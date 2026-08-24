import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  InputLabel,
  Skeleton,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import LocationPlaceHolder from 'assets/images/LocationPlaceHolder.jpeg';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { toggleAutoCheckoutStatus } from 'services/runsheet.services';
import DirectionsMap from 'src/app/components/common/directionsMap';
import ShiftVisitsStatus from 'src/app/components/obxComponents/ShiftVisitsStatus';
import { ACL_OBX_SCHEDULES_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { ReactComponent as AddedHitIcon } from 'src/assets/svg/AddedHitIcon.svg';
import { ReactComponent as AssignCarIcon } from 'src/assets/svg/AssignCarIcon.svg';
import { ReactComponent as RunsheetVehicle } from 'src/assets/svg/bluecar.svg';
import { ReactComponent as CheckoutShiftIcon } from 'src/assets/svg/CheckoutShiftIcon.svg';
import { ReactComponent as CoveredRunsheetHit } from 'src/assets/svg/CoveredRunsheetHit.svg';
import { ReactComponent as EditIcon } from 'src/assets/svg/edit-icon.svg';
import { ReactComponent as ExistingHitIcon } from 'src/assets/svg/ExistingHitIcon.svg';
import { ReactComponent as FranchiseIcon } from 'src/assets/svg/FranchiseIconFooter.svg';
import { ReactComponent as RunsheetIcon } from 'src/assets/svg/RunsheetIcon.svg';
import { ReactComponent as StartingPointIcon } from 'src/assets/svg/StartingPointIcon.svg';
import { ReactComponent as UnassignedOfficerIcon } from 'src/assets/svg/UnassignedOfficerIcon.svg';
import {
  convertRunSheetMinutesToHoursAndMinutes,
  isObjectEmpty,
  mapRunSheetData,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDistance from 'src/hooks/useDistance';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { toastSettings } from 'src/utils/constants';
import { calendarShiftStatusEnum, ShiftStatus } from 'src/utils/constants/schedules';
import { truncateString } from 'src/utils/string/truncate';

import HitsAccordionListing from '../../../runSheets/components/hitsAccordionListing';
import { ScheduleStatusChips } from '../../components/scheduleStatusChips';
import { getCurrentStandardTimeInIsoWrtTimezone } from '../../helper';
import { ASSIGN_RUNSHEET_OPTIONS } from '..';
import { breakConfiguration, shiftPayRateOverride } from '../demoPanelFields';
import { PANEL_ACCENT_LIGHT } from '../panelAccent';
import { useStyles } from './runsheetDetailsStyles';

const RunsheetDetail = ({
  shiftData,
  setIsAssign,
  loading,
  hideButtons = false,
  shiftId,
  shiftActivityLogId,
  callbackUponAssignment,
}) => {
  const classes = useStyles();
  const [visitedPoints, setVisitedPoints] = useState({});
  const [runsheetDetails, setRunsheetDetails] = useState({});
  const [autoShiftToggle, setAutoShiftToggle] = useState(null);
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const { getDistanceValue, getDistanceShortUnit } = useDistance();

  useEffect(() => {
    if (!isObjectEmpty(shiftData)) {
      const points = {};
      shiftData?.runsheetDetails?.hits?.forEach((hit) => {
        points[hit?.hitId] = hit?.isVisited;
      });
      setVisitedPoints(points);
      setRunsheetDetails(
        mapRunSheetData({
          ...shiftData?.runsheetDetails,
          pathData: shiftData?.pathData,
          startEndLocation: {
            ...shiftData?.runsheetDetails?.startEndLocation,
            position: {
              lat: shiftData?.runsheetDetails?.startEndLocation?.lat,
              lng: shiftData?.runsheetDetails?.startEndLocation?.lng,
            },
          },
        }),
      );
      setAutoShiftToggle(shiftData?.runsheetDetails?.autoClockoutOff);
    }
  }, [shiftData]);

  const toggleAutoShift = async () => {
    try {
      const shiftIdRunsheet = shiftActivityLogId ? shiftActivityLogId : shiftId;
      const payload = {
        type: 'runsheet',
        startsAt: shiftData?.startsAt,
        endsAt: shiftData?.endsAt,
      };
      const response = await toggleAutoCheckoutStatus(shiftIdRunsheet, payload);
      if (response && response?.statusCode === 200) {
        setAutoShiftToggle(!autoShiftToggle);
        if (response?.data?.logId) {
          callbackUponAssignment(response?.data?.logId);
        }
      }
    } catch (error) {
      toast.error(error?.message, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const finalVisitSet = useMemo(() => {
    return shiftData?.runsheetDetails?.hits?.length
      ? shiftData?.runsheetDetails?.hits.filter((data) => data?.status !== 'deleted')
      : shiftData?.runsheetDetails?.hits;
  }, [shiftData?.runsheetDetails?.hits]);

  // getDistanceValue returns NaN for a missing total — render 0 rather than "NaN Mi".
  const toDistance = (value) => {
    const converted = getDistanceValue(value);
    return Number.isFinite(Number(converted)) ? converted : 0;
  };

  const totalDistance = toDistance(shiftData?.pathData?.[0]?.totalDistance);

  let converedDistance = shiftData?.runsheetDetails?.hits?.reduce((acc, obj) => {
    const foundHit = shiftData?.pathData?.find(
      (hit) => hit?.hitId === obj?.hitId && obj?.isVisited,
    );

    return foundHit ? acc + foundHit?.distance?.value : acc;
  }, 0);

  const totalTime = shiftData?.pathData?.[0]?.totalDuration;
  let timeTravelled = shiftData?.runsheetDetails?.hits?.reduce((acc, obj) => {
    const foundHit = shiftData?.pathData?.find(
      (hit) => hit?.hitId === obj?.hitId && obj?.isVisited,
    );
    return foundHit ? acc + foundHit?.duration?.value : acc;
  }, 0);

  // Adding the last time duration and covered distance if the start end location is visited
  if (shiftData?.runsheetDetails?.startEndLocation?.isVisited) {
    const startEndLocationFromPathData = shiftData?.pathData?.[shiftData?.pathData?.length - 1];
    converedDistance += startEndLocationFromPathData?.distance?.value;
    timeTravelled += startEndLocationFromPathData?.duration?.value;
  }

  const finalTimeVal = `${convertRunSheetMinutesToHoursAndMinutes(timeTravelled) || `${0}s`} / ${convertRunSheetMinutesToHoursAndMinutes(totalTime) || `${0}s`}`;

  const breakRule = breakConfiguration(shiftData);

  const isPastRunsheet = getCurrentStandardTimeInIsoWrtTimezone() > shiftData?.endsAt;
  const disableAssignment = userHasPermission(ACL_OBX_SCHEDULES_UPDATE)
    ? isPastRunsheet ||
      [calendarShiftStatusEnum.IN_PROGRESS, calendarShiftStatusEnum.COMPLETED].includes(
        shiftData?.scheduleStatus,
      )
    : true;

  return (
    <Box>
      <Box className={classes.hitCardWrapper}>
        <Box className={classes.HitStats}>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {/* The tenant's word with the generic one behind it: this label's locale entry is
                  `{{hits}} Done`, so a tenant with no label set rendered a bare "Done" — and
                  the officer field below rendered *nothing at all*. A field with a value and
                  no label reads as a broken panel. */}
              {t('obx.schedules.dutyDetail.runsheetDetail.hitsDone', {
                hits: getLabel('terms', 'hits', t) || 'Hits',
              })}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {`${shiftData?.visitedHit ?? 0} / ${shiftData?.totalHits ?? 0}`}
              </Typography>
            )}
          </Box>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.runsheetDetail.officer', {
                officer: getLabel('roles', 'officer', t) || 'Officer',
              })}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {shiftData?.officer?.name ? (
                  <Box className={classes.nameAvatar}>
                    <Avatar alt={shiftData?.officer?.name} src={shiftData?.officer?.imageUrl} />

                    {shiftData?.officer?.name?.length > 12 ? (
                      <>
                        <Tooltip title={shiftData?.officer?.name} arrow>
                          {truncateString(shiftData?.officer?.name, 12) || NA}
                        </Tooltip>
                      </>
                    ) : (
                      <> {shiftData?.officer?.name}</>
                    )}
                    {!disableAssignment && !hideButtons && (
                      <EditIcon onClick={() => setIsAssign(ASSIGN_RUNSHEET_OPTIONS.OFFICER)} />
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Button
                      onClick={() => setIsAssign(ASSIGN_RUNSHEET_OPTIONS.OFFICER)}
                      // className={classes.assignButton}
                      className={`${classes.assignButton} ${disableAssignment ? classes.disable : ''}`}
                      disableRipple
                      startIcon={<UnassignedOfficerIcon />}
                      variant="onlyText"
                      disabled={disableAssignment}
                    >
                      {t('obx.schedules.dutyDetail.runsheetDetail.assign')}
                    </Button>
                  </Box>
                )}
              </Typography>
            )}
          </Box>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.runsheetDetail.vehicle')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {shiftData?.vehicle?.name ? (
                  <Box className={classes.nameAvatar}>
                    <Avatar alt="Cindy Baker" src={shiftData?.vehicle?.images?.[0]?.url} />

                    {shiftData?.vehicle?.name?.length > 12 ? (
                      <>
                        <Tooltip title={shiftData?.vehicle?.name} arrow>
                          {truncateString(shiftData?.vehicle?.name, 12) || NA}
                        </Tooltip>
                      </>
                    ) : (
                      <> {shiftData?.vehicle?.name}</>
                    )}
                    {!disableAssignment && !hideButtons && (
                      <EditIcon onClick={() => setIsAssign(ASSIGN_RUNSHEET_OPTIONS.VEHICLE)} />
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Button
                      onClick={() => setIsAssign(ASSIGN_RUNSHEET_OPTIONS.VEHICLE)}
                      // className={classes.assignButton}
                      className={`${classes.assignButton} ${disableAssignment ? classes.disable : ''}`}
                      disableRipple
                      startIcon={<AssignCarIcon />}
                      variant="onlyText"
                      disabled={disableAssignment}
                    >
                      {t('obx.schedules.dutyDetail.runsheetDetail.assign')}
                    </Button>
                  </Box>
                )}
              </Typography>
            )}
          </Box>
        </Box>
        <Box className={classes.HitStats}>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.runsheetDetail.spentTime')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {finalTimeVal}
              </Typography>
            )}
          </Box>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.runsheetDetail.coveredDistance')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {`${converedDistance ? toDistance(converedDistance) : 0} / ${totalDistance} `}
                {getDistanceShortUnit()}
              </Typography>
            )}
          </Box>
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.runsheetDetail.status')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : shiftData?.scheduleStatus ? (
              <ScheduleStatusChips scheduleStatus={shiftData?.scheduleStatus} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {t('commonText.nA')}
              </Typography>
            )}
          </Box>
          {/* Its own row in the design rather than a fourth column, which the three-track
              grid gives it for free — it is the only money on the panel and reads as a
              different kind of fact from the five above it. */}
          <Box className={classes.hitItem}>
            <Typography variant="body3" className={classes.hitItemTitle}>
              {t('obx.schedules.dutyDetail.detail.payRateOverride')}
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" className={classes.fieldSkelton} />
            ) : (
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {shiftPayRateOverride(shiftData)}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      {/* **Closed by default, and it stays closed.** A break rule is a policy the runsheet
          inherits — it is read when something has gone wrong with a clock-out, not while
          reading the round — so it earns a line, not a section. The panel above it is the
          six facts a dispatcher opens this drawer for. */}
      <Accordion disableGutters elevation={0} square className={classes.breakAccordion}>
        <AccordionSummary
          expandIcon={<KeyboardArrowDownIcon className={classes.breakChevron} />}
          className={classes.breakSummary}
        >
          <Typography variant="h5" className={classes.breakTitle}>
            {t('obx.runsheet.breakConfigurations')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.breakDetails}>
          <Typography variant="subtitle2" className={classes.breakRuleName}>
            {breakRule.name}
          </Typography>
          {breakRule.rows.map((row) => (
            <Box key={row.label} className={classes.breakRow}>
              <Typography variant="body3" className={classes.hitItemTitle}>
                {row.label}
              </Typography>
              <Typography variant="body3" className={classes.hitItemSubTitle}>
                {row.value}
              </Typography>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
      <Box className={classes.shiftProgressWrapper}>
        {[
          calendarShiftStatusEnum.NOT_STARTED,
          calendarShiftStatusEnum.IN_PROGRESS,
          calendarShiftStatusEnum.COMPLETED,
        ].includes(shiftData?.scheduleStatus) && (
          <ShiftVisitsStatus
            {...{
              completedTours: shiftData?.visitedHit,
              status: shiftData?.scheduleStatus,
              totalTours: shiftData?.totalHits,
              isVisit: true,
            }}
          />
        )}
      </Box>
      <RunsheetMap
        runsheetDetails={runsheetDetails}
        visitedPoints={visitedPoints}
        finalVisitSet={finalVisitSet}
      />
      {autoShiftToggle !== null && (
        <Box className={classes.autoCheckout}>
          <Box className={classes.autoLeft}>
            <CheckoutShiftIcon />
            <Typography variant="h5">{t('obx.schedules.autoClockoutShift')}</Typography>
          </Box>
          <Box className={classes.autoRight}>
            <Switch
              /* Green, like every other accent on this panel — see `panelAccent`. Inline
                 rather than a class because MUI's switch is three nested elements and the
                 checked state lives on the inner one; a `makeStyles` class here would have to
                 restate the same two selectors anyway. */
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: PANEL_ACCENT_LIGHT },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: PANEL_ACCENT_LIGHT,
                },
              }}
              checked={!autoShiftToggle}
              onChange={toggleAutoShift}
              disabled={
                getCurrentStandardTimeInIsoWrtTimezone() >= shiftData?.endsAt ||
                [ShiftStatus.SHIFT_ENDED, ShiftStatus.SHIFT_AUTO_ENDED].includes(shiftData)
                  ?.shiftStatus
              }
            />
          </Box>
        </Box>
      )}
      <RunsheetSites
        runsheetDetails={runsheetDetails}
        shiftDetails={shiftData}
        visitedPoints={visitedPoints}
        isRunsheetLoading={loading}
      />
    </Box>
  );
};

