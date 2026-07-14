import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import { ReactComponent as RightArrowIcon } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as EditBtnIcon } from 'assets/svg/EditBtnIcon.svg?react';
import ReportAIModifiedBadge from 'commonComponents/reportAIModifiedBadge';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchShiftActivityReportPdf } from 'services/duty.services';
import { getReportAiBadgeVariant } from 'src/app/obx/pages/reports/helpers/reportAiBadgeVisibility';
import { OBX_TOURE_REPORT } from 'src/app/router/constant/ROUTE';
import { useApiControllers } from 'src/helper/axios';
import { listStatusHandler } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum, enumStatusReport, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './activities.styles';

const Tours = ({ tours, shiftId, type }) => {
  const { getNewApiController } = useApiControllers();
  const [isLoading, setLoading] = useState(false);
  const [loadingReportId, setLoadingReportId] = useState(null);

  const classes = useStyles();

  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const { formatDayjsDateTime } = useDateTime();

  const fetchActivityReportPdf = async (tour) => {
    const apiController = getNewApiController();
    if (tour.status !== enumStatusReport.notSubmitted) {
      if (tour?.reportUrl) {
        window.open(tour.reportUrl, '_blank');
        return;
      }

      if (tour?.pdfUrl) {
        window.open(tour.pdfUrl, '_blank');
        return;
      }

      setLoading(true);
      setLoadingReportId(tour?.id);

      try {
        const body = { type };
        if (shiftId) body.shiftId = shiftId;

        if (tour?.reportId) body.reportId = tour?.reportId;

        if (tour?.tourId) body.tourId = tour?.tourId;

        if (tour?.siteId) body.siteId = tour?.siteId;

        let config = {
          signal: apiController.signal,
        };

        const response = await fetchShiftActivityReportPdf({ body: body }, config);

        if (response?.statusCode === 200) {
          window.open(response?.data?.url, '_blank');
          return;
        }
      } catch (error) {
        if (!apiController.signal.aborted) {
          toaster.error({
            text: error?.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
      } finally {
        setLoading(false);
        setLoadingReportId(null);
      }
    }
  };

  return (
    <>
      {tours?.map((tour) => {
        const status = listStatusHandler(tour?.status, t, getLabel);
        const aiBadgeVariant = getReportAiBadgeVariant(tour);
        const showAiBadge = aiBadgeVariant != null;
        return (
          <Box key={tour?.id}>
            <Box className={classes.dutyDetailReports}>
              <Box className={classes.dutyDetailReportsContent}>
                <Box
                  className={
                    tour.status === enumStatusReport.submitted
                      ? classes.dutyDetailReportsHeaderWithReportUrl
                      : classes.dutyDetailReportsHeaderWithoutReportUrl
                  }
                  onClick={() => {
                    fetchActivityReportPdf(tour);
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} width="100%" flexWrap="nowrap">
                    <Typography
                      className={classes.dutyDetailReportsTitle}
                      variant="h4"
                      sx={{ flex: '1 1 auto', minWidth: 0 }}
                    >
                      {tour?.title}
                      {tour?.submittedAt
                        ? ` • ${formatDayjsDateTime({
                            value: tour?.submittedAt,
                            formatType: dayjsFormatsEnum.time,
                          })}`
                        : null}
                      {tour?.reportId && tour.status !== enumStatusReport.notSubmitted && (
                        <RightArrowIcon className={classes.dutyDetailReportIcon} />
                      )}
                      {tour?.reportId === loadingReportId && isLoading && (
                        <CircularProgress size={14} />
                      )}
                    </Typography>
                    {tour.status === enumStatusReport.submitted && showAiBadge && (
                      <ReportAIModifiedBadge isAIModified={aiBadgeVariant === 'refined'} />
                    )}
                  </Box>
                </Box>
                {/* {report?.reportId && (
            <>
              <Typography className={classes.dutyDetailReportsDescription} variant="subtitle3">
                {report?.description}
              </Typography>
              {report?.submittedAt && (
                <Typography className={classes.dutyDetailReportsTime} variant="subtitle3">
                  {t('obx.schedules.dutyDetail.activities.reportSubmittionTime', {
                    submittedAt: dayjs(report?.submittedAt).format('hh:mm A'),
                  })}
                </Typography>
              )}
            </>
          )} */}
                {tour?.isDisabled && (
                  <Chip label={t('obx.schedules.dutyDetail.detail.outOfShiftTime')} size="small" />
                )}
                {!tour?.isDisabled && status && tour.status !== enumStatusReport.submitted && (
                  <Chip label={status?.title} size="small" color={status?.color} />
                )}

                {tour.status === enumStatusReport.submitted && (
                  <Box className={classes.reportsActions}>
                    {/* <Tooltip
                      title="Reject"
                      arrow
                      slotProps={{
                        popper: {
                          modifiers: [
                            {
                              name: 'offset',
                              options: {
                                offset: [0, -14],
                              },
                            },
                          ],
                          sx: { cursor: 'pointer' },
                        },
                      }}
                    >
                      <Button
                        onClick={() => {
                          setShowRejectModal(true);
                          setSelectedId(tour?.reportId);
                        }}
                        variant="destructiveSecondary"
                        className={classes.reportsActionsCross}
                      >
                        <RedCrossIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      title="Approve"
                      arrow
                      slotProps={{
                        popper: {
                          modifiers: [
                            {
                              name: 'offset',
                              options: {
                                offset: [0, -14],
                              },
                            },
                          ],
                          sx: { cursor: 'pointer' },
                        },
                      }}
                    >
                      <Button
                        onClick={() => {
                          setShowAcceptModelModal(true);
                          setSelectedId(tour?.reportId);
                        }}
                        variant="secondaryBlue"
                        className={classes.reportsActionsTick}
                      >
                        <BlueTickIcon />
                      </Button>
                    </Tooltip> */}
                    {/*<Chip color="success" size="small" label="sent" />*/}
                    <Link
                      to={`${OBX_TOURE_REPORT.replace(':reportId', tour?.reportId).replace(
                        '/:tourReportId',
                        '',
                      )}`}
                      className={classes.addVehicle}
                    >
                      <EditBtnIcon className={classes.addIcon} />
                    </Link>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </>
  );
};

Tours.propTypes = {
  tours: PropTypes.array,
  shiftId: PropTypes.any,
  type: PropTypes.any,
  setShowAcceptModelModal: PropTypes.any,
  setShowRejectModal: PropTypes.any,
  setSelectedId: PropTypes.any,
  setShowDrawer: PropTypes.any,
  showDrawerChange: PropTypes.any,
};

export default Tours;
