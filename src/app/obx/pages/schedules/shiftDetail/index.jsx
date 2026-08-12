import { Box, Tab, Tabs } from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SideDrawer from 'src/app/components/common/sideDrawer';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import HitReassignmentDrawer from 'src/app/obx/pages/schedules/components/hitReassignmentDrawer';
import ReassignHitDrawerContent from 'src/app/obx/pages/schedules/components/reassignHitDrawerContent';
import { ACL_OBX_SCHEDULES_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { ReactComponent as WarningIcon } from 'src/assets/svg/warning.svg';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import {
  cancelShift,
  fetchShiftDetailById,
  getHitShiftDetail,
  getRunsheetShiftDetail,
  restoreShift,
  updateAllowClockBackIn,
} from 'src/services/duty.services';
// import NotesEmptyState from 'src/app/components/salesComponents/components/notesEmpty';
import { getSitesInstructions } from 'src/services/sites.services';
import { toastSettings } from 'src/utils/constants';
import {
  DRAWER_TYPE,
  SCHEDULE_DUTIES,
  ShiftStatus,
  TourShiftStatusEnum,
} from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import CancelShiftModal from '../../sites/detail/components/jobs/assignmentSideDrawer/CancelShiftModal';
import RestoreShiftModal from '../../sites/detail/components/jobs/assignmentSideDrawer/RestoreShiftModal';
import PatrolAssignTour from '../../sites/detail/components/jobs/PatrolAssignTour';
import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
  getStartEndTimeWithDesiredDate,
} from '../helper';
import AssignmentOnRunsheet from './components/assignmentOnRunsheet';
import HitHeaderEditButtons from './components/hitHeaderEditButton';
import PatrolHeader from './components/patrolHeader';
import RunsheetHeaderEditButton from './components/runsheetHeaderEditButton';
import EditRunsheetModal from './editRunsheetModal';
import Header from './Header';

const Activities = lazy(() => import('./Activities'));
const Details = lazy(() => import('./Details'));
const HitDetail = lazy(() => import('./hitDetail'));
const Logs = lazy(() => import('./Logs'));
const Notes = lazy(() => import('./Notes'));
const RunsheetDetail = lazy(() => import('./RunsheetDetail'));

