import { Box, Button, Checkbox, InputLabel, Typography } from '@mui/material';
import LocationPlaceHolder from 'assets/images/LocationPlaceHolder.jpeg';
import { ReactComponent as EditLocationIcon } from 'assets/svg/EditLocationIcon.svg?react';
import { ReactComponent as UnassignedLocationIcon } from 'assets/svg/UnassignedLocationIcon.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import SideDrawer from 'src/app/components/common/sideDrawer';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/BlueCheckboxIcon.svg?react';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/BlueCheckedIcon.svg?react';
import {
  isObjectEmpty,
  mergeObjects,
  visitRowIdKey,
  visitSetInViewOrder,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useGetHits from 'src/hooks/useGetHits';
import { UPDATE_RUNSHEET_STATE } from 'src/redux/reducers/runSheetReducer';
import { getEditedTimeRunsheetHits } from 'src/services/runsheet.services';
import {
  CONST_RE_ORDER_HITS,
  CONST_RUNSHEET_SELECT_HITS,
  toastSettings,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { dayjsWithStandardOffset } from '../../../schedules/helper';
import HitsAccordionListing from '../hitsAccordionListing';
import LocationModal from '../locationModal';
import NewHitsAccordionListing from '../newHitsAccordionListing';
import RemovedHits from '../removedHitsDrawer';
import UnassignedHits from '../unassignedHits';
import { useStyles } from './SelectHitsTab';
const SelectHitsTab = (props) => {
  const {
    state,
    showStartEnd,
    showSelectAll,
    showSearch,
    activeStep,
    dispatch,
    isSameDate,
    handleBack,
    openUnassignedHits,
    setOpenUnassignedHits,
    isEditRunsheet,
    checked,
    setChecked,
  } = props;
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const { hitsList, hitsLoading, getHits, setHitsList, totalHits } = useGetHits(
    state,
    isEditRunsheet,
  );
  const [existingHits, setExistingHits] = useState(null);
  const [viewHits, setViewHits] = useState(false);
  const classes = useStyles();

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const { id } = useParams();
  const [excludedHits, setExcludedHits] = useState(null);
  const [isLoadingExistingHits, setIsLoadingExistingHits] = useState(true);
  const [newlyAddedHit, setNewlyAddedHit] = useState(null);

  const prevActiveStepRef = useRef(null);

  const removedIdsForOrder = useMemo(() => {
    const flat = Object.values(existingHits?.removedHits || {}).flat();
    return new Set(flat.map((r) => visitRowIdKey(r)).filter(Boolean));
  }, [existingHits]);

  useEffect(() => {
    if (totalHits > -1 && totalHits !== undefined)
      dispatch({
        type: UPDATE_RUNSHEET_STATE,
        payload: { key: 'totalHits', value: totalHits },
      });
  }, [totalHits]);

  useEffect(() => {
    if (newlyAddedHit) {
      const mergedHits = mergeObjects(hitsList, newlyAddedHit);
      setHitsList(mergedHits);
      setNewlyAddedHit(null);
    }
  }, [newlyAddedHit]);

  const addHitToTheHitsList = (hit) => setNewlyAddedHit(hit);

  const handleButtonClick = () => {
    setChecked((prevChecked) => !prevChecked);
  };

  const [queryString, setQueryString] = useState('');

  const handleSearch = (e) => {
    setQueryString(e.target.value);
  };

  useEffect(() => {
    if (!hitsLoading && !isLoadingExistingHits) setHitsList(existingHits?.visits);
  }, [hitsLoading, isLoadingExistingHits]);

  const fetchEditedTimeRunsheetHits = async () => {
    try {
      const response = await getEditedTimeRunsheetHits(id, {
        runsheetName: state?.runsheetName,
        startsAt: dayjsWithStandardOffset(state?.startsAt)?.toISOString(),
        endsAt: dayjsWithStandardOffset(state?.endsAt)?.toISOString(),
      });
      if (response && response?.statusCode === 200) {
        setExistingHits(response.data);
        const removedHits = Object.values(response?.data?.removedHits)?.flat();
        const removedSet = new Set(removedHits?.map((r) => visitRowIdKey(r)).filter(Boolean) || []);
        const hitsNeedToBeAdded = state?.hits?.filter((hit) => !removedSet.has(visitRowIdKey(hit)));
        const visitSetOrdered = visitSetInViewOrder(
          hitsNeedToBeAdded,
          state?.hits || [],
          removedSet,
        );

        dispatch({
          type: UPDATE_RUNSHEET_STATE,
          payload: {
            key: 'visitSet',
            value: visitSetOrdered,
          },
        });
        setIsLoadingExistingHits(false);
      }
    } catch (err) {
      toaster.error({
        text: err.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (!!isEditRunsheet && !existingHits) fetchEditedTimeRunsheetHits();
    if (Object.keys(hitsList)?.length) return;
    // Passing true for appending runsheet name to payload
    if (!isEditRunsheet) getHits(false, handleBack);
    if (isSameDate) setChecked(false);
  }, []);

  // When landing on Re-order, align visitSet with view order (state.hits), then new adds at end.
  // Do not depend on visitSet alone or we would undo drag-reorder on the same step.
  useEffect(() => {
    const prev = prevActiveStepRef.current;
    prevActiveStepRef.current = activeStep;
    const enteredReorder = activeStep === CONST_RE_ORDER_HITS && prev !== CONST_RE_ORDER_HITS;
    if (!enteredReorder) return;
    if (!state?.visitSet?.length || !state?.hits?.length) return;

    const ordered = visitSetInViewOrder(state.visitSet, state.hits, removedIdsForOrder);
    const cur = state.visitSet.map((v) => visitRowIdKey(v)).join(',');
    const next = ordered.map((v) => visitRowIdKey(v)).join(',');
    if (cur !== next) {
      dispatch({
        type: UPDATE_RUNSHEET_STATE,
        payload: { key: 'visitSet', value: ordered },
      });
    }
  }, [activeStep, state?.visitSet, state?.hits, removedIdsForOrder, dispatch]);

  // Resetting checked checkbox to uncheck if user unselects any of the hit
  useEffect(() => {
    if (
      state?.visitSet?.length &&
      state?.visitSet?.length !==
        Object.values(hitsList)
          .flat()
          .filter((hit) => hit.tour)?.length
    )
      setChecked(null);
  }, [state?.visitSet]);

  /**
   * @description Delete selected hit
   * @param {*} id
   */
  const handleDelete = (id) => {
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: 'visitSet', value: state?.visitSet?.filter((data) => data?.hitId !== id) },
    });

    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: 'isVisitsUpdated', value: true },
    });
  };

  const getFilteredHitList = () => {
    return activeStep !== CONST_RE_ORDER_HITS
      ? queryString
        ? Object.fromEntries(
            Object.entries(hitsList).filter(([key]) =>
              key.toLowerCase().includes(queryString.toLowerCase()),
            ),
          )
        : hitsList
      : state?.visitSet;
  };

  const finalProps = {
    ...props,
    hitsList: getFilteredHitList(),
    unfilteredHitList: Object.values(hitsList)
      .flat()
      .filter((data) => data?.tour),
    hitsLoading,
    selectAllHits: activeStep === CONST_RUNSHEET_SELECT_HITS ? checked : null,
    setChecked,
    handleDelete,
    excludedHits,
    fetchRunsheetDetails: () => getHits(true),
  };

  useEffect(() => {
    if (existingHits) setExcludedHits(existingHits?.removedHits);
  }, [existingHits]);

  return (
    <>
      <Box className={classes.hitsWrapper}>
        {!openUnassignedHits ? (
          <>
            {/** show location selection */}
            {showStartEnd && (
              <Box className={classes.locationButtons}>
                <InputLabel htmlFor="runsheetName">
                  {t('obx.runsheet.startingEndingLocation')}
                </InputLabel>
                {/* NOTE::::: there are two buttons one for edit and one for add  */}
                {isObjectEmpty(state?.startEndLocation) ? (
                  <Button
                    onClick={handleOpenModal}
                    disableRipple
                    startIcon={<UnassignedLocationIcon />}
                    className={classes.redButton}
                    type="button"
                    variant="destructive"
                  >
                    {t('obx.runsheet.addStartingEndingLocation')}
                  </Button>
                ) : (
                  <Button
                    onClick={handleOpenModal}
                    disableRipple
                    endIcon={<EditLocationIcon />}
                    className={classes.editButton}
                    type="button"
                    variant="destructive"
                  >
                    <Box component="span" className={classes.editButtonInner}>
                      <img src={LocationPlaceHolder} alt="" />{' '}
                      {state?.startEndLocation?.name || state?.startEndLocation?.address}
                    </Box>
                  </Button>
                )}
              </Box>
            )}
            {isEditRunsheet &&
            activeStep === CONST_RUNSHEET_SELECT_HITS &&
            excludedHits &&
            Object.keys(excludedHits)?.length ? (
              <Box className={classes.visitHits}>
                <Typography variant="caption">
                  {t('obx.runsheet.excludedHitsEditRunsheet', {
                    hits: getLabel('terms', 'hits', t).toLowerCase(),
                    runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
                  })}
                </Typography>

                <Button variant="destructive" onClick={() => setViewHits(true)}>
                  View hits
                </Button>
              </Box>
            ) : null}

            {/** Show search */}
            <Box className={classes.searchSelected}>
              {showSearch && (
                <SearchComponentWithQuery
                  onSearch={handleSearch}
                  placeHolder={t('obx.runsheet.search')}
                />
              )}
              {/** show select all button */}
              {showSelectAll && (
                <Button
                  disableRipple
                  className={classes.selectAll}
                  variant="onlyText"
                  onClick={handleButtonClick}
                >
                  <Checkbox
                    id="mark-emergency-contact"
                    icon={<CheckBoxRegularIcon />}
                    checkedIcon={<CheckBoxCheckedIcon />}
                    className={classes.checkBoxCustom}
                    checked={checked}
                  />
                  {t('obx.runsheet.selectAllSites')}
                </Button>
              )}
            </Box>

            <Box className={classNames(classes.accordionWrapper, 'innerScrollBar')}>
              {activeStep === CONST_RUNSHEET_SELECT_HITS ? (
                <NewHitsAccordionListing idKey="hitId" {...finalProps} />
              ) : (
                <HitsAccordionListing idKey="hitId" {...finalProps} />
              )}
            </Box>

            {viewHits && (
              <SideDrawer
                isOpen={viewHits}
                totalWidth={'532px'}
                className={classes.sideDrawerHeight}
              >
                <RemovedHits setShowDrawer={setViewHits} excludedHits={excludedHits} />
              </SideDrawer>
            )}
            <LocationModal openModal={openModal} handleCloseModal={handleCloseModal} {...props} />
          </>
        ) : (
          <Box className={classes.unassignedHitsListing}>
            {!isObjectEmpty(state) && (
              <UnassignedHits
                state={state}
                dispatch={dispatch}
                goBack={() => setOpenUnassignedHits(false)}
                addHitToTheHitsList={addHitToTheHitsList}
                setNewlyAddedHit={setNewlyAddedHit}
              />
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

SelectHitsTab.propTypes = {
  activeStep: PropTypes.string,
  state: PropTypes.shape({
    hits: PropTypes.array,
    runsheetName: PropTypes.string,
    startsAt: PropTypes.string,
    startDate: PropTypes.string,
    endsAt: PropTypes.string,
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
    visitSet: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.function,
  showStartEnd: PropTypes.bool || undefined,
  checked: PropTypes.bool ?? null,
  setChecked: PropTypes.func,
  showSearch: PropTypes.bool || undefined,
  showSelectAll: PropTypes.bool || undefined,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  isSameDate: PropTypes.bool,
  handleBack: PropTypes.func,
  openUnassignedHits: PropTypes.bool,
  setOpenUnassignedHits: PropTypes.func,
  isEditRunsheet: PropTypes.bool,
};
export default SelectHitsTab;
