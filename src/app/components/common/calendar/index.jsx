import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import timeGridPlugin from '@fullcalendar/timegrid';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactComponent as CancelIcon } from 'assets/svg/cancelHit.svg?react';
import { ReactComponent as WarningIcon } from 'assets/svg/warningCalander.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DUTY_COLORS } from 'src/app/obx/pages/schedules/calendar';
import MissedHitsDrawer from 'src/app/obx/pages/schedules/components/missedHitsDrawer';
import {
  calendarIndicatorIcons,
  calendarShiftStatusValues,
} from 'src/app/obx/pages/schedules/components/scheduleStatusIcons';
import {
  dayjsWithTimezone,
  formatShiftScheduleTimeRange,
  getCurrentStandardTimeInIsoWrtTimezone,
} from 'src/app/obx/pages/schedules/helper';
import { ACL_OBX_SCHEDULES_UPDATE } from 'src/app/router/constant/OBXMODULE';
import AvatarSchedule from 'src/assets/images/Avatar-schedule.png';
import { ReactComponent as NoShiftIcon } from 'src/assets/images/no-shift.svg?react';
import { SplittedCalenderIcon } from 'src/assets/svg';
import { ReactComponent as UnAssignHit } from 'src/assets/svg/assignHit.svg?react';
import { ReactComponent as LeftArrow } from 'src/assets/svg/calendar-left.svg?react';
import { ReactComponent as RightArrow } from 'src/assets/svg/calendar-right.svg?react';
import { ReactComponent as CarIcon } from 'src/assets/svg/carImage.svg?react';
import { ReactComponent as AlertIcon } from 'src/assets/svg/DedicatedDuty/alertCircle.svg?react';
import { ReactComponent as CalenderIcon } from 'src/assets/svg/DedicatedDuty/schedule-calendar.svg?react';
import { ReactComponent as DispatchIndicator } from 'src/assets/svg/dispatchIndicator.svg?react';
import { ReactComponent as ListIcon } from 'src/assets/svg/list.svg?react';
import { ReactComponent as MHitsIcon } from 'src/assets/svg/MHitsIcon.svg?react';
import { ReactComponent as NotesIcon } from 'src/assets/svg/notesStatus.svg?react';
import { ReactComponent as RunsheetIcon } from 'src/assets/svg/runsheetHit.svg?react';
import { ReactComponent as WhiteCarIcon } from 'src/assets/svg/WhiteCarIcon.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import userHasPermission from 'src/utils/auth/userHasPermission';
import {
  calendarShiftStatusEnum,
  DAY_GRID,
  DEFAULT_CALENDER_VIEW,
  DRAWER_TYPE,
  SCHEDULE_DUTIES,
  ShiftStatus,
  TIME_GRID,
} from 'src/utils/constants/schedules';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import DutyIndicator from '../../obxComponents/dutyIndicator';
import SideDrawer from '../sideDrawer';
import CalendarSkeleton from '../skeletonLoader/calendarSkeleton';
import { useStyles } from './calendar.styles';

const isShiftCancelled = (shift = {}) => {
  const normalizedShiftStatus = `${
    shift?.shiftStatus || shift?.scheduleStatus || ''
  }`.toLowerCase();
  const isCancelledByStatus =
    normalizedShiftStatus === 'cancelled' || normalizedShiftStatus === 'canceled';
  const isCancelledByFlag =
    shift?.isCancelled === true || `${shift?.isCancelled}`.toLowerCase() === 'true';
  return isCancelledByStatus || isCancelledByFlag;
};

