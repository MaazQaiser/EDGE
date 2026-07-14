import { Box, InputLabel, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { UPDATE_RUNSHEET_STATE } from 'src/redux/reducers/runSheetReducer';

import HitsAccordionListing from '../../hitsAccordionListing/index.jsx';
import { useStyles } from './reOrder';

const SplitReOrderHits = (props) => {
  const { state, dispatch } = props;
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();

  const visitSet = state?.visitSet || [];
  const hits = state?.hits || [];
  const parentVisitSet = state?.parentVisitSet || [];

  const visitedPoints = useMemo(() => {
    const points = {};
    hits.forEach((hit) => {
      if (hit?.isVisited) points[hit?.hitId] = true;
    });
    return points;
  }, [hits]);

  const parentShiftHits = useMemo(
    () => hits.filter((h) => !visitSet.some((v) => v.hitId === h.hitId)),
    [hits, visitSet],
  );
  const childShiftHits = visitSet;

  useEffect(() => {
    const expectedParentIds = new Set(parentShiftHits.map((h) => h.hitId));
    const currentParentIds = new Set(parentVisitSet.map((h) => h.hitId));
    const setsMatch =
      expectedParentIds.size === currentParentIds.size &&
      [...expectedParentIds].every((id) => currentParentIds.has(id));
    if (!setsMatch && parentShiftHits.length > 0) {
      dispatch({
        type: UPDATE_RUNSHEET_STATE,
        payload: { key: 'parentVisitSet', value: [...parentShiftHits] },
      });
    }
  }, [parentShiftHits, parentVisitSet, dispatch]);

  const displayParentShiftHits = parentVisitSet.length > 0 ? parentVisitSet : parentShiftHits;
  const displayChildShiftHits = childShiftHits;

  const handleDeleteChildShift = (id) => {
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: 'visitSet', value: state?.visitSet?.filter((data) => data?.hitId !== id) },
    });
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: 'isVisitsUpdated', value: true },
    });
  };

  const parentShiftProps = {
    ...props,
    hitsList: displayParentShiftHits,
    showSelectionCheckBox: false,
    handleDelete: () => {},
    idKey: 'hitId',
    visitSetKey: 'parentVisitSet',
    showOrder: true,
    showDragAndDrop: true,
    showDelete: false,
    showVisitedPoints: true,
    visitedPoints,
  };

  const childShiftProps = {
    ...props,
    hitsList: displayChildShiftHits,
    showSelectionCheckBox: false,
    handleDelete: handleDeleteChildShift,
    idKey: 'hitId',
    visitSetKey: 'visitSet',
    showOrder: true,
    showDragAndDrop: true,
    showDelete: displayChildShiftHits.length > 1,
    showVisitedPoints: true,
    visitedPoints,
  };

  return (
    <Box className={classes.hitsSplitWrapper}>
      <Box>
        <Typography variant="h5">
          {t('obx.runsheet.reorderHits', { hits: getLabel('terms', 'hits', t) })}
        </Typography>
        <InputLabel htmlFor="runsheetName">
          {t('obx.runsheet.reorderHitsText', {
            hits: getLabel('terms', 'hits', t).toLowerCase(),
          })}
        </InputLabel>
      </Box>
      <Box className={classNames(classes.accordionWrapper, 'innerScrollBar')}>
        <Box className={classes.patrolShiftSection}>
          <Typography variant="subtitle1" className={classes.patrolShiftHeader}>
            {t('obx.runsheet.patrolShift1')}
          </Typography>
          <HitsAccordionListing {...parentShiftProps} />
        </Box>
        <Box className={classes.patrolShiftSection}>
          <Typography variant="subtitle1" className={classes.patrolShiftHeader}>
            {t('obx.runsheet.patrolShift2')}
          </Typography>
          <HitsAccordionListing {...childShiftProps} />
        </Box>
      </Box>
    </Box>
  );
};

SplitReOrderHits.propTypes = {
  activeStep: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  state: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.string,
    startDate: PropTypes.string,
    endsAt: PropTypes.string,
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
    visitSet: PropTypes.array,
    parentVisitSet: PropTypes.array,
    hits: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.func,
  showStartEnd: PropTypes.bool,
  showSearch: PropTypes.bool,
  showSelectAll: PropTypes.bool,
  showOrder: PropTypes.bool,
  showDragAndDrop: PropTypes.bool,
  showDelete: PropTypes.bool,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
};

export default SplitReOrderHits;
