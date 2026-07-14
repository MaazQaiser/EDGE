import { Box, Button, Chip, CircularProgress, Tooltip, Typography } from '@mui/material';
import { ReactComponent as RightArrowIcon } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as EditBtnIcon } from 'assets/svg/EditBtnIcon.svg?react';
// import LoaderComponent from 'commonComponents/loader';
import ReportAIModifiedBadge from 'commonComponents/reportAIModifiedBadge';
import SideDrawer from 'commonComponents/sideDrawer';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { Link } from 'react-router-dom';
import { fetchShiftActivityReportPdf } from 'services/duty.services';
import { downloadPdfFromUrl } from 'services/reports.services';
import { getReportAiBadgeVariant } from 'src/app/obx/pages/reports/helpers/reportAiBadgeVisibility';
import { OBX_TOURE_REPORT } from 'src/app/router/constant/ROUTE';
// import { OBX_TOURE_REPORT } from 'src/app/router/constant/ROUTE';
import { useApiControllers } from 'src/helper/axios';
import { listStatusHandler } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum, enumStatusReport, toastSettings } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';
import { toaster } from 'src/utils/toast';

import { useStyles } from './activities.styles';

const PDFViewDrawer = lazy(() => import('src/app/obx/pages/reports/components/pdfViewDrawer'));

