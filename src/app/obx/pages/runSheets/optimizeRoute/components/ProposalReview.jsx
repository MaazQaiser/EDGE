import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  barScaleMinutes,
  changeDelta,
  formatMinutesAsDuration,
  formatSignedDuration,
  MAN_DAY_MINUTES,
} from '../helper';
import { CHANGE_MARK, CHANGE_TYPE, WEEK } from '../mockProposal';
import { useStyles } from '../optimizeRoute.styles';

const TONE_CLASS = {
  warn: 'toneWarn',
  brand: 'toneBrand',
  alert: 'toneAlert',
  neutral: 'toneNeutral',
};

/**
 * The headline trade. Mixes signs deliberately — two gains, a cost and an
 * obligation — because a strip that could only go green reads as a sales pitch.
 */
export const SummaryStrip = ({ summary, visitsTerm, perRoute, onReviewNotifications }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  const worst = summary.regressions[0];

  return (
    <Box className={classes.summaryStrip}>
      <Box className={classes.summaryCell}>
        <Typography className={classNames(classes.summaryValue, classes.summaryValueGain)}>
          {formatSignedDuration(summary.driveMinutesDelta)}
        </Typography>
        <Typography className={classes.summaryLabel}>
          {tt(perRoute ? 'summaryDrivingDay' : 'summaryDriving')}
        </Typography>
      </Box>

      <Box className={classes.summaryCell}>
        <Typography className={classes.summaryValue}>{summary.visitsChangingDay}</Typography>
        <Typography className={classes.summaryLabel}>
          {tt('summaryMovedDay', { visits: visitsTerm })}
        </Typography>
      </Box>

      <Box className={classes.summaryCell}>
        <Typography
          className={classNames(classes.summaryValue, worst ? classes.summaryValueCost : undefined)}
        >
          {worst ? formatSignedDuration(worst.minutesDelta) : '—'}
        </Typography>
        <Typography className={classes.summaryLabel}>
          {worst ? tt('summaryRegression', { day: worst.label }) : tt('summaryNoRegression')}
        </Typography>
      </Box>

      {/* A count you cannot inspect is a count you have to trust — so the cell
          that says "2 clients" is the control that shows you which two. */}
      <Box
        component={summary.notifications.length ? 'button' : 'div'}
        type={summary.notifications.length ? 'button' : undefined}
        onClick={summary.notifications.length ? onReviewNotifications : undefined}
        className={classNames(
          classes.summaryCell,
          summary.notifications.length && classes.summaryCellButton,
        )}
      >
        <Typography className={classes.summaryValue}>{summary.notifications.length}</Typography>
        <Typography
          className={classNames(
            classes.summaryLabel,
            summary.notifications.length && classes.summaryCellLink,
          )}
        >
          {tt(summary.notifications.length ? 'summaryNotifyReview' : 'summaryNotify')}
        </Typography>
      </Box>

      <Box className={classes.summaryCell}>
        <Typography className={classes.summaryValue}>{summary.heldCount}</Typography>
        <Typography className={classes.summaryLabel}>{tt('summaryHeld')}</Typography>
      </Box>
    </Box>
  );
};

SummaryStrip.propTypes = {
  summary: PropTypes.object.isRequired,
  visitsTerm: PropTypes.string,
  perRoute: PropTypes.bool,
  onReviewNotifications: PropTypes.func,
};

