import { convertToDraft } from 'commonComponents/richText';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import weekday from 'dayjs/plugin/weekday';
import { EditorState } from 'draft-js';
import { convertHHMMAToDayJsDate } from 'src/utils/passTime/time';

dayjs.extend(weekday);
// Set Monday as the first day of the week
dayjs.extend(weekday, { weekStart: 1 });
dayjs.extend(isSameOrBefore);

/**
 * Contract Service Types
 */
export const serviceTypes = {
  PATROL: 'patrol',
  DEDICATED: 'dedicated',
  DISPATCH: 'dispatch',
};

/**
 * Patrol Service Visit Types
 */
export const visitTypes = {
  FIXED: 'fixed',
  RANDOM: 'random',
};

/**
 * Slugs.
 */
export const slugs = {
  ARMED_OFFICER: 'armed_officer',
  PATROL_OFFICER: 'patrol_officer',
  DEDICATED_OFFICER: 'dedicated_officer',
  VISITOR_MANAGEMENT: 'visitor_management',
  LOAD_MANAGEMENT: 'load_management',
};

/**
 * Contract Form Keys
 */
export const FormKeys = {
  NAME: 'name',
  TYPE: 'type',
  OFFICER_TYPE: 'officerType',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  START_TIME: 'startTime',
  ADD_FUEL_SURCHARGE: 'addFuelSurcharge',
  END_TIME: 'endTime',
  VISIT_TYPE: 'visitType',
  NUMBER_OF_VISITS: 'numberOfVisits',
  REQ_OFFICERS: 'reqOfficers',
  TIMEZONE: 'timezone',
  VISITS: 'visits',
  PRICE_PER_HIT: 'pricePerHit',
  HOURLY_RATE: 'hourlyRate',
  DUTY_DAYS: 'dutyDays',
  INSTRUCTIONS: 'instructions',
  VISITOR_MANAGEMENT: 'visitorManagement',
  LOAD_MANAGEMENT: 'loadManagement',
  TOTAL: 'total',
  ESTIMATED_PROFIT: 'estimatedProfit',
  HOURS: 'hours',
  CALCULATIONS: 'calculations',
  TOTAL_VISITS: 'totalVisits',
  TOTAL_DUTY_DAYS: 'totalDutyDays',
};

export const ServicesTimeError = 'servicesTimeError';

export const emptyStateServiceName = { index: null, value: '', isError: false };

const emptyState = {
  [FormKeys.NAME]: 'Service',
  [FormKeys.OFFICER_TYPE]: null,
  [FormKeys.VISITS]: [
    { [FormKeys.START_TIME]: null, [FormKeys.END_TIME]: null, [FormKeys.DUTY_DAYS]: [] },
  ],
  [FormKeys.ADD_FUEL_SURCHARGE]: false,
  [FormKeys.INSTRUCTIONS]: EditorState.createEmpty(),
};

export const emptyStatePatrolVisit = {
  ...emptyState[FormKeys.VISITS][0],
  [FormKeys.NUMBER_OF_VISITS]: null,
  [FormKeys.VISIT_TYPE]: visitTypes.RANDOM,
};

export const emptyStatePatrol = {
  ...emptyState,
  [FormKeys.VISITS]: [{ ...emptyStatePatrolVisit }],
  [FormKeys.TYPE]: serviceTypes.PATROL,
  [FormKeys.PRICE_PER_HIT]: null,
};

export const emptyStateDedicated = {
  ...emptyState,
  [FormKeys.VISITS]: [{ ...emptyState[FormKeys.VISITS][0], [FormKeys.REQ_OFFICERS]: null }],
  [FormKeys.TYPE]: serviceTypes.DEDICATED,
  [FormKeys.HOURLY_RATE]: null,
  [FormKeys.VISITOR_MANAGEMENT]: false,
  [FormKeys.LOAD_MANAGEMENT]: false,
};

export const getCurrentDate = () => dayjs();

export const isTimeSameOrBefore = (time1, time2) => time1?.isSameOrBefore(time2, 'minute');

const calculateMinutesPerWeek = (visit) => {
  let areTimingsValid = true;
  const { startTime, endTime, dutyDays } = visit;

  if (!startTime || !endTime) areTimingsValid = false;

  if (!areTimingsValid || !dutyDays.length) return null;

  let currentDate = dayjs();

  const sTime = convertHHMMAToDayJsDate(startTime);
  const eTime = convertHHMMAToDayJsDate(endTime);

  // Convert start and end times to dayjs objects
  const start = currentDate.set('hour', sTime?.hour()).set('minute', sTime?.minute());
  let end = currentDate.set('hour', eTime?.hour()).set('minute', eTime?.minute());

  if (isTimeSameOrBefore(end, start)) end = end.add('1', 'd');

  // Calculate the difference in minutes
  const minutesPerDay = end.diff(start, 'minute');

  const minutesPerWeek = minutesPerDay * dutyDays.length;

  return minutesPerWeek;
};

const emptyStateCalculation = {
  [FormKeys.TOTAL]: 0,
  [FormKeys.ESTIMATED_PROFIT]: 0,
};

