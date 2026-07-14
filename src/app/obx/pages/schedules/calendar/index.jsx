import { ExpandMore } from '@mui/icons-material';
import { Box, Chip, Skeleton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { allDutyData, allMonthDutyData, getMissedHitsCount } from 'services/duty.services';
import CustomDropDown from 'src/app/components/common/customDropDown';
import SearchComponent from 'src/app/components/common/search';
import StyledMenuButton from 'src/app/components/common/styledMenuButton';
import { siteStatusEnum } from 'src/app/homeOffice/pages/franchise/utils/enums';
import { ACL_OBX_SITE_EXTRA_JOB_CREATE } from 'src/app/router/constant/OBXMODULE';
import {
  HO_SITES_DETAIL,
  OBX_SCHEDULES_CREATE_EXTRA_DUTY,
  OBX_SITES,
  OBX_SITES_CREATE_EXTRA_DUTY,
  OBX_USER,
  OBX_USERS_CREATE_EXTRA_DUTY,
} from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { AddIcon, AlertIcon } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { getAllSites, getSitesAllLocations } from 'src/services/sites.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import {
  DAY_GRID,
  DEFAULT_CALENDER_VIEW,
  DRAWER_TYPE,
  DUTIES_FILTER_DATA,
  SCHEDULE_DUTIES,
  STATUS_FILTER_DATA,
  TIME_GRID,
} from 'src/utils/constants/schedules';
import { throwAPIError } from 'src/utils/throwAPIError';
import { toaster } from 'src/utils/toast';

import Calendar from '../../../../components/common/calendar';
import AssignmentSideDrawer from '../../sites/detail/components/jobs/assignmentSideDrawer';
import {
  dayjsWithStandardOffset,
  getCurrentTimeWithDisabledDlsInIso,
  getFranchiseIdWithRoleAndSource,
  getOffsetWithStandardTime,
  getTimezone,
  isShiftScheduleFullyCancelled,
} from '../helper';
import ShiftDetail from '../shiftDetail';
import DedicatedSplitShift from '../shiftDetail/components/dedicatedSplitShift/index';
import { useStyles } from './scheduleCalendar.styles';

const params = {
  search: '',
  allSites: [],
  siteLocations: [],
  filter: {
    selectedSites: [],
    selectedDutyType: {},
    selectedStatus: {},
    selectedLocations: { label: 'All Locations', value: '' },
  },
  selectedView: {
    type: DEFAULT_CALENDER_VIEW,
    windowStart: '',
    windowEnd: '',
  },
};