/** One change. Type is a glyph and a word before it is a colour. */
const ChangeRow = ({ change, accepted, locked, standing, onToggle, onToggleLock }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  const mark = CHANGE_MARK[change.type];
  const delta = changeDelta(change);
  const movesDay = change.from.day !== change.to.day;

  /* The sign belongs in the Effect column; in prose "22m closer" reads, "−22m closer" does not. */
  const reasonText = change.reasons
    .map((reason) =>
      tt(`reason.${reason.code}`, {
        ...reason,
        minutes: reason.minutes === undefined ? undefined : Math.abs(reason.minutes),
      }),
    )
    .join(' · ');

  return (
    <tr
      role="row"
      className={classNames(classes.changeRow, !accepted && classes.changeRowDeclined)}
      onClick={() => onToggle(change.id)}
    >
      <td role="cell" className={classes.typeMark}>
        <Box
          component="span"
          className={classNames(classes.typeGlyph, classes[TONE_CLASS[mark.tone]])}
        >
          {mark.glyph}
        </Box>
        <Typography
          component="span"
          className={classNames(classes.typeWord, classes[TONE_CLASS[mark.tone]])}
        >
          {tt(`type.${change.type}`)}
        </Typography>
      </td>

      <td role="cell" className={classes.changeBody}>
        <Typography className={classes.changeTitle}>
          {change.site}{' '}
          <Box component="span" className={classes.changeUnit}>
            · {change.unit}
          </Box>
        </Typography>

        <Typography className={classes.changeMove}>
          {movesDay
            ? /* A standing change moves every Wednesday, not one — so it must not
                 render as a date-shaped move. */
              tt(standing ? 'moveDayDetailStanding' : 'moveDayDetail', {
                fromDay: change.from.day,
                toDay: change.to.day,
                route: change.to.route,
                position: change.to.position,
              })
            : tt('moveRouteDetail', {
                fromRoute: change.from.route,
                fromPosition: change.from.position,
                toRoute: change.to.route,
                toPosition: change.to.position,
              })}
        </Typography>

        <Typography className={classes.changeReason}>{reasonText}</Typography>

        {change.regression && (
          <Typography className={classes.changeRegression}>
            {tt(`regression.${change.regression.code}`, change.regression)}
          </Typography>
        )}

        {change.requiresNotification && (
          <Box component="span" className={classes.notifyPill}>
            ✉ {tt('willNotify', { contact: change.requiresNotification.contact })}
          </Box>
        )}
      </td>

      <td role="cell">
        <Typography
          className={classNames(
            classes.changeDelta,
            delta > 0 && classes.changeDeltaCost,
            delta === 0 && classes.changeDeltaNone,
          )}
        >
          {formatSignedDuration(delta)}
        </Typography>
      </td>

      <td role="cell">
        <Box className={classes.rowControls} onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className={classNames(classes.lockButton, locked && classes.lockButtonOn)}
            aria-pressed={locked}
            aria-label={tt(locked ? 'unlockAria' : 'lockAria', { site: change.site })}
            onClick={() => onToggleLock(change.id)}
          >
            {locked ? '🔒' : '🔓'}
          </button>
          <input
            type="checkbox"
            className={classes.checkbox}
            checked={accepted}
            onChange={() => onToggle(change.id)}
            /* L on a focused row toggles its lock — the shortcut the pane header advertises. */
            onKeyDown={(event) => {
              if (event.key === 'l' || event.key === 'L') {
                event.preventDefault();
                onToggleLock(change.id);
              }
            }}
            aria-label={tt('acceptAria', { site: change.site })}
          />
        </Box>
      </td>
    </tr>
  );
};

ChangeRow.propTypes = {
  change: PropTypes.object.isRequired,
  accepted: PropTypes.bool,
  locked: PropTypes.bool,
  standing: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onToggleLock: PropTypes.func.isRequired,
};

/** A stop the solver was not allowed to consider, and who said so. */
const HeldRow = ({ held }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  return (
    <tr role="row" className={classNames(classes.changeRow, classes.changeRowHeld)}>
      <td role="cell" className={classes.typeMark}>
        <Box component="span" className={classNames(classes.typeGlyph, classes.toneNeutral)}>
          —
        </Box>
        <Typography component="span" className={classNames(classes.typeWord, classes.toneNeutral)}>
          {tt('type.held')}
        </Typography>
      </td>
      <td role="cell" className={classes.changeBody}>
        <Typography className={classes.changeTitle}>
          {held.site}{' '}
          <Box component="span" className={classes.changeUnit}>
            · {held.unit}
          </Box>
        </Typography>
        <Typography className={classes.heldMeta}>
          {/* A stop left out of a selection is held for a different reason than one
              a person pinned, and the row has to say which. */}
          {held.level === 'selection' ? (
            tt('heldNotSelected')
          ) : (
            <>
              {held.by
                ? tt('heldBy', { level: tt(`lockLevel.${held.level}`), by: held.by, at: held.at })
                : tt('heldBySystem')}
              {' — '}
              {held.reason}
            </>
          )}
        </Typography>
      </td>
      <td role="cell">
        <Typography className={classNames(classes.changeDelta, classes.changeDeltaNone)}>
          —
        </Typography>
      </td>
      <td role="cell">
        <Box className={classes.rowControls}>
          <Box component="span" className={classNames(classes.lockButton, classes.lockButtonOn)}>
            🔒
          </Box>
        </Box>
      </td>
    </tr>
  );
};

HeldRow.propTypes = { held: PropTypes.object.isRequired };

/** A consequence of another change, shown only once that change is accepted. */
const DerivedRow = ({ route }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  return (
    <tr role="row" className={classNames(classes.changeRow, classes.changeRowDerived)}>
      <td role="cell" className={classes.typeMark}>
        <Box component="span" className={classNames(classes.typeGlyph, classes.toneNeutral)}>
          {CHANGE_MARK[CHANGE_TYPE.EMPTIED].glyph}
        </Box>
        <Typography component="span" className={classNames(classes.typeWord, classes.toneNeutral)}>
          {tt('type.emptied')}
        </Typography>
      </td>
      <td role="cell" className={classes.changeBody}>
        <Typography className={classes.changeTitle}>{tt('emptiedTitle', { route })}</Typography>
        <Typography className={classes.changeReason}>{tt('emptiedBody')}</Typography>
      </td>
      <td role="cell">
        <Typography className={classNames(classes.changeDelta, classes.changeDeltaNone)}>
          —
        </Typography>
      </td>
      <td role="cell" />
    </tr>
  );
};

DerivedRow.propTypes = { route: PropTypes.string.isRequired };

