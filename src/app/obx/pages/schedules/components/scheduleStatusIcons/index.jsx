import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SplittedCalenderIcon } from 'src/assets/svg';
import { ReactComponent as CancelledIcon } from 'src/assets/svg/CancelledIcon.svg';
import { ReactComponent as CompletedIcon } from 'src/assets/svg/CompletedIcon.svg';
import { ReactComponent as IncompleteIcon } from 'src/assets/svg/incompleteScheduleStatus.svg';
import { ReactComponent as InProgressIcon } from 'src/assets/svg/InProgressIcon.svg';
import { ReactComponent as MissedIcon } from 'src/assets/svg/MissedIcon.svg';
import { ReactComponent as NotStartedIcon } from 'src/assets/svg/notStartedScheduleStatus.svg';
import { ReactComponent as UnassignedIcon } from 'src/assets/svg/UnassignedIcon.svg';
// import { ReactComponent as UpcomingIcon } from 'src/assets/svg/UpcomingIcon.svg';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

const useStyles = makeStyles((theme) => ({
  bottomArea: {
    backgroundColor: theme.palette.surfaceWhite,

    borderRadius: '0px 0px 5px 5px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '20px',

    padding: '0px 0px 0px 10px',
    '& .MuiButtonBase-root': {
      fontSize: '12px',
      color: theme.palette.textPrimary,
      pointerEvents: 'none',
      padding: '0px',
      height: 'auto',
      flex: '0 0 auto',
    },
  },

  /**
   * The Cancelled mark, greyed so it agrees with the card it describes.
   *
   * A cancelled visit's card is flat grey (`visitFillCancelled`, `#F6F7F9`) —
   * void, not absent, and nothing about it invites action — but
   * `CancelledIcon.svg` draws a red disc, so the legend was promising a red card
   * the grid stopped drawing.
   *
   * The grey is applied **here, at the legend's call site, rather than in the
   * asset**, because the asset is shared and red is still right in its other two
   * homes: the grid stamps card badges from `calendarIndicatorIcons` below, and
   * the visit drawer's status chip imports the same svg
   * (`shiftDetail/hitDetail/VisitAssignment.jsx`). Recolouring the file would
   * have changed all three from one edit.
   *
   * `grayscale(1)` rather than a fill override: the svg states its colours as
   * presentation attributes on half a dozen nested nodes, so overriding them
   * means selecting on hex literals a Figma re-export would silently invalidate.
   * The filter is the same idiom `scheduleCalendar.styles.js` already uses to
   * retire a card, and it keeps the white glyph legible — a flat `#F6F7F9`, the
   * card's own fill, would be an invisible mark on this white footer.
   */
  cancelledMark: {
    '& svg': {
      filter: 'grayscale(1)',
    },
  },

  /**
   * The Missed mark, lightened so it is not the same mark as Unassigned.
   *
   * `MissedIcon.svg` and `UnassignedIcon.svg` both paint their glyph on a
   * full-strength `#E43F32`, and at 16px both read as one thing: a red disc. The
   * key could not tell the two states apart, which is the same failure the
   * cancelled mark above had, in a different colour.
   *
   * **Missed is the one that lightens.** Its card carries a red tint — `#FEE4E2`
   * (`MISSED` in `helper/visitCardInk.js`, `visitFillMissed` in the grid) — while
   * an unassigned card is deliberately untinted grey with the red living on its
   * badge, so full red is exactly what that mark should keep.
   *
   * Applied **here, at the legend's call site, not in the asset**, for the reason
   * `cancelledMark` states: `MissedIcon` is shared with the grid's card badges
   * (`calendarIndicatorIcons` below) and the visit drawer's status chip, where
   * full red is intended.
   *
   * `opacity(0.55)` rather than `grayscale` — the ask is a lighter *red*, not a
   * grey — and rather than a `brightness`/`saturate` chain, because those are
   * multiplicative: lifting `#E43F32`'s green (63) and blue (50) far enough to
   * read as light red drives its red (228) past 255, and the clip swings the hue
   * to orange. Blending toward the near-white footer is the operation that
   * actually produces a tint of the same hue. It also avoids overriding the fill,
   * which would mean selecting on hex literals a re-export could silently
   * invalidate.
   *
   * **`0.55` is not a taste call — it is the value at which the mark states the
   * card's own colour.** Composited over this footer (white, `0.96` over a white
   * page), the icon's own light-red ring `#FECDCA` lands on `#FEE4E2` exactly:
   * the missed card's wash, character for character. The disc `#E43F32` lands on
   * `#F0958E`, which is what makes the mark read light red and no longer read as
   * Unassigned's full-strength disc beside it.
   *
   * The cost, stated plainly: the disc sits at 2.2:1 against the footer and the
   * white glyph at 2.1:1 against the disc, both down from 4.2:1 and 3.8:1 at full
   * strength. That is inherent — a light red on near-white cannot be a
   * high-contrast mark — and it is why the treatment is confined to a key whose
   * every mark is captioned. Anything that has to carry the state on its own (the
   * card badge, the drawer's chip) keeps the asset at full strength.
   */
  missedMark: {
    '& svg': {
      filter: 'opacity(0.55)',
    },
  },
}));

