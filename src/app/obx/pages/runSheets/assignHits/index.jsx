import { Box, Button, InputLabel, Skeleton, Tooltip, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import DirectionsMap from 'src/app/components/common/directionsMap';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
// import LoaderComponent from 'src/app/components/common/loader';
import { OBX_RUNSHEET } from 'src/app/router/constant/ROUTE';
import { ReactComponent as AssignHitsIcon } from 'src/assets/svg/assignHits.svg?react';
import { ReactComponent as BackIcon } from 'src/assets/svg/backPage.svg?react';
import { ReactComponent as ExclamatoryRoundIcon } from 'src/assets/svg/ExclamatoryRoundIcon.svg?react';
import { ReactComponent as FranchiseIcon } from 'src/assets/svg/FranchiseIcon.svg?react';
import { ReactComponent as SeeListIcon } from 'src/assets/svg/SeeListIcon.svg?react';
import { ReactComponent as SiteIcon } from 'src/assets/svg/sitenew.svg?react';
import { ReactComponent as UnAssignHitsIcon } from 'src/assets/svg/unassignHits.svg?react';
// import { useApiControllers } from 'src/helper/axios';
import {
  calculateAndDisplayRouteUtils,
  generateUniqueId,
  isObjectEmpty,
  mapRunSheetData,
  updateLastItemWithUniqueId,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import {
  addHit,
  getRunsheetsPath,
  // getRunsheetsDropdown,
  getUnassignedHitsByDaysListing,
} from 'src/services/runsheet.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import {
  dayjsFormatsEnum,
  daysOfWeekWithVal,
  runSheetIcons,
  toastSettings,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import ConfirmAssignmentModal from '../components/confirmAssignmentModal';
import MapBottomButton from '../components/mapBottomButton';
import { useStyles } from './assignHitsStyles';

const AccordionListItem = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const {
    startsAt,
    siteName,
    endsAt,
    assignMissedHitsToRunsheet,
    selectedRunsheet,
    runsheets,
    tour,
  } = props;

  const { formatDayjsDateTime } = useDateTime();

  return (
    <Box className={classNames(classes.accordionListItem, classes.accordionListItemUnassigned)}>
      <Box className={classes.mainAccordionWrapper}>
        <Box className={classes.accordionListTitle}>
          <Box className={classes.iconWrapper}>
            {isObjectEmpty(selectedRunsheet) ? (
              <UnAssignHitsIcon />
            ) : (
              <img src={runSheetIcons?.runsheetMapBluePointerIconForDirectionsServiceRes} />
            )}
          </Box>
          <Box className={classes.accordionBlockWrapper}>
            <Typography variant="h5" className={classes.accordionListTitleText}>
              {siteName}
            </Typography>
            <Box className={classes.accordionListTime}>
              •
              <Typography className={classes.accordionListTimeText} variant="body2">
                {`${formatDayjsDateTime({ value: startsAt, formatType: dayjsFormatsEnum.time })} - ${formatDayjsDateTime({ value: endsAt, formatType: dayjsFormatsEnum.time })}`}
              </Typography>
            </Box>
            <Box className={classes.dayShteetWrapper}>
              {!tour && (
                <Tooltip
                  title={t('obx.runsheet.assignTourFirst', {
                    tour: getLabel('terms', 'tour', t).toLowerCase(),
                    runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
                  })}
                  arrow
                >
                  <ExclamatoryRoundIcon />
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
        <Typography className={classes.accordionListDate} variant="overline">
          {`${formatDayjsDateTime({ value: startsAt, formatType: dayjsFormatsEnum.date })} - ${formatDayjsDateTime({ value: endsAt, formatType: dayjsFormatsEnum.date })}`}
        </Typography>
      </Box>
      <Box>
        <CustomDropDown
          handleChange={(event) => assignMissedHitsToRunsheet(event, props)}
          options={(tour && transformArrayForOptions(runsheets, 'name', 'runsheetId')) || []}
          selectedValues={selectedRunsheet || {}}
          name="selectedRunsheet"
          placeHolder={t('obx.runsheet.selectRunsheet', {
            runsheet: getLabel('terms', 'runsheet', t),
          })}
          bordered
          searchable
          zIndexValue={'98'}
        />
      </Box>
    </Box>
  );
};

AccordionListItem.propTypes = {
  siteName: PropTypes.string,
  endsAt: PropTypes.string,
  startsAt: PropTypes.string,
  hitId: PropTypes.number,
  sites: PropTypes.number,
  assignMissedHitsToRunsheet: PropTypes.func,
  index: PropTypes.string,
  dutyDay: PropTypes.number,
  selectedRunsheet: PropTypes.object,
  utcDay: PropTypes.number,
  runsheets: PropTypes.array,
  tour: PropTypes.bool,
};

AccordionListItem.defaultProps = {
  siteName: '',
  endsAt: '',
  startsAt: '',
  hitId: null,
  sites: null,
  assignMissedHitsToRunsheet: () => {},
  index: '',
  dutyDay: null,
  selectedRunsheet: {},
  utcDay: null,
  runsheets: [],
  tour: true,
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const AssignHits = () => {
  const { t } = useTranslation();

  const { getLabel } = useTenantLabel();

  const [runsheetMissedHits, setRunsheetMissedHits] = useState([]);

  const [openConfirmAssignment, setOpenConfirmAssignment] = useState(false);
  const handleOpenConfirmAssignment = () => setOpenConfirmAssignment(true);
  const handleCloseConfirmAssignment = () => setOpenConfirmAssignment(false);
  const [expanded, setExpanded] = useState(false);
  const classes = useStyles({ expanded });
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState({});
  const [uniqueRunsheets, setUniqueRunsheets] = useState([]);
  const [sharedPathData, setSharedPathData] = useState([]);
  const [applyOnMap, setApplyOnMap] = useState(true);
  const [enableSave, setEnableSave] = useState(true);
  const _RenderAccordionHeader = (runsheet) => {
    return (
      <Box className={classes.accordionHeader}>
        <Box className={classes.accordionHeaderLeft}>
          <Typography variant="subtitle2" className={classes.accordionHeaderDay}>
            {/* 01/10/2024 •  */}
            {runsheet?.day}
          </Typography>
        </Box>
      </Box>
    );
  };

  const toggleRightSide = () => {
    setExpanded(!expanded);
  };

  const goBack = () => {
    history.push(OBX_RUNSHEET);
  };

  const getListing = async () => {
    try {
      setIsLoading(true);
      if (selectedDay?.value === null || selectedDay?.value === undefined)
        throw new Error('Invalid day');

      const response = await getUnassignedHitsByDaysListing(selectedDay?.value);

      if (response?.statusCode === 200) {
        const { data } = response;

        const dataWithUniqueId = data?.map((item) => ({
          ...mapRunSheetData(item),
          uniqueId: generateUniqueId(),
          runsheets: item.runsheets?.filter((a) => a.startEndLocation.address),
        }));

        setRunsheetMissedHits(dataWithUniqueId);

        setUniqueRunsheets(
          Array.from(
            new Set(
              data.flatMap((item) =>
                item.runsheets?.filter((a) => a.startEndLocation.address)?.map(JSON.stringify),
              ),
            ),
          )?.map(JSON.parse),
        );
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSheetApplyOnMap = async () => {
    try {
      const newlyAssignedMissedHits = runsheetMissedHits?.filter((data) => data?.selectedRunsheet);
      let updatedData = sharedPathData?.map((runSheet) => {
        const found = newlyAssignedMissedHits.filter(
          (missedHit) => missedHit?.selectedRunsheet?.runsheetId === runSheet?.id,
        );
        if (found?.length) {
          const response = found.map((matchedHits) => ({
            ...matchedHits.selectedRunsheet,
            siteName: matchedHits.siteName,
            siteImage: matchedHits.siteImage,
            tour: matchedHits.tour,
            start_location: matchedHits.position,
            position: matchedHits.position,
            hitId: matchedHits.hitId,
            day: matchedHits.day,
            name: matchedHits?.siteName,
          }));
          // verify pathdata
          return {
            ...runSheet,
            uuID: runSheet?.startEndLocation?.id || null,
            updated: true,
            pathData: [...runSheet.pathData, ...response],
          };
        }
        return runSheet;
      });

      updatedData = await Promise.all(
        updatedData?.map(async (data) => {
          if (!data?.updated) {
            return data;
          }

          // pluck the first item from the waypoints
          const waypoints = data?.pathData?.slice(1);
          try {
            const result = await calculateAndDisplayRouteUtils(data?.pathData?.[0], waypoints, t);

            return {
              // verfify this
              ...data,
              visitSet: result.visitSetPolyLines,
              pathData: result.mapPolyLineArray,
              startEndLocation: { position: result.mapPolyLineArray?.[0]?.[0] },
            };
          } catch (error) {
            console.error('Error processing route:', error);
            return data; // Return the original data if there's an error
          }
        }),
      );

      setSharedPathData(updatedData);
      setEnableSave(false);
      setApplyOnMap(true);
    } catch (e) {
      console.log({ e });
    }
  };
  const getPathData = async () => {
    try {
      if (!uniqueRunsheets?.length) return;
      const payload = uniqueRunsheets.map((runsheet) => runsheet?.runsheetId);
      const response = await getRunsheetsPath({ runsheetIds: payload });
      if (response?.statusCode === 200) {
        const decodedRunsheetPaths = response?.data?.map((item) => ({
          ...mapRunSheetData(item),
          // uniqueId: generateUniqueId(),
        }));
        setSharedPathData(decodedRunsheetPaths);
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const assignMissedHitsToRunsheet = (e, hit) => {
    setApplyOnMap(false);
    setEnableSave(true);
    const { name, value } = e.target;

    setRunsheetMissedHits((prevState) => {
      const newState = [...prevState];
      newState[hit.itemIndex][name] = value;
      return newState;
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = [];

      for (const item of runsheetMissedHits) {
        if (item && item?.selectedRunsheet && item?.hitId && item?.siteId) {
          const patrolTemplateId = item?.selectedRunsheet?.runsheetId;

          const existingEntry = payload?.find(
            (entry) => entry?.patrolTemplateId === patrolTemplateId,
          );

          if (existingEntry) {
            existingEntry?.hits?.push({
              hitId: item?.hitId,
              siteId: item?.siteId,
              startsAt: item?.startsAt,
              endsAt: item?.endsAt,
              day: item?.day,
            });
          } else {
            const updatedRunsheetPathData = sharedPathData.find(
              (runsheet) => runsheet.id === patrolTemplateId,
            );

            const startEndLocation = item?.selectedRunsheet.startEndLocation;
            const existingPathData = item?.selectedRunsheet?.pathData || [];

            const updatedPathData =
              existingPathData.length === 0
                ? [
                    startEndLocation, // start
                    item, // middle
                  ]
                : [...existingPathData, item];

            const waypoints = updatedPathData?.slice(1);

            const result = await calculateAndDisplayRouteUtils(updatedPathData?.[0], waypoints, t);

            let pathData = result?.visitSetPolyLines;

            let newData = {
              patrolTemplateId: patrolTemplateId,
              pathData: pathData,
              hits: [
                {
                  hitId: item?.hitId,
                  startsAt: item?.startsAt,
                  endsAt: item?.endsAt,
                  day: item?.day,
                  siteId: item?.siteId,
                },
              ],
            };
            if (updatedRunsheetPathData?.startEndLocation?.id) {
              newData.pathData = updateLastItemWithUniqueId(
                newData,
                updatedRunsheetPathData?.startEndLocation?.id,
              );
            }
            payload.push(newData);
          }
        }
      }
      const response = await addHit({ data: payload });
      if (response && response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        getListing();
      }
    } catch (error) {
      toaster.error({
        text: error?.message ? error?.message : error?.e ? error?.e : error,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      handleCloseConfirmAssignment();
      getListing();
    }
  };

  useEffect(() => {
    if (!isObjectEmpty(selectedDay)) {
      getListing();
    }
  }, [selectedDay]);

  useEffect(() => {
    if (!isObjectEmpty(runsheetMissedHits)) getPathData();
  }, [runsheetMissedHits, uniqueRunsheets]);

  const handleDaySelection = (value) => {
    if (isObjectEmpty(value)) return;
    setSelectedDay(value);
  };

  console.log({ sharedPathData, runsheetMissedHits, selectedDay });
  return (
    <>
      <Box className={classes.mainWrapper}>
        {/* {isLoading && <LoaderComponent />} */}

        <Box className={classes.leftSide}>
          <Box className={classes.runsheetsListingHeader}>
            <Button
              disableRipple
              variant="onlyText"
              onClick={goBack}
              startIcon={<BackIcon />}
              className={classes.onlyTextButton}
            ></Button>
            <Typography variant="h2" className={classes.runsheetsListingHeaderTitle}>
              {t('obx.runsheet.assignHits', { hits: getLabel('terms', 'hits', t) })}
            </Typography>
          </Box>
          <Box className={classes.runsheetsAccordion}>
            <Box className={classes.runsheetsAccordionTop}>
              <Typography variant="h5" className={classes.gutterBottom}>
                {t('obx.runsheet.selectRunsheetDateDesc', {
                  hits: getLabel('terms', 'hits', t),
                  runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
                })}
              </Typography>
              <Box className={classes.boxWrapper}>
                <InputLabel htmlFor="Runsheet Day">
                  {t('obx.runsheet.selectDay')} <RequiredAsterik />
                </InputLabel>
                <Box>
                  <CustomDropDown
                    disabled={isLoading}
                    handleChange={(e) => handleDaySelection(e?.target?.value)}
                    options={daysOfWeekWithVal(t) || []}
                    selectedValues={selectedDay || {}}
                    name="selectedRunsheet"
                    placeHolder="Select Day"
                    bordered
                    clearAll
                    className={classes.dropHeader}
                  />
                </Box>
              </Box>
            </Box>
            {isLoading ? (
              <Box className={classes.loaderBox}>
                <Skeleton variant="rectangular" />
                <Skeleton variant="rectangular" />
                <Skeleton variant="rectangular" />
                <Skeleton variant="rectangular" />
                <Skeleton variant="rectangular" />
              </Box>
            ) : (
              <Box className={classNames(classes.innerUpperWrapper, 'innerScrollBar')}>
                {runsheetMissedHits?.map((content, itemIndex) => (
                  // {runsheetMissedHits?.[selectedDay?.value]?.data.map((content, itemIndex) => (
                  <AccordionListItem
                    key={itemIndex}
                    dutyDay={selectedDay?.value}
                    itemIndex={itemIndex}
                    assignMissedHitsToRunsheet={assignMissedHitsToRunsheet}
                    {...content}
                  />
                ))}
              </Box>
            )}
            <Box className={classes.bottomSticky}>
              <Box className={classes.flexbtn}>
                {/* <Button
                  disableRipple
                  variant="primary"
                  onClick={handleRunSheetApplyOnMap}
                  disabled={applyOnMap}
                >
                  Apply on Map
                </Button> */}
                <Button
                  disableRipple
                  variant="primary"
                  onClick={handleOpenConfirmAssignment}
                  disabled={enableSave}
                >
                  {t('links.save')}
                </Button>
                <ConfirmAssignmentModal
                  openModal={openConfirmAssignment}
                  handleOpenConfirmAssignment={handleOpenConfirmAssignment}
                  handleCloseModal={handleCloseConfirmAssignment}
                  handleSubmit={handleSubmit}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className={classes.rightSide}>
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
            <MapBottomButton
              onClick={handleRunSheetApplyOnMap}
              disabled={applyOnMap}
              label={t('obx.runsheet.applyOnMap')}
            />
            <DirectionsMap
              hideMap={!uniqueRunsheets.length}
              mapPlaceholder={t('obx.runsheet.mapPlaceholder', {
                runsheets: getLabel('terms', 'runsheets', t).toLowerCase(),
              })}
              center={defaultCenter}
              onlyShowMarkers
              enableToolTipOnPolyline={true}
              waypoints={sharedPathData}
              unassignedHits={true}
              runsheetMissedHits={true}
              runsheetMissedHitsData={runsheetMissedHits || []}
              enableHitHover={true}
              isAssignHits={true}
            />
          </Box>
          <Box className={classes.bottomArea}>
            <Button disableRipple variant="onlyText">
              {selectedDay?.label}
            </Button>
            <Button disableRipple startIcon={<AssignHitsIcon />} variant="onlyText">
              {t('obx.runsheet.assignedHits', { hits: getLabel('terms', 'hits', t) })}
            </Button>
            <Button disableRipple startIcon={<SiteIcon />} variant="onlyText">
              {t('obx.runsheet.unAssignedHits', { hits: getLabel('terms', 'hits', t) })}
            </Button>
            <Button disableRipple startIcon={<FranchiseIcon />} variant="onlyText">
              {t('obx.runsheet.franchise')}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};
export default AssignHits;