const useStyles = makeStyles((theme) => ({
  dutyDetailTabFirst: {
    padding: '24px',
  },
  /* The visit drawer's own sections already carry `20px 24px` of their own — see
     `VisitAssignment.wrapper` and `runsheetHits.hitCardWrapper` — so this panel's
     24px was doubling it and the visit drawer's content sat 48px from the edge
     while the runsheet drawer, whose body brings no padding of its own, sat at 24.
     Side by side the visit drawer looked narrower than it is. Flush here; the
     children provide the inset. */
  dutyDetailTabFirstFlush: {
    padding: 0,
  },
  dutyDetail: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,

    overflow: 'auto',
    '& .MuiTabs-root': {
      padding: '0 24px',
      minHeight: '50px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      '& .MuiTabs-scroller': {
        '& .MuiTabs-indicator': {
          backgroundColor: theme.palette.surfaceBrand,
        },
        '& .MuiTabs-flexContainer': {
          gap: '16px',

          '& .MuiButtonBase-root': {
            padding: '14px 4px 14px 4px',
            color: theme.palette.textPlaceholder,
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',

            '&.Mui-selected': {
              color: theme.palette.textBrand,
              fontWeight: 500,
            },

            '&.Mui-disabled': {
              color: theme.palette.textDisabled,
            },
          },
        },
      },
    },
  },

  dutyDetailTabPanel: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    // padding: '0px 24px',
  },

  dutyDetailFooter: {
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  confirmButton: {
    '&.swal2-confirm': {
      padding: '8px 14px !important',
      height: 36,
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      fontFamily: 'Inter',
      textTransform: 'none',
      cursor: 'pointer',
      letterSpacing: 'normal',
      boxShadow: 'none',
      whiteSpace: 'nowrap',
      color: '#ffffff',
      margin: 0,
      backgroundColor: '#146DFF !important',
      border: `1px solid #146DFF`,
      display: 'flex !important',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  cancelButton: {
    '&.swal2-cancel': {
      padding: '8px 14px !important',
      display: 'flex !important',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
      height: 36,
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      fontFamily: 'Inter',
      textTransform: 'none',
      cursor: 'pointer',
      letterSpacing: 'normal',
      boxShadow: 'none',
      whiteSpace: 'nowrap',
      color: '#444446',
      backgroundColor: 'white !important',
      border: `1px solid #AEAEB2 !important`,
    },
  },
}));

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  const classes = useStyles();
  return (
    <Box
      className={classes.dutyDetailTabPanel}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Box>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

/**
 * Drawer title from a primary name plus optional context.
 *
 * Route names are usually derived from their site ("Downtown Plaza Route"), so
 * appending the site unconditionally produced titles like
 * "Downtown Plaza Route - Downtown Plaza". The suffix is only added when it
 * actually says something new.
 */
const composeDrawerTitle = (name, context) => {
  const primary = `${name || ''}`.trim();
  const suffix = `${context || ''}`.trim();

  if (!primary) return suffix;
  if (!suffix) return primary;

  // The containment test has to run both ways. It only guarded
  // "Downtown Plaza Route - Downtown Plaza"; the visit drawer leads with the site
  // and appends the route, which is the mirror case and produced
  // "Alderwood Business Park - Alderwood Business Park Route" — the same name
  // twice, over two lines. Keep the shorter, which is the one that identifies.
  const a = primary.toLowerCase();
  const b = suffix.toLowerCase();
  if (a.includes(b)) return primary;
  if (b.includes(a)) return primary;

  return `${primary} - ${suffix}`;
};

const getShiftDetailTabs = (t, shiftType) => {
  return [
    t('obx.schedules.dutyDetail.detail.title'),
    t('obx.schedules.dutyDetail.activities.title'),
    ...(shiftType !== SCHEDULE_DUTIES.HIT
      ? [t('obx.schedules.dutyDetail.notes.title'), t('obx.schedules.dutyDetail.logs.title')]
      : []),
  ];
};

const renderTabs = (t, disabled, shiftType) => {
  const shiftDetailTabs = getShiftDetailTabs(t, shiftType);
  return shiftDetailTabs.map((tab, index) => (
    <Tab key={index} disableRipple label={tab} disabled={disabled} />
  ));
};

export const ASSIGN_RUNSHEET_OPTIONS = {
  OFFICER: 'officer',
  VEHICLE: 'vehicle',
};
const DutyDetail = ({
  isOpen,
  drawerData,
  closeDrawer,
  setShowDrawer,
  getAllDuties,
  activeIndex,
  hideButtons = false,
}) => {
  const { shiftId, shiftType, shiftDate, startsAt, endsAt, runsheetId, shiftActivityLogId, rest } =
    drawerData || {};
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const [value, setValue] = useState(activeIndex);
  const [shiftData, setShiftData] = useState(rest || {});
  const [loading, setLoading] = useState(false);
  const [loadInstructions, setLoadInstructions] = useState(false);
  const [isReassignHit, setIsReassignHit] = useState(false);
  const [isReassignHitToRunsheet, setIsReassignHitToRunsheet] = useState(false);
  const [isAssign, setIsAssign] = useState(null); // officer, vehicle
  const [showTourDrawer, setShowTourDrawer] = useState({
    open: '',
    data: {},
  });
  const [clockBackInConfirmation, setClockBackInConfirmation] = useState(false);
  const [dedicatedCancelModalOpen, setDedicatedCancelModalOpen] = useState(false);
  const [dedicatedRestoreModalOpen, setDedicatedRestoreModalOpen] = useState(false);

  const now = useMemo(() => getCurrentStandardTimeInIsoWrtTimezone(), []);
  const isPastShift = dayjs(now).isAfter(dayjs(endsAt));
  const [isEditRunsheetModal, setIsEditRunsheetModal] = useState(false);

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  const getShiftDetail = async ({ shiftId }) => {
    try {
      setLoading(true);

      const response = await fetchShiftDetailById({
        shiftId,
        shiftDate: shiftDate,
      });
      const detail = response?.data?.shift;
      const totalHours = dayjs(detail?.endsAt).diff(detail?.startsAt, 'h', true);

      const tourShiftStatus = findTourShiftStatus({
        tours: detail?.tours,
        shiftStatus: detail?.shiftStatus,
        endsAt: detail?.reassignedShift?.startsAt || detail?.endsAt,
        totalTours: detail?.totalTours,
      });

      setShiftData((prev) => ({
        ...prev,
        ...detail,
        totalHours,
        tourShiftStatus,
        endsAt: detail?.reassignedShift?.startsAt || detail?.endsAt,
        shiftEndsAt: detail?.endsAt,
        reassignedShift: detail?.reassignedShift
          ? {
              ...detail?.reassignedShift,
              reassignedTourShiftStatus: findTourShiftStatus({
                tours: detail?.reassignedShift?.tours,
                shiftStatus: detail?.reassignedShift?.shiftStatus,
                endsAt: detail?.reassignedShift?.endsAt,
                totalTours: detail?.reassignedShift?.totalTours,
              }),
            }
          : null,

        // ...(response?.data?.type === SCHEDULE_DUTIES.EXTRA && {
        //   instruction: { content: response?.data?.description },
        // }),
      }));

      setLoading(false);
    } catch (error) {
      setShiftData({});
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      setLoading(false);
    }
  };

  const getHitDetail = async (hitId) => {
    try {
      setLoading(true);

      const params = {
        startsAt,
        endsAt,
        runsheetId,
      };

      const response = await getHitShiftDetail({ hitId, params });
      let hitDetail = response?.data || {};

      hitDetail = {
        ...hitDetail,
        name: hitDetail?.name || '',
        runsheetName: hitDetail?.runsheetName || '',
        startsAt,
        endsAt,
        // subTitleText: '',
      };

      setShiftData(hitDetail);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShiftData({});
    }
  };

  const getRunsheetDetail = async ({
    runsheetId,
    actId = null,
    newStartsAt = null,
    newEndsAt = null,
  }) => {
    try {
      setLoading(true);

      const params = {
        startsAt: newStartsAt ? newStartsAt : startsAt,
        endsAt: newEndsAt ? newEndsAt : endsAt,
        shiftActivityLogId: actId ? actId : shiftActivityLogId,
      };

      const response = await getRunsheetShiftDetail({ runsheetId, params });

      const runsheetStartsAt = response?.data?.runsheetDetails?.startsAt;
      const runsheetEndsAt = response?.data?.runsheetDetails?.endsAt;

      let minAssignmentDate;
      if (getCurrentStandardTimeInIsoWrtTimezone() < response?.data?.contractStartTime) {
        minAssignmentDate = dayjsWithStandardOffset(response?.data?.contractStartTime).format(
          'YYYY-MM-DD',
        );
      } else {
        const currentDate = dayjsWithStandardOffset().format('YYYY-MM-DD');
        const currentDay = dayjsWithStandardOffset().day();

        const runsheetStartsAtDay = dayjsWithStandardOffset(runsheetStartsAt).day();
        const runsheetEndsAtDay = dayjsWithStandardOffset(runsheetEndsAt).day();

        let currentDateRunsheet = null;

        if (currentDay === runsheetStartsAtDay) {
          // if runsheet startAt day is on currentday(today), then this check will worl

          const { startTime, endTime } = getStartEndTimeWithDesiredDate(
            currentDate,
            runsheetStartsAt,
            runsheetEndsAt,
          );
          currentDateRunsheet = {
            startsAt: startTime,
            endsAt: endTime,
          };
        } else if (currentDay === runsheetEndsAtDay) {
          // if runsheet startsAt day is not at current day and endsAt day is at current day, then this check will work

          const yesterdayDate = dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD');
          const { startTime, endTime } = getStartEndTimeWithDesiredDate(
            yesterdayDate,
            runsheetStartsAt,
            runsheetEndsAt,
          );
          currentDateRunsheet = {
            startsAt: startTime,
            endsAt: endTime,
          };
        }

        if (!currentDateRunsheet) {
          // if runsheet do not exist on current day, then this check will work

          minAssignmentDate = currentDate;
        } else if (
          currentDateRunsheet &&
          getCurrentStandardTimeInIsoWrtTimezone() < currentDateRunsheet.endsAt
        ) {
          // if runsheet is not started yet on current day or if runsheet is not ended yet, then this check will work
          minAssignmentDate = dayjsWithStandardOffset(currentDateRunsheet.startsAt).format(
            'YYYY-MM-DD',
          );
        } else {
          // if runsheet has ended on current day, then this check will work
          minAssignmentDate = dayjsWithStandardOffset(currentDateRunsheet.startsAt)
            .add(1, 'week')
            .format('YYYY-MM-DD');
        }
      }

      const detail = {
        ...response?.data,
        name: response?.data?.runsheetDetails?.runsheetName || '',
        startsAt: newStartsAt ? newStartsAt : startsAt,
        endsAt: newEndsAt ? newEndsAt : endsAt,
        minAssignmentDate,
        // subTitleText: '',
      };

      setShiftData(detail);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShiftData({});
    }
  };

  useEffect(() => {
    if (shiftType === SCHEDULE_DUTIES.HIT) {
      getHitDetail(shiftId);
      return;
    }
    if (shiftType === SCHEDULE_DUTIES.PATROL || shiftType === SCHEDULE_DUTIES.DISPATCH) {
      getRunsheetDetail({ runsheetId: shiftId });
      return;
    }

    getShiftDetail({ shiftId });
  }, []);

  const fetchSitesInstructions = async (siteId) => {
    try {
      setLoadInstructions(true);
      const response = await getSitesInstructions(siteId);
      setShiftData((prev) => ({ ...prev, instruction: response?.data?.instruction }));
      setLoadInstructions(false);
    } catch (err) {
      setLoadInstructions(false);
      setShiftData((prev) => ({ ...prev, instruction: undefined }));
    }
  };
  useEffect(() => {
    if (!shiftData || !shiftData.site?.id) return;
    if (shiftData?.instruction?.content) return;
    fetchSitesInstructions(shiftData.site.id);
  }, [shiftData?.site?.id]);

  const handleBackFromReassignHit = () => {
    setIsReassignHit(false);
  };

  const handleBackFromAssgnment = () => {
    setIsAssign(false);
  };

  const handleBackFromReassignRunsheetHit = () => {
    setIsReassignHitToRunsheet(false);
  };

  const showSideDrawer = (value) => (data) => {
    setShowTourDrawer({ open: value, data: value ? data : null });
  };
  const changeOnlyDrawerType = (value) => () => {
    setShowTourDrawer((prev) => ({ open: value, data: value ? prev?.data : null }));
  };

  const shiftDetailForDedicatedCancelModal = useMemo(() => {
    if (!shiftData || !Object.keys(shiftData).length) return {};
    return {
      ...shiftData,
      id: shiftData?.id ?? shiftId,
      selectedShiftStartTime: shiftData?.selectedShiftStartTime ?? shiftData?.startsAt,
      selectedShiftEndTime: shiftData?.selectedShiftEndTime ?? shiftData?.endsAt,
      shiftStartTime: shiftData?.shiftStartTime ?? shiftData?.startsAt,
      shiftEndTime: shiftData?.shiftEndTime ?? shiftData?.endsAt,
    };
  }, [shiftData, shiftId]);

  const getSingleShiftDayUtcDedicated = (dateValue) => {
    if (!dateValue) return [];
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return [];
    return [parsed.getUTCDay()];
  };

  const buildDedicatedDutyDetailCancelPayload = (cancelShiftModalData) => {
    const { reason } = cancelShiftModalData;
    const detail = shiftData;
    const scheduleShiftId = `${detail?.shiftId ?? ''}`;

    const startsAt = detail?.startsAt;
    const days = getSingleShiftDayUtcDedicated(startsAt);
    return {
      shiftType: 'dedicated',
      shiftId: scheduleShiftId,
      startsAt,
      endsAt: detail?.startsAt,
      days,
      cancelReason: reason,
    };
  };

  const handleDedicatedDutyDetailCancelConfirm = async (cancelShiftModalData) => {
    try {
      const payload = buildDedicatedDutyDetailCancelPayload(cancelShiftModalData);
      const response = await cancelShift({ payload });
      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDedicatedCancelModalOpen(false);
      getShiftDetail({ shiftId });
      getAllDuties();
      closeDrawer();
      return true;
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return false;
    }
  };

  const handleDedicatedDutyDetailRestoreConfirm = async () => {
    try {
      const activityLogId =
        shiftData?.shiftActivityLogId || shiftData?.logId || shiftData?.id || shiftId || '';
      if (!activityLogId) {
        toaster.error({
          text: t('obx.commonText.somethingWentWrong'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        return false;
      }
      const response = await restoreShift({
        activityLogId,
        payload: { shiftType: 'dedicated', activityLogId },
      });
      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDedicatedRestoreModalOpen(false);
      getShiftDetail({ shiftId });
      getAllDuties();
      closeDrawer();
      return true;
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return false;
    }
  };

  const handleConfirmClockBackIn = async () => {
    try {
      let logId = shiftId; // for dedicated and extra shifts
      if (shiftType === SCHEDULE_DUTIES.PATROL || shiftType === SCHEDULE_DUTIES.DISPATCH) {
        logId = shiftData?.shiftActivityLogId;
      }
      const response = await updateAllowClockBackIn(logId);
      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      getAllDuties();

      if (shiftType === SCHEDULE_DUTIES.PATROL || shiftType === SCHEDULE_DUTIES.DISPATCH) {
        getRunsheetDetail({ runsheetId: shiftId });
      } else {
        // for dedicated and extra shifts
        getShiftDetail({ shiftId });
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setClockBackInConfirmation(false);
  };
  return (
    <>
      <SideDrawer totalWidth={'660px'} isOpen={isOpen}>
        {isReassignHitToRunsheet ? (
          <HitReassignmentDrawer
            runsheetHitsList={shiftData?.runsheetDetails?.hits}
            shiftData={shiftData}
            closeDrawer={closeDrawer}
            shiftType={shiftType}
            id={shiftId}
            onClickBack={handleBackFromReassignRunsheetHit}
            callBackOnSuccess={(shId) => {
              getAllDuties();
              getRunsheetDetail({ runsheetId: shiftId, actId: shId });
            }}
          />
        ) : isReassignHit ? (
          <ReassignHitDrawerContent
            {...{
              closeDrawer,
              handleBackBtn: handleBackFromReassignHit,
              shiftData: shiftData,
              headerTitle: t('obx.schedules.dutyDetail.reassignHit.headerTitle', {
                hit: getLabel('terms', 'hit', t),
              }),
              callbackUponReassignHit: () => {
                getHitDetail(shiftId);
                getAllDuties();
              },
            }}
          />
        ) : isAssign ? (
          <AssignmentOnRunsheet
            {...{
              closeDrawer,
              handleBackBtn: handleBackFromAssgnment,
              shiftData: shiftData,
              runsheetId: shiftId,
              name: isAssign,
              isParent: shiftData?.isParent,
              isChild: shiftData?.isChild,
              shiftType,
              callbackUponAssignment: () => {
                getRunsheetDetail({ runsheetId: shiftId });
                getAllDuties();
              },
            }}
          />
        ) : (
          <>
            {[SCHEDULE_DUTIES.PATROL, SCHEDULE_DUTIES.DISPATCH].includes(shiftType) ? (
              <PatrolHeader
                loading={loading}
                shiftData={shiftData}
                closeDrawer={closeDrawer}
                shiftType={shiftType}
                headerTitle={composeDrawerTitle(shiftData?.name, shiftData?.site?.name)}
                editButtons={
                  <RenderIfHasPermission name={ACL_OBX_SCHEDULES_UPDATE}>
                    <>
                      <RunsheetHeaderEditButton
                        shiftData={{
                          ...shiftData,
                          runsheetId: shiftId,
                          shiftActivityLogId: shiftData?.shiftActivityLogId || shiftActivityLogId,
                        }}
                        setClockBackInConfirmation={setClockBackInConfirmation}
                        setIsReassignHitToRunsheet={setIsReassignHitToRunsheet}
                        setIsEditRunsheetModal={setIsEditRunsheetModal}
                        callbackUponAssignment={(startsAt, endsAt) => {
                          getRunsheetDetail({
                            runsheetId: shiftId,
                            newStartsAt: startsAt,
                            newEndsAt: endsAt,
                          });
                          getAllDuties();
                        }}
                        setShiftData={setShiftData}
                      />
                    </>
                  </RenderIfHasPermission>
                }
              />
            ) : [SCHEDULE_DUTIES.HIT].includes(shiftType) ? (
              <PatrolHeader
                loading={loading}
                shiftData={shiftData}
                closeDrawer={closeDrawer}
                headerTitle={composeDrawerTitle(shiftData?.name, shiftData?.runsheetName)}
                editButtons={
                  <RenderIfHasPermission name={ACL_OBX_SCHEDULES_UPDATE}>
                    <HitHeaderEditButtons
                      {...{
                        closeDrawer,
                        getAllDuties,
                        hitData: shiftData,
                        setIsReassignHit,
                        changeOnlyDrawerType,
                      }}
                    />
                  </RenderIfHasPermission>
                }
              />
            ) : (
              <Header
                loading={loading}
                shiftData={shiftData}
                readonly={false}
                closeDrawer={closeDrawer}
                setShowDrawer={setShowDrawer}
                setClockBackInConfirmation={setClockBackInConfirmation}
                refetchShiftDetail={() => getShiftDetail({ shiftId })}
                onDedicatedCancelClick={
                  shiftType === SCHEDULE_DUTIES.DEDICATED
                    ? () => setDedicatedCancelModalOpen(true)
                    : undefined
                }
                onDedicatedRestoreClick={
                  shiftType === SCHEDULE_DUTIES.DEDICATED
                    ? () => setDedicatedRestoreModalOpen(true)
                    : undefined
                }
              />
            )}
            {/* tabs */}
            <Box className={classes.dutyDetail}>
              <>
                <Tabs value={value} onChange={handleChange}>
                  {renderTabs(t, loading, shiftType)}
                </Tabs>

                <CustomTabPanel value={value} index={0}>
                  <Box
                    className={`${classes.dutyDetailTabFirst} ${
                      shiftType === SCHEDULE_DUTIES.HIT ? classes.dutyDetailTabFirstFlush : ''
                    }`}
                  >
                    {shiftType === SCHEDULE_DUTIES.HIT ? (
                      <Box>
                        <Suspense fallback={null}>
                          <HitDetail
                            {...{
                              loading,
                              shiftData,
                              // Unassigned demand is the reason this drawer gets
                              // opened from the visits grid, so the fix is one
                              // click away rather than buried in the kebab.
                              onAssignToRoute: () => setIsReassignHit(true),
                              // A visit with no tour cannot be routed at all, so
                              // the drawer offers the tour first instead of an
                              // action the backend would reject.
                              onAssignTour: changeOnlyDrawerType(DRAWER_TYPE.TOUR_ASSIGNMENT),
                              /* The dropdown proposes; the existing reassign flow
                                 commits. That flow owns the part that cannot be
                                 duplicated inline — it recalculates the route's
                                 polyline through the Maps API before writing, so a
                                 second write path here would produce a runsheet
                                 with a stale route. */
                              onChangeRunsheet: () => setIsReassignHit(true),
                              callbackUponAssignment: () => {
                                getHitDetail(shiftId);
                                getAllDuties();
                              },
                            }}
                          />
                        </Suspense>
                      </Box>
                    ) : shiftType === SCHEDULE_DUTIES.PATROL ||
                      shiftType === SCHEDULE_DUTIES.DISPATCH ? (
                      <Suspense fallback={null}>
                        <RunsheetDetail
                          hideButtons={hideButtons}
                          shiftData={shiftData}
                          loading={loading}
                          setIsAssign={setIsAssign}
                          shiftId={shiftId}
                          shiftActivityLogId={shiftData?.shiftActivityLogId || null}
                          callbackUponAssignment={(activityId) => {
                            getRunsheetDetail({ runsheetId: shiftId, actId: activityId });
                            getAllDuties();
                          }}
                        />
                      </Suspense>
                    ) : (
                      <Suspense fallback={null}>
                        <Details
                          shiftData={shiftData}
                          loading={loading}
                          loadInstructions={loadInstructions}
                          shiftId={shiftId}
                        />
                      </Suspense>
                    )}
                  </Box>
                </CustomTabPanel>

                <CustomTabPanel value={value} index={1}>
                  <Suspense fallback={null}>
                    <Activities
                      {...{
                        shiftId:
                          shiftType === SCHEDULE_DUTIES.PATROL ||
                          shiftType === SCHEDULE_DUTIES.HIT ||
                          shiftType === SCHEDULE_DUTIES.DISPATCH
                            ? rest?.shiftActivityLogId
                            : shiftId,
                        shiftDate,
                        shiftType,
                        hitId: shiftType === SCHEDULE_DUTIES.HIT ? shiftId : null,
                      }}
                    />
                  </Suspense>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                  <Suspense fallback={null}>
                    <Notes
                      shiftActivityLogId={
                        shiftType === SCHEDULE_DUTIES.PATROL ||
                        shiftType === SCHEDULE_DUTIES.DISPATCH
                          ? shiftData?.shiftActivityLogId
                          : shiftId
                      }
                      runsheetId={
                        shiftType === SCHEDULE_DUTIES.PATROL ||
                        shiftType === SCHEDULE_DUTIES.DISPATCH
                          ? shiftId
                          : ''
                      }
                      cbUponNotesCreation={(logId) => {
                        setShiftData((prev) => ({
                          ...prev,
                          shiftActivityLogId: logId,
                        }));
                        getAllDuties();
                      }}
                      startsAt={startsAt}
                      endsAt={endsAt}
                    />
                  </Suspense>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={3}>
                  <Suspense fallback={null}>
                    <Logs
                      {...{
                        logId: shiftData?.shiftActivityLogId || shiftId,
                        shiftDate,
                        shiftType,
                        name: shiftData?.name,
                      }}
                    />
                  </Suspense>
                </CustomTabPanel>
              </>
            </Box>
          </>
        )}
      </SideDrawer>

      {shiftType === SCHEDULE_DUTIES.DEDICATED && (
        <>
          <CancelShiftModal
            open={dedicatedCancelModalOpen}
            onClose={() => setDedicatedCancelModalOpen(false)}
            shiftDetail={shiftDetailForDedicatedCancelModal}
            onConfirm={handleDedicatedDutyDetailCancelConfirm}
            isPastShift={isPastShift}
            fromJobSection={false}
          />
          <RestoreShiftModal
            open={dedicatedRestoreModalOpen}
            onClose={() => setDedicatedRestoreModalOpen(false)}
            onConfirm={handleDedicatedDutyDetailRestoreConfirm}
          />
        </>
      )}

      {[DRAWER_TYPE.TOUR_ASSIGNMENT, DRAWER_TYPE.TOUR_TEMPLATE_PATROL].includes(
        showTourDrawer?.open,
      ) && (
        <PatrolAssignTour
          drawerData={{
            type: showTourDrawer?.open,
            hitId: shiftData?.hitId,
            siteId: shiftData?.siteId,
          }}
          closeSideDrawer={showSideDrawer('')}
          changeOnlyDrawerType={changeOnlyDrawerType}
          callbackUponAssignment={() => {
            getHitDetail(shiftId);
            getAllDuties();
          }}
        />
      )}

      {/* Edit Runsheet Modal for patrol shifts (future, ongoing, past) */}
      <EditRunsheetModal
        open={isEditRunsheetModal}
        onClose={() => setIsEditRunsheetModal(false)}
        shiftData={shiftData}
        shiftId={shiftId}
        shiftActivityLogId={shiftData?.shiftActivityLogId || shiftActivityLogId}
        callbackOnSuccess={(newStartsAt, newEndsAt) => {
          getRunsheetDetail({
            runsheetId: shiftId,
            actId: shiftData?.shiftActivityLogId || shiftActivityLogId,
            newStartsAt,
            newEndsAt,
          });
          closeDrawer();
          getAllDuties();
        }}
      />

      {/* Clock in back Confirmation Modal */}
      <SweetAlertModal
        type="warning"
        title={t('obx.schedules.dutyDetail.runsheetDetail.clockBackInModal.title')}
        text={t('obx.schedules.dutyDetail.runsheetDetail.clockBackInModal.description', {
          officer: getLabel('terms', 'officer', t)?.toLowerCase(),
        })}
        customClass={{
          confirmButton: classes.confirmButton,
          cancelButton: classes.cancelButton,
        }}
        cancelButtonText={t('links.cancel')}
        confirmButtonText={t('buttons.confirm')}
        show={!!clockBackInConfirmation}
        handleConfirmButton={handleConfirmClockBackIn}
        handleCancelButton={() => setClockBackInConfirmation(false)}
        icon={<WarningIcon />}
      />
    </>
  );
};

DutyDetail.propTypes = {
  isOpen: PropTypes.bool,
  drawerData: PropTypes.object,
  jobId: PropTypes.string,
  closeDrawer: PropTypes.func,
  setShowDrawer: PropTypes.func,
  getAllDuties: PropTypes.func,
  readonly: PropTypes.bool,
  hideButtons: PropTypes.bool,
  activeIndex: PropTypes.number,
  setDrawerData: PropTypes.func,
};

DutyDetail.defaultProps = {
  readonly: false,
  activeIndex: 0,
  getAllDuties: () => {},
};

export default DutyDetail;

export const findTourShiftStatus = ({ tours, shiftStatus, endsAt, totalTours }) => {
  if ([ShiftStatus.SHIFT_NOT_STARTED, ShiftStatus.ABSENT].includes(shiftStatus)) {
    return TourShiftStatusEnum.NOT_STARTED;
  }

  if (
    [ShiftStatus.SHIFT_ENDED].includes(shiftStatus) ||
    getCurrentStandardTimeInIsoWrtTimezone() >= endsAt
  ) {
    return TourShiftStatusEnum.COMPLETED;
  }

  if (!totalTours) {
    // shiftStatus !== ShiftStatus.SHIFT_NOT_STARTED && shiftStatus !== ShiftStatus.ABSENT
    return TourShiftStatusEnum.IN_PROGRESS;
  }

  const ascSortedTours = tours?.sort((a, b) => a?.startsAt - b?.startsAt); // ASC sorted tours by startsAt
  const firstTour = ascSortedTours?.[0];
  if (
    totalTours &&
    !firstTour?.startedAt &&
    getCurrentStandardTimeInIsoWrtTimezone() < firstTour?.endsAt
  ) {
    // shiftStatus !== ShiftStatus.SHIFT_NOT_STARTED && shiftStatus !== ShiftStatus.ABSENT
    return TourShiftStatusEnum.IN_PROGRESS;
  }

  const findOngoingTour = () => {
    const ongoingTour = tours?.find((tour) => {
      const isOngoingTour =
        getCurrentStandardTimeInIsoWrtTimezone() >= tour?.startsAt &&
        getCurrentStandardTimeInIsoWrtTimezone() < tour?.endsAt;
      if (isOngoingTour) return true;
    });
    return ongoingTour;
  };
  const findRecentlyPastTour = () => {
    const descSortedTours = tours?.sort((a, b) => b?.startsAt - a?.startsAt); // DESC sorted tours by startsAt
    const recentlyPastTour = descSortedTours?.find((tour) => {
      const pastTour = getCurrentStandardTimeInIsoWrtTimezone() >= tour?.endsAt;
      if (pastTour) return true;
    });

    return recentlyPastTour;
  };
  const ongoingTour = findOngoingTour();
  const recentlyPastTour = findRecentlyPastTour();
  const getScheduledStatus = () => {
    if (ongoingTour && ongoingTour?.startedAt) {
      return TourShiftStatusEnum.ON_SCHEDULE;
    }

    if (recentlyPastTour) {
      if (recentlyPastTour?.endedAt <= recentlyPastTour?.endsAt) {
        return TourShiftStatusEnum.ON_SCHEDULE;
      } else {
        return TourShiftStatusEnum.BEHIND_SCHEDULE;
      }
    }
  };

  // shiftStatus !== ShiftStatus.SHIFT_NOT_STARTED && shiftStatus !== ShiftStatus.ABSENT
  return getScheduledStatus();
};
