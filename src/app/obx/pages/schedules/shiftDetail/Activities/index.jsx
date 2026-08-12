import { Box, Skeleton, Typography } from '@mui/material';
import SweetAlertModal from 'commonComponents/sweetAlertModal';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { updateReportStatus } from 'services/reports.services';
import ShiftVisitsStatus from 'src/app/components/obxComponents/ShiftVisitsStatus';
import RejectReportModal from 'src/app/obx/pages/schedules/shiftDetail/Activities/RejectReportModal';
import { HO_SITES_DETAIL, OBX_SITES } from 'src/app/router/constant/ROUTE';
import { ReactComponent as CheckIcon } from 'src/assets/svg/check.svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { fetchShiftActivitiesById } from 'src/services/duty.services';
import {
  dataReportCheckPointShiftSummary,
  dataReportShiftSummary,
  runsheetDayEndReport,
  siteReportSummary,
  toastSettings,
} from 'src/utils/constants';
import { calendarShiftStatusEnum, SCHEDULE_DUTIES } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import { findTourShiftStatus } from '..';
import { useStyles } from './activities.styles';
import Report from './Report';
import Tours from './Tours';

const Activities = ({ shiftId, shiftDate, shiftType, hitId }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const location = useLocation();
  const { id: paramId } = useParams();

  const [shiftActivity, setShiftActivity] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAcceptModelModal, setShowAcceptModelModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showDrawerChange, setShowDrawer] = useState(false);
  const [isSummaryAvailable, setIsSummaryAvailable] = useState(false);

  const { getLabel } = useTenantLabel();
  const isSitesModule =
    location.pathname?.includes(OBX_SITES) || location.pathname?.includes(HO_SITES_DETAIL);

  // ------------------- Data Fetcher -------------------
  const getShiftActivities = useCallback(async () => {
    if (!shiftId) return;
    setLoading(true);
    try {
      const siteId = paramId || null;
      const response = await fetchShiftActivitiesById({
        shiftId,
        shiftDate: siteId ? null : shiftDate,
        siteId,
      });

      if (response && response?.statusCode === 200) {
        const shiftDetail = response?.data?.shift?.reassignedShift || response?.data?.shift || {};
        setIsSummaryAvailable(shiftDetail?.isSummaryAvailable);

        const completedTours = shiftDetail?.tours?.filter((t) => t?.endedAt).length;

        const tourShiftStatus = findTourShiftStatus({
          tours: shiftDetail?.tours,
          shiftStatus: shiftDetail?.shiftStatus,
          endsAt: shiftDetail?.endsAt,
          totalTours: shiftDetail?.activeTourCount,
        });

        const reports = Object.values(shiftDetail?.reports || {});

        const visitMapped = shiftDetail?.visits
          ?.filter((v) => (isSitesModule ? v.siteId == paramId && v?.hitId == hitId : true))
          ?.map((v) => ({
            title: v?.tour?.title || '',
            reportId: v?.tour?.reportId || '',
            siteId: v?.siteId || '',
            status: v?.tour?.reportId ? 'submitted' : 'notSubmitted',
            submittedAt: null,
            isVisits: true,
            siteName: v?.siteName || '',
            visitedAt: v?.visitedAt || null,
            visitType: v.visitType,
            reportUrl: v?.tour?.tourUrl || '',
          }));

        return setShiftActivity({
          ...shiftDetail,
          tourShiftStatus,
          totalTours: shiftDetail?.activeTourCount,
          completedTours,
          visits: visitMapped,
          tours: shiftDetail?.tours?.map((a) => ({
            ...a,
            type: a?.dispatchId ? 'dispatch' : 'tourReports',
            reportUrl:
              reports.find((report) => report?.reportId === a?.reportId)?.reportUrl ||
              a.tourUrl ||
              null,
            status: a?.completed ? 'submitted' : 'notSubmitted',
            submittedAt: a?.endedAt ? a?.endedAt : null,
            tourId: a?.completed ? a?.id : null,
          })),
        });
      }
    } catch (error) {
      setShiftActivity({});
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  }, [shiftId, shiftDate, paramId, hitId, isSitesModule]);

  // ------------------- Report Status Handler -------------------
  const updateReportStatusButtonClick = async (comments) => {
    try {
      const body = showAcceptModelModal
        ? { status: 'accepted', supervisorComments: '' }
        : { status: 'rejected', supervisorComments: comments };

      const response = await updateReportStatus({ reportId: selectedId, report: body });

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setSelectedId(null);
      }

      setShowAcceptModelModal(false);
      setShowRejectModal(false);
      setShowDrawer((d) => !d);

      getShiftActivities();
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setShowAcceptModelModal(false);
      setShowRejectModal(false);
      setShowDrawer(false);
    }
  };

  useEffect(() => {
    getShiftActivities();
  }, [getShiftActivities]);

  // ------------------- Helpers -------------------
  const renderReport = (report, type, extraProps = {}) => (
    <Box className={classes.dutyDetailActivitiesReports}>
      <Report
        report={report}
        shiftId={shiftId}
        type={type}
        setShowRejectModal={setShowRejectModal}
        setShowAcceptModelModal={setShowAcceptModelModal}
        setSelectedId={setSelectedId}
        setShowDrawer={setShowDrawer}
        showDrawerChange={showDrawerChange}
        {...extraProps}
      />
    </Box>
  );

  // ------------------- UI -------------------
  if (loading) {
    return (
      <Box className={classes.activitiesSkeleton}>
        {Array(5)
          .fill()
          .map((_, i) => (
            <Skeleton key={i} animation="wave" />
          ))}
      </Box>
    );
  }

  return (
    <Box className={classes.dutyDetailActivities}>
      {/* Shift Progress */}
      {shiftActivity?.shiftType === SCHEDULE_DUTIES.PATROL &&
        [
          calendarShiftStatusEnum.NOT_STARTED,
          calendarShiftStatusEnum.IN_PROGRESS,
          calendarShiftStatusEnum.COMPLETED,
        ].includes(shiftActivity?.scheduleStatus) && (
          <>
            <Typography variant="h4" className={classes.dutyDetailActivitiesTitle}>
              {t('obx.schedules.dutyDetail.activities.shiftProgress')}
            </Typography>
            <Box className={classes.dutyDetailActivitiesStatus}>
              <ShiftVisitsStatus
                completedTours={shiftActivity?.visitedHit}
                status={shiftActivity?.scheduleStatus}
                totalTours={shiftActivity?.totalHits}
                isVisit
              />
            </Box>
          </>
        )}
      {/* Dedicated and Extra - Shift Visits Status */}
      {[SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(shiftActivity?.shiftType) && (
        <>
          <Typography variant="h4" className={classes.dutyDetailActivitiesTitle}>
            {t('obx.schedules.dutyDetail.activities.shiftProgress')}
          </Typography>
          <Box className={classes.dutyDetailActivitiesStatus}>
            <ShiftVisitsStatus
              startsAt={shiftActivity?.startsAt}
              endsAt={shiftActivity?.endsAt}
              status={shiftActivity?.tourShiftStatus}
              completedTours={shiftActivity?.completedTours}
              totalTours={shiftActivity?.totalTours}
            />
          </Box>
        </>
      )}
      {/* No Records Found */}
      {isObjectEmpty(shiftActivity) && (
        <Box className={classes.dutyDetailLogsCentered}>
          <NoRecordFound type="listing" data={[]} />
        </Box>
      )}
      {/* Reports */}
      {shiftActivity?.reports?.equipmentInspection?.title &&
        shiftType !== SCHEDULE_DUTIES.HIT &&
        renderReport(shiftActivity?.reports?.equipmentInspection, 'equipmentInspection', {
          shiftId: null,
          showEdit: false,
        })}
      {/* Vehicle Inspection */}
      {shiftActivity?.reports?.vehicleInspection?.title &&
        shiftType !== SCHEDULE_DUTIES.HIT &&
        renderReport(shiftActivity?.reports?.vehicleInspection, 'vehicleInspection', {
          shiftId: null,
          showEdit: false,
        })}
      {/* Tours */}
      {shiftActivity?.tours?.length > 0 && (
        <Box className={classes.dutyDetailActivitiesTours}>
          <Tours
            tours={shiftActivity?.tours}
            shiftId={shiftId}
            type="tourReports"
            setShowRejectModal={setShowRejectModal}
            setShowAcceptModelModal={setShowAcceptModelModal}
            setSelectedId={setSelectedId}
            setShowDrawer={setShowDrawer}
            showDrawerChange={showDrawerChange}
          />
        </Box>
      )}
      {/* Visits */}
      {shiftActivity?.visits?.map((visit, i) =>
        renderReport(
          visit,
          visit?.visitType === SCHEDULE_DUTIES.DISPATCH ? 'dispatch' : 'siteHitReport',
          {
            key: i,
            shiftId: null,
            showEdit: true,
          },
        ),
      )}
      {/* Activity Report */}
      {shiftActivity?.reports?.activityReport?.length > 0 &&
        shiftType !== SCHEDULE_DUTIES.HIT &&
        shiftActivity?.reports?.activityReport?.map((report, i) =>
          renderReport(report, 'activityReport', {
            key: i,
            shiftId: null,
            showEdit: true,
          }),
        )}
      {shiftActivity?.reports?.incidentReport?.length > 0 &&
        shiftType !== SCHEDULE_DUTIES.HIT &&
        shiftActivity?.reports?.incidentReport?.map((report, i) =>
          renderReport(report, 'incidentReport', {
            key: i,
            shiftId: null,
            showEdit: true,
          }),
        )}
      {/* Tour Reports */}
      {shiftActivity?.reports?.tourReports?.length > 0 && (
        <Box className={classes.dutyDetailActivitiesTours}>
          <Tours
            tours={shiftActivity?.reports?.tourReports}
            shiftId={shiftId}
            type="tourReports"
            setShowRejectModal={setShowRejectModal}
            setShowAcceptModelModal={setShowAcceptModelModal}
            setSelectedId={setSelectedId}
            setShowDrawer={setShowDrawer}
            showDrawerChange={showDrawerChange}
          />
        </Box>
      )}
      {/* Shift Day End Report */}
      {shiftActivity?.reports?.shiftDayEndReport?.title &&
        shiftType !== SCHEDULE_DUTIES.HIT &&
        renderReport(shiftActivity?.reports?.shiftDayEndReport, 'shiftDayEndReport', {
          shiftId: null,
          showEdit: false,
        })}
      {/* Patrol Day End */}
      {(shiftActivity?.shiftStatus === 'shiftEnded' ||
        shiftActivity?.shiftStatus === 'shiftAutoEnded') &&
        shiftActivity?.shiftType === SCHEDULE_DUTIES.PATROL &&
        !paramId &&
        renderReport(
          runsheetDayEndReport(getLabel('terms', 'runsheet', t)),
          'runsheetSummaryReport',
          { showEdit: false },
        )}
      {/* Summary Reports */}
      {isSummaryAvailable && (
        <>
          {![SCHEDULE_DUTIES.PATROL, SCHEDULE_DUTIES.HIT].includes(shiftType) && (
            <>
              {renderReport(dataReportCheckPointShiftSummary, 'checkpointSummaryReport', {
                showEdit: false,
              })}
              {renderReport(dataReportShiftSummary, 'shiftSummaryReport', { showEdit: false })}
            </>
          )}
          {shiftType === SCHEDULE_DUTIES.PATROL &&
            paramId &&
            renderReport({ ...siteReportSummary, siteId: paramId }, 'siteSummaryReport', {
              showEdit: false,
            })}
        </>
      )}
      {/* Modals */}
      <SweetAlertModal
        customClass={{ confirmButton: classes.sweetAlertConfirmBlueButton }}
        type="warning"
        title={t('obx.schedules.dutyDetail.acceptRejectReport.approveReport')}
        text={t('obx.schedules.dutyDetail.acceptRejectReport.approveReportDesc')}
        cancelButtonText={t('links.cancel')}
        confirmButtonText={t('obx.schedules.dutyDetail.acceptRejectReport.approveReport')}
        show={showAcceptModelModal}
        handleConfirmButton={updateReportStatusButtonClick}
        handleCancelButton={() => setShowAcceptModelModal(false)}
        icon={<CheckIcon />}
      />
      {showRejectModal && (
        <RejectReportModal
          open={showRejectModal}
          handleClose={() => setShowRejectModal(false)}
          onSubmit={updateReportStatusButtonClick}
        />
      )}
    </Box>
  );
};

Activities.propTypes = {
  shiftId: PropTypes.string,
  shiftType: PropTypes.string,
  shiftDate: PropTypes.string,
  hitId: PropTypes.string,
};
export default Activities;
