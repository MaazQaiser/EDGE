import 'temporal-polyfill/global';
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import listPlugin from '@fullcalendar/react/list';
import fcClass from '@fullcalendar/react/protected-styles';
import themePlugin from '@fullcalendar/react/themes/classic';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import resourceTimelinePlugin from '@fullcalendar/react-scheduler/resource-timeline';
import { Box, Button, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as NoShiftIcon } from 'src/assets/images/no-shift.svg';
import { ReactComponent as LeftArrow } from 'src/assets/svg/calendar-left.svg';
import { ReactComponent as RightArrow } from 'src/assets/svg/calendar-right.svg';
import { ReactComponent as CalenderIcon } from 'src/assets/svg/DedicatedDuty/schedule-calendar.svg';
import { ReactComponent as ListIcon } from 'src/assets/svg/list.svg';
import {
  DAY_GRID,
  DEFAULT_CALENDER_VIEW,
  SCHEDULE_CALENDAR_VIRTUALIZATION,
  TIME_GRID,
} from 'src/utils/constants/schedules';

import CalendarSkeleton from '../skeletonLoader/calendarSkeleton';
import { useStyles } from './calendar.styles';

/** Vertical FC body scrollers (Locations column + day grid). */
const getVerticalScrollers = (root) => {
  if (!root) return [];
  return [...root.querySelectorAll(`.${fcClass.internalScroller}`)].filter((el) => {
    // Avoid getComputedStyle on every wheel tick — it forces style recalc/layout.
    // FC body scrollers use overflow via class; scrollability is enough to filter.
    return el.scrollHeight > el.clientHeight + 1;
  });
};

const normalizeWheelDeltaY = (event, pageHeight) => {
  let deltaY = event.deltaY;
  if (event.deltaMode === 1) deltaY *= 16;
  else if (event.deltaMode === 2) deltaY *= pageHeight || 1;
  return deltaY;
};

const FULL_CALENDAR_PLUGINS = [
  themePlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin,
  resourceTimelinePlugin,
];

// Falls back to FullCalendar's documented non-commercial key so the design
// demo doesn't show the "invalid license" notice; production sets the real key.
const SCHEDULER_LICENSE_KEY =
  process.env.REACT_APP_FULLCALENDAR_LICENSE_KEY || 'CC-Attribution-NonCommercial-NoDerivatives';

/**
 * Only show the virtual-scroll skeleton if the viewport stays empty this long.
 * Small scrolls remount within a frame and must not flash a loader.
 */
const VIRTUAL_SCROLL_BLANK_DELAY_MS = 120;
const VIRTUAL_SCROLL_ROW_POLL_MS = 50;

/** True when at least one virtualized row intersects the vertical scroll viewport. */
const hasVisibleVirtualRows = (root) => {
  if (!root) return false;
  const scrollers = [...root.querySelectorAll(`.${fcClass.internalScroller}`)].filter(
    (el) => el.scrollHeight > el.clientHeight + 1 || el.clientHeight > 0,
  );
  if (!scrollers.length) return false;

  const scroller = scrollers.reduce((wider, el) =>
    el.clientWidth >= wider.clientWidth ? el : wider,
  );
  const scrollerRect = scroller.getBoundingClientRect();
  if (scrollerRect.height < 2) return false;

  return [...scroller.querySelectorAll(`.${fcClass.fillX}`)].some((row) => {
    const rect = row.getBoundingClientRect();
    return (
      rect.height > 0 && rect.bottom > scrollerRect.top + 2 && rect.top < scrollerRect.bottom - 2
    );
  });
};

/**
 * Domain-agnostic calendar shell.
 * Consumers pass normalized resources/events and optional render callbacks.
 */