/**
 * The two marks whose asset is right for a card badge and wrong for this key.
 * Both treatments are the call site's, never the svg's — see the classes above.
 */
const markClassFor = (classes, status) => {
  if (status === calendarShiftStatusEnum.CANCELLED) return classes.cancelledMark;
  if (status === calendarShiftStatusEnum.MISSED) return classes.missedMark;
  return undefined;
};

export const calendarIndicatorIcons = {
  [calendarShiftStatusEnum.UNASSIGNED]: <UnassignedIcon />,
  [calendarShiftStatusEnum.NOT_STARTED]: <NotStartedIcon />,
  [calendarShiftStatusEnum.IN_PROGRESS]: <InProgressIcon />,
  [calendarShiftStatusEnum.COMPLETED]: <CompletedIcon />,
  [calendarShiftStatusEnum.INCOMPLETE]: <IncompleteIcon />,
  // [calendarShiftStatusEnum.UPCOMING]: <UpcomingIcon />,
  [calendarShiftStatusEnum.MISSED]: <MissedIcon />,
  [calendarShiftStatusEnum.CANCELLED]: <CancelledIcon />,
  [calendarShiftStatusEnum.SPLITTED_SHIFT]: <SplittedCalenderIcon />,
};

export const calendarShiftStatusValues = (t) => ({
  [calendarShiftStatusEnum.NOT_STARTED]: t('obx.schedules.calendar.scheduleStatus.notStarted'),
  [calendarShiftStatusEnum.IN_PROGRESS]: t('obx.schedules.calendar.scheduleStatus.inProgress'),
  [calendarShiftStatusEnum.COMPLETED]: t('obx.schedules.calendar.scheduleStatus.completed'),
  [calendarShiftStatusEnum.INCOMPLETE]: t('obx.schedules.calendar.scheduleStatus.inComplete'),
  [calendarShiftStatusEnum.UPCOMING]: t('obx.schedules.calendar.scheduleStatus.upComing'),
  [calendarShiftStatusEnum.UNASSIGNED]: t('obx.schedules.calendar.scheduleStatus.unAssigned'),
  [calendarShiftStatusEnum.MISSED]: t('obx.schedules.calendar.scheduleStatus.missed'),
  [calendarShiftStatusEnum.CANCELLED]: t('obx.schedules.calendar.scheduleStatus.cancelled'),
  [calendarShiftStatusEnum.SPLITTED_SHIFT]: t(
    'obx.schedules.calendar.scheduleStatus.splittedShift',
  ),
});

const ScheduleStatusIcons = ({ statuses }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.bottomArea}>
      {statuses?.map((status, index) => {
        return (
          <Button
            disableRipple
            startIcon={calendarIndicatorIcons[status]}
            variant="onlyText"
            key={index}
            className={markClassFor(classes, status)}
          >
            {calendarShiftStatusValues(t)?.[status]}
          </Button>
        );
      })}
    </Box>
  );
};

export default ScheduleStatusIcons;

ScheduleStatusIcons.propTypes = {
  statuses: PropTypes.array,
};
