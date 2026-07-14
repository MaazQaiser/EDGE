import { Box, Typography } from '@mui/material';
import { ReactComponent as LiveDotIcon } from 'assets/svg/liveDot.svg?react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import CommonSignalMap from 'src/app/components/common/signalMap';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { getSites } from 'src/services/invoice.services';
import { getOfficersDropDown } from 'src/services/reports.services';
import {
  getLiveTrackingVisitors,
  getOfficerShiftDetailsAPI,
  getPatrolOfficerLiveTrackingData,
} from 'src/services/scout.service';
import { fetchSettingsPreferences } from 'src/services/settings.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { LIVE_TRACKING_JOBS_DATA, TourShiftStatusEnum } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import { findTourShiftStatus } from '../schedules/shiftDetail';
import { useStyles } from './franchiseMap';
export const sitesPaginationEmptyState = {
  currentPage: 0,
  nextPage: 1,
  prevPage: 0,
  totalPages: 0,
  totalCount: 0,
};

// If live tracking is enabled, the time interval will be of 10seconds, otherwise, 5minutes
const timerValues = {
  // Live Tracking is enabled
  true: 10000,

  // Live Tracking is disabled
  false: 300000,
};

export default function FranchiseMap() {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const services = useSelector((state) => state.auth.tenantInfo?.services || {});
  const [sites, setSites] = useState([]);
  const [allOfficers, setAllOfficers] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [officerDetails, setOfficerDetails] = useState(null);
  const [officerLoading, setOfficerLoading] = useState(false);
  const classes = useStyles();
  const [isLiveTrackingEnabled, setLiveTrackingEnabled] = useState(null);
  const hasShownNoOfficerToastRef = useRef(false);
  const [formData, setFormData] = useState({
    sites: [],
    job: {},
    officers: [],
  });

  const { getNewApiController } = useApiControllers();
  const franchiseCenter = useSelector((state) => {
    const franchiseInfo = state?.auth?.franchiseInfo;
    return { lat: parseFloat(franchiseInfo?.lat), lng: parseFloat(franchiseInfo?.lng) };
  });

  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    updateFormHandler(name, value);
  };

  const fetchAllOfficers = async () => {
    try {
      const response = await getOfficersDropDown();
      if (response?.data?.statusCode === 200) {
        const transformedUsers = transformArrayForOptions(response?.data?.users, 'name', 'id');
        setAllOfficers([
          {
            value: 'all',
            label: t('obx.schedules.filters.officers.label', {
              officers: getLabel('terms', 'officers', t),
            }),
            image: 'someDefaultImageString',
          },
          ...transformedUsers,
        ]);
      }
    } catch (error) {
      //error handling
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchSites = async () => {
    try {
      const response = await getSites();
      if (response && response?.statusCode === 200) {
        setSites(response?.data?.sites || []);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getVisitorsForTracking = async () => {
    const apiController = getNewApiController();
    try {
      const queryParams = {
        siteId: formData?.sites?.map((site) => site?.id),
        jobType: formData?.job?.value,
        officerId: formData?.officers?.map((officer) => officer?.id),
        random: Math.random(),
      };
      let response = await getLiveTrackingVisitors(queryParams, {
        signal: apiController.signal,
      });
      if (response && response?.statusCode === 200) {
        setVisitors(response?.data);

        // Showing the toast only if the initial visitors are not loaded
        if (!hasShownNoOfficerToastRef.current && response?.data?.length === 0)
          toaster.error({
            text: t('obx.franchiseMap.noOfficersFound'),
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });

        // Making this flag true to avoid showing the toast again
        hasShownNoOfficerToastRef.current = true;
      }
    } catch (e) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: e.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const getOfficerShiftDetails = async (shiftId, visitor) => {
    try {
      setOfficerLoading(true);
      const data =
        visitor?.jobType === 'patrol'
          ? await getPatrolOfficerLiveTrackingData(shiftId)
          : await getOfficerShiftDetailsAPI(shiftId);
      const shiftType = visitor?.jobType === 'patrol' ? 'patrol' : 'dedicated';
      const status = data?.data?.shift
        ? findTourShiftStatus({
            tours: data?.data?.shift?.tours,
            shiftStatus: data?.data?.shift?.shiftStatus,
            endsAt: data?.data?.shift?.endsAt,
            totalTours: data?.data?.shift?.totalTours,
          })
        : TourShiftStatusEnum.IN_PROGRESS;
      setOfficerDetails({
        ...(data?.data?.shift || data?.data),
        customShiftStatusKey: status,
        customShiftType: shiftType,
      });
      setOfficerLoading(false);
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setOfficerLoading(false);
    }
  };

  const getLiveTrackingPreference = async () => {
    try {
      const response = await fetchSettingsPreferences();
      if (response && response?.statusCode === 200) {
        setLiveTrackingEnabled(response?.data?.preferences?.liveTracking?.[0]?.active);
      }
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  // Fetch static data only once
  useEffect(() => {
    fetchAllOfficers();
    fetchSites();
    getLiveTrackingPreference();
  }, []);

  // Reset the initial visitors loaded flag when the form data changes
  useEffect(() => {
    hasShownNoOfficerToastRef.current = false;
  }, [formData]);

  // Fetch visitors immediately on first load and on filter changes
  useEffect(() => {
    getVisitorsForTracking();
  }, [formData]);

  // Poll visitors based on live tracking preference
  useEffect(() => {
    if (isLiveTrackingEnabled === null) return undefined;

    const interval = setInterval(
      getVisitorsForTracking,
      timerValues[isLiveTrackingEnabled ?? false],
    );

    return () => clearInterval(interval);
  }, [formData, isLiveTrackingEnabled]);

  const allSitesOptions = [
    { value: 'all', label: t('obx.franchiseMap.allSites') },
    ...transformArrayForOptions(sites, 'name', 'id'),
  ];

  const memorizedFranchiseData = useMemo(() => ({ sites }), [sites]);

  return (
    <>
      <Box className={classes.mainMapSectionWrapper}>
        <Box className={classes.filtersBar}>
          <Box className={classes.filtersBarLeft}>
            <CustomDropDown
              label={`${t('obx.franchiseMap.allSites')}`}
              name="sites"
              checkmark
              searchPlaceholder={t('obx.franchiseMap.searchSites')}
              options={allSitesOptions || []}
              selectedValues={formData?.sites || []}
              handleChange={inputChangedHandler}
              multiSelect={true}
              searchable={true}
              clearAll
            />

            <CustomDropDown
              name="job"
              label={t('obx.franchiseMap.allJobs')}
              selectedValues={formData?.job || {}}
              options={LIVE_TRACKING_JOBS_DATA(t, getLabel, services) || []}
              handleChange={inputChangedHandler}
            />

            <CustomDropDown
              label={t('obx.franchiseMap.allOfficers', {
                officers: getLabel('terms', 'officers', t),
              })}
              name="officers"
              searchable
              options={allOfficers}
              selectedValues={formData?.officers || []}
              handleChange={inputChangedHandler}
              searchPlaceholder={t('obx.franchiseMap.searchOfficer', {
                officer: getLabel('terms', 'officer', t)?.toLowerCase(),
              })}
              checkmark={true}
              multiSelect={true}
              clearAll={true}
            />
          </Box>
          <Box className={classes.liveButtonWrapper}>
            {isLiveTrackingEnabled && (
              <>
                <Box className={classes.liveDotWrap}>
                  <Box className={classes.liveDotPulse} />
                  <LiveDotIcon />
                </Box>
                <Typography className={classes.liveButton} variant="subtitle3">
                  {t('obx.franchiseMap.live')}
                </Typography>
              </>
            )}
          </Box>
        </Box>
        <Box className={classes.mapArea}>
          <CommonSignalMap
            mapCenter={franchiseCenter}
            franchiseData={memorizedFranchiseData}
            createOrUpdate={false}
            setOfficerDetails={setOfficerDetails}
            // externalCenter={focusPoint}
            visitors={visitors}
            officerDetails={officerDetails}
            getOfficerShiftDetails={getOfficerShiftDetails}
            officerLoading={officerLoading}
          />
          {/* {loading && <Skeleton variant="rect" width={'100vw'} height={'100vh'} />} */}
        </Box>
      </Box>
    </>
  );
}
