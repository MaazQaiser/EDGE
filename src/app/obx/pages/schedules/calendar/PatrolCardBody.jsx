import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import AvatarSchedule from 'src/assets/images/Avatar-schedule.png';
import { SplittedCalenderIcon } from 'src/assets/svg';
import { ReactComponent as CarIcon } from 'src/assets/svg/carImage.svg';
import { ReactComponent as DispatchIndicator } from 'src/assets/svg/dispatchIndicator.svg';
import { ReactComponent as RunsheetHitsIcon } from 'src/assets/svg/hits-runsheet.svg';
import { ReactComponent as NotesIcon } from 'src/assets/svg/notesStatus.svg';
import { ReactComponent as UnassignedOfficerIcon } from 'src/assets/svg/unassigned-officer.svg';
import { ReactComponent as UnassignedVehicleIcon } from 'src/assets/svg/unassigned-vehicle.svg';
import { ReactComponent as WhiteCarIcon } from 'src/assets/svg/WhiteCarIcon.svg';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';
import { capitalizeFirstLetter } from 'src/utils/string/common';

/**
 * Everything a patrol or dispatch card says below its time line: who is on it,
 * which vehicle, and the marks in the corner.
 *
 * Extracted from `CalendarCardContent` in `ScheduleCalendarGrid.jsx` for the reason
 * `VisitMonthChipContent` was — that file imports FullCalendar, which jest's
 * transform cannot parse, so nothing rendered inside it can be asserted on. It takes
 * `classes` as a prop for the same reason: `calendar.styles.js` reaches
 * FullCalendar's protected styles and is equally out of reach from a test. See
 * `patrolCardBody.render.test.js`.
 *
 * ── Three shapes, one body ──
 *
 * Every shape is **two lines under the card's time line**, and which two depends on
 * what the surface has to say:
 *
 * 1. `showVehicle` — officer, then vehicle with the marks pinned right of it. Every
 *    surface but one: the patrol and dedicated tabs, the multi-service overview, the
 *    site and user embeds, and the day view's expanded card.
 * 2. **the routes reading, with a visit count** — officer on its own line, then the
 *    run's visit count with the marks pinned right of *it*. The rows there are the
 *    routes and which van runs one is not that reading's question, so the vehicle
 *    line is free; the count takes the slot rather than leaving it empty, and the
 *    marks keep the exact position they hold on every other card.
 * 3. **the routes reading with no count to show** — officer and marks share one row.
 *    The window has no visit list (a visits fetch that failed, an embedded grid),
 *    so there is nothing to fill the second line with, and a line holding only the
 *    corner marks is a gap where something was taken out.
 *
 * Shape 2 is where this card spent the height it briefly gave up. It was compressed
 * to two lines total when the vehicle came off, matching the visit card's "two lines
 * at most"; the ask now is the opposite — more room — so the officer gets its own
 * line back and stops competing with the marks for width, and the count gets a line
 * where it is not crowding anything.
 *
 * ── The count: a number and a mark, no noun ──
 *
 * `visitCount` is how many visits this run is carrying (`routeVisitCount.js`). It is
 * drawn as `hits-runsheet.svg` and a figure, and **no word** — asked for directly.
 * The glyph is not decoration standing in for the missing noun: it is the mark this
 * app already uses for exactly this fact, "hits on a runsheet", on the Runsheets
 * listing (`runSheets/listing`, `N Hits`). Same object, same question, same mark, so
 * a planner who has seen one has seen the other. The word survives in the native
 * tooltip (`visitCountTitle`), in the tenant's own vocabulary, which is what keeps a
 * bare numeral legible on first encounter without spending card width on it every
 * time.
 *
 * Quiet by construction, per D29: the asset's own `#6A6A70` is already a muted grey,
 * so the count reads as card meta rather than competing with the one red count this
 * chrome allows itself.
 *
 * `null`/`undefined` draws nothing at all, which is a different statement from `0` —
 * see `buildRouteVisitCounts`, which decides that once for the whole window rather
 * than per card.
 *
 * **There is no total for these to be checked against, and that is deliberate.** The
 * header's total is gone on this reading (it counted route cards, in a unit nobody
 * plans in — see `sumScheduleWindowTotal`), so nothing on screen invites a planner to
 * add these up and find a number that does not match. What they *would* sum to is the
 * window's routed visits, one card each: visits nobody has routed sit on no card here
 * (the red assignment count is where that demand is reported), and a route running
 * twice in one day has two cards showing that day's one count, so a sum over cards
 * can exceed a sum over route-days.
 */
