import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { WEEK } from '../mockProposal';
import { useStyles } from '../optimizeRoute.styles';

/**
 * Selection as a scope.
 *
 * The other three scopes are geographic or temporal — this route, this day, this
 * week. This one is "these, and leave everything else alone", which is how a
 * planner with a handful of problem sites actually thinks.
 *
 * Mechanically it is the inverse of locking: everything unticked is held exactly
 * where it is, and says so in the proposal rather than quietly vanishing from it.
 */
const SelectionPicker = ({ candidates, selectedIds, onToggle, onToggleAll, onConfirm }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  const groups = WEEK.filter((day) => candidates.some((item) => item.group === day.key));
  const allSelected = candidates.every((item) => selectedIds.has(item.id));

  return (
    <>
      <Box className={classes.pickPane}>
        <Box className={classes.paneHeader}>
          <Box>
            <Typography className={classes.pickTitle}>{tt('pickTitle')}</Typography>
            <Typography className={classes.pickBody}>{tt('pickBody')}</Typography>
          </Box>
          <button
            type="button"
            className={classes.groupAction}
            onClick={() => onToggleAll(!allSelected)}
          >
            {tt(allSelected ? 'pickSelectNone' : 'pickSelectAll')}
          </button>
        </Box>

        <Box className={classes.paneScroll}>
          {groups.map((day) => (
            <Box key={day.key}>
              <Box className={classes.groupHeader}>
                <Typography component="span" className={classes.groupTitle}>
                  {tt('pickGroup', { day: day.label, date: day.date })}
                </Typography>
              </Box>

              {candidates
                .filter((item) => item.group === day.key)
                .map((item) => {
                  const checked = selectedIds.has(item.id);

                  return (
                    <Box
                      key={item.id}
                      component="label"
                      className={classes.pickRow}
                      htmlFor={`pick-${item.id}`}
                    >
                      <input
                        id={`pick-${item.id}`}
                        type="checkbox"
                        className={classes.checkbox}
                        checked={checked}
                        onChange={() => onToggle(item.id)}
                      />
                      <Box className={classes.pickBodyCell}>
                        <Typography className={classes.changeTitle}>
                          {item.site}{' '}
                          <Box component="span" className={classes.changeUnit}>
                            · {item.unit}
                          </Box>
                        </Typography>
                        <Typography className={classes.changeReason}>{item.where}</Typography>
                      </Box>
                    </Box>
                  );
                })}
            </Box>
          ))}
        </Box>
      </Box>

      <Box className={classes.commitBar}>
        <Box className={classes.commitSummary}>
          <Typography className={classes.commitLine}>
            {tt('pickCount', { count: selectedIds.size })}
          </Typography>
          <Typography className={classes.commitSubline}>
            {selectedIds.size ? tt('pickHeld') : tt('pickEmpty')}
          </Typography>
        </Box>
        <Box className={classes.commitActions}>
          <Button
            disableRipple
            variant="primary"
            onClick={onConfirm}
            disabled={selectedIds.size === 0}
          >
            {tt('pickAction', { count: selectedIds.size })}
          </Button>
        </Box>
      </Box>
    </>
  );
};

SelectionPicker.propTypes = {
  candidates: PropTypes.array.isRequired,
  selectedIds: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
  onToggleAll: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default SelectionPicker;
