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
  FUEL_SURCHARGE: 'fuelSurCharge',
  VISITS: 'visits',
  PRICE_PER_HIT: 'pricePerHit',
  HOURLY_RATE: 'hourlyRate',
  DUTY_DAYS: 'dutyDays',
  INSTRUCTIONS: 'instructions',
  VISITOR_MANAGEMENT: 'visitorManagement',
  LOAD_MANAGEMENT: 'loadManagement',
  DISPATCH: 'isDispatch',
  TOTAL: 'total',
  ESTIMATED_PROFIT: 'estimatedProfit',
  HOURS: 'hours',
  CALCULATIONS: 'calculations',
  TOTAL_VISITS: 'totalVisits',
  TOTAL_DUTY_DAYS: 'totalDutyDays',
};

export const ActiveStepsKeys = {
  SERVICES: 'services',
  DEVICES: 'devices',
  ON_DEMAND_SERVICES: 'onDemandServices',
  PAYMENT_TERMS: 'paymentTerms',
  DESCRIPTIONS: 'descriptions',
  CONFIGURATION: 'configuration',
};

export const ActiveSteps = [...Object.values(ActiveStepsKeys)];

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
