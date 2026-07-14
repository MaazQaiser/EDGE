import { Box, Button } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import LoaderComponent from 'src/app/components/common/loader';
import { ACL_OBX_DISPATCH_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { OBX_DISPATCH } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import DedicatedOfficer from 'src/assets/images/dedicated-officer.png';
import DedicatedOfficerSelected from 'src/assets/images/dedicated-officer-selected.png';
import SiteDispatchIcon from 'src/assets/images/site-dispatch.png';
import { useApiControllers } from 'src/helper/axios';
import { decode, generateUniqueId } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import {
  assignDispatch,
  assignDispatchSupervisor,
  getShiftAssignmentJobs,
  getShiftAssignmentJobsFilters,
} from 'src/services/dispatch.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { dayjsWithStandardOffset } from '../../schedules/helper';
import DispatchDirectionsMap from '../components/dispatchMap';
import { SHIFT_TIME_OPTIONS, STATUS_FILTER_DATA_DISPATCH } from '../dispatch.constant';
import { stateToQueryParams } from '../helper';
import { useStyles } from './assignDispatch';
import AssignDispactchTabs from './components/assignDispactchTabs';
import OfficerPopup from './components/officerPopup';
import RunSheetPopup from './components/runSheetPopup';
// import SupervisorList from './components/supervisorList';

const DEFAULT_PARAMS = (t) => ({
  windowEnd: dayjsWithStandardOffset(dayjs()).toISOString(),
  windowStart: dayjsWithStandardOffset(dayjs().subtract(4, 'hour')).toISOString(),
  officerIds: [],
  shiftType: 0,
  minutes: { ...SHIFT_TIME_OPTIONS(t)?.[0] },
  status: [{ ...STATUS_FILTER_DATA_DISPATCH(t)?.[1] }, { ...STATUS_FILTER_DATA_DISPATCH(t)?.[5] }],
});

const SHIFT_TYPE_MAP = ['', 'dedicated', 'patrol'];

const filterQueryParams = (obj) => {
  const transformed = {};
  for (const key in obj) {
    if (key === 'shiftType') {
      transformed[key] = SHIFT_TYPE_MAP[obj[key]];
    } else if (key === 'status') {
      transformed[key] = obj['status']?.[0]?.value === 'all' ? [] : stateToQueryParams(obj, key);
    } else if (key === 'minutes') {
      transformed[key] = obj['minutes']?.value ? obj['minutes']?.value : 60;
    } else {
      transformed[key] = stateToQueryParams(obj, key);
    }
  }
  return transformed;
};

const convertLocation = (location) => {
  if (!location) return null;
  return { lat: parseFloat(location?.lat), lng: parseFloat(location?.lng) };
};

export default function AssignDispatch() {
  const { getNewApiController } = useApiControllers();
  const { getLabel } = useTenantLabel();
  const { t } = useTranslation();
  const classes = useStyles();
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search);
  const siteId = searchParams.get('siteId');
  const officerId = searchParams.get('officerId');
  const franchiseId = searchParams.get('franchiseId');
  const sameAsSiteAddress = searchParams.get('sameAsSiteAddress');

  const [data, setData] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [alreadySelectedJob, setAlreadySelectedJob] = useState(null);
  const [officers, setOfficers] = useState([]);

  const [queryParams, setQueryParams] = useState({ ...DEFAULT_PARAMS(t), siteId });

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const handleAssign = async () => {
    try {
      setLoading(true);
      let config = {};
      if (franchiseId) {
        config = {
          headers: {
            franchise_id: franchiseId,
          },
        };
      }
      let response;
      if (selectedJob?.type === 'patrolSupervisors') {
        const payload = {
          siteId: Number(siteId),
          officerId: Number(selectedJob?.id),
          dispatchId: Number(params.id),
          sameAsSiteAddress,
        };

        response = await assignDispatchSupervisor(payload, config);
      } else {
        const payload = {
          ...selectedJob,
          dispatchId: Number(params.id),
          sameAsSiteAddress,
        };
        response = await assignDispatch(payload, config);
      }
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        history.push(OBX_DISPATCH);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    history.goBack();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setQueryParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleJobChange = (job) => setSelectedJob(job);
  const handleTabChange = (tab) =>
    setQueryParams((prev) => ({
      ...prev,
      shiftType: tab,
      officerIds: [],
      minutes: {},
      status: [],
    }));

  const fetchShiftAssignmentJobs = async (payload, apiController) => {
    try {
      setSelectedJob(null);
      setDataLoading(true);
      let config = {};
      if (franchiseId) {
        config = {
          headers: {
            franchise_id: franchiseId,
          },
          signal: apiController.signal,
        };
      }
      const result = await getShiftAssignmentJobs(payload, config);
      const uniqueJobs = {
        ...result?.data,
        dedicatedJobs: result?.data?.dedicatedJobs.map((job) => ({
          ...job,
          uniqueId: generateUniqueId(),
        })),
        patrolJobs: result?.data?.patrolJobs.map((job) => ({
          ...job,
          uniqueId: generateUniqueId(),
        })),
        patrolSupervisors: result?.data?.patrolSupervisors.map((job) => ({
          ...job,
          uniqueId: generateUniqueId(),
          type: 'patrolSupervisors',
        })),
      };
      setDataLoading(false);
      setData(uniqueJobs);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setSelectedJob(null);
        setData({
          dedicatedJobs: [],
          patrolJobs: [],
          patrolSupervisors: [],
        });
        console.error(error);
        setDataLoading(false);
      }
    }
  };

  const fetchShiftAssignmentJobsFilters = async (payload, apiController) => {
    try {
      const filtersParam = { ...payload };
      delete filtersParam.officerIds;
      let config = {};
      if (franchiseId) {
        config = {
          headers: {
            franchise_id: franchiseId,
          },
          signal: apiController.signal,
        };
      }
      const result = await getShiftAssignmentJobsFilters(filtersParam, config);
      setOfficers(result?.data?.officers || []);
    } catch (error) {
      if (!apiController.signal.aborted) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const payload = filterQueryParams({
      ...queryParams,
      siteId,
      dispatchId: Number(params.id),
      sameAsSiteAddress,
    });
    const apiController = getNewApiController();

    Promise.all([
      fetchShiftAssignmentJobs(payload, apiController),
      fetchShiftAssignmentJobsFilters(payload, apiController),
    ])
      .then((_result) => {})
      .catch((error) => {
        if (!apiController.signal.aborted) {
          console.error(error);
        }
      });
  }, [queryParams]);

  useEffect(() => {
    if (!alreadySelectedJob && data) {
      let jobResult = data?.dedicatedJobs?.find((job) => job?.officer?.id == officerId);
      jobResult = jobResult || data?.patrolJobs?.find((job) => job?.officer?.id == officerId);
      jobResult && setSelectedJob(jobResult);
      jobResult && setAlreadySelectedJob(jobResult);
    }
  }, [officerId, data]);

  const polygons = useMemo(
    () =>
      data?.patrolJobs?.map((job) => ({
        data: job,
        position: job?.pathData?.[0]?.start_location,
        lines: job?.pathData?.map((path) => ({ ...path, mapPath: decode(path?.mapPath) })) || [],
      })),
    [data?.patrolJobs],
  );

  const markers = useMemo(() => {
    const markers = [
      {
        position: null,
        icon: SiteDispatchIcon,
      },
    ];
    data?.dedicatedJobs?.forEach((job) =>
      markers.push({
        position: convertLocation(job?.location),
        icon: DedicatedOfficer,
        selectedIcon: DedicatedOfficerSelected,
        data: job,
      }),
    );
    return markers;
  }, [data?.dedicatedJobs]);

  const center = useMemo(
    () =>
      convertLocation(selectedJob?.location) ||
      convertLocation(selectedJob?.pathData?.[0]?.start_location),
    [selectedJob],
  );

  // const showSupervisorList = useMemo(
  //   () => !data?.dedicatedJobs?.length && !data?.patrolJobs?.length && !queryParams.shiftType,
  //   [data],
  // );

  return (
    <Box className={classes.assignDispatchWrap}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.assignDispatchLeft}>
        <AssignDispactchTabs
          jobs={data}
          officers={officers}
          selectedOfficers={queryParams?.officerIds}
          minutes={queryParams?.minutes}
          queryParams={queryParams}
          selectedJob={selectedJob}
          selectedTab={queryParams.shiftType}
          loading={dataLoading}
          // showSupervisorList={showSupervisorList}
          handleOfficerChange={handleChange}
          handleShiftChange={handleChange}
          handleJobChange={handleJobChange}
          handleTabChange={handleTabChange}
        />
        {/* {showSupervisorList && (
          <SupervisorList
            supervisors={data?.patrolSupervisors || []}
            selectedSupervisor={selectedJob}
            loading={dataLoading}
            handleSupervisorChange={handleJobChange}
          />
        )} */}

        <Box className={classes.bottomButtons}>
          <Button variant="secondaryGrey" disableRipple disabled={loading} onClick={handleCancel}>
            {t('obx.dispatch.cancel')}
          </Button>
          <RenderIfHasPermission name={ACL_OBX_DISPATCH_UPDATE}>
            <Button
              variant="primary"
              disableRipple
              disabled={loading || !selectedJob}
              onClick={handleAssign}
            >
              {t('obx.dispatch.assignDispatch', { dispatch: getLabel('terms', 'dispatch', t) })}
            </Button>
          </RenderIfHasPermission>
        </Box>
      </Box>
      <Box className={classes.assignDispatchRight}>
        <DispatchDirectionsMap
          containerClassName="dispatch-map"
          center={center}
          polygons={polygons}
          markers={markers}
          selectedUniqueId={selectedJob?.uniqueId}
          markerInfoWindow={OfficerPopup}
          polygonInfoWindow={RunSheetPopup}
        />
      </Box>
    </Box>
  );
}