const Report = ({ report, shiftId, type, showDrawerChange, showEdit }) => {
  const { getNewApiController } = useApiControllers();
  const { formatDayjsDateTime } = useDateTime();

  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const [pdfUrl, setPdfUrl] = useState('');

  const [isLoading, setLoading] = useState(false);

  const [reset, setReset] = useState(true);

  const [_docNum, setDocNums] = useState(0);

  const [showDrawer, setShowDrawer] = useState(false);
  const [loadingReportId, setLoadingReportId] = useState(null);

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setPdfUrl(null);
    setReset(true);
  };

  const fetchActivityReportPdf = async () => {
    const apiController = getNewApiController();
    if (report.status !== enumStatusReport.notSubmitted) {
      if (report?.reportUrl) {
        window.open(report.reportUrl, '_blank');
        return;
      }

      if (report?.pdfUrl) {
        window.open(report.pdfUrl, '_blank');
        return;
      }

      setLoading(true);
      setLoadingReportId(report?.reportId);

      try {
        const body = { type };
        if (shiftId) body.shiftId = shiftId;

        if (report?.reportId) body.reportId = report?.reportId;

        if (report?.tourId) body.tourId = report?.tourId;

        if (report?.siteId) body.siteId = report?.siteId;

        let config = {
          signal: apiController.signal,
        };

        const response = await fetchShiftActivityReportPdf({ body: body }, config);

        if (response?.statusCode === 200) {
          setLoading(false);
          setReset(true);
          setLoadingReportId(null);
          window.open(response?.data?.url, '_blank');
          return;
        }
      } catch (error) {
        if (!apiController.signal.aborted) {
          setLoading(false);
          setShowDrawer(false);
          toaster.error({
            text: error?.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
      }
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await downloadPdfFromUrl(pdfUrl, {
        responseType: 'blob',
        skipAuth: true,
      });

      const url = URL.createObjectURL(response);

      downloadLocalPDf(url);
    } catch (error) {
      setLoading(false);
      setShowDrawer(false);

      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      console.error('Error downloading PDF:', error);
    }
  };
  const downloadLocalPDf = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_${dayjs().unix()}.pdf`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (pdfUrl) setReset(false);
  }, [pdfUrl]);

  useEffect(() => {
    setShowDrawer(false);
  }, [showDrawerChange]);

  const status = listStatusHandler(report?.status, t, getLabel);
  const NA = t('commonText.nA');
  const aiBadgeVariant = getReportAiBadgeVariant(report);
  const showAiBadge = aiBadgeVariant != null;

  return (
    <>
      <Box className={classes.dutyDetailReports}>
        <Box className={classes.dutyDetailReportsContent}>
          <Box
            className={
              report.status === enumStatusReport.notSubmitted
                ? classes.noCursorHeader
                : classes.dutyDetailReportsHeader
            }
            onClick={fetchActivityReportPdf}
          >
            <Box className={classes.reportTourTitleAndDate}>
              <Typography className={classes.dutyDetailReportsTitle} variant="h4">
                {report?.title?.length > 25 ? (
                  <>
                    <Tooltip title={report?.title} arrow>
                      {truncateString(capitalizeFirstLetter(report?.title), 25) || NA}
                    </Tooltip>
                  </>
                ) : (
                  <>{capitalizeFirstLetter(report?.title) || NA}</>
                )}

                {report?.submittedAt
                  ? ` • ${formatDayjsDateTime({ value: report?.submittedAt || report?.startsAt, formatType: dayjsFormatsEnum.time })}`
                  : null}
                {!report?.submittedAt && report?.isVisits && report?.visitedAt && report?.reportId
                  ? ` • ${formatDayjsDateTime({ value: report?.visitedAt, formatType: dayjsFormatsEnum.time })}`
                  : null}
              </Typography>
              {showEdit && report.status === enumStatusReport.submitted && showAiBadge && (
                <ReportAIModifiedBadge isAIModified={aiBadgeVariant === 'refined'} />
              )}
              {report?.reportId && report.status !== enumStatusReport.notSubmitted && (
                <RightArrowIcon className={classes.dutyDetailReportIcon} />
              )}
              {report?.reportId === loadingReportId && isLoading && <CircularProgress size={14} />}
            </Box>

            <Box width={'100%'} className={classes.inlineFlex}>
              {report?.siteName && <Typography variant="subtitle3">{report?.siteName}</Typography>}

              {report?.visitType === 'dispatch' ? (
                <Chip
                  sx={{
                    color: '#9747FF',
                    backgroundColor: '#F4EDFD',
                    '&:hover': {
                      backgroundColor: '#F4EDFD',
                      color: '#9747FF',
                    },
                  }}
                  label={t('obx.schedules.legends.dispatch', {
                    dispatch: getLabel('terms', 'dispatch', t),
                  })}
                />
              ) : null}
            </Box>
          </Box>
          {status && report.status !== enumStatusReport?.submitted && !report?.reportId && (
            <Chip
              label={status?.title}
              size="small"
              color={status?.color}
              className={classes.tourChipStatus}
            />
          )}

          {report.status === enumStatusReport.submitted && showEdit && (
            <Box className={classes.reportsActions}>
              <Box
                onClick={() => {
                  if (report?.tourId && report?.reportId) {
                    const url = OBX_TOURE_REPORT.replace(':reportId', 'tour-report').replace(
                      ':tourReportId',
                      report?.reportId,
                    );
                    window.open(url, '_blank').focus();
                  } else {
                    const url = OBX_TOURE_REPORT.replace(':reportId', report?.reportId).replace(
                      '/:tourReportId',
                      '',
                    );
                    window.open(url, '_blank').focus();
                  }
                }}
                className={classes.addVehicle}
              >
                <EditBtnIcon className={classes.addIcon} />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <SideDrawer
        closeDrawer={handleCloseDrawer}
        key={`${pdfUrl}-${reset}`}
        isOpen={showDrawer}
        totalWidth={'992px'}
      >
        <Box>
          <Suspense fallback={null}>
            <PDFViewDrawer
              url={pdfUrl}
              key={pdfUrl}
              loading={reset}
              setLoading={setReset}
              setUrl={setPdfUrl}
              closeDrawer={handleCloseDrawer}
              setDocNums={setDocNums}
            />
          </Suspense>
        </Box>

        <Box className={classes.reportsDrawerActions}>
          <Button
            onClick={() => {
              downloadPdf();
            }}
            variant="secondaryBlue"
            disableRipple
            disabled={isLoading}
          >
            {t('buttons.downloadReport')}
          </Button>

          {/*{report.status === enumStatusReport.submitted && pdfUrl && !!docNum && (*/}
          {/*  <Button*/}
          {/*    onClick={() => {*/}
          {/*      history.push(*/}
          {/*        OBX_TOURE_REPORT.replace(':reportId', report?.reportId).replace(*/}
          {/*          '/:tourReportId',*/}
          {/*          '',*/}
          {/*        ),*/}
          {/*      );*/}
          {/*    }}*/}
          {/*    variant="secondaryBlue"*/}
          {/*    disableRipple*/}
          {/*    disabled={isLoading}*/}
          {/*  >*/}
          {/*    {t('buttons.editReport')}*/}
          {/*  </Button>*/}
          {/*)}*/}
        </Box>
      </SideDrawer>
    </>
  );
};

Report.propTypes = {
  report: PropTypes.any,
  shiftId: PropTypes.any,
  type: PropTypes.any,
  setShowAcceptModelModal: PropTypes.any,
  setShowRejectModal: PropTypes.any,
  setSelectedId: PropTypes.any,
  setShowDrawer: PropTypes.any,
  showDrawerChange: PropTypes.any,
  showEdit: PropTypes.bool,
  hasUrl: PropTypes.bool,
};

export default Report;