const Calendar = ({
  resources = [],
  events = [],
  queryParams,
  setQueryParams,
  loading = false,
  isEmpty = false,
  skeletonVariant = 'default',
  toolbarLeftContent,
  toolbarRightContent,
  showListSwitch = true,
  resourceColumnHeader = '',
  resourceOrder,
  eventContent,
  eventDidMount,
  eventClick,
  dayHeaderContent,
  slotHeaderContent,
  resourceCellContent,
  resourceCellClass,
  resourceLaneClass,
  resourceCellDidMount,
  resourceCellWillUnmount,
  resourceLaneDidMount,
  resourceLaneWillUnmount,
  weekSlotHeaderContent,
  resourceColumnsWidth = '15%',
  // Controlled by REACT_APP_SCHEDULE_CALENDAR_VIRTUALIZATION (true only when set to "true").
  // When on, paired FC scrollers are mirror-synced on the main thread.
  virtualization = SCHEDULE_CALENDAR_VIRTUALIZATION,
  calendarClassName = '',
  isOverviewSectionsEmptyOnly = false,
  // Rendered under the FC grid (full width). Used by day view so cards are not
  // trapped in FC's centered dayHeaderContent shrink-wrap.
  belowGridContent = null,
}) => {
  const calendarRef = useRef(null);
  const calendarContainerRef = useRef(null);
  const virtualScrollBlankTimerRef = useRef(null);
  const virtualScrollPollTimerRef = useRef(null);
  const isVirtualScrollLoadingRef = useRef(false);
  const [isVirtualScrollLoading, setIsVirtualScrollLoading] = useState(false);
  // Hide the grid until updateSize runs after data arrives — otherwise the first
  // paint can show cards with wrong column widths (off the day grid lines).
  const [isTimelineLaidOut, setIsTimelineLaidOut] = useState(false);
  const classes = useStyles();
  // Pre-revamp behaviour: keep prior events/resources visible under the loading
  // skeleton so FullCalendar never remounts from a 1×1 hidden host (that caused
  // 1px day columns / thin-strip flash). Only clear when the loaded result is empty.
  const displayResources = !loading && isEmpty ? [] : resources;
  const displayEvents = !loading && isEmpty ? [] : events;
  const showLoadingOverlay = loading || (!isEmpty && !isTimelineLaidOut);
  // Fixed-height FC scrollport so the date/slot header stays outside the body
  // scroller (no sticky-in-outer-scroll stretch). Virtualization also needs this
  // to measure viewport + scrollTop. Day view with belowGridContent stays auto
  // so only the date chip is painted and cards scroll in the outer wrapper.
  /* Month sizes to its content; every other view fills the scrollport.
     `100%` made the five week-rows stretch to fill 750px, so a cell holding one
     line of text ("2 Visits") was 150px tall and the month read as a grid that had
     failed to load. A month cell here is a count, not a stack of cards, so there is
     nothing for that height to hold. This also lets the `contentHeight: 'auto'` in
     the `dayGridMonth` view config take effect — FullCalendar ignores it whenever
     `height` is set. */
  const isMonthView = queryParams?.selectedView?.type === DAY_GRID.MONTH;
  const calendarHeight = belowGridContent || isMonthView ? 'auto' : '100%';
  const resolvedCalendarClassName = [
    calendarClassName,
    isOverviewSectionsEmptyOnly ? classes.overviewCalendarSectionsEmpty : '',
    isMonthView ? classes.monthGridCompact : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Hide until FC finishes column + row sizing after eventContent mounts.
  // A single updateSize in the same turn is not enough — row heights settle one
  // paint later, which caused a brief "cards off the grid lines" flash.
  useLayoutEffect(() => {
    if (loading) {
      setIsTimelineLaidOut(false);
      return undefined;
    }

    if (isEmpty) {
      setIsTimelineLaidOut(true);
      return undefined;
    }

    let cancelled = false;
    let outerFrame = 0;
    let innerFrame = 0;

    calendarRef.current?.getApi?.()?.updateSize?.();

    outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        if (cancelled) return;
        calendarRef.current?.getApi?.()?.updateSize?.();
        setIsTimelineLaidOut(true);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [loading, isEmpty, displayResources, displayEvents]);

  // Keep column widths in sync when the schedule chrome resizes.
  useEffect(() => {
    const containerEl = calendarContainerRef.current;
    if (!containerEl || typeof ResizeObserver === 'undefined') return undefined;

    let frameId = null;
    let lastWidth = containerEl.offsetWidth;

    const observer = new ResizeObserver((entries) => {
      const width = Math.round(entries[0]?.contentRect?.width ?? 0);
      if (width === lastWidth) return;
      lastWidth = width;

      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        calendarRef.current?.getApi?.()?.updateSize?.();
      });
    });
    observer.observe(containerEl);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  // Keep Locations + day grid locked while virtualized. FC's ScrollerSyncer updates
  // the follower on the main thread after the master may already have painted via
  // compositor scrolling — fast wheel makes that lag visible. Intercept wheel and
  // set both scrollTops together before paint.
  // Skeleton only if the remount gap leaves the viewport blank past a short delay.
  useEffect(() => {
    if (!virtualization || loading || isEmpty || !isTimelineLaidOut) {
      isVirtualScrollLoadingRef.current = false;
      setIsVirtualScrollLoading(false);
      return undefined;
    }

    const container = calendarContainerRef.current;
    if (!container) return undefined;

    let syncingScroll = false;
    let cachedScrollers = null;
    let cachedPrimary = null;

    const refreshScrollerCache = () => {
      cachedScrollers = getVerticalScrollers(container);
      cachedPrimary =
        cachedScrollers.length > 0
          ? cachedScrollers.reduce((wider, el) =>
              el.clientWidth >= wider.clientWidth ? el : wider,
            )
          : null;
      return cachedScrollers;
    };

    const getCachedScrollers = () => {
      if (
        !cachedScrollers ||
        cachedScrollers.some(
          (scroller) => !scroller.isConnected || scroller.scrollHeight <= scroller.clientHeight + 1,
        )
      ) {
        return refreshScrollerCache();
      }
      return cachedScrollers;
    };

    const clearBlankTimer = () => {
      if (virtualScrollBlankTimerRef.current) {
        clearTimeout(virtualScrollBlankTimerRef.current);
        virtualScrollBlankTimerRef.current = null;
      }
    };

    const clearPollTimer = () => {
      if (virtualScrollPollTimerRef.current) {
        clearTimeout(virtualScrollPollTimerRef.current);
        virtualScrollPollTimerRef.current = null;
      }
    };

    const hideVirtualScrollLoader = () => {
      clearBlankTimer();
      clearPollTimer();
      if (!isVirtualScrollLoadingRef.current) return;
      isVirtualScrollLoadingRef.current = false;
      setIsVirtualScrollLoading(false);
    };

    const pollUntilRowsVisible = () => {
      clearPollTimer();
      virtualScrollPollTimerRef.current = setTimeout(() => {
        if (hasVisibleVirtualRows(container)) {
          hideVirtualScrollLoader();
          return;
        }
        pollUntilRowsVisible();
      }, VIRTUAL_SCROLL_ROW_POLL_MS);
    };

    const showVirtualScrollLoader = () => {
      if (isVirtualScrollLoadingRef.current) return;
      isVirtualScrollLoadingRef.current = true;
      setIsVirtualScrollLoading(true);
      pollUntilRowsVisible();
    };

    // After scroll, wait a beat. Only cover with skeleton if still blank — i.e.
    // virtualization has not remounted rows yet. Instant remounts never flash.
    const evaluateVirtualScrollViewport = () => {
      if (hasVisibleVirtualRows(container)) {
        hideVirtualScrollLoader();
        return;
      }

      if (isVirtualScrollLoadingRef.current || virtualScrollBlankTimerRef.current) return;

      virtualScrollBlankTimerRef.current = setTimeout(() => {
        virtualScrollBlankTimerRef.current = null;
        if (!hasVisibleVirtualRows(container)) {
          showVirtualScrollLoader();
        }
      }, VIRTUAL_SCROLL_BLANK_DELAY_MS);
    };

    const onWheel = (event) => {
      if (event.ctrlKey) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const scrollers = getCachedScrollers();
      if (scrollers.length < 2) return;

      const overScroller = scrollers.some(
        (scroller) => scroller === event.target || scroller.contains(event.target),
      );
      if (!overScroller) return;

      const primary = cachedPrimary || scrollers[0];
      const maxScrollTop = primary.scrollHeight - primary.clientHeight;
      if (maxScrollTop <= 0) return;

      event.preventDefault();
      const nextTop = Math.max(
        0,
        Math.min(
          maxScrollTop,
          primary.scrollTop + normalizeWheelDeltaY(event, primary.clientHeight),
        ),
      );

      syncingScroll = true;
      scrollers.forEach((scroller) => {
        if (scroller.scrollTop !== nextTop) scroller.scrollTop = nextTop;
      });
      syncingScroll = false;
      requestAnimationFrame(evaluateVirtualScrollViewport);
    };

    const onScroll = (event) => {
      if (syncingScroll) return;
      const scrollers = getCachedScrollers();
      if (scrollers.length < 2 || !scrollers.includes(event.target)) return;

      syncingScroll = true;
      const { scrollTop } = event.target;
      scrollers.forEach((scroller) => {
        if (scroller !== event.target && scroller.scrollTop !== scrollTop) {
          scroller.scrollTop = scrollTop;
        }
      });
      syncingScroll = false;
      requestAnimationFrame(evaluateVirtualScrollViewport);
    };

    container.addEventListener('wheel', onWheel, { passive: false, capture: true });
    container.addEventListener('scroll', onScroll, { passive: true, capture: true });

    return () => {
      container.removeEventListener('wheel', onWheel, { capture: true });
      container.removeEventListener('scroll', onScroll, { capture: true });
      clearBlankTimer();
      clearPollTimer();
    };
  }, [virtualization, loading, isEmpty, isTimelineLaidOut, displayResources, displayEvents]);

  const handleEventClick = useCallback(
    (info) => {
      if (typeof eventClick === 'function') {
        eventClick(info, calendarRef);
        return;
      }

      if (info.view.type === DAY_GRID.MONTH) {
        const updatedViewType = DAY_GRID.DAY;
        const API = calendarRef.current?.getApi?.();
        if (!API) return;

        API.changeView(updatedViewType, info.event.start);
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
      }
    },
    [eventClick, setQueryParams],
  );

  return (
    <Box
      className={`${classes.calendar} ${virtualization ? classes.calendarVirtualized : ''}${
        resolvedCalendarClassName ? ` ${resolvedCalendarClassName}` : ''
      }`}
      ref={calendarContainerRef}
    >
      <CalendarHeaderToolbar
        calendarRef={calendarRef}
        queryParams={queryParams}
        setQueryParams={setQueryParams}
        toolbarLeftContent={toolbarLeftContent}
        toolbarRightContent={toolbarRightContent}
        showListSwitch={showListSwitch}
      />
      <Box className={classes.calendarBody}>
        {showLoadingOverlay && (
          <Box
            className={classes.calendarLoadingPlaceholder}
            data-testid="calendar-loading-placeholder"
          >
            <CalendarSkeleton
              variant={skeletonVariant}
              windowStart={queryParams?.selectedView?.windowStart}
              resourceColumnsWidth={resourceColumnsWidth}
            />
          </Box>
        )}
        {!loading && isEmpty && (
          <Box
            className={classes.calendarEmptyPlaceholder}
            data-testid="calendar-empty-placeholder"
          >
            <NoEvent />
          </Box>
        )}
        {virtualization && isVirtualScrollLoading && !showLoadingOverlay && !isEmpty && (
          <Box
            className={classes.calendarVirtualScrollOverlay}
            data-testid="calendar-virtual-scroll-loader"
          >
            <CalendarSkeleton
              variant={skeletonVariant}
              windowStart={queryParams?.selectedView?.windowStart}
              resourceColumnsWidth={resourceColumnsWidth}
            />
          </Box>
        )}
        <Box
          className={`${classes.calendarGridVisible}${
            virtualization ? ` ${classes.calendarGridVirtualized}` : ''
          }${isEmpty && !loading ? ` ${classes.calendarGridEmpty}` : ''}${
            belowGridContent ? ` ${classes.calendarGridWithBelowContent}` : ''
          }${showLoadingOverlay ? ` ${classes.calendarGridLoading}` : ''}`}
          aria-hidden={showLoadingOverlay || undefined}
        >
          <FullCalendar
            plugins={FULL_CALENDAR_PLUGINS}
            // Restore v6 root class so existing Signal calendar CSS can scope under `.fc`.
            className="fc"
            headerToolbar={false}
            initialView={DEFAULT_CALENDER_VIEW}
            height={calendarHeight}
            tableHeaderSticky
            schedulerLicenseKey={SCHEDULER_LICENSE_KEY}
            virtualization={virtualization}
            // Classic theme centers day headers by intrinsic width — breaks day view
            // when cards lived in dayHeaderContent. Keep start so the date chip is left-aligned.
            dayHeaderAlign="start"
            events={displayEvents}
            eventDidMount={eventDidMount}
            eventClick={handleEventClick}
            ref={calendarRef}
            allDaySlot={false}
            dayHeaderContent={dayHeaderContent}
            eventContent={eventContent}
            slotHeaderContent={slotHeaderContent}
            noEventsContent={<NoEvent />}
            resources={displayResources}
            resourceOrder={resourceOrder}
            resourceCellContent={resourceCellContent}
            resourceCellClass={resourceCellClass}
            resourceCellInnerClass={classes.resourceCellInnerReset}
            resourceLaneClass={resourceLaneClass}
            resourceCellDidMount={resourceCellDidMount}
            resourceCellWillUnmount={resourceCellWillUnmount}
            resourceLaneDidMount={resourceLaneDidMount}
            resourceLaneWillUnmount={resourceLaneWillUnmount}
            resourceColumnDividerClass={classes.resourceTimelineDivider}
            resourceColumnHeaderInnerClass={classes.resourceColumnHeaderInner}
            firstDay={6}
            resourceColumnHeaderContent={resourceColumnHeader}
            slotDuration={{ days: 1 }}
            slotHeaderInterval={{ days: 1 }}
            views={{
              resourceTimelineWeek: {
                // Week timeline uses a custom 1px resource↔grid divider; suppress FC's
                // outer left/right borders. Do NOT set globally — day/month grids need them.
                borderlessX: true,
                slotHeaderContent: weekSlotHeaderContent || dayHeaderContent,
                slotHeaderInnerClass: classes.slotHeaderInnerReset,
                resourceColumnsWidth,
                dragScroll: false,
                slotMinWidth: 1,
                // Keep Signal event cards flush — classic timeline adds row padding.
                rowEventInnerClass: classes.rowEventInnerReset,
                eventOverlap: true,
              },
              // Day header is a full-bleed strip (top/bottom rules only) — no side borders.
              dayGridDay: {
                borderlessX: true,
                dayHeaderAlign: 'start',
              },
              dayGridMonth: {
                /* FullCalendar pads every month to six weeks by default. August 2026
                   needs five, so the grid rendered a whole extra row — Sep 5–11,
                   empty, ~150px tall, with nothing in it and nothing that could ever
                   be in it, because it is outside the range that was fetched. It read
                   as the view failing to load its last week. */
                fixedWeekCount: false,
                /* And rows sized themselves to fill the viewport rather than to their
                   contents, so each one was ~150px of white around a single line of
                   text. A month cell here holds a count, not a list of cards — let
                   the rows be as tall as what is in them. */
                contentHeight: 'auto',
              },
            }}
          />
          {!loading && isTimelineLaidOut && belowGridContent}
        </Box>
      </Box>
    </Box>
  );
};

Calendar.propTypes = {
  resources: PropTypes.array,
  events: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  queryParams: PropTypes.object,
  setQueryParams: PropTypes.func,
  loading: PropTypes.bool,
  isEmpty: PropTypes.bool,
  skeletonVariant: PropTypes.string,
  toolbarLeftContent: PropTypes.node,
  toolbarRightContent: PropTypes.node,
  showListSwitch: PropTypes.bool,
  resourceColumnHeader: PropTypes.string,
  resourceOrder: PropTypes.string,
  eventContent: PropTypes.func,
  eventDidMount: PropTypes.func,
  eventClick: PropTypes.func,
  dayHeaderContent: PropTypes.func,
  slotHeaderContent: PropTypes.func,
  resourceCellContent: PropTypes.func,
  resourceCellClass: PropTypes.func,
  resourceLaneClass: PropTypes.func,
  resourceCellDidMount: PropTypes.func,
  resourceCellWillUnmount: PropTypes.func,
  resourceLaneDidMount: PropTypes.func,
  resourceLaneWillUnmount: PropTypes.func,
  weekSlotHeaderContent: PropTypes.func,
  resourceColumnsWidth: PropTypes.string,
  virtualization: PropTypes.bool,
  calendarClassName: PropTypes.string,
  isOverviewSectionsEmptyOnly: PropTypes.bool,
  belowGridContent: PropTypes.node,
};

export default Calendar;

export const getStartEndTimeForView = ({ activeStart, activeEnd, type }) => {
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

const CalendarHeaderToolbar = ({
  calendarRef,
  queryParams,
  setQueryParams,
  toolbarLeftContent,
  toolbarRightContent,
  showListSwitch = true,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [title, setTitle] = useState('');
  const calendarView = queryParams.selectedView?.type;

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

  const dayTitleFormat = (info) => {
    const { view } = info;
    const currentDisplayDate = view.activeStart;
    const month = currentDisplayDate.toLocaleString('default', { month: 'long' });
    const day = currentDisplayDate.getDate();
    const year = currentDisplayDate.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const weekTitleFormat = (info) => {
    const { view } = info;
    const currentDisplayDate = view.activeStart;
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

  const handleGoToToday = () => {
    const calendarGetApi = calendarRef.current?.getApi();
    if (!calendarGetApi) return;

    calendarGetApi.today();
    const { activeEnd, activeStart, type } = calendarGetApi.view || {};
    const { windowStart, windowEnd } = getStartEndTimeForView({ activeEnd, activeStart, type });

    setQueryParams((prev) => ({
      ...prev,
      selectedView: { ...prev.selectedView, windowStart, windowEnd },
    }));
  };

  // "Today" is only meaningful when the visible range does not already contain
  // it. This is a browser-clock comparison — the schedules-domain timezone
  // helper does not belong in the shared calendar, and the only consequence of
  // being off near a period boundary is whether the button reads as disabled.
  const isViewingToday = (() => {
    const { windowStart, windowEnd } = queryParams.selectedView || {};
    if (!windowStart || !windowEnd) return false;

    const now = dayjs();
    return now.isAfter(dayjs(windowStart)) && now.isBefore(dayjs(windowEnd));
  })();

  const dateNavigator = (
    <Box className={classes.calendarHeaderToolbarLeft}>
      <Button
        variant="tertiaryGrey"
        className={classes.calendarHeaderToolbarLeftAction}
        onClick={handlePrevNext(false)}
        aria-label={t('obx.schedules.calendar.previousPeriod')}
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
        aria-label={t('obx.schedules.calendar.nextPeriod')}
      >
        <RightArrow />
      </Button>
      {/* Without this, returning to the current period meant clicking the arrow
          once per week navigated away. */}
      <Button
        variant="tertiaryGrey"
        className={classes.calendarHeaderToolbarToday}
        onClick={handleGoToToday}
        disabled={isViewingToday}
      >
        {t('obx.schedules.calendar.today')}
      </Button>
    </Box>
  );

  return (
    <Box
      className={`${classes.calendarHeaderToolbar} ${
        toolbarLeftContent ? classes.calendarHeaderToolbarWithFilters : ''
      }`}
    >
      {toolbarLeftContent ? (
        <Box className={classes.calendarHeaderToolbarFilters}>{toolbarLeftContent}</Box>
      ) : (
        dateNavigator
      )}
      <Box className={classes.calendarHeaderToolbarRight}>
        {toolbarRightContent}
        {toolbarLeftContent && dateNavigator}
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

        {showListSwitch && (
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
        )}
      </Box>
    </Box>
  );
};

CalendarHeaderToolbar.propTypes = {
  calendarRef: PropTypes.object,
  queryParams: PropTypes.object,
  setQueryParams: PropTypes.func,
  toolbarLeftContent: PropTypes.node,
  toolbarRightContent: PropTypes.node,
  showListSwitch: PropTypes.bool,
};

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
