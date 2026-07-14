import {
  Box,
  Button,
  ClickAwayListener,
  InputLabel,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import LocationPlaceHolder from 'assets/images/LocationPlaceHolder.jpeg';
import { ReactComponent as EditLocationIcon } from 'assets/svg/EditLocationIcon.svg?react';
import classNames from 'classnames';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import DirectionsMap from 'src/app/components/common/directionsMap';
// import LoaderComponent from 'src/app/components/common/loader';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import SideDrawer from 'src/app/components/common/sideDrawer';
import {
  ACL_OBX_RUNSHEET_DELETE,
  ACL_OBX_RUNSHEET_UPDATE,
} from 'src/app/router/constant/OBXMODULE';
import { OBX_RUNSHEET } from 'src/app/router/constant/ROUTE';
import { ReactComponent as AddedHitIcon } from 'src/assets/svg/AddedHitIcon.svg?react';
import { ReactComponent as ArrowBack } from 'src/assets/svg/ArrowRightBlack.svg?react';
import { ReactComponent as DeletedHitIcon } from 'src/assets/svg/deletedHitIcon.svg?react';
import { ReactComponent as Edit } from 'src/assets/svg/edit.svg?react';
import { ReactComponent as ExistingHitIcon } from 'src/assets/svg/ExistingHitIcon.svg?react';
import { ReactComponent as FranchiseIcon } from 'src/assets/svg/FranchiseIconFooter.svg?react';
import { ReactComponent as RunsheetIcon } from 'src/assets/svg/RunsheetIcon.svg?react';
import { ReactComponent as SeeListIcon } from 'src/assets/svg/SeeListIcon.svg?react';
import { ReactComponent as StartingPointIcon } from 'src/assets/svg/StartingPointIcon.svg?react';
import {
  decode,
  isObjectEmpty,
  mapRunSheetData,
  updateLastItemWithUniqueId,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import useDistance from 'src/hooks/useDistance';
import {
  ADDED_HIT,
  createRunSheetReducer,
  DELETED_HIT,
  runSheetInitialState,
  SET_ENTIRE_STATE,
  UPDATE_RUNSHEET_STATE,
} from 'src/redux/reducers/runSheetReducer';
import {
  getRunsheetDetails,
  getSplitRunsheetDetails,
  updateRunsheet,
} from 'src/services/runsheet.services';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { DEFAULT_CENTER } from '../../dispatch/dispatch.constant';
import { dayjsWithStandardOffset, getHoursDiff24HourFormat } from '../../schedules/helper';
import ActivityLogDrawer from '../components/activityLogsDrawer';
import DeleteRunsheetModal from '../components/deleteRunsheetModal';
import DuplicateRunsheetModal from '../components/duplicateRunsheetModal';
import HitsAccordionListing from '../components/hitsAccordionListing';
import HitsActions from '../components/hitsPopoverButtons';
import LocationModal from '../components/locationModal';
import MapBottomButton from '../components/mapBottomButton';
import RunsheetTimeModal from '../components/runsheetTimeModal';
import UnassignedHits from '../components/unassignedHits';
import UpdateRunsheetModal from '../components/updateRunsheetModal';
import { useStyles } from './runSheetDetails';

const SEARCH_TERM_LENGTH = {
  MINIMUM: 2,
  MAXIMUM: 100,
};

const RunSheetDetail = () => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const NA = t('commonText.nA');
  const history = useHistory();
  const [expanded, setExpanded] = useState(false);
  const classes = useStyles({ expanded });
  const toggleRightSide = () => {
    setExpanded(!expanded);
  };

  const [openModal, setOpenModal] = useState(false);
  const [openDuplicateRunsheetModal, setOpenDuplicateRunsheetModal] = useState(false);
  const _handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const [applyOnMap, setApplyOnMap] = useState(null);

  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const handleOpenDuplicateRunsheetModal = () => setOpenDuplicateRunsheetModal(true);
  const handleCloseDuplicateRunsheetModal = () => setOpenDuplicateRunsheetModal(false);

  const handleOpenUpdateModal = () => setOpenUpdateModal(true);
  const handleCloseUpdateModal = () => setOpenUpdateModal(false);

  const [openLocationModal, setOpenLocationModal] = useState(false);
  const handleOpenLocationModal = () => {
    if (isEditing) setOpenLocationModal(true);
  };
  const handleCloseLocationModal = () => setOpenLocationModal(false);

  const [showDrawer, setShowDrawer] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);
  const { id: runsheetTemplateId } = useParams();
  const [runsheetDetails, setRunsheetDetails] = useState(null);
  const [isLoadingRunsheetDetails, setIsLoadingRunsheetDetails] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [state, dispatch] = useReducer(createRunSheetReducer, runSheetInitialState);
  const [openUnassignedHits, setOpenUnassignedHits] = useState(false);

  const [updatedPathCoordinates, setUpdatedPathCoordinates] = useState(null);
  const [runsheetHits, setRunsheetHits] = useState([]);
  const [updatedVisitSet, setUpdatedVisitSet] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessages, setErrorMessages] = useState({});
  const [isFocused, setIsFocused] = useState(false);
  const { formatDayjsDateTime } = useDateTime();
  const { getDistance } = useDistance();

  const setCoordinatesToMap = (data, pathDataCoordinates) => {
    let finalPayload = {
      ...state,
      pathData: data,
    };

    dispatch({ type: SET_ENTIRE_STATE, payload: finalPayload });
    if (pathDataCoordinates && pathDataCoordinates?.length) {
      setUpdatedPathCoordinates(pathDataCoordinates);
    }
    // setApplyOnMap(false);
  };
  const { search } = useLocation();
  const fetchRunsheetDetails = async () => {
    const query = new URLSearchParams(search);
    const startsAt = query.get('startsAt');
    const endsAt = query.get('endsAt');
    const fromSchedule = query.get('fromSchedule');

    try {
      let response = null;
      if (startsAt && endsAt && fromSchedule) {
        response = await getSplitRunsheetDetails(runsheetTemplateId, {
          startsAt: startsAt,
          endsAt: endsAt,
        });
      } else {
        response = await getRunsheetDetails(runsheetTemplateId);
      }
      if (response && response.statusCode === 200) {
        if (startsAt && endsAt && fromSchedule) {
          const updateHitsData = response?.data?.runsheetDetails?.hits?.filter((item) => {
            return (
              !!item?.isVisited == false &&
              !!item?.isMoved == false &&
              !!item?.isDisabled == false &&
              !!item?.isCancelled == false &&
              !!item?.isInactive == false
            );
          });
          response = {
            ...response?.data?.runsheetDetails,
            noOfHits: updateHitsData.length,
            hits: updateHitsData,
            pathData: response?.data?.pathData,
          };
        } else {
          response = response.data;
        }

        const dataForRunsheet = mapRunSheetData(response || {});
        let data = {
          ...dataForRunsheet,
          startDate: dayjsWithStandardOffset(response?.startsAt),
          startsAt: dayjsWithStandardOffset(response?.startsAt),
          endsAt: dayjsWithStandardOffset(response?.endsAt),
        };

        setRunsheetDetails(dataForRunsheet);
        dispatch({
          type: SET_ENTIRE_STATE,
          payload: data,
        });
        setRunsheetHits(response?.data?.hits);
      }
    } catch (error) {
      setRunsheetDetails(runSheetInitialState);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoadingRunsheetDetails(false);
      setApplyOnMap(null);
    }
  };

  useEffect(() => {
    if (runsheetTemplateId && isObjectEmpty(runsheetDetails)) {
      fetchRunsheetDetails();
    }
  }, [runsheetTemplateId]);

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    const errors = value
      ? {}
      : {
          [name]: t('obx.runsheet.runsheetNameError', {
            runsheet: getLabel('terms', 'runsheet', t),
          }),
        };
    setErrorMessages(errors);
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: name, value },
    });
  };

  const filterHitList = (status) => {
    return (
      state?.visitSet
        ?.filter((hit) => hit?.status === status)
        .map((hit) => ({
          hitId: hit?.hitId,
          day: hit?.day,
          siteId: hit?.siteId,
          hitName: hit?.hitName || hit?.name,
          _id: hit?._id,
          siteName: hit?.siteName,
          startsAt: hit?.startsAt,
          endsAt: hit?.endsAt,
        })) || []
    );
  };

  console.log({ runsheetDetails, state });
  const handleSaveRunsheet = async () => {
    const addedHits = filterHitList(ADDED_HIT);
    const deletedHits = filterHitList(DELETED_HIT);

    const extractLocation = (location) => ({
      lat: location?.lat || location?.position?.lat,
      lng: location?.lng || location?.position?.lng,
      address: location?.address || location?.name,
      id: location?.id,
    });

    const stateStartEndLocation = extractLocation(state?.startEndLocation);
    const currentStartEndLocation = extractLocation(runsheetDetails?.startEndLocation);

    let payload = {};

    if (state?.runsheetName !== runsheetDetails?.runsheetName) {
      payload.runsheetName = state?.runsheetName;
    }

    if (JSON.stringify(state?.visitSet) !== JSON.stringify(runsheetHits)) {
      payload.visitSet = state?.visitSet?.filter((hit) => hit?.status !== DELETED_HIT) || [];
      if (addedHits?.length) payload.addedHits = addedHits;
      if (deletedHits?.length) payload.removedHits = deletedHits;
    }
    if (state?.pathData && !updatedPathCoordinates) {
      payload.pathData = state?.pathData;
      if (runsheetDetails?.startEndLocation?.id) {
        payload.pathData = updateLastItemWithUniqueId(state, runsheetDetails?.startEndLocation?.id);
      }
    }

    /**
     * if display on map is clicked once
     */
    if (state?.pathData && updatedPathCoordinates && updatedPathCoordinates?.length) {
      payload.pathData = state?.pathData
        ?.filter((path) => !path?.status || path?.status !== DELETED_HIT)
        ?.map((data, i) => ({ ...data, mapPath: updatedPathCoordinates[i] }))
        ?.map((data) => {
          if (data?.status) {
            const { status: _skip, ...rest } = data;
            return rest;
          }
          return data;
        });
      // after everything is filtered out, set the hitid of last pathdata
      if (runsheetDetails?.startEndLocation?.id) {
        payload.pathData = updateLastItemWithUniqueId(
          payload,
          runsheetDetails?.startEndLocation?.id,
        );
      }
    }

    if (JSON.stringify(stateStartEndLocation) !== JSON.stringify(currentStartEndLocation)) {
      payload.startEndLocation = state?.startEndLocation && {
        address: state?.startEndLocation?.name,
        lat: state?.startEndLocation?.position?.lat,
        lng: state?.startEndLocation?.position?.lng,
        id: runsheetDetails?.startEndLocation?.id,
      };
    }

    // Early return if no changes are detected
    if (isObjectEmpty(payload)) {
      resetAllOpenedStates();
      return;
    }

    try {
      if (applyOnMap === null) {
        payload = { runsheetName: state?.runsheetName };
      }
      const response = await updateRunsheet(runsheetTemplateId, payload);
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toaster.error({
        text: error?.message || 'An error occurred',
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      resetAllOpenedStates();
      fetchRunsheetDetails();
    }
  };

  const handleApplyOnMap = () => {
    setApplyOnMap(true);
    if (applyOnMap === true) setUpdatedVisitSet(state?.visitSet);
  };

  const resetAllOpenedStates = () => {
    setIsEditing(false);
    setNameEdited(false);
    setOpenUpdateModal(false);
    setOpenUnassignedHits(false);
  };

  const handleEnableDirection = (val) => setApplyOnMap(val);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setOpenUnassignedHits(false);
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: 'visitSet', value: state?.hits },
    });
    fetchRunsheetDetails();
    if (Object.keys(errorMessages)?.length) {
      setErrorMessages({});
      setNameEdited(false);
    }
  };

  const handleDelete = (id) => {
    const updatedHits = state?.visitSet
      .map((hitItem) => {
        if (
          hitItem?.hitId === id &&
          hitItem?.status !== ADDED_HIT &&
          hitItem?.status !== DELETED_HIT
        ) {
          hitItem['status'] = DELETED_HIT;
          return hitItem;
        }

        if (hitItem?.hitId === id && hitItem?.status) {
          return null;
        }

        return hitItem;
      })
      ?.filter((data) => !!data);

    const updatedMapPath = state?.pathData
      .map((mapPathItem) => {
        /**
         * If the hit is not already deleted or added and is not the starting position
         */
        if (
          mapPathItem?.hitId === id &&
          mapPathItem?.status !== ADDED_HIT &&
          mapPathItem?.status !== DELETED_HIT
        ) {
          mapPathItem['status'] = DELETED_HIT;
          return mapPathItem;
        }

        /**
         * if the hit is already added or deleted and is not the starting position
         */
        if (mapPathItem?.hitId === id && mapPathItem?.status) {
          return null;
        }

        return mapPathItem;
      })
      ?.filter((data) => !!data);

    dispatch({
      type: SET_ENTIRE_STATE,
      payload: { ...state, pathData: updatedMapPath, visitSet: updatedHits },
    });
  };

  useEffect(() => {
    setApplyOnMap(null);
    setSearchTerm('');
  }, [isEditing]);

  useEffect(() => {
    setSearchTerm('');
  }, [openUnassignedHits]);

  useEffect(() => {
    if (applyOnMap) {
      const data = state.pathData?.map((pathInfo, index) => {
        if (!index) {
          return { ...pathInfo, uniqueId: null, mapPath: decode(pathInfo.mapPath) };
        }
        return {
          ...pathInfo,
          mapPath: decode(pathInfo.mapPath),
          siteImage: state?.visitSet?.[index - 1]?.siteImage || null,
          siteAddress: state?.visitSet?.[index - 1]?.siteAddress,
          uniqueId: state?.visitSet?.[index - 1]?.uniqueId,
          startsAt: state?.visitSet?.[index - 1]?.startsAt,
          endsAt: state?.visitSet?.[index - 1]?.endsAt,
          siteId: state?.visitSet?.[index - 1]?.siteId,
          siteName: state?.visitSet?.[index - 1]?.siteName,
          position: state?.visitSet?.[index - 1]?.position,
        };
      });
      dispatch({
        type: UPDATE_RUNSHEET_STATE,
        payload: { key: 'pathData', value: data },
      });
      setApplyOnMap(false);
    } else {
      setApplyOnMap(false);
    }
    if (isObjectEmpty(updatedVisitSet)) setUpdatedVisitSet(state?.visitSet);
  }, [state?.visitSet, state?.startEndLocation]);
  const isDisableButton = () => {
    // Returning early disable true if the runsheet name is empty
    if (!isObjectEmpty(errorMessages)) return true;

    // disable button if any now waypoint or start end location is added or updated
    if (applyOnMap === false) return true;
    const visitSetSame = JSON.stringify(state?.visitSet) === JSON.stringify(updatedVisitSet);
    return applyOnMap === false && !visitSetSame;
  };

  const [nameEdited, setNameEdited] = useState(false);
  const finalVisitSet = useMemo(() => {
    return state?.visitSet?.length
      ? state?.visitSet?.filter((data) => data?.status !== DELETED_HIT)
      : state?.visitSet;
  }, [state?.visitSet]);

  const runsheetTime = Number.isInteger(
    parseFloat(getHoursDiff24HourFormat(state.startsAt, state.endsAt)),
  )
    ? Math.round(parseFloat(getHoursDiff24HourFormat(state.startsAt, state.endsAt)))
    : parseFloat(getHoursDiff24HourFormat(state.startsAt, state.endsAt)).toFixed(1);

  const goBack = () => {
    history.push(OBX_RUNSHEET);
  };

  const runsheetWeekDay = dayjsWithStandardOffset(runsheetDetails?.startsAt).format('ddd');

  const handleSearch = (e) => {
    const { value, name } = e.target;
    const searchLength = value.length;
    let errors = {};
    if (searchLength && searchLength > SEARCH_TERM_LENGTH.MAXIMUM)
      errors = { [name]: t('obx.runsheet.maximumSearchLength') };
    if (searchLength && searchLength < SEARCH_TERM_LENGTH.MINIMUM)
      errors = { [name]: t('obx.runsheet.minimumSearchLength') };

    setErrorMessages(errors);
    if (!errors?.[name]) setSearchTerm(value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleClickAway = () => {
    if (!isFocused && Object.keys(errorMessages).length === 0) {
      setNameEdited(false);
    }
  };

  const goToEditRunsheet = () => {
    history.push(`${OBX_RUNSHEET}/details/${runsheetTemplateId}/editRunsheet`);
  };

  return (
    <>
      {/* {isLoadingRunsheetDetails && <LoaderComponent />} */}

      <Box className={classes.mainWrapper}>
        <Box className={classes.leftSide}>
          <Box className={classes.TopBox}>
            <Box className={classes.buttonsAndText}>
              <>
                {!nameEdited && (
                  <Box className={classes.contractNameFlex}>
                    {isLoadingRunsheetDetails ? (
                      <Skeleton className={classes.titleSkeleton} />
                    ) : (
                      <Box className={classes.headingWrapper}>
                        <Button onClick={goBack} className={classes.backActionButton}>
                          <ArrowBack />
                        </Button>
                        <Typography variant="h2" className={classes.stepperHeadding}>
                          {state?.runsheetName || runsheetDetails?.runsheetName || NA}
                        </Typography>
                        {isEditing && (
                          <Button
                            disableRipple
                            variant="onlyText"
                            className={classes.serviceEditIcon}
                            onClick={() => {
                              setNameEdited(true);
                            }}
                          >
                            <Edit />
                          </Button>
                        )}
                        <Typography variant="h2">{'•'}</Typography>
                        <Typography variant="h2" className={classes.grayColor}>
                          {`${runsheetWeekDay}`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {nameEdited && (
                  <ClickAwayListener onClickAway={handleClickAway}>
                    <Box className={classes.contractNameFlex}>
                      <TextField
                        type="text"
                        className={classes.inputField}
                        fullWidth
                        value={state?.runsheetName}
                        // defaultValue={savedContractName ? savedContractName : contractName}
                        onChange={inputChangedHandler}
                        name={'runsheetName'}
                        error={errorMessages?.['runsheetName']}
                        helperText={errorMessages?.['runsheetName']}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                      <Typography variant="h2">{'•'}</Typography>
                      <Typography variant="h2" className={classes.grayColor}>
                        {`${runsheetWeekDay}`}
                      </Typography>
                    </Box>
                  </ClickAwayListener>
                )}
              </>

              {isEditing && (
                <Box className={classes.topButoons}>
                  <Button disableRipple variant="secondaryGrey" onClick={handleCancelEdit}>
                    {t('obx.runsheet.cancel')}
                  </Button>
                  <Button
                    disableRipple
                    variant="primary"
                    disabled={isDisableButton()}
                    onClick={handleOpenUpdateModal}
                  >
                    {t('obx.runsheet.save')}
                  </Button>
                </Box>
              )}
            </Box>
            <Box className={classes.searchbar}>
              <SearchComponentWithQuery
                name="search"
                placeHolder={`${t('obx.runsheet.searchBySiteName')}`}
                onSearch={(e) => handleSearch(e)}
                helperText={!!errorMessages?.search ? errorMessages?.search : null}
                error={!!errorMessages?.search ? errorMessages?.search : false}
              />
              {!isEditing && (
                <Box className={classes.hamburgerButton}>
                  <Button onClick={() => setShowDrawer(true)} disableRipple variant="secondaryGrey">
                    {t('obx.runsheet.viewActivity')}
                  </Button>

                  {(userHasPermission(ACL_OBX_RUNSHEET_DELETE) ||
                    userHasPermission(ACL_OBX_RUNSHEET_UPDATE)) && (
                    <Box className={classes.popButton}>
                      <HitsActions
                        handleOpenDeleteModal={handleOpenDeleteModal}
                        setOpenDeleteModal={setOpenDeleteModal}
                        handleOpenDuplicateRunsheetModal={handleOpenDuplicateRunsheetModal}
                        setDuplicateRunsheetModal={setOpenDuplicateRunsheetModal}
                        setIsEditing={setIsEditing}
                        editAction={goToEditRunsheet}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          {!openUnassignedHits ? (
            <>
              <Box className={classes.locationButtons}>
                <InputLabel htmlFor="runsheetName">
                  {t('obx.runsheet.startingEndingLocation')}
                </InputLabel>

                <Button
                  onClick={handleOpenLocationModal}
                  disableRipple
                  endIcon={isEditing && <EditLocationIcon />}
                  className={classes.editButton}
                  type="button"
                  variant="destructive"
                >
                  <Box component="span" className={classes.editButtonInner}>
                    <img src={state?.startEndLocation?.siteImage || LocationPlaceHolder} alt="" />{' '}
                    {state?.startEndLocation?.address || state?.startEndLocation?.name}
                  </Box>
                </Button>
              </Box>
              {isLoadingRunsheetDetails ? (
                <Box className={classes.loaderBox}>
                  <Skeleton variant="rectangular" />
                  <Skeleton variant="rectangular" />
                  <Skeleton variant="rectangular" />
                  <Skeleton variant="rectangular" />
                  <Skeleton variant="rectangular" />
                </Box>
              ) : (
                <Box className={classes.hitsListinng}>
                  <InputLabel htmlFor="runsheetName">
                    {t('obx.runsheet.hits', { hits: getLabel('terms', 'hits', t) })}
                  </InputLabel>
                  <Box className={classNames(classes.accordionWrapper, 'innerScrollBar')}>
                    <HitsAccordionListing
                      showEdit={isEditing}
                      state={state}
                      idKey="hitId"
                      showOrder={true}
                      dispatch={dispatch}
                      hitsList={finalVisitSet || []}
                      showSelectionCheckBox={false}
                      handleDelete={handleDelete}
                      showDragAndDrop={isEditing}
                      showDelete={isEditing}
                      fetchRunsheetDetails={fetchRunsheetDetails}
                      searchTerm={searchTerm}
                    />
                  </Box>
                </Box>
              )}
              {isEditing && (
                <Box className={classes.bottomSticky}>
                  <Button
                    disableRipple
                    variant="secondaryBlue"
                    onClick={() => setOpenUnassignedHits(true)}
                  >
                    {t('obx.runsheet.addUnassignedHits', {
                      hits: getLabel('terms', 'hits', t).toLowerCase(),
                    })}
                  </Button>
                </Box>
              )}{' '}
            </>
          ) : (
            <Box className={classes.unassignedHitsListing}>
              {!isObjectEmpty(state) && !isLoadingRunsheetDetails && (
                <UnassignedHits
                  state={state}
                  showOrder={isEditing}
                  dispatch={dispatch}
                  hitsList={finalVisitSet}
                  showSelectionCheckBox={false}
                  showDragAndDrop={isEditing}
                  searchTerm={searchTerm}
                  handleDelete={handleDelete}
                  showDelete={isEditing}
                  goBack={() => setOpenUnassignedHits(false)}
                />
              )}
            </Box>
          )}
        </Box>

        <Box className={classes.rightSide}>
          <Box className={classes.hitStates}>
            <Box className={classes.stateColums}>
              <Typography variant="body3">
                {t('obx.runsheet.totalHits', { hits: getLabel('terms', 'hits', t) })}
              </Typography>
              {isLoadingRunsheetDetails ? (
                <Skeleton className={classes.detailsSkeleton} />
              ) : (
                <Typography variant="body2">{state?.noOfHits}</Typography>
              )}
            </Box>
            <Box className={classes.stateColums}>
              <Typography variant="body3">
                {t('obx.runsheet.runsheetTime', { runsheet: getLabel('terms', 'runsheet', t) })}
              </Typography>
              {isLoadingRunsheetDetails ? (
                <Skeleton className={classes.detailsSkeleton} />
              ) : (
                <Typography variant="body2" className={classes.editTime}>
                  {state?.startsAt &&
                    state?.endsAt &&
                    `${formatDayjsDateTime({
                      value: state?.startsAt,
                      formatType: dayjsFormatsEnum.time,
                    })} 
                    - ${formatDayjsDateTime({ value: state?.endsAt, formatType: dayjsFormatsEnum.time })} (${runsheetTime}h)`}
                </Typography>
              )}
            </Box>
            <Box className={classes.stateColums}>
              <Typography variant="body3">{t('obx.runsheet.startDate')}</Typography>
              {isLoadingRunsheetDetails ? (
                <Skeleton className={classes.detailsSkeleton} />
              ) : (
                <Typography variant="body2">
                  {formatDayjsDateTime({
                    value: state?.startsAt,
                    formatType: dayjsFormatsEnum.date,
                  })}
                </Typography>
              )}
            </Box>
            <Box className={classes.stateColums}>
              <Typography variant="body3">{t('obx.runsheet.estDistance')}</Typography>
              {isLoadingRunsheetDetails ? (
                <Skeleton className={classes.detailsSkeleton} />
              ) : (
                <Typography variant="body2">
                  {state?.pathData?.[0]?.totalDistance
                    ? getDistance(state?.pathData?.[0]?.totalDistance)
                    : NA}
                </Typography>
              )}
            </Box>
          </Box>
          {isEditing && (
            <MapBottomButton
              isSplit={true}
              disabled={!isEditing || applyOnMap === null || applyOnMap}
              onClick={handleApplyOnMap}
              label={t('obx.runsheet.applyOnMap')}
            />
          )}
          <Button
            disableRipple
            className={classes.toggleButton}
            startIcon={<SeeListIcon className={classes.iconRotate} />}
            variant="onlyText"
            onClick={toggleRightSide}
          >
            {expanded ? t('obx.runsheet.back') : t('obx.runsheet.SeeList')}
          </Button>
          <Box className={classes.mapArea}>
            <DirectionsMap
              key={`${isLoadingRunsheetDetails}`}
              setCoordinates={setCoordinatesToMap}
              waypoints={state?.visitSet || []}
              origin={state?.startEndLocation || DEFAULT_CENTER}
              destination={state?.startEndLocation || {}}
              showPolyineAndMarkersSeparately={!applyOnMap}
              enableHitHover={true}
              center={
                isObjectEmpty(state?.startEndLocation?.position)
                  ? state?.startEndLocation?.position
                  : DEFAULT_CENTER
              }
              pathData={state?.pathData || []}
              dontRunDirections={true}
              applyOnMap={applyOnMap}
              handleEnableDirection={handleEnableDirection}
            />
          </Box>
          <Box className={classes.bottomArea}>
            {isEditing && (
              <>
                <Button disableRipple startIcon={<ExistingHitIcon />} variant="onlyText">
                  {t('obx.runsheet.existingHit', { hit: getLabel('terms', 'hit', t) })}
                </Button>
                <Button disableRipple startIcon={<AddedHitIcon />} variant="onlyText">
                  {t('obx.runsheet.addedHit', { hit: getLabel('terms', 'hit', t) })}
                </Button>
                <Button disableRipple startIcon={<DeletedHitIcon />} variant="onlyText">
                  {t('obx.runsheet.deletedHit', { hit: getLabel('terms', 'hit', t) })}
                </Button>
              </>
            )}
            <Button disableRipple startIcon={<RunsheetIcon />} variant="onlyText">
              {t('obx.runsheet.runsheet', { runsheet: getLabel('terms', 'runsheet', t) })}
            </Button>
            <Button disableRipple startIcon={<StartingPointIcon />} variant="onlyText">
              {t('obx.runsheet.startingEndingPoint')}
            </Button>

            <Button disableRipple startIcon={<FranchiseIcon />} variant="onlyText">
              {t('obx.runsheet.franchise')}
            </Button>
          </Box>
        </Box>
        <UpdateRunsheetModal
          openModal={openUpdateModal}
          handleCloseModal={handleCloseUpdateModal}
          handleSubmit={handleSaveRunsheet}
        />
        {openDeleteModal && (
          <DeleteRunsheetModal
            openModal={openDeleteModal}
            handleCloseModal={handleCloseDeleteModal}
            runsheetTemplateId={runsheetTemplateId}
          />
        )}

        {openDuplicateRunsheetModal && (
          <DuplicateRunsheetModal
            openModal={openDuplicateRunsheetModal}
            handleCloseModal={handleCloseDuplicateRunsheetModal}
            runsheetTemplateId={runsheetTemplateId}
            currentRunsheetDate={state?.startsAt}
          />
        )}

        <RunsheetTimeModal openModal={openModal} handleCloseModal={handleCloseModal} />
        <LocationModal
          openModal={openLocationModal}
          handleCloseModal={handleCloseLocationModal}
          dispatch={dispatch}
          state={state}
        />
        {showDrawer && (
          <SideDrawer isOpen={showDrawer} totalWidth={'571px'}>
            <ActivityLogDrawer
              patrolTemplateId={runsheetTemplateId}
              showDrawer={showDrawer}
              setShowDrawer={setShowDrawer}
            />
          </SideDrawer>
        )}
      </Box>
    </>
  );
};

export default RunSheetDetail;