const StatusTooltip = ({ title, icon }) => (
  <Tooltip arrow title={title || ''}>
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      {icon}
    </Box>
  </Tooltip>
);

StatusTooltip.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.node,
};

const PatrolCardBody = memo(
  ({
    classes,
    shift,
    statusIcon,
    statusValue,
    showVehicle = true,
    showContextualDetails = false,
    canAssignOfficer = false,
    officerClickProps = {},
    visitCount = null,
    visitCountTitle = '',
  }) => {
    const { t } = useTranslation();
    const { shiftType, name, officer, reassignedOfficer, runsheetName, vehicle, hasNotes } =
      shift || {};

    /* Mirrors `CalendarCardContent`, whose dedicated branch needs the same
       expression: the label and the avatar read off one derived name, so an
       unassigned slot can never draw a face beside the word "Unassigned". */
    const officerName = officer?.name || reassignedOfficer?.name;
    const isOfficerUnassigned = !officerName;
    const vehicleName = vehicle?.name;
    const patrolOrDispatchName = name || runsheetName;
    const truncatedPatrolOrDispatchName =
      patrolOrDispatchName?.length > 25
        ? `${capitalizeFirstLetter(patrolOrDispatchName).substring(0, 25)}...`
        : capitalizeFirstLetter(patrolOrDispatchName || '');

    /* The empty slot draws `unassigned-officer.svg` rather than nothing — but the
       click target does not follow it back onto the icon. When a real officer is
       assigned, `officerClickProps` sits on just the avatar's own box (a
       deliberately narrow re-assign target). An unassigned row has no name to
       anchor a target that tightly, and shrinking the shortcut down to a 16px glyph
       the moment the slot empties would make it harder to claim an unassigned
       shift, not easier — so the trigger keeps its wider home on the whole row.
       Because the icon is a child of this row, clicking it still reaches the
       handler by normal bubbling.

       Sharing the row with the marks does not narrow that target: `reassignedFooter`
       gives its `reassignedFooterFlex` child `flex: 1`, so this box still takes every
       pixel the marks do not. */
    const officerRow = (
      <Box
        className={`${classes.reassignedFooterFlex} ${
          isOfficerUnassigned && canAssignOfficer ? classes.officerAssignTrigger : ''
        }`}
        {...(isOfficerUnassigned ? officerClickProps : {})}
      >
        {isOfficerUnassigned ? (
          <Box className={classes.reassignedOfficerFlex}>
            <UnassignedOfficerIcon className={classes.unassignedOfficerIcon} />
          </Box>
        ) : (
          <Box
            className={`${classes.reassignedOfficerFlex} ${
              canAssignOfficer ? classes.officerAssignTrigger : ''
            }`}
            {...officerClickProps}
          >
            <Avatar
              className={classes.eventAvatar}
              src={officer?.imageUrl || reassignedOfficer?.imageUrl || AvatarSchedule}
            />
          </Box>
        )}
        <Typography className={classes.reassignedName} variant="subtitle4">
          {officerName || t('obx.schedules.calendar.unassigned')}
        </Typography>
      </Box>
    );

    /* `!= null` and not a truthiness test: `0` is a count this window can honestly
       report — a run with nothing on it — and it is a reading a planner wants. Only
       "no visit list for this window" hides the number. */
    const hasVisitCount = visitCount != null;

    const visitCountMark = (
      <Box className={classes.patrolVisitCount} title={visitCountTitle || undefined}>
        <Box className={classes.patrolVisitCountIcon}>
          <RunsheetHitsIcon />
        </Box>
        <Typography component="span" className={classes.patrolVisitCountValue}>
          {visitCount}
        </Typography>
      </Box>
    );

    const cardMarks = (
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
            title={t('obx.schedules.calendar.scheduleStatus.noteStatusShow')}
            icon={<NotesIcon />}
          />
        )}
        <StatusTooltip title={statusValue} icon={statusIcon} />
      </Box>
    );

    return (
      <>
        {showContextualDetails ? (
          <Box className={classes.reassignedFooterFlex}>
            <Box className={classes.reassignedOfficerFlex}>
              {shiftType === SCHEDULE_DUTIES.DISPATCH ? <DispatchIndicator /> : <CarIcon />}
            </Box>
            <Typography className={classes.reassignedName} variant="subtitle4">
              {patrolOrDispatchName?.length > 25 ? (
                <Tooltip arrow title={patrolOrDispatchName}>
                  <span>{truncatedPatrolOrDispatchName}</span>
                </Tooltip>
              ) : (
                truncatedPatrolOrDispatchName || t('obx.schedules.calendar.unassigned')
              )}
            </Typography>
          </Box>
        ) : null}

        {showVehicle ? (
          <>
            {officerRow}
            <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
              <Box className={classes.reassignedFooterFlex}>
                {/* A solid `WhiteCarIcon` beside "Unassigned" read as a vehicle
                    having been allocated — the same problem the officer row had,
                    and the same shape of fix: not "drop the icon" but "draw a
                    different one". `unassigned-vehicle.svg` takes the same
                    `carIcon` boxing `WhiteCarIcon` uses (16px, bordered) so the row
                    holds its height and position in both states; only the glyph
                    inside changes with `vehicleName`. */}
                <Box className={classes.reassignedOfficerFlex}>
                  {vehicleName ? (
                    <>
                      {vehicle?.images?.[0]?.url ? (
                        <Avatar className={classes.eventAvatar} src={vehicle?.images?.[0]?.url} />
                      ) : (
                        <Box className={classes.carIcon}>
                          <WhiteCarIcon />
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box className={classes.carIcon}>
                      <UnassignedVehicleIcon />
                    </Box>
                  )}
                </Box>
                <Typography className={classes.reassignedName} variant="subtitle4">
                  {vehicleName || t('obx.schedules.calendar.unassigned')}
                </Typography>
              </Box>
              {cardMarks}
            </Box>
          </>
        ) : hasVisitCount ? (
          /* Shape 2 — the routes reading with a count. The officer takes the line it
             had before the vehicle came off, and the count takes the vehicle's own
             slot: same wrapper, same marks position, a different fact in the left of
             the row. Nothing about the officer row changes between this shape and the
             vehicle one, which is what keeps the unassigned click target the
             full-width target it has always been there. */
          <>
            {officerRow}
            <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
              {visitCountMark}
              {cardMarks}
            </Box>
          </>
        ) : (
          <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
            {officerRow}
            {cardMarks}
          </Box>
        )}
      </>
    );
  },
);

