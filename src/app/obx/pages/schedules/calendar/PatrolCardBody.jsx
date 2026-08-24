import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import AvatarSchedule from 'src/assets/images/Avatar-schedule.png';
import { SplittedCalenderIcon } from 'src/assets/svg';
import { ReactComponent as CarIcon } from 'src/assets/svg/carImage.svg';
import { ReactComponent as DispatchIndicator } from 'src/assets/svg/dispatchIndicator.svg';
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
 * ── Two shapes, one body ──
 *
 * 1. `showVehicle` — officer, then vehicle with the marks pinned right of it. Every
 *    surface but one: the patrol and dedicated tabs, the multi-service overview, the
 *    site and user embeds, and the day view's expanded card.
 * 2. **the routes reading** — officer and marks share one row. The rows there are the
 *    routes and which van runs one is not that reading's question, so the vehicle
 *    line comes off entirely.
 *
 * ── The visit count is no longer drawn here ──
 *
 * It used to be a third shape: the count in the slot the vehicle line gave up, with a
 * native `title`. **It moved to the card's top-right corner** — asked for directly —
 * which on this card is the time line's own row, so it is rendered by
 * `CalendarCardContent` beside the missed-hits chip rather than in this body. That
 * removed the extra line this card was spending on it and put an at-a-glance figure
 * beside the time instead of below the officer.
 *
 * `visitCount`/`visitCountTitle` are therefore gone from this component's contract.
 * The reconciliation note that used to live here — why per-card counts do not sum to
 * the header's total — moved with the badge.
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
};

export default PatrolCardBody;