const Calendar = ({
  events,
  listEvents,
  weekViewLocations,
  dayViewDuties,
  dayViewLocations,
  setShowDrawer,
  queryParams,
  setQueryParams,
  loading,
  missedHitsCount,
  refreshMissedHitsCount,
}) => {
  const calendarRef = useRef(null);
  const classes = useStyles();
  const { t } = useTranslation();
  const { is24Hours } = useDateTime();

  const showSideDrawerHandler = ({ requiresAttention, id, shiftId, ...rest }) => {
    // open assign duty side drawer
    let open = undefined;
    let activeIndex = 0;

    if (
      requiresAttention &&
      [SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(rest?.shiftType)
    ) {
      if (getCurrentStandardTimeInIsoWrtTimezone() >= rest?.endsAt || rest?.isCancelled) {
        open = DRAWER_TYPE.DETAIL;
        activeIndex = 2;
      } else {
        if (userHasPermission(ACL_OBX_SCHEDULES_UPDATE)) {
          open = DRAWER_TYPE.ASSIGN;
        }
      }
    } else {
      open = DRAWER_TYPE.DETAIL;
    }

    setShowDrawer({
      open: open,
      data: { id, shiftId, ...rest },
      activeIndex: activeIndex,
    });
  };

  const handleEventClick = (info) => {
    if (info.view.type === DAY_GRID.MONTH) {
      const updatedViewType = DAY_GRID.DAY;

      const { current: calendarDom } = calendarRef;
      const API = calendarDom ? calendarDom.getApi() : null;
      API && API.changeView(updatedViewType, info.event.start);

      const { activeEnd, activeStart, type } = API.view || {};
      const { windowStart, windowEnd } = getStartEndTimeForView({ activeEnd, activeStart, type });

      setQueryParams((prev) => ({
        ...prev,
        selectedView: {
          ...prev.selectedView,
          type: updatedViewType,
          windowStart,
          windowEnd,
        },
      }));

      return;
    }
    if (info.view.type === DAY_GRID.WEEK) {
      // for week view
      let data = info.event._def?.extendedProps || {};
      data = { ...data, startsAt: data?.startsAt };

      const id = info.event?.id;
      showSideDrawerHandler({ ...data, id });
    }
  };

  const onClickListViewEvent = (data) => {
    showSideDrawerHandler({ ...data });
  };

  const dutyColorClass = {
    [SCHEDULE_DUTIES.DEDICATED]: 'dutyGreen',
    [SCHEDULE_DUTIES.PATROL]: 'dutyBlue',
    [SCHEDULE_DUTIES.DISPATCH]: 'dutyPurple',
    [SCHEDULE_DUTIES.HIT]: 'dutyBlue',
    [SCHEDULE_DUTIES.EXTRA]: 'dutyYellow',
  };
  const isDedicatedCancelledShift = (shift = {}) => {
    return shift?.shiftType === SCHEDULE_DUTIES.DEDICATED && isShiftCancelled(shift);
  };

  const eventMounted = (info) => {
    const { shiftType } = info.event._def?.extendedProps || {};
    // BEAUTIFY EVENTS
    const eventClassName = classes[dutyColorClass[shiftType]];
    info.el.className += ` ${eventClassName}`;
  };

  // Event Content
  const eventContent = (info) => {
    const shift = info.event._def?.extendedProps || {};
    const { requiresAttention, name, shiftType, unassignedCount } = shift;
    const currentView = info.view.type;
    if (currentView === DAY_GRID.MONTH) {
      return (
        <>
          <Box className={`${classes.eventContentMonthAlert}`}>
            <DutyIndicator color={DUTY_COLORS[shiftType]} label={name} />
            {requiresAttention && (
              <ToolTipComponent unassignedCount={unassignedCount} shiftType={shiftType} />
            )}
          </Box>
        </>
      );
    }

    if (currentView === DAY_GRID.WEEK) {
      const { statusIcon, statusValue, eventBgColorClass } = getValuesWrtStatuses({ shift, t });
      const cancelledDedicatedClass = isDedicatedCancelledShift(shift)
        ? classes.cancelledDedicatedCard
        : '';

      const isExtraHit = shiftType === SCHEDULE_DUTIES.HIT && shift?.isExtra;

      const dutyColor = isExtraHit
        ? dutyColorClass[SCHEDULE_DUTIES.EXTRA]
        : dutyColorClass[shiftType];

      return (
        <Box
          className={`${classes.eventContent} ${classes.eventContentWeek} ${classes[dutyColor]} ${classes[eventBgColorClass]} ${cancelledDedicatedClass}`}
        >
          <CalendarCardContent
            shift={shift}
            statusIcon={statusIcon}
            statusValue={statusValue}
            is24Hours={is24Hours}
          />
        </Box>
      );
    }

    return <></>;
  };

  // TimeSlot View
  const customTimeSlotView = (info) => {
    const hour = info.date.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return (
      <Typography variant="subtitle3" className={classes.calendarTimeSlot}>
        {formattedHour} {ampm}
      </Typography>
    );
  };

  // FullCalendar header view
  const customHeaderView = (info) => {
    const date = info.date.getDate();
    const dayName = info.date.toLocaleString('default', { weekday: 'short' });
    const dayMonth = info.date.toLocaleString('default', { month: 'short' });
    const currentView = info.view.type;

    // Get the current date
    const currentDate = dayjsWithTimezone();
    const currentDay = currentDate.date();
    const currentMonth = currentDate.month();

    // Check if the date being rendered is both in the current month and is the current date
    const isCurrentDate = date === currentDay && info.date.getMonth() === currentMonth;
    const highlightClass = isCurrentDate ? classes.highlightCurrentDate : '';
    const highlightClassDay = isCurrentDate ? classes.highlightCurrentDay : '';

    if ([DAY_GRID.WEEK].includes(currentView)) {
      return (
        <Box className={classes.calendarHeaderCell}>
          <Typography variant="subtitle2" className={classes.calendarHeaderCellDay}>
            {dayName}
          </Typography>
          <Typography
            variant="subtitle2"
            className={`${classes.calendarHeaderCellDate} ${highlightClass}`}
          >
            {date}
          </Typography>
        </Box>
      );
    }

    if (currentView === DAY_GRID.MONTH) {
      return (
        <Box className={classes.calendarHeaderMonthCell}>
          <Typography variant="subtitle2" className={classes.calendarHeaderMonthCellDate}>
            {info.text}
          </Typography>
        </Box>
      );
    }

    if ([DAY_GRID.DAY].includes(currentView)) {
      const events = dayViewDuties || {};
      const sortedLocations = [...(dayViewLocations || [])].sort((a, b) => {
        const idA = a?.id;
        const idB = b?.id;
        if (typeof idA === 'number' && typeof idB === 'number') {
          return idA - idB;
        }
        if (typeof idA === 'number' && idB === null) {
          return -1;
        }
        if (idA === null && typeof idB === 'number') {
          return 1;
        }
        return 0;
      });
      const locationOrderMap = sortedLocations.reduce((acc, loc, index) => {
        acc[loc?.title] = index;
        return acc;
      }, {});
      const sortedEvents = Object.entries(events)?.sort(([locationNameA], [locationNameB]) => {
        const orderA = locationOrderMap[locationNameA] ?? 999;
        const orderB = locationOrderMap[locationNameB] ?? 999;
        return orderA - orderB;
      });
      return (
        <Box>
          <Box className={`${classes.calendarHeaderCell} ${classes.borderBottom}`}>
            <Typography variant="subtitle2" className={classes.calendarHeaderCellDay}>
              {dayName}
            </Typography>
            <Typography
              variant="subtitle2"
              className={`${classes.calendarHeaderCellDate} ${highlightClass}`}
            >
              {date}
            </Typography>
          </Box>
          <Box className={classes.calendarDayCustom}>
            {sortedEvents?.map(([locationName, shifts], index) => {
              shifts = shifts || [];
              return (
                <Box key={index} className={classes.dayViewBorder}>
                  <Typography variant="subtitle2" className={classes.dayLocationName}>
                    {locationName}
                  </Typography>
                  <Box className={classes.dayViewWrapper}>
                    {shifts?.map((shift) => {
                      const { statusIcon, statusValue, eventBgColorClass } = getValuesWrtStatuses({
                        shift,
                        t,
                      });
                      const cancelledDedicatedClass = isDedicatedCancelledShift(shift)
                        ? classes.cancelledDedicatedCard
                        : '';
                      return (
                        <Box
                          key={shift?.id}
                          className={`${classes.dayEventContent} ${classes.eventContentWeek} ${classes[dutyColorClass[shift?.shiftType]]} ${classes[eventBgColorClass]} ${cancelledDedicatedClass}`}
                          onClick={() => onClickListViewEvent(shift)}
                        >
                          <CalendarCardContent
                            shift={shift}
                            statusIcon={statusIcon}
                            statusValue={statusValue}
                            is24Hours={is24Hours}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    }

    if (currentView === TIME_GRID.LIST) {
      const events = listEvents?.[date];

      return (
        <Box className={classes.calendarListView}>
          <Box className={classes.calendarListViewTime}>
            <Typography
              variant="subtitle1"
              className={`${classes.calendarListViewDate} ${highlightClass}`}
            >
              {date}
            </Typography>
            <Box>
              <Typography
                variant="subtitle2"
                className={`${classes.calendarListViewDay} ${highlightClassDay}`}
              >
                {dayMonth}, {dayName}
              </Typography>
            </Box>
          </Box>

          <Box className={classes.calendarListViewRight}>
            {events?.map((event) => (
              <Box
                key={event?.id}
                className={classes.calendarListViewEvent}
                onClick={() => onClickListViewEvent(event)}
              >
                <Box className={classes.calendarListViewEventBody}>
                  <DutyIndicator
                    color={DUTY_COLORS[event?.shiftType]}
                    label={formatShiftScheduleTimeRange(event?.start, event?.end, is24Hours)}
                    className={classes.calendarListViewDutyTime}
                  />
                </Box>
                <Typography variant="subtitle3" className={classes.calendarListViewDutyName}>
                  {event?.name}
                </Typography>
                {event?.requiresAttention && <ToolTipComponent shiftType={event?.shiftType} />}
              </Box>
            ))}
          </Box>
        </Box>
      );
    }
  };

  const weekViewCustomDaysHeader = (info) => {
    const date = info.date.getDate();
    const dayName = info.date.toLocaleString('default', { weekday: 'short' });

    // Get the current date
    const currentDate = dayjsWithTimezone();
    const currentDay = currentDate.date();
    const currentMonth = currentDate.month();

    // Check if the date being rendered is both in the current month and is the current date
    const isCurrentDate = date === currentDay && info.date.getMonth() === currentMonth;
    const highlightClass = isCurrentDate ? classes.highlightCurrentDate : '';

    return (
      <Box className={classes.calendarHeaderCell}>
        <Typography variant="subtitle2" className={classes.calendarHeaderCellDay}>
          {dayName}
        </Typography>
        <Typography
          variant="subtitle2"
          className={`${classes.calendarHeaderCellDate} ${highlightClass}`}
        >
          {date}
        </Typography>
      </Box>
    );
  };

  return (
    <>
      <Box className={classes.calendar}>
        <CalendarHeaderToolbar
          calendarRef={calendarRef}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          missedHitsCount={missedHitsCount}
          refreshMissedHitsCount={refreshMissedHitsCount}
        />
        {loading && <CalendarSkeleton />}

        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
            resourceTimelinePlugin,
          ]}
          headerToolbar={false}
          initialView={DEFAULT_CALENDER_VIEW}
          events={events}
          eventDidMount={eventMounted}
          eventClick={handleEventClick}
          ref={calendarRef}
          allDaySlot={false}
          dayHeaderContent={customHeaderView}
          eventContent={eventContent}
          slotLabelContent={customTimeSlotView}
          noEventsContent={<NoEvent />}
          resources={weekViewLocations || []}
          firstDay={6} // Start week on Saturday (6 = Saturday)
          resourceAreaHeaderContent={''}
          slotDuration={{ days: 1 }} // Set slot duration to one day to show only dates
          slotLabelInterval={{ days: 1 }} // Ensure slot labels are shown for each day
          views={{
            resourceTimelineWeek: {
              slotLabelContent: weekViewCustomDaysHeader,
              resourceAreaWidth: '15%',
              dragScroll: false,
            },
          }}
        />
      </Box>
    </>
  );
};

Calendar.propTypes = {
  events: PropTypes.object,
  weekViewLocations: PropTypes.array,
  listEvents: PropTypes.object,
  dayViewDuties: PropTypes.object,
  dayViewLocations: PropTypes.array,
  setShowDrawer: PropTypes.func,
  queryParams: PropTypes.func,
  setQueryParams: PropTypes.func,
  loading: PropTypes.bool,
  missedHitsCount: PropTypes.number,
  refreshMissedHitsCount: PropTypes.func,
};
export default Calendar;

// Custom Header Toolbar
const CalendarHeaderToolbar = ({
  calendarRef,
  queryParams,
  setQueryParams,
  missedHitsCount,
  refreshMissedHitsCount,
}) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const [title, setTitle] = useState('');

  const calendarView = queryParams.selectedView?.type;
  const [missedHitDrawerData, setMissedHitDrawerData] = useState(null);
  // Custom Header Toolbar Prev/Next Button
  const handlePrevNext = (isNext) => () => {
    const calendarGetApi = calendarRef.current.getApi();
    if (isNext) {
      calendarGetApi.next();
    } else {
      calendarGetApi.prev();
    }
    const { activeEnd, activeStart, type } = calendarGetApi.view || {};
    const { windowStart, windowEnd } = getStartEndTimeForView({ activeEnd, activeStart, type });

    setQueryParams((prev) => ({
      ...prev,
      selectedView: {
        ...prev.selectedView,
        windowStart,
        windowEnd,
      },
    }));
  };

  const headerTitle = (calenderGetApi) => ({
    [DAY_GRID.DAY]: dayTitleFormat(calenderGetApi),
    [DAY_GRID.WEEK]: weekTitleFormat(calenderGetApi),
    [DAY_GRID.MONTH]: monthTitleFormat(calenderGetApi),
    [TIME_GRID.LIST]: monthTitleFormat(calenderGetApi),
  });

  const handleChangeCalenderView = (selectedType) => () => {
    const calendarGetApi = calendarRef.current.getApi();
    calendarGetApi?.changeView(selectedType);

    const { activeEnd, activeStart, type } = calendarGetApi.view || {};
    const { windowStart, windowEnd } = getStartEndTimeForView({ activeEnd, activeStart, type });

    setQueryParams((prev) => ({
      ...prev,
      selectedView: {
        ...prev.selectedView,
        type: type,
        windowStart,
        windowEnd,
      },
    }));
  };

  // Day Title Format
  const dayTitleFormat = (info) => {
    const { view } = info;
    const currentDisplayDate = view.activeStart;

    const month = currentDisplayDate.toLocaleString('default', { month: 'long' });
    const day = currentDisplayDate.getDate();
    const year = currentDisplayDate.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  // Week Title Format
  const weekTitleFormat = (info) => {
    const { view } = info;
    const currentDisplayDate = view.activeStart;

    // Calculate the start and end dates of the week
    const weekStartDate = new Date(currentDisplayDate);
    const weekEndDate = new Date(currentDisplayDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const startMonth = weekStartDate.toLocaleString('default', { month: 'short' });
    const endMonth = weekEndDate.toLocaleString('default', { month: 'short' });
    const startDay = weekStartDate.getDate();
    const endDay = weekEndDate.getDate();
    const year = weekStartDate.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  };

  // Month Title Format
  const monthTitleFormat = (info) => {
    const { view } = info;

    const currentDisplayDate = view.currentStart;

    const month = currentDisplayDate.toLocaleString('default', { month: 'long' });
    const year = currentDisplayDate.getFullYear();

    return `${month}, ${year}`;
  };

  useEffect(() => {
    if (!calendarRef.current) return;
    const calendarGetApi = calendarRef.current?.getApi();
    if (!calendarGetApi) return;

    const { activeEnd, activeStart, type } = calendarGetApi.view || {};
    const { windowStart, windowEnd } = getStartEndTimeForView({ activeEnd, activeStart, type });

    setQueryParams((prev) => ({
      ...prev,
      selectedView: {
        ...prev.selectedView,
        windowStart,
        windowEnd,
      },
    }));
  }, []);

  useEffect(() => {
    if (
      calendarRef.current &&
      queryParams.selectedView.windowStart &&
      queryParams.selectedView.windowEnd &&
      queryParams.selectedView.type
    ) {
      const calendarGetApi = calendarRef.current?.getApi();
      if (!calendarGetApi) return;

      const { type } = calendarGetApi.view || {};
      setTitle(headerTitle(calendarGetApi)?.[type]);
    }
  }, [queryParams.selectedView]);

  const isCalenderView = [DAY_GRID.DAY, DAY_GRID.WEEK, DAY_GRID.MONTH].includes(calendarView);

  return (
    <Box className={classes.calendarHeaderToolbar}>
      <Box className={classes.calendarHeaderToolbarLeft}>
        <Button
          variant="tertiaryGrey"
          className={classes.calendarHeaderToolbarLeftAction}
          onClick={handlePrevNext(false)}
        >
          <LeftArrow />
        </Button>
        <Typography className={classes.calendarHeaderToolbarLeftText} variant="subtitle2">
          {title}
        </Typography>
        <Button
          variant="tertiaryGrey"
          className={classes.calendarHeaderToolbarLeftAction}
          onClick={handlePrevNext(true)}
        >
          <RightArrow />
        </Button>
      </Box>
      <Box className={classes.calendarHeaderToolbarRight}>
        {missedHitsCount === undefined && (
          <>
            <Skeleton variant="rectangular" className={classes.loaderBox} />
          </>
        )}

        <RenderIfHasPermission name={ACL_OBX_SCHEDULES_UPDATE}>
          {!!missedHitsCount && (
            <Button
              onClick={() => {
                setMissedHitDrawerData({
                  startsAt: queryParams.selectedView.windowStart,
                  endsAt: queryParams.selectedView.windowEnd,
                });
              }}
              endIcon={<MHitsIcon />}
              variant="destructiveSecondary"
              className={classes.missedHitsButton}
            >
              {missedHitsCount}{' '}
              {t('obx.runsheet.missedHits', { hits: getLabel('terms', 'hits', t) })}
            </Button>
          )}
        </RenderIfHasPermission>

        <SideDrawer isOpen={!!missedHitDrawerData} totalWidth={'571px'}>
          <MissedHitsDrawer
            missedHitDrawerData={missedHitDrawerData}
            setMissedHitDrawerData={setMissedHitDrawerData}
            refreshMissedHitsCount={refreshMissedHitsCount}
          />
        </SideDrawer>
        {calendarView !== TIME_GRID.LIST && (
          <ToggleButtonGroup
            value={calendarView}
            exclusive
            className={classes.calendarHeaderToolbarToggle}
          >
            <ToggleButton
              className={classes.calendarHeaderToolbarToggleBtn}
              value={DAY_GRID.DAY}
              onClick={handleChangeCalenderView(DAY_GRID.DAY)}
            >
              {t('obx.schedules.calendar.view.day')}
            </ToggleButton>
            <ToggleButton
              className={classes.calendarHeaderToolbarToggleBtn}
              value={DAY_GRID.WEEK}
              onClick={handleChangeCalenderView(DAY_GRID.WEEK)}
            >
              {t('obx.schedules.calendar.view.week')}
            </ToggleButton>
            <ToggleButton
              className={classes.calendarHeaderToolbarToggleBtn}
              value={DAY_GRID.MONTH}
              onClick={handleChangeCalenderView(DAY_GRID.MONTH)}
            >
              {t('obx.schedules.calendar.view.month')}
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        <ToggleButtonGroup
          value={calendarView}
          exclusive
          className={classes.calendarHeaderToolbarSwitch}
        >
          <ToggleButton
            value={DEFAULT_CALENDER_VIEW}
            className={classes.calendarHeaderToolbarSwitchBtn}
            onClick={handleChangeCalenderView(DEFAULT_CALENDER_VIEW)}
            selected={isCalenderView}
          >
            <CalenderIcon />
          </ToggleButton>
          <ToggleButton
            value={TIME_GRID.LIST}
            className={classes.calendarHeaderToolbarSwitchBtn}
            onClick={handleChangeCalenderView(TIME_GRID.LIST)}
          >
            <ListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

CalendarHeaderToolbar.propTypes = {
  calendarRef: PropTypes.object,
  queryParams: PropTypes.func,
  setQueryParams: PropTypes.func,
  missedHitsCount: PropTypes.number,
  refreshMissedHitsCount: PropTypes.func,
};
// When there are no events
const NoEvent = () => {
  const { t } = useTranslation();

  const classes = useStyles();

  return (
    <Box className={classes.calendarListEmpty}>
      <NoShiftIcon />
      <Typography variant="h2" className={classes.calendarListViewNoShiftTitle}>
        {t('obx.schedules.calendar.noEvents.title')}
      </Typography>
      <Typography variant="body2" className={classes.calendarListViewNoShiftText}>
        {t('obx.schedules.calendar.noEvents.description')}
      </Typography>
    </Box>
  );
};

const getStartEndTimeForView = ({ activeStart, activeEnd, type }) => {
  if (type == DAY_GRID.MONTH) {
    activeEnd?.setDate(activeEnd?.getDate() - 1);
    return {
      windowStart: dayjs(activeStart)?.format('YYYY-MM-DD'),
      windowEnd: dayjs(activeEnd)?.format('YYYY-MM-DD'),
    };
  }

  return {
    windowStart: dayjs(activeStart)?.toISOString(),
    windowEnd: dayjs(activeEnd)?.toISOString(),
  };
};

const ToolTipComponent = ({ unassignedCount = '', shiftType }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const msg = {
    [SCHEDULE_DUTIES.DEDICATED]: t('obx.schedules.calendar.tooltips.dedicatedAttention', {
      dedicated: getLabel('terms', 'dedicated', t),
    }),
    [SCHEDULE_DUTIES.PATROL]: t('obx.schedules.calendar.tooltips.patrolAttention', {
      patrol: getLabel('terms', 'patrol', t),
    }),
    [SCHEDULE_DUTIES.HIT]: t('obx.schedules.calendar.tooltips.patrolAttention', {
      patrol: getLabel('terms', 'patrol', t),
    }),
    [SCHEDULE_DUTIES.EXTRA]: t('obx.schedules.calendar.tooltips.extraAttention', {
      extra: getLabel('terms', 'extra', t),
    }),
  };

  return (
    <Tooltip
      arrow
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -14],
              },
            },
          ],
          sx: { cursor: 'pointer' },
        },
      }}
      title={
        <Box
          //Don't have option to add class sx is required here
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <AlertIcon />
          {unassignedCount} {msg[shiftType]}
        </Box>
      }
      slots={<Box />}
      placement="bottom"
    >
      <AlertIcon />
    </Tooltip>
  );
};

ToolTipComponent.propTypes = {
  unassignedCount: PropTypes.number,
  shiftType: PropTypes.string,
};

const StatusTooltip = ({ title, icon }) => {
  return (
    <Tooltip
      arrow
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -14],
              },
            },
          ],
          sx: { cursor: 'pointer' },
        },
      }}
      title={title}
      placement="bottom"
    >
      {icon}
    </Tooltip>
  );
};