PatrolCardBody.displayName = 'PatrolCardBody';
PatrolCardBody.propTypes = {
  /** `calendar.styles.js`'s sheet, passed in — see the note above. */
  classes: PropTypes.object.isRequired,
  shift: PropTypes.object,
  statusIcon: PropTypes.node,
  statusValue: PropTypes.string,
  /** False on the routes reading of the main tab, and nowhere else. */
  showVehicle: PropTypes.bool,
  /** The day view's expanded card, which also names the route. */
  showContextualDetails: PropTypes.bool,
  canAssignOfficer: PropTypes.bool,
  officerClickProps: PropTypes.object,
  /**
   * Visits on this run. `null` means the window has no count to give, not zero — and
   * it also decides the card's shape (see the three above).
   */
  visitCount: PropTypes.number,
  /**
   * Native tooltip: the count's noun and its scope — this route, this day.
   *
   * The only place the word appears, and passed in already resolved rather than built
   * here. That keeps this component out of the store — the test renders it with a
   * stylesheet and nothing else, which is the only reason this card is testable at
   * all — and it lets the caller take the noun from `resolveScheduleWindowTerm`, the
   * one resolution of the tenant's visits term in this chrome.
   */
  visitCountTitle: PropTypes.string,
};

export default PatrolCardBody;