export default RunsheetDetail;

const RunsheetMap = ({ runsheetDetails, visitedPoints, finalVisitSet }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  // Without a Maps key the embed renders a tall grey panel with a Google error
  // dialog over it, and the legend below then explains symbols nobody can see.
  // Drop the whole block instead of shipping dead space.
  const hasMapsKey = Boolean(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
  if (!hasMapsKey) return null;

  return (
    <Box>
      <Box className={classes.mapWrapper}>
        <DirectionsMap
          waypoints={finalVisitSet || []}
          origin={runsheetDetails?.startEndLocation || {}}
          destination={runsheetDetails?.startEndLocation || {}}
          showPolyineAndMarkersSeparately={true}
          center={runsheetDetails?.startEndLocation?.position || {}}
          pathData={runsheetDetails?.pathData || []}
          onlyShowPolyline={true}
          showVisitedPoints={true}
          visitedPoints={visitedPoints}
        />
      </Box>
      <Box className={classes.bottomArea}>
        <Button disableRipple startIcon={<CoveredRunsheetHit />} variant="onlyText">
          {t('obx.runsheet.covered')}
        </Button>
        <Button disableRipple startIcon={<RunsheetIcon />} variant="onlyText">
          {getLabel('terms', 'runsheet', t)}
        </Button>
        <Button disableRipple startIcon={<ExistingHitIcon />} variant="onlyText">
          {t('obx.runsheet.unvisitedHit', { hit: getLabel('terms', 'hit', t) })}
        </Button>
        <Button disableRipple startIcon={<AddedHitIcon />} variant="onlyText">
          {t('obx.runsheet.visitedHit', { hit: getLabel('terms', 'hit', t) })}
        </Button>
        <Button disableRipple startIcon={<StartingPointIcon />} variant="onlyText">
          {t('obx.runsheet.startingEndingPoint')}
        </Button>
        <Button disableRipple startIcon={<RunsheetVehicle />} variant="onlyText">
          {t('obx.runsheet.vehicle')}
        </Button>
        <Button disableRipple startIcon={<FranchiseIcon />} variant="onlyText">
          {t('obx.runsheet.franchise')}
        </Button>
      </Box>
    </Box>
  );
};

const RunsheetSites = ({
  runsheetDetails,
  visitedPoints,
  isRunsheetLoading,
  shiftDetails = {},
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Box>
      {isRunsheetLoading ? (
        <Box className={classes.loaderBox}>
          <Skeleton variant="rectangular" />
          <Skeleton variant="rectangular" />
          <Skeleton variant="rectangular" />
        </Box>
      ) : (
        <Box>
          {(runsheetDetails?.startEndLocation?.address ||
            runsheetDetails?.startEndLocation?.name) && (
            <Box>
              <InputLabel htmlFor="runsheetName">
                {t('obx.runsheet.startingEndingLocation')}
              </InputLabel>

              <Box component="span" className={classes.editButtonInner}>
                <img
                  src={runsheetDetails?.startEndLocation?.siteImage || LocationPlaceHolder}
                  alt=""
                />{' '}
                {runsheetDetails?.startEndLocation?.address ||
                  runsheetDetails?.startEndLocation?.name}
              </Box>
            </Box>
          )}
          <HitsAccordionListing
            showOrder={true}
            showMissedHits={true}
            shiftDetails={shiftDetails}
            state={runsheetDetails}
            hitsList={runsheetDetails?.hits}
            visitedPoints={visitedPoints}
            showVisitedPoints={true}
          />
        </Box>
      )}
    </Box>
  );
};

RunsheetDetail.propTypes = {
  shiftData: PropTypes.object,
  setIsAssign: PropTypes.func,
  loading: PropTypes.bool,
  hideButtons: PropTypes.bool,
  shiftId: PropTypes.string,
  shiftActivityLogId: PropTypes.string,
  callbackUponAssignment: PropTypes.func,
};

RunsheetMap.propTypes = {
  runsheetDetails: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.object,
    startDate: PropTypes.object,
    endsAt: PropTypes.object, // Ensure this line is present
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
    visitSet: PropTypes.array,
    pathData: PropTypes.array,
    hits: PropTypes.array,
  }),
  visitedPoints: PropTypes.array,
  finalVisitSet: PropTypes.array,
};

RunsheetSites.propTypes = {
  runsheetDetails: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.object,
    startDate: PropTypes.object,
    endsAt: PropTypes.object, // Ensure this line is present
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
    visitSet: PropTypes.array,
    pathData: PropTypes.array,
    hits: PropTypes.array,
  }),
  shiftDetails: PropTypes.object,
  visitedPoints: PropTypes.array,
  isRunsheetLoading: PropTypes.bool,
};
