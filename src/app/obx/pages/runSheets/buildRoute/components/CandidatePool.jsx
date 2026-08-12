import { Box, Button, Checkbox, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from '../buildRoute.styles';
import { formatMinutesAsDuration } from '../helper';
import { VISIT_BUCKET } from '../mockVisits';

const GROUPS = [
  { bucket: VISIT_BUCKET.OVERDUE, titleKey: 'obx.runsheet.buildRoute.groupOverdue' },
  { bucket: VISIT_BUCKET.TODAY, titleKey: 'obx.runsheet.buildRoute.groupToday' },
  { bucket: VISIT_BUCKET.AHEAD, titleKey: 'obx.runsheet.buildRoute.groupAhead' },
];

const CandidateRow = ({ visit, selected, onToggle }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box
      className={classNames(classes.candidate, selected && classes.candidateSelected)}
      onClick={() => onToggle(visit.id)}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle(visit.id);
        }
      }}
    >
      <Checkbox
        className={classes.candidateCheckbox}
        checked={selected}
        tabIndex={-1}
        inputProps={{ 'aria-label': visit.siteName }}
        onClick={(event) => event.stopPropagation()}
        onChange={() => onToggle(visit.id)}
      />

      <Box className={classes.candidateBody}>
        <Box className={classes.candidateTopLine}>
          <Typography className={classes.candidateName}>{visit.siteName}</Typography>
          <Typography className={classes.candidateUnit}>{visit.unit}</Typography>

          {visit.bucket === VISIT_BUCKET.OVERDUE && (
            <Box component="span" className={classNames(classes.pill, classes.pillOverdue)}>
              {t('obx.runsheet.buildRoute.daysLate', { count: visit.daysOverdue })}
            </Box>
          )}

          {visit.bucket === VISIT_BUCKET.AHEAD && (
            <Box component="span" className={classNames(classes.pill, classes.pillMoved)}>
              {visit.scheduledFor}
            </Box>
          )}
        </Box>

        <Box className={classes.candidateSubLine}>
          <Typography className={classes.candidateMeta}>{visit.address}</Typography>

          {visit.onRunsheet && (
            <Box component="span" className={classNames(classes.pill, classes.pillRunsheet)}>
              {visit.onRunsheet}
            </Box>
          )}
        </Box>

        {!visit.withinServiceWindow && visit.windowNote && (
          <Box className={classes.candidateSubLine}>
            <Box component="span" className={classNames(classes.pill, classes.pillWindow)}>
              {visit.windowNote}
            </Box>
          </Box>
        )}
      </Box>

      <Typography className={classes.candidateService}>
        {formatMinutesAsDuration(visit.serviceMinutes)}
      </Typography>
    </Box>
  );
};

CandidateRow.propTypes = {
  visit: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
};

/**
 * Candidates are grouped by why they are a candidate — overdue, due today, or
 * available to pull forward — because that is the order the decision gets made in.
 */
const CandidatePool = ({ visits = [], selectedIds, onToggle, onToggleGroup }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.poolScroll}>
      {GROUPS.map(({ bucket, titleKey }) => {
        const groupVisits = visits.filter((visit) => visit.bucket === bucket);
        if (!groupVisits.length) return null;

        const selectedCount = groupVisits.filter((visit) => selectedIds.has(visit.id)).length;
        const allSelected = selectedCount === groupVisits.length;

        return (
          <Box key={bucket}>
            <Box
              className={classNames(
                classes.groupHeader,
                bucket === VISIT_BUCKET.OVERDUE && classes.groupHeaderOverdue,
                bucket === VISIT_BUCKET.TODAY && classes.groupHeaderToday,
              )}
            >
              <Typography
                className={classNames(
                  classes.groupTitle,
                  bucket === VISIT_BUCKET.OVERDUE && classes.groupTitleOverdue,
                  bucket === VISIT_BUCKET.TODAY && classes.groupTitleToday,
                  bucket === VISIT_BUCKET.AHEAD && classes.groupTitleAhead,
                )}
              >
                {t(titleKey)} · {groupVisits.length}
              </Typography>

              <Button
                disableRipple
                variant="onlyText"
                className={classes.selectAllButton}
                onClick={() => onToggleGroup(bucket, !allSelected)}
              >
                {allSelected
                  ? t('obx.runsheet.buildRoute.clearGroup')
                  : t('obx.runsheet.buildRoute.selectGroup')}
              </Button>

              <Typography className={classes.groupMeta}>
                {t('obx.runsheet.buildRoute.selectedCount', {
                  selected: selectedCount,
                  total: groupVisits.length,
                })}
              </Typography>
            </Box>

            {groupVisits.map((visit) => (
              <CandidateRow
                key={visit.id}
                visit={visit}
                selected={selectedIds.has(visit.id)}
                onToggle={onToggle}
              />
            ))}
          </Box>
        );
      })}
    </Box>
  );
};

CandidatePool.propTypes = {
  visits: PropTypes.array,
  selectedIds: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
  onToggleGroup: PropTypes.func.isRequired,
};

export default CandidatePool;
