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
import {
  Box,
  Button,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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
 * How the toolbar's right-hand cluster is ordered.
 *
 * Two arrangements of the same four things — the date navigator, the caller's
 * `toolbarRightContent`, the Day/Week/Month toggle and `toolbarTrailingContent`:
 *
 * - `DATE_FIRST` — date navigator, then the right slot, then the view toggles,
 *   then the trailing slot. The original order, and the default.
 * - `TOGGLES_FIRST` — the right slot and the view toggles lead, the date
 *   navigator follows them, and the trailing slot still closes the row. For a
 *   caller that wants "what am I looking at" ahead of "when".
 *
 * Named for the *shape* rather than for any caller's variation, because this is
 * the shared shell: it knows about a date navigator and two content slots, and
 * nothing about what a consumer puts in them.
 */
export const CALENDAR_TOOLBAR_ARRANGEMENT = {
  DATE_FIRST: 'dateFirst',
  TOGGLES_FIRST: 'togglesFirst',
};

/**
 * Read by the toolbar, provided by whoever renders the calendar — **through
 * context rather than a prop** because the two are not always neighbours: the
 * schedules grid sits between the page and this shell and forwards a fixed prop
 * list, so an ordering prop would have to be plumbed through a component that has
 * no interest in it. The default is the order this toolbar has always drawn, so a
 * caller that provides nothing is unaffected.
 */
export const CalendarToolbarArrangementContext = createContext(
  CALENDAR_TOOLBAR_ARRANGEMENT.DATE_FIRST,
);

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
  toolbarLeadingContent,
  toolbarLeftContent,
  toolbarRightContent,
  toolbarTrailingContent,
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
  monthFillsScrollport = false,
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
     `height` is set.

     `monthFillsScrollport` is for the month whose cells *are* a stack of cards.
     There the reasoning inverts: a week row sized to its contents is 62px, so the
     grid ended a third of the way down the page with the rest of the scrollport
     white below it, and the chips inside those rows had no room to be spaced
     apart. Caller-driven rather than inferred, because only the caller knows what
     its cells hold. */
  const isMonthView = queryParams?.selectedView?.type === DAY_GRID.MONTH;
  const monthSizesToContent = isMonthView && !monthFillsScrollport;
  const calendarHeight = belowGridContent || monthSizesToContent ? 'auto' : '100%';
  const resolvedCalendarClassName = [
    calendarClassName,
    isOverviewSectionsEmptyOnly ? classes.overviewCalendarSectionsEmpty : '',
    isMonthView ? classes.monthGridCompact : '',
  ]
    .filter(Boolean)
    .join(' ');

  window.__calDebug = {
    calendarHeight,
    monthSizesToContent,
    isMonthView,
    monthFillsScrollport,
    ref: () => calendarRef.current,
  };

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
        toolbarLeadingContent={toolbarLeadingContent}
        toolbarLeftContent={toolbarLeftContent}
        toolbarRightContent={toolbarRightContent}
        toolbarTrailingContent={toolbarTrailingContent}
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
                // outer left/right borders. Do NOT set globally — the classic theme's
                // viewClass always adds a top+bottom border regardless of this flag, so
                // setting it per-view only ever drops the left/right pair (see dayGridDay
                // and dayGridMonth below, which want that same open-sided look).
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
                /* Same reasoning as `dayGridDay`/`resourceTimelineWeek` above: the classic
                   theme's `viewClass` always borders the view root top+bottom, and adds a
                   left+right pair on top of that unless `borderlessX` says otherwise. Month
                   was the one view still leaving that pair on, so it alone read as a boxed-in
                   card — internal cell rules (`.fc-theme-standard td`/`th`) are untouched by
                   this flag and still divide the days and weeks. */
                borderlessX: true,
                /* FullCalendar pads every month to six weeks by default. August 2026
                   needs five, so the grid rendered a whole extra row — Sep 5–11,
                   empty, ~150px tall, with nothing in it and nothing that could ever
                   be in it, because it is outside the range that was fetched. It read
                   as the view failing to load its last week. */
                fixedWeekCount: false,
                /* And rows sized themselves to fill the viewport rather than to their
                   contents, so each one was ~150px of white around a single line of
                   text. A month cell here holds a count, not a list of cards — let
                   the rows be as tall as what is in them.

                   Spread in rather than set to `undefined`, because `contentHeight`
                   outranks `height`: a grid that wants the port has to have this
                   option *absent*, not merely falsy — and then has to say so
                   twice, since a calendar given a height still leaves its rows at
                   their content size until `expandRows` lets them take it. */
                ...(monthSizesToContent ? { contentHeight: 'auto' } : { expandRows: true }),
                /* Except on the company grouping, where a cell holds one chip per
                   visit and a busy day would otherwise stretch its whole week row.
                   Three is what fits before the row is taller than the two beside
                   it; the rest collapse into FullCalendar's own "+N more", which
                   opens the day. Harmless on the counting cells — those never
                   render more than one entry per service. */
                dayMaxEvents: 3,
                /**
                 * Keep the order the payload arrived in, which is start-time order.
                 *
                 * FullCalendar's default `eventOrder` is `start,-duration,allDay,title`.
                 * A month visit is deliberately an all-day event with a date-only
                 * start (that is what puts the chip in the cell's flow instead of on
                 * a time axis), so the first three keys tie on every chip in a cell
                 * and **`title` decides** — and the title is the window's name. That
                 * sorted a day alphabetically: `Afternoon visit`, `Evening visit`,
                 * `Midday visit`, `Morning visit`, i.e. 2p, 5p, 11a, 8a. Sorting the
                 * events before handing them over could not survive it.
                 *
                 * So the month sorts on an explicit key instead. `sortKey` is stamped
                 * on every visit event as the franchise-local `YYYY-MM-DDTHH:mm` — the
                 * same projection that places the chip in its cell and prints the time
                 * on it, so the order, the placement and the label cannot disagree.
                 * Naming the key here rather than relying on `Array.sort` stability is
                 * the difference between FullCalendar preserving our order and
                 * re-deriving one of its own.
                 *
                 * Scoped to `dayGridMonth`: the week and day grids keep FullCalendar's
                 * own ordering, where a real clock time makes `start` the deciding key
                 * rather than a tiebreak. The aggregate month carries no `sortKey` and
                 * needs none — one entry per day per service.
                 */
                eventOrder: 'sortKey',
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
  /** Leads the row, before the filters, separated from them by a hairline rule. */
  toolbarLeadingContent: PropTypes.node,
  toolbarLeftContent: PropTypes.node,
  toolbarRightContent: PropTypes.node,
  /** Rendered after the view toggles, at the row's right edge — for page actions. */
  toolbarTrailingContent: PropTypes.node,
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
  /** Month cells hold a stack of cards, so the grid takes the whole scrollport. */
  monthFillsScrollport: PropTypes.bool,
};