StatusTooltip.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.node,
};

const CalendarCardContent = ({ shift, statusIcon, statusValue, is24Hours }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isDedicatedCancelledShift =
    isShiftCancelled(shift) && shift?.shiftType === SCHEDULE_DUTIES.DEDICATED;

  const {
    name,
    shiftType,
    // shiftStatus,
    site,
    startsAt,
    endsAt,
    officer,
    vehicle,
    reassignedOfficer,
    tour,
    runsheetName,
    overTime,
    hasNotes,
    missedHits,
  } = shift || {};

  const eventTime = formatShiftScheduleTimeRange(startsAt, endsAt, is24Hours);

  return (
    <>
      {overTime ? (
        <Box className={classes.warnWrapper}>
          <WarningIcon />
          <Typography className={classes.eventSiteNameColor} variant="subtitle4">
            {t('obx.schedules.calendar.scheduleStatus.overTime')}
          </Typography>
        </Box>
      ) : (
        ''
      )}

      <Box className={classes.eventDetailHeaderWrapper}>
        <Box className={classes.eventDetailHeader}>
          <Typography className={classes.eventSiteNameColor} variant="subtitle4">
            {eventTime}
          </Typography>

          {[SCHEDULE_DUTIES.PATROL].includes(shiftType) && missedHits > 0 && (
            <Chip
              className={classes.eventSiteNameColor}
              size="small"
              variant="Filled"
              color="error"
              label={t('obx.schedules.calendar.hitsMissed', { count: missedHits })}
            />
          )}
          {[SCHEDULE_DUTIES.HIT].includes(shiftType) && (
            <>
              <Typography className={classes.eventSiteNameColor} variant="subtitle4">
                <CarIcon />
              </Typography>
              <Typography className={classes.eventSiteNameColor} variant="subtitle4">
                {name}
              </Typography>
            </>
          )}
          {[SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(shiftType) && (
            <>
              <Typography className={classes.eventSiteNameColor} variant="subtitle4">
                •
              </Typography>
              <Typography className={classes.eventSiteNameColor} variant="subtitle4">
                {name}
              </Typography>

              {/* <Typography className={classes.eventSiteName} variant="subtitle4">
                {site?.name}
              </Typography> */}
              {/* <Typography className={classes.eventSiteName} variant="subtitle4">
                    {location?.name}
                  </Typography> */}
            </>
          )}
        </Box>
      </Box>
      {[SCHEDULE_DUTIES.HIT].includes(shiftType) && (
        <>
          <Box className={classes.reassignedFooterFlex}>
            <Box className={classes.reassignedOfficerFlex}>
              <UnAssignHit />
            </Box>
            <Typography className={classes.reassignedName} variant="subtitle4">
              {tour?.title || t('obx.schedules.calendar.unassigned')}
            </Typography>
          </Box>
          <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
            <Box className={classes.reassignedFooterFlex}>
              {/* <Typography className={classes.eventSiteNameColor} variant="subtitle4">< <CarIcon /></Typography> */}
              <Box className={classes.reassignedOfficerFlex}>
                <RunsheetIcon />
              </Box>
              <Typography className={classes.reassignedName} variant="subtitle4">
                {runsheetName || t('obx.schedules.calendar.unassigned')}
              </Typography>
            </Box>
            <StatusTooltip
              {...{
                title: statusValue,
                icon: statusIcon,
              }}
            />
          </Box>
        </>
      )}
      {[SCHEDULE_DUTIES.PATROL, SCHEDULE_DUTIES.DISPATCH].includes(shiftType) && (
        <>
          <Box className={classes.reassignedFooterFlex}>
            <Box className={classes.reassignedOfficerFlex}>
              {shiftType === SCHEDULE_DUTIES.DISPATCH ? <DispatchIndicator /> : <CarIcon />}
            </Box>
            <Typography className={classes.reassignedName} variant="subtitle4">
              {name?.length > 25 ? (
                <Tooltip arrow title={name}>
                  {capitalizeFirstLetter(name).substring(0, 25) + '...'}
                </Tooltip>
              ) : (
                capitalizeFirstLetter(name)
              )}
            </Typography>
          </Box>
          <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
            <Box className={classes.reassignedFooterFlex}>
              <Box className={classes.reassignedOfficerFlex}>
                <Avatar className={classes.eventAvatar} src={officer?.imageUrl || AvatarSchedule} />
              </Box>
              <Typography className={classes.reassignedName} variant="subtitle4">
                {officer?.name || reassignedOfficer?.name || t('obx.schedules.calendar.unassigned')}
              </Typography>
            </Box>
          </Box>
          <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
            <Box className={classes.reassignedFooterFlex}>
              <Box className={classes.reassignedOfficerFlex}>
                {vehicle?.images?.[0]?.url ? (
                  <Avatar className={classes.eventAvatar} src={vehicle?.images?.[0]?.url} />
                ) : (
                  <Box className={classes.carIcon}>
                    <WhiteCarIcon />
                  </Box>
                )}
              </Box>
              <Typography className={classes.reassignedName} variant="subtitle4">
                {vehicle?.name || t('obx.schedules.calendar.unassigned')}
              </Typography>
            </Box>
            <Box className={classes.reassignedFooter}>
              {shift?.isSplit && (
                <Tooltip title={t('obx.schedules.splitShift.splitShift')}>
                  <Box className={classes.splitShiftIconWrapperInView}>
                    <SplittedCalenderIcon />
                  </Box>
                </Tooltip>
              )}
              {!!hasNotes && (
                <StatusTooltip
                  {...{
                    title: t('obx.schedules.calendar.scheduleStatus.noteStatusShow'),
                    icon: <NotesIcon />,
                  }}
                />
              )}
              <StatusTooltip
                {...{
                  title: statusValue,
                  icon: statusIcon,
                }}
              />
            </Box>
          </Box>
        </>
      )}

      {[SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(shiftType) && (
        <Box className={classes.reassignedFooterFlex}>
          <Typography className={classes.eventSiteName} variant="subtitle4">
            {site?.name}
          </Typography>
        </Box>
      )}

      {[SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(shiftType) && (
        <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
          <Box
            className={
              !reassignedOfficer ? classes.reassignedFooterFlex : classes.reassignedFooterFlexGap
            }
          >
            <Box className={classes.reassignedOfficerFlex}>
              <Avatar className={classes.eventAvatar} src={officer?.imageUrl || AvatarSchedule} />
              {reassignedOfficer && (
                <Avatar
                  className={classes.eventAvatarReassignedOfficer}
                  src={reassignedOfficer?.imageUrl || AvatarSchedule}
                />
              )}
            </Box>
            <Typography className={classes.reassignedName} variant="subtitle4">
              {officer?.name || reassignedOfficer?.name || t('obx.schedules.calendar.unassigned')}
            </Typography>
          </Box>
          <Box className={classes.notesIconDiv}>
            {isDedicatedCancelledShift ? (
              <CancelIcon />
            ) : (
              <>
                {[SCHEDULE_DUTIES.DEDICATED].includes(shiftType) && shift.isSplit && (
                  <Tooltip title={t('obx.schedules.splitShift.splitShift')}>
                    <Box className={classes.splitShiftIconWrapperInView}>
                      <SplittedCalenderIcon />
                    </Box>
                  </Tooltip>
                )}
                {!!hasNotes && (
                  <StatusTooltip
                    {...{
                      title: t('obx.schedules.calendar.scheduleStatus.noteStatusShow'),
                      icon: <NotesIcon />,
                    }}
                  />
                )}
                <StatusTooltip
                  {...{
                    title: statusValue,
                    icon: statusIcon,
                  }}
                />
              </>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

CalendarCardContent.propTypes = {
  shift: PropTypes.object,
  statusIcon: PropTypes.node,
  statusValue: PropTypes.string,
  is24Hours: PropTypes.bool,
};

const eventBgColorClasses = {
  [calendarShiftStatusEnum.NOT_STARTED]: 'dutyYellowBg',
  [calendarShiftStatusEnum.IN_PROGRESS]: 'dutyBlueBg',
  [calendarShiftStatusEnum.COMPLETED]: 'dutyGreenBg',
};

const getValuesWrtStatuses = ({ shift, t }) => {
  const { scheduleStatus, shiftStatus } = shift || {};
  // shiftType, shiftStatus, startsAt, endsAt, officer, requiresAttention
  let statusValue = '';
  let statusIcon = <></>;
  let eventBgColorClass = '';

  const isInProgressState = [
    ShiftStatus.SHIFT_STARTED,
    ShiftStatus.BREAK_STARTED,
    ShiftStatus.BREAK_ENDED,
  ].includes(shiftStatus);

  const effectiveScheduleStatus = isInProgressState
    ? calendarShiftStatusEnum.IN_PROGRESS
    : scheduleStatus;

  // if ([SCHEDULE_DUTIES.PATROL, SCHEDULE_DUTIES.HIT].includes(shiftType)) {
  eventBgColorClass = eventBgColorClasses[effectiveScheduleStatus];
  statusValue = calendarShiftStatusValues(t)?.[effectiveScheduleStatus];
  statusIcon = calendarIndicatorIcons[effectiveScheduleStatus];
  // } else {
  //   // dedicated | extra
  //   eventBgColorClass = requiresAttention ? 'dutyRedBg' : '';
  //   statusValue = checkIfShiftNotStartedYet({ shiftStatus, startsAt, endsAt, officer })
  //     ? t('obx.schedules.calendar.notStartedDuty')
  //     : '';
  // }

  return { statusIcon, statusValue, eventBgColorClass };
};