const ScheduleCalendar = (props) => {
  const [allDuties, setAllDuties] = useState();
  const [listDuties, setListDuties] = useState();
  const [dayViewDuties, setDayViewDuties] = useState();
  const [dayViewLocations, setDayViewLocations] = useState([]);
  const [weekViewLocations, setWeekViewLocations] = useState([]);
  const [showDrawer, setShowDrawer] = useState({
    open: '',
    data: {},
    activeIndex: 0,
  });
  const [queryParams, setQueryParams] = useState(params);
  const [loading, setLoading] = useState(false);
  const [dedicatedSplitShiftData, setDedicatedSplitShiftData] = useState(null);
  const classes = useStyles();
  const location = useLocation();
  const { id: paramId = '' } = useParams();

  const isSitesModule =
    location.pathname?.includes(OBX_SITES) || location.pathname?.includes(HO_SITES_DETAIL);
  const isUsersModule = location.pathname?.includes(OBX_USER);
  const [requireAttentionJobs, setRequireAttentionJobs] = useState(null);
  const [missedHitsCount, setMissedHitsCount] = useState(null);

  const _franchiseIdWithRoleAndSource = getFranchiseIdWithRoleAndSource();

  const _franchiseTimeZoneFromUrl = getTimezone();

  const { getNewApiController } = useApiControllers();

  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const services = useSelector((state) => state.auth.tenantInfo?.services || {});

  const showSideDrawer = (value) => (data) => {
    setShowDrawer({ open: value, data: value ? data : null });
  };
  const changeOnlyDrawerType = (value) => () => {
    setShowDrawer((prev) => ({ open: value, data: value ? prev?.data : null }));
  };
  const refetchScheduleData = () => getAllDutiesData(queryParams.filter, queryParams.selectedView);
  const handleOpenDedicatedSplitShift = (shiftDetail) => {
    if (!shiftDetail) return;
    if (isShiftScheduleFullyCancelled(shiftDetail)) {
      toaster.info({
        text: t('obx.schedules.assignDedicatedDuty.assignShift.shiftScheduleCancelled'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }
    setDedicatedSplitShiftData(shiftDetail);
    showSideDrawer('')();
  };

  const handleSelectFilter = (event, key) => {
    setQueryParams((prev) => ({
      ...prev,
      filter: {
        ...prev.filter,
        [key]: event.target.value,
      },
    }));
  };

  const dutyNameMonth = {
    [SCHEDULE_DUTIES.DEDICATED]: t('obx.schedules.legends.dedicated', {
      dedicated: getLabel('terms', 'dedicated', t),
    }),
    [SCHEDULE_DUTIES.PATROL]: t('obx.schedules.legends.patrol', {
      patrol: getLabel('terms', 'patrol', t),
    }),
    [SCHEDULE_DUTIES.EXTRA]: t('obx.schedules.legends.extra', {
      extra: getLabel('terms', 'extra', t),
    }),
    [SCHEDULE_DUTIES.DISPATCH]: t('obx.schedules.legends.dispatch', {
      dispatch: getLabel('terms', 'dispatch', t),
    }),
    [SCHEDULE_DUTIES.HIT]: t('obx.schedules.legends.patrol', {
      patrol: getLabel('terms', 'patrol', t),
    }),
  };

  const getDutiesByMonth = async (query, config) => {
    const response = await allMonthDutyData(query, config);

    const shiftsRes = response?.data?.shifts || [];

    const shifts = shiftsRes?.flatMap((shiftRes) => {
      const shift = Object.values(shiftRes).reduce((acc, current) => {
        const count = (current?.assignedCount || 0) + (current?.unassignedCount || 0);
        if (!current?.type || !count) return acc;

        acc = [
          ...acc,
          {
            date: shiftRes?.date,
            name: `${count}x ${dutyNameMonth[current?.type]}`,
            requiresAttention: current?.requiresAttention,
            shiftType: current?.type,
            unassignedCount: current?.unassignedCount,
            assignedCount: current?.assignedCount,
          },
        ];

        return acc;
      }, []);

      return shift;
    }, []);

    setRequireAttentionJobs(response?.data?.unassignedCount || 0);
    return shifts;
  };

  const getAllDuties = async (query, config) => {
    try {
      query.windowStart = getCurrentTimeWithDisabledDlsInIso(query?.windowStart);
      query.windowEnd = getCurrentTimeWithDisabledDlsInIso(query?.windowEnd);

      const response = await allDutyData(query, config);

      if (response?.statusCode === 200) {
        const data = response?.data;
        setRequireAttentionJobs(response?.data?.unassignedCount || 0);
        return data || [];
      }

      return [];
    } catch (error) {
      throwAPIError(error);
    }
  };

  const getAllListDuties = async (query, config) => {
    query.list = true;

    let shifts = [];
    let listShifts = {};

    const shiftsRes = (await getAllDuties(query, config))?.shifts;
    shiftsRes.forEach((shift) => {
      shifts.push({
        ...shift,
        start: dayjsWithStandardOffset(shift?.startsAt).format('YYYY-MM-DD'),
        end: shift?.endsAt,
      });

      const date = dayjsWithStandardOffset(shift?.startsAt).date();
      listShifts[date] = [
        ...(listShifts[date] || []),
        {
          ...shift,
          start: shift?.startsAt,
          end: shift?.endsAt,
          name: shift?.name,
        },
      ];
    });

    return { shifts, listShifts };
  };

  const getAllDutiesData = async (filter, selectedView, search) => {
    const apiController = getNewApiController();

    try {
      setLoading(true);
      setListDuties([]);
      setAllDuties([]);
      setDayViewDuties({});
      setWeekViewLocations([]);
      setRequireAttentionJobs(null);

      if ((isSitesModule && !props.selectedSite?.id) || (isUsersModule && !props.officerId)) {
        setLoading(false);
        setListDuties([]);
        setDayViewDuties({});
        setDayViewLocations([]);
        setWeekViewLocations([]);
        setAllDuties([]);
        setRequireAttentionJobs(0);

        return;
      }

      const { type, windowStart, windowEnd } = selectedView;

      const siteIds = isSitesModule
        ? [props.selectedSite?.id]
        : filter.selectedSites?.map((site) => site?.id);
      const shiftType = filter?.selectedDutyType?.value;
      const shiftStatus = filter?.selectedStatus?.value;
      const locationId = filter?.selectedLocations?.value;
      const query = {
        windowStart: windowStart,
        windowEnd: windowEnd,
        shiftType,
        shiftStatus,
        search,
        siteId: siteIds,
        officerId: props.officerId,
        isSite: isSitesModule,
        locationId,
      };

      let shifts = [];
      let listShifts = undefined;
      let dayViewShifts = {};
      let weekViewLocations = [];

      const config = { signal: apiController.signal };
      if (type == DAY_GRID.MONTH) {
        query.offset = getOffsetWithStandardTime();
        shifts = await getDutiesByMonth(query, config);
      } else if (type == TIME_GRID.LIST) {
        const res = await getAllListDuties(query, config);
        shifts = res.shifts;
        listShifts = res.listShifts || {};
      } else if (type == DAY_GRID.DAY) {
        shifts = [];
        query.isDayView = true;
        const dayViewData = await getAllDuties(query, config);
        dayViewShifts = dayViewData?.shifts;
        setDayViewLocations(dayViewData?.locations || []);
      } else if (type == DAY_GRID.WEEK) {
        const res = await getAllDuties(query, config);
        shifts = res?.shifts || [];
        shifts = shifts?.map((shift) => ({
          ...shift,
          startsAt: shift?.startsAt,
          start: dayjsWithStandardOffset(shift?.start).format('YYYY-MM-DD'),
          endsAt: shift?.endsAt,
        }));
        weekViewLocations = res?.locations || [];
      }

      setListDuties(listShifts);
      setDayViewDuties(dayViewShifts);
      setWeekViewLocations(weekViewLocations);
      setAllDuties(shifts);
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setListDuties([]);
        setDayViewDuties({});
        setDayViewLocations([]);
        setWeekViewLocations([]);
        setAllDuties([]);
        setRequireAttentionJobs(0);
        setLoading(false);
      }
    }
  };

  const getMissedHitsCountFunc = async ({ start, end }) => {
    try {
      setMissedHitsCount(undefined);

      const startsAt = getCurrentTimeWithDisabledDlsInIso(start);
      const endsAt = getCurrentTimeWithDisabledDlsInIso(end);
      const response = await getMissedHitsCount({
        startsAt: startsAt,
        endsAt: endsAt,
      });

      setMissedHitsCount(response?.data?.missedHitsCount || 0);
    } catch (error) {
      setMissedHitsCount(null);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  // fetch missed hits count
  useEffect(() => {
    if (isSitesModule || isUsersModule) return;
    if (queryParams.selectedView.windowStart && queryParams.selectedView.windowEnd) {
      getMissedHitsCountFunc({
        start: queryParams.selectedView?.windowStart,
        end: queryParams.selectedView?.windowEnd,
      });
    }
  }, [queryParams.selectedView?.windowStart, queryParams.selectedView?.windowEnd]);

  const onSearch = (e) => {
    setQueryParams((prev) => ({
      ...prev,
      search: e.target.value,
    }));

    getAllDutiesData(queryParams.filter, queryParams.selectedView, e.target.value);
  };
  useEffect(() => {
    if (queryParams.selectedView.windowStart && queryParams.selectedView.windowEnd) {
      getAllDutiesData(queryParams.filter, queryParams.selectedView);
    } else {
      setListDuties([]);
      setDayViewDuties({});
      setDayViewLocations([]);
      setWeekViewLocations([]);
      setAllDuties([]);
    }
  }, [queryParams.filter, queryParams.selectedView, props.selectedSite?.id, props.officerId]);

  const getSitesList = async () => {
    try {
      let response;
      // if (officerId) {
      //   response = await getAllSitesByOfficerId(officerId);
      // } else {
      response = await getAllSites({});
      // }

      const sitesList = response?.data?.sites || [];
      setQueryParams((prev) => ({
        ...prev,
        allSites: [...sitesList],
      }));
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      setQueryParams((prev) => ({
        ...prev,
        allSites: [],
        filter: {
          ...prev.filter,
          selectedSites: [],
        },
      }));
    }
  };

  const getLocationsOfSite = async (siteId) => {
    try {
      const response = await getSitesAllLocations(siteId);

      if (response?.statusCode === 200) {
        const locationsRes = response?.data?.locations || [];

        setQueryParams((prev) => ({
          ...prev,
          siteLocations: [
            { label: 'All Locations', value: '' },
            ...transformArrayForOptions(locationsRes, 'name', 'id'),
          ],
        }));
      }
    } catch (error) {
      setQueryParams((prev) => ({
        ...prev,
        siteLocations: [],
      }));
    }
  };

  /**
   * if site is nonFunctional disable the create extra job button
   * */
  const disableIfSiteNonFunctional = () => {
    if (Object.keys(props?.selectedSite).length === 1) return true;

    if (Object.keys(props?.selectedSite).length > 1) {
      if (
        props?.selectedSite?.status === siteStatusEnum.requiresAttention ||
        props?.selectedSite?.status === siteStatusEnum.nonFunctional
      ) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (isSitesModule) return;

    getSitesList(props.officerId);
  }, [props.officerId]);

  useEffect(() => {
    if (isSitesModule) {
      getLocationsOfSite(props.selectedSite?.id);
    }
  }, [isSitesModule]);

  const onClickCreateExtraDuty = (type) => {
    // if (
    //   franchiseIdWithRoleAndSource?.role === rolesEnum.homeOfficer &&
    //   franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam]
    // ) {
    //   const createExtraJob = HO_SITES_CREATE_EXTRA_DUTY;
    //   const queryParams = new URLSearchParams({
    //     siteId: `${paramId}`,
    //     [franchiseIdUrlQueryParam]: franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam],
    //     [timeZoneKeyUrlQueryParam]: franchiseTimeZoneFromUrl,
    //   }).toString();
    //   return history.push(`${createExtraJob}?${queryParams}`);
    // }

    if (isSitesModule) {
      return history.push(OBX_SITES_CREATE_EXTRA_DUTY + `?siteId=${paramId}&type=${type}`);
    }
    if (isUsersModule) {
      return history.push(OBX_USERS_CREATE_EXTRA_DUTY + `?userId=${paramId}&type=${type}`);
    }

    return history.push(OBX_SCHEDULES_CREATE_EXTRA_DUTY + `?type=${type}`);
  };
  return (
    <Box className={`${classes.scheduleCalendar} ${props.className}`}>
      <Box className={classes.scheduleCalendarHeader}>
        <Box className={classes.scheduleCalendarHeaderLeft}>
          {queryParams.selectedView.type === TIME_GRID.LIST && (
            <SearchComponent
              name="search"
              placeholder={t('form.input.textField.search.placeHolder')}
              onSearch={onSearch}
            />
          )}

          <Box className={classes.scheduleCalendarHeaderFilters}>
            {!isSitesModule && (
              <CustomDropDown
                name="sites"
                label={t('obx.schedules.filters.sites.label')}
                options={transformArrayForOptions(queryParams.allSites, 'name', 'id') || []}
                selectedValues={queryParams.filter.selectedSites}
                handleChange={(e) => handleSelectFilter(e, 'selectedSites')}
                multiSelect
                searchPlaceholder={t('obx.schedules.filters.sites.searchPlaceholder')}
                checkmark
                searchable
                withTiles
                clearAll
              />
            )}

            {isSitesModule && (
              <CustomDropDown
                label={t('obx.schedules.filters.locations.all')}
                name="location"
                options={queryParams.siteLocations}
                selectedValues={queryParams.filter.selectedLocations}
                handleChange={(e) => handleSelectFilter(e, 'selectedLocations')}
                searchPlaceholder={t('obx.schedules.filters.locations.searchPlaceholder')}
                searchable
              />
            )}

            <CustomDropDown
              name="duties"
              label={t('obx.schedules.filters.duties.label')}
              options={DUTIES_FILTER_DATA(t, getLabel, services) || []}
              selectedValues={queryParams.filter.selectedDutyType}
              handleChange={(e) => handleSelectFilter(e, 'selectedDutyType')}
              checkmark
            />
            {!isUsersModule && (
              <CustomDropDown
                name="status"
                label={t('obx.schedules.filters.status.label')}
                options={STATUS_FILTER_DATA(t) || []}
                selectedValues={queryParams.filter.selectedStatus}
                handleChange={(e) => handleSelectFilter(e, 'selectedStatus')}
              />
            )}
          </Box>
        </Box>

        <Box className={classes.scheduleCalendarHeaderRight}>
          {!isUsersModule && requireAttentionJobs !== 0 && (
            <>
              {typeof requireAttentionJobs === 'number' ? (
                <>
                  <Chip
                    color="error"
                    label={t('obx.schedules.calendar.jobsRequireAttention', {
                      count: requireAttentionJobs,
                    })}
                    icon={<AlertIcon />}
                  />
                  {/* <Typography variant="subtitle2" className={classes.scheduleCalendarAlert}>
                        <AlertIcon />
                        {t('obx.schedules.calendar.jobsRequireAttention', {
                          count: requireAttentionJobs,
                        })}
                      </Typography> */}
                </>
              ) : (
                <Skeleton className={classes.scheduleCalendarAlertSkeleton} />
              )}
            </>
          )}
          {/* Loader */}

          <RenderIfHasPermission name={ACL_OBX_SITE_EXTRA_JOB_CREATE}>
            <Tooltip
              placement="top"
              arrow
              title={
                isSitesModule &&
                disableIfSiteNonFunctional() &&
                t('obx.sites.cannotCreateExtraJobForNonFunctionalSite', {
                  extra: getLabel('terms', 'extra', t),
                })
              }
            >
              <StyledMenuButton
                buttonId="demo-customized-button"
                menuId="demo-customized-menu"
                buttonLabel={t('obx.obxExtraDuty.labels.create')}
                startIcon={<AddIcon />}
                endIcon={<ExpandMore />}
                buttonVariant="primary"
                disabled={isSitesModule && disableIfSiteNonFunctional()}
                menuItems={[
                  {
                    id: 'extraJobDedicated',
                    label: t('obx.obxExtraDuty.labels.extraJob'),
                    disableRipple: true,
                    onClick: onClickCreateExtraDuty,
                  },
                  {
                    id: 'extraHitPatrol',
                    label: t('obx.obxExtraDuty.labels.extraHit'),
                    disableRipple: true,
                    onClick: onClickCreateExtraDuty,
                  },
                ]}
              />
            </Tooltip>
          </RenderIfHasPermission>
        </Box>
      </Box>
      <Box className={classes.scheduleCalendarFull}>
        <Calendar
          {...{
            events: allDuties,
            listEvents: listDuties,
            dayViewDuties,
            dayViewLocations,
            weekViewLocations,
            setShowDrawer,
            queryParams,
            setQueryParams,
            loading,
            missedHitsCount,
            refreshMissedHitsCount: () =>
              getMissedHitsCountFunc({
                start: queryParams.selectedView?.windowStart,
                end: queryParams.selectedView?.windowEnd,
              }),
          }}
        />
      </Box>

      {[
        DRAWER_TYPE.ASSIGN,
        DRAWER_TYPE.TOUR_TEMPLATE,
        DRAWER_TYPE.REASSIGNMENT,
        DRAWER_TYPE.EDIT_REASSIGNMENT,
      ].includes(showDrawer?.open) && (
        <AssignmentSideDrawer
          isOpen={true}
          drawerData={{
            type: showDrawer?.open,
            shiftId: showDrawer?.data?.shiftId,
            siteId: showDrawer?.data?.site?.id,
            shiftDate: showDrawer?.data?.startsAt,
          }}
          closeSideDrawer={showSideDrawer('')}
          changeOnlyDrawerType={changeOnlyDrawerType}
          callbackUponAssignment={refetchScheduleData}
          onOpenDedicatedSplitShift={handleOpenDedicatedSplitShift}
        />
      )}
      {showDrawer?.open === DRAWER_TYPE.DETAIL && (
        <ShiftDetail
          {...{
            isOpen: showDrawer?.open === DRAWER_TYPE.DETAIL,
            drawerData: {
              shiftId: showDrawer?.data?.id,
              shiftType: showDrawer?.data?.shiftType,
              shiftDate: showDrawer?.data?.startsAt,
              startsAt: showDrawer?.data?.startsAt,
              endsAt: showDrawer?.data?.endsAt,
              runsheetId: showDrawer?.data?.runsheetId,
              shiftActivityLogId: showDrawer?.data?.shiftActivityLogId,
              rest: showDrawer.data,
            },
            activeIndex: showDrawer?.activeIndex,
            closeDrawer: showSideDrawer(''),
            setShowDrawer,
            setAllDuties,
            getAllDuties: () => getAllDutiesData(queryParams.filter, queryParams.selectedView),
          }}
        />
      )}
      {dedicatedSplitShiftData && (
        <DedicatedSplitShift
          isOpen={!!dedicatedSplitShiftData}
          closeDrawer={() => setDedicatedSplitShiftData(null)}
          onSuccesCloseModal={() => {
            setDedicatedSplitShiftData(null);
            refetchScheduleData();
          }}
          shiftData={dedicatedSplitShiftData}
          setShiftData={setDedicatedSplitShiftData}
        />
      )}
    </Box>
  );
};

ScheduleCalendar.propTypes = {
  props: PropTypes.any,
  selectedSite: PropTypes.number,
  officerId: PropTypes.number,
  className: PropTypes.string,
};

export default ScheduleCalendar;

export const DUTY_COLORS = {
  [SCHEDULE_DUTIES.DEDICATED]: '#31a150',
  [SCHEDULE_DUTIES.EXTRA]: '#FFAC0D',
  [SCHEDULE_DUTIES.PATROL]: '#146dff',
  [SCHEDULE_DUTIES.HIT]: '#146dff',
  [SCHEDULE_DUTIES.DISPATCH]: '#9747FF',
};