export default Calendar;

/**
 * Month reports its window as two *inclusive* date-only strings, so `windowEnd` is
 * the last cell the grid actually draws — for an August grid that ends on Sep 4,
 * `2026-09-04`. FullCalendar's `activeEnd` is exclusive (`Sep 5` for that grid), so
 * the last visible date is always one day back from it.
 *
 * That day used to be taken off by calling `activeEnd.setDate(...)` — an in-place
 * write to a Date that belongs to FullCalendar's live view object, on a function
 * that runs on mount, on prev/next, on view change and on Today. It happened to
 * stay a stable one-day shift only because `view.activeEnd` is a getter that builds
 * a throwaway Date per access; the moment a caller read `activeEnd` once and passed
 * it twice, the window would have walked backwards a day at a time. Subtract into a
 * new value instead and never write through the argument.
 *
 * Anything turning this string back into an instant has to treat it as the *end* of
 * that day (23:59:59.999). Read as midnight it excludes the day it names, which is
 * how every visit on the last visible cell went missing from the month grid.
 */
export const getStartEndTimeForView = ({ activeStart, activeEnd, type }) => {
  if (type == DAY_GRID.MONTH) {
    return {
      windowStart: dayjs(activeStart)?.format('YYYY-MM-DD'),
      windowEnd: dayjs(activeEnd)?.subtract(1, 'day')?.format('YYYY-MM-DD'),
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
  toolbarLeadingContent,
  toolbarLeftContent,
  toolbarRightContent,
  toolbarTrailingContent,
  showListSwitch = true,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [title, setTitle] = useState('');
  const calendarView = queryParams.selectedView?.type;
  const toolbarArrangement = useContext(CalendarToolbarArrangementContext);
  const leadsWithToggles = toolbarArrangement === CALENDAR_TOOLBAR_ARRANGEMENT.TOGGLES_FIRST;

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

  const [datePickerAnchorEl, setDatePickerAnchorEl] = useState(null);
  const isDatePickerOpen = Boolean(datePickerAnchorEl);

  const handleOpenDatePicker = (event) => {
    setDatePickerAnchorEl(event.currentTarget);
  };

  const handleCloseDatePicker = () => {
    setDatePickerAnchorEl(null);
  };

  const handleSelectDate = (selectedDate) => {
    const calendarGetApi = calendarRef.current?.getApi();
    if (!calendarGetApi || !selectedDate) return;

    calendarGetApi.gotoDate(selectedDate.toDate());

    const { activeEnd, activeStart, type } = calendarGetApi.view || {};
    const { windowStart, windowEnd } = getStartEndTimeForView({ activeEnd, activeStart, type });

    setQueryParams((prev) => ({
      ...prev,
      selectedView: { ...prev.selectedView, windowStart, windowEnd },
    }));

    handleCloseDatePicker();
  };

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
      <Box
        component="button"
        type="button"
        className={classes.calendarHeaderToolbarLeftTextTrigger}
        onClick={handleOpenDatePicker}
        aria-label={t('obx.schedules.calendar.openDatePicker')}
      >
        <Typography className={classes.calendarHeaderToolbarLeftText} variant="subtitle2">
          {title}
        </Typography>
      </Box>
      <Popover
        open={isDatePickerOpen}
        anchorEl={datePickerAnchorEl}
        onClose={handleCloseDatePicker}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        className={classes.calendarHeaderToolbarDatePickerPopover}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={
              queryParams.selectedView?.windowStart
                ? dayjs(queryParams.selectedView.windowStart)
                : null
            }
            onChange={handleSelectDate}
          />
        </LocalizationProvider>
      </Popover>
      <Button
        variant="tertiaryGrey"
        className={classes.calendarHeaderToolbarLeftAction}
        onClick={handlePrevNext(true)}
        aria-label={t('obx.schedules.calendar.nextPeriod')}
      >
        <RightArrow />
      </Button>
    </Box>
  );

  return (
    <Box
      className={`${classes.calendarHeaderToolbar} ${
        toolbarLeftContent ? classes.calendarHeaderToolbarWithFilters : ''
      }`}
    >
      {/* Ahead of the filters, and fenced off from them by a hairline rule: what
          leads this row is a *view* control — it re-groups the grid rather than
          narrowing it — and sitting flush against a run of filter dropdowns it read
          as the first of them. The rule is drawn only when something is in the slot,
          so a caller that passes nothing gets no stray line. */}
      {toolbarLeadingContent}
      {toolbarLeadingContent ? (
        <Box className={classes.calendarHeaderToolbarLeadingDivider} aria-hidden />
      ) : null}
      {toolbarLeftContent ? (
        <Box className={classes.calendarHeaderToolbarFilters}>{toolbarLeftContent}</Box>
      ) : (
        dateNavigator
      )}
      <Box className={classes.calendarHeaderToolbarRight}>
        {/* After the date navigator, so it lands beside the Day/Week/Month toggle:
            both are view controls and reading them as one cluster is the point.

            Under `TOGGLES_FIRST` the navigator moves to *after* the toggles instead
            (see below) — the cluster is unchanged, only which side of it the date
            sits on. Rendered in one place or the other, never both. */}
        {toolbarLeftContent && !leadsWithToggles && dateNavigator}
        {toolbarRightContent}
        {/* **D / W / M**, not Day / Week / Month. Three words are three of the widest
            things in a row that now also carries a labelled grouping toggle, a date
            range and two page actions, and the words were the most compressible of
            them: the initials are unambiguous *because* the three are always shown
            together and always in that order.

            Each keeps its full name in a tooltip and in `aria-label`, so nothing is
            lost to anyone reading the control rather than glancing at it — the
            Tooltip wraps the *button*, never a bare glyph, for the ref reason noted
            on the grouping switch. */}
        {calendarView !== TIME_GRID.LIST && (
          <ToggleButtonGroup
            value={calendarView}
            exclusive
            className={classes.calendarHeaderToolbarToggle}
          >
            {[
              { value: DAY_GRID.DAY, short: 'dayShort', full: 'day' },
              { value: DAY_GRID.WEEK, short: 'weekShort', full: 'week' },
              { value: DAY_GRID.MONTH, short: 'monthShort', full: 'month' },
            ].map((view) => {
              const fullLabel = t(`obx.schedules.calendar.view.${view.full}`);
              return (
                <Tooltip key={view.value} arrow placement="top" title={fullLabel}>
                  <ToggleButton
                    className={classes.calendarHeaderToolbarToggleBtn}
                    value={view.value}
                    aria-label={fullLabel}
                    onClick={handleChangeCalenderView(view.value)}
                  >
                    {t(`obx.schedules.calendar.view.${view.short}`)}
                  </ToggleButton>
                </Tooltip>
              );
            })}
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

        {/* `TOGGLES_FIRST`: the toggles have had their turn, so the date navigator
            follows them here instead of leading the cluster. Still inside the right
            group and still before the trailing slot — the page action keeps the
            edge in both arrangements. */}
        {toolbarLeftContent && leadsWithToggles && dateNavigator}

        {/* The trailing slot: after the view toggles, hard against the right edge.
            `toolbarRightContent` lands *before* them so that what it usually holds —
            another segmented control — reads as part of the same cluster. A page
            action does not: it is the end of the row, not a member of that group. */}
        {toolbarTrailingContent}
      </Box>
    </Box>
  );
};

CalendarHeaderToolbar.propTypes = {
  calendarRef: PropTypes.object,
  queryParams: PropTypes.object,
  setQueryParams: PropTypes.func,
  /** Leads the row, before the filters, separated from them by a hairline rule. */
  toolbarLeadingContent: PropTypes.node,
  toolbarLeftContent: PropTypes.node,
  toolbarRightContent: PropTypes.node,
  /** Rendered after the view toggles, at the row's right edge — for page actions. */
  toolbarTrailingContent: PropTypes.node,
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