export const ChangeList = ({
  changes,
  held,
  acceptedIds,
  lockedIds,
  standing,
  onToggle,
  onToggleLock,
  onToggleGroup,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  const groups = WEEK.filter(
    (day) =>
      changes.some((change) => change.group === day.key) ||
      held.some((item) => item.group === day.key),
  );

  return (
    <table role="table" className={classes.tableReset}>
      <caption className={classes.srOnly}>{tt('changesCaption')}</caption>
      <thead role="rowgroup" className={classes.srOnly}>
        <tr role="row">
          <th role="columnheader" scope="col">
            {tt('colType')}
          </th>
          <th role="columnheader" scope="col">
            {tt('colChange')}
          </th>
          <th role="columnheader" scope="col">
            {tt('colEffect')}
          </th>
          <th role="columnheader" scope="col">
            {tt('colTake')}
          </th>
        </tr>
      </thead>

      {groups.map((day) => {
        const groupChanges = changes.filter((change) => change.group === day.key);
        const groupHeld = held.filter((item) => item.group === day.key);
        const allTaken = groupChanges.every((change) => acceptedIds.has(change.id));

        return (
          <tbody role="rowgroup" key={day.key}>
            <tr role="row">
              <th role="columnheader" colSpan={4} scope="colgroup" className={classes.groupHeader}>
                <Typography component="span" className={classes.groupTitle}>
                  {tt(standing ? 'groupHeadingStanding' : 'groupHeading', {
                    day: day.label,
                    date: day.date,
                    routes: tt('groupRoutes', { count: day.routes }),
                    changes: tt('groupChanges', { count: groupChanges.length }),
                  })}
                </Typography>
                {groupChanges.length > 0 && (
                  <button
                    type="button"
                    className={classes.groupAction}
                    onClick={() => onToggleGroup(day.key, !allTaken)}
                  >
                    {tt(allTaken ? 'groupTakeNone' : 'groupTakeAll')}
                  </button>
                )}
              </th>
            </tr>

            {groupChanges.map((change) => (
              <React.Fragment key={change.id}>
                <ChangeRow
                  change={change}
                  accepted={acceptedIds.has(change.id)}
                  locked={lockedIds.has(change.id)}
                  standing={standing}
                  onToggle={onToggle}
                  onToggleLock={onToggleLock}
                />
                {change.empties && acceptedIds.has(change.id) && (
                  <DerivedRow route={change.empties} />
                )}
              </React.Fragment>
            ))}

            {groupHeld.map((item) => (
              <HeldRow key={item.id} held={item} />
            ))}
          </tbody>
        );
      })}
    </table>
  );
};

ChangeList.propTypes = {
  changes: PropTypes.array.isRequired,
  held: PropTypes.array.isRequired,
  acceptedIds: PropTypes.object.isRequired,
  lockedIds: PropTypes.object.isRequired,
  standing: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onToggleLock: PropTypes.func.isRequired,
  onToggleGroup: PropTypes.func.isRequired,
};

/**
 * Day length before and after. The ghost bar is the plan as it stands, so the
 * cost of the proposal is visible on the same row as its benefit.
 */
export const WeekBars = ({ summary, perRoute }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  const scale = barScaleMinutes(summary.days);
  const pct = (minutes) => `${(minutes / scale) * 100}%`;

  return (
    <>
      <Box className={classes.weekList}>
        {summary.days.map((day) => {
          const inBudget = Math.min(day.afterMinutes, MAN_DAY_MINUTES);

          return (
            <Box key={day.key} className={classes.dayRow}>
              <Box className={classes.dayLabel}>
                <Typography className={classes.dayName}>{day.label}</Typography>
                <Typography className={classes.dayDate}>{day.date}</Typography>
              </Box>

              <Box className={classes.barStack}>
                <Box className={classes.barTrack}>
                  <Box className={classes.barGhost} style={{ width: pct(day.baseMinutes) }} />
                  <Box className={classes.barAfter} style={{ width: pct(inBudget) }} />
                  {day.overflowMinutes > 0 && (
                    <Box
                      className={classes.barOverflow}
                      style={{
                        left: pct(MAN_DAY_MINUTES),
                        width: pct(day.overflowMinutes),
                      }}
                    />
                  )}
                  <Box className={classes.budgetMark} style={{ left: pct(MAN_DAY_MINUTES) }} />
                </Box>
              </Box>

              <Box className={classes.dayFigure}>
                <Typography
                  className={classNames(
                    classes.dayMinutes,
                    day.overflowMinutes > 0 && classes.dayMinutesOver,
                  )}
                >
                  {formatMinutesAsDuration(day.afterMinutes)}
                </Typography>
                <Typography className={classes.dayDelta}>
                  {day.delta ? formatSignedDuration(day.delta) : tt('dayUnchanged')}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Typography className={classes.weekFootnote}>
        {summary.daysOverBudget > 0
          ? tt(perRoute ? 'routeFootnoteOver' : 'weekFootnoteOver', {
              count: summary.daysOverBudget,
            })
          : tt(perRoute ? 'routeFootnote' : 'weekFootnote')}
      </Typography>
    </>
  );
};

WeekBars.propTypes = {
  summary: PropTypes.object.isRequired,
  perRoute: PropTypes.bool,
};
