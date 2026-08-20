import { Avatar, Box, Chip, Tooltip, Typography } from '@mui/material';
import { ReactComponent as CancelIcon } from 'assets/svg/cancelHit.svg';
import { ReactComponent as WarningIcon } from 'assets/svg/warningCalander.svg';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useStyles } from 'src/app/components/common/calendar/calendar.styles';
import { formatShiftScheduleTimeRange } from 'src/app/obx/pages/schedules/helper';
import AvatarSchedule from 'src/assets/images/Avatar-schedule.png';
import { SplittedCalenderIcon } from 'src/assets/svg';
import { ReactComponent as UnAssignHit } from 'src/assets/svg/assignHit.svg';
import { ReactComponent as CarIcon } from 'src/assets/svg/carImage.svg';
import { ReactComponent as DispatchIndicator } from 'src/assets/svg/dispatchIndicator.svg';
import { ReactComponent as NotesIcon } from 'src/assets/svg/notesStatus.svg';
import { ReactComponent as RunsheetIcon } from 'src/assets/svg/runsheetHit.svg';
import { ReactComponent as UnassignedOfficerIcon } from 'src/assets/svg/unassigned-officer.svg';
import { ReactComponent as UnassignedVehicleIcon } from 'src/assets/svg/unassigned-vehicle.svg';
import { ReactComponent as WhiteCarIcon } from 'src/assets/svg/WhiteCarIcon.svg';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';
import { capitalizeFirstLetter } from 'src/utils/string/common';

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

/**
 * Pre-revamp shift card used on site/user embedded schedules (legacy API payload).
 * Main schedule route keeps CalendarCardContent in ScheduleCalendarGrid.
 */
const LegacyCalendarCardContent = ({ shift, statusIcon, statusValue, is24Hours }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isDedicatedCancelledShift =
    isShiftCancelled(shift) && shift?.shiftType === SCHEDULE_DUTIES.DEDICATED;

  const {
    name,
    shiftType,
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
  /* Mirrors CalendarCardContent: the officer label and the officer avatar read
     off one derived name, so the card can never draw a face beside the word
     "Unassigned". The legacy payload has no assign-from-calendar affordance, so
     here the fix is only the conditional render. */
  const officerName = officer?.name || reassignedOfficer?.name;
  const isOfficerUnassigned = !officerName;
  // Same derivation for the vehicle row below — the icon and the label read off one
  // name, so an unassigned vehicle cannot draw a car next to "Unassigned".
  const vehicleName = vehicle?.name;

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
              <Box className={classes.reassignedOfficerFlex}>
                <RunsheetIcon />
              </Box>
              <Typography className={classes.reassignedName} variant="subtitle4">
                {runsheetName || t('obx.schedules.calendar.unassigned')}
              </Typography>
            </Box>
            <StatusTooltip title={statusValue} icon={statusIcon} />
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
              {isOfficerUnassigned ? (
                /* No assign-from-calendar affordance on the legacy payload (see
                   the class comment above), so this is display-only: the empty
                   slot draws `unassigned-officer.svg`, sized to the avatar's own
                   16px via `unassignedOfficerIcon`, rather than drawing nothing. */
                <Box className={classes.reassignedOfficerFlex}>
                  <UnassignedOfficerIcon className={classes.unassignedOfficerIcon} />
                </Box>
              ) : (
                <Box className={classes.reassignedOfficerFlex}>
                  {/* The label already falls through to the reassignment, so the
                      avatar follows the same chain — otherwise a reassigned shift
                      drew the placeholder beside a real officer's name. */}
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
          </Box>
          <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
            <Box className={classes.reassignedFooterFlex}>
              {/* Same rule as the officer row above — a different glyph for an
                  empty slot, not no glyph — and the same `carIcon` boxing
                  `WhiteCarIcon` uses, so the row holds its height and position
                  in both states. */}
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
            {isOfficerUnassigned ? (
              <Box className={classes.reassignedOfficerFlex}>
                <UnassignedOfficerIcon className={classes.unassignedOfficerIcon} />
              </Box>
            ) : (
              <Box className={classes.reassignedOfficerFlex}>
                <Avatar className={classes.eventAvatar} src={officer?.imageUrl || AvatarSchedule} />
                {reassignedOfficer && (
                  <Avatar
                    className={classes.eventAvatarReassignedOfficer}
                    src={reassignedOfficer?.imageUrl || AvatarSchedule}
                  />
                )}
              </Box>
            )}
            <Typography className={classes.reassignedName} variant="subtitle4">
              {officerName || t('obx.schedules.calendar.unassigned')}
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
                    title={t('obx.schedules.calendar.scheduleStatus.noteStatusShow')}
                    icon={<NotesIcon />}
                  />
                )}
                <StatusTooltip title={statusValue} icon={statusIcon} />
              </>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

LegacyCalendarCardContent.propTypes = {
  shift: PropTypes.object,
  statusIcon: PropTypes.node,
  statusValue: PropTypes.string,
  is24Hours: PropTypes.bool,
};

export default LegacyCalendarCardContent;