export const getDedicatedCalculations = ({ service, baseRates }) => {
  if (!service || !baseRates) return { ...emptyStateCalculation, [FormKeys.HOURS]: 0 };

  const visit = service[FormKeys.VISITS][0];
  const minutesPerWeek = calculateMinutesPerWeek(visit);

  const baseRate = baseRates[service[FormKeys.OFFICER_TYPE]];

  const hoursPerWeek = minutesPerWeek / 60;
  const totalHoursPerWeek = hoursPerWeek * visit[FormKeys.REQ_OFFICERS];
  const ratePerWeek = totalHoursPerWeek * service[FormKeys.HOURLY_RATE];
  const defaultRatePerWeek = totalHoursPerWeek * baseRate;
  const estimatedProfit = ratePerWeek - defaultRatePerWeek;

  let total = ratePerWeek;

  return {
    [FormKeys.ESTIMATED_PROFIT]: total > 0 ? estimatedProfit : 0,
    [FormKeys.TOTAL]: total > 0 ? total : 0,
    [FormKeys.HOURS]: total > 0 ? totalHoursPerWeek : 0,
  };
};

export const getPatrolCalculations = ({ service, baseRates }) => {
  if (!service || !baseRates)
    return { ...emptyStateCalculation, [FormKeys.TOTAL_DUTY_DAYS]: {}, [FormKeys.TOTAL_VISITS]: 0 };

  const totalDutyDays = {};
  const totalVisits = service.visits.reduce((acc, visit) => {
    visit[FormKeys.DUTY_DAYS].map((visitDutyDay) => {
      if (totalDutyDays[visitDutyDay]) {
        totalDutyDays[visitDutyDay] += Number(visit[FormKeys.NUMBER_OF_VISITS]);
        return;
      }
      totalDutyDays[visitDutyDay] = Number(visit[FormKeys.NUMBER_OF_VISITS]);
    });
    return visit[FormKeys.NUMBER_OF_VISITS] * visit[FormKeys.DUTY_DAYS].length + acc;
  }, 0);

  const baseRate = baseRates[service[FormKeys.OFFICER_TYPE]?.value] || 0;

  const totalPrice = totalVisits * service[FormKeys.PRICE_PER_HIT];
  const defaultTotalPrice = totalVisits * baseRate;
  const estimatedProfit = totalPrice - defaultTotalPrice;

  return {
    [FormKeys.ESTIMATED_PROFIT]: estimatedProfit || 0,
    [FormKeys.TOTAL]: totalPrice || 0,
    [FormKeys.TOTAL_DUTY_DAYS]: totalDutyDays,
    [FormKeys.TOTAL_VISITS]: totalVisits,
  };
};

export const officerTypeOptions = [
  {
    id: 'armed_officer',
    name: 'Armed Officer',
  },
  { id: 'patrol_officer', name: 'Patrol Officer', [FormKeys.TYPE]: serviceTypes.PATROL },
  { id: 'dedicated_officer', name: 'Dedicated Officer', [FormKeys.TYPE]: serviceTypes.DEDICATED },
];

export const getServicesData = (data, baseRates) => {
  return data.map((service) => {
    const newService = { ...service };
    const officerType = officerTypeOptions.find(
      (option) => option.id === newService[FormKeys.OFFICER_TYPE],
    );
    newService[FormKeys.OFFICER_TYPE] = {
      ...officerType,
      label: officerType.name,
      value: officerType.id,
    };
    if (newService[FormKeys.TYPE] === serviceTypes.PATROL) {
      delete newService[FormKeys.REQ_OFFICERS];
      delete newService[FormKeys.HOURLY_RATE];
    } else {
      delete newService[FormKeys.PRICE_PER_HIT];
      delete newService[FormKeys.NUMBER_OF_VISITS];
    }
    newService[FormKeys.VISITS] = newService[FormKeys.VISITS].map((visit) => ({
      ...visit,
      startTime: convertHHMMAToDayJsDate(visit.startTime),
      endTime: convertHHMMAToDayJsDate(visit.endTime),
    }));
    delete newService.id;
    newService[FormKeys.INSTRUCTIONS] = newService[FormKeys.INSTRUCTIONS]
      ? convertToDraft(newService[FormKeys.INSTRUCTIONS])
      : EditorState.createEmpty();
    newService[FormKeys.CALCULATIONS] =
      service[FormKeys.TYPE] === serviceTypes.DEDICATED
        ? getDedicatedCalculations({
            service,
            baseRates,
          })
        : getPatrolCalculations({ service, baseRates });

    return newService;
  });
};

export const getDefaultServicesData = (length) => {
  return {
    ...emptyStateDedicated,
    [FormKeys.CALCULATIONS]: {
      [FormKeys.ESTIMATED_PROFIT]: 0,
      [FormKeys.TOTAL]: 0,
      [FormKeys.HOURS]: 0,
    },
    [FormKeys.NAME]: `${emptyStatePatrol[FormKeys.NAME]} #${length + 1}`,
  };
};

export const getServicesCalculations = (services, baseRates) => {
  return services?.map((service) => {
    const result =
      service[FormKeys.TYPE] === serviceTypes.DEDICATED
        ? getDedicatedCalculations({
            service,
            baseRates,
          })
        : getPatrolCalculations({ service, baseRates });
    return result;
  });
};
