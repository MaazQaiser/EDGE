import { Box, Button, Chip, Typography } from '@mui/material';
import { ReactComponent as RightArrowIcon } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as EditBtnIcon } from 'assets/svg/EditBtnIcon.svg?react';
import SideDrawer from 'commonComponents/sideDrawer';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchShiftActivityReportPdf } from 'services/duty.services';
import { downloadPdfFromUrl } from 'services/reports.services';
import { OBX_EDIT_REPORT } from 'src/app/router/constant/ROUTE';
import { useApiControllers } from 'src/helper/axios';
import { listStatusHandler } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { getDispatchTemplates } from 'src/services/dispatch.services';
import { dayjsFormatsEnum, enumStatusReport, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './report.styles';

const PDFViewDrawer = lazy(() => import('src/app/obx/pages/reports/components/pdfViewDrawer'));

const Report = ({ report, type, showDrawerChange, franchiseId }) => {
  const classes = useStyles();
  const { getNewApiController } = useApiControllers();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const [pdfUrl, setPdfUrl] = useState('');

  const [isLoading, setLoading] = useState(false);

  const [reset, setReset] = useState(true);

  const [_docNum, setDocNums] = useState(0);

  const [showDrawer, setShowDrawer] = useState(false);
  const { formatDayjsDateTime } = useDateTime();

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setPdfUrl(null);
    setReset(true);
  };

  const fetchActivityReportPdf = async () => {
    const apiController = getNewApiController();
    if (report.status !== enumStatusReport.notSubmitted) {
      setLoading(true);
      setShowDrawer(true);
      setReset(true);

      try {
        const body = { type };
        body.reportId = report?.id;

        let config = {
          signal: apiController.signal,
          headers: {
            franchise_id: franchiseId,
          },
        };

        const response = await fetchShiftActivityReportPdf({ body: body }, config);

        if (response?.statusCode === 200) {
          setLoading(false);
          setReset(true);
          setPdfUrl(response?.data?.url);
          return;
        }

        const blob = new Blob([response], {
          type: 'application/pdf',
        });
        const objectUrl = URL.createObjectURL(blob);
        setLoading(false);
        setReset(true);
        setPdfUrl(objectUrl);
        // setShowDrawer(true);
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

  useEffect(() => {
    const fetchDispatchReport = async () => {
      const result = await getDispatchTemplates();
      console.log(result, 'here');
    };
    fetchDispatchReport();
  }, []);

  const status = listStatusHandler(report?.status, t, getLabel);

  return (
    <>
      <Box className={classes.dutyDetailReports}>
        <Box className={classes.dutyDetailReportsContent}>
          <Box
            className={
              report?.status === enumStatusReport.notSubmitted
                ? classes.noCursorHeader
                : classes.dutyDetailReportsHeader
            }
            onClick={fetchActivityReportPdf}
          >
            <Box className={classes.reportTourTitleAndDate}>
              <Typography className={classes.dutyDetailReportsTitle} variant="h4">
                {report?.title}
                {' • '}
                {report?.submittedAt
                  ? formatDayjsDateTime({
                      value: report?.submittedAt || report?.startsAt,
                      formatType: dayjsFormatsEnum.time,
                    })
                  : null}
                {!report?.submittedAt && report?.isVisits && report?.visitedAt
                  ? formatDayjsDateTime({
                      value: report?.visitedAt,
                      formatType: dayjsFormatsEnum.time,
                    })
                  : null}
              </Typography>
              {report?.id && <RightArrowIcon className={classes.dutyDetailReportIcon} />}
            </Box>
            {report?.siteName && (
              <Box>
                <Typography variant="subtitle3">{report?.siteName}</Typography>
              </Box>
            )}
          </Box>
          {status && report?.status !== enumStatusReport?.submitted && (
            <Chip
              label={status?.title}
              size="small"
              color={status?.color}
              className={classes.tourChipStatus}
            />
          )}

          {report?.status === enumStatusReport.submitted && (
            <Box className={classes.reportsActions}>
              <Link
                to={`${OBX_EDIT_REPORT.replace(':reportId', report?.id)}?redirectPath=${window?.location?.pathname}${window?.location?.search}${franchiseId ? '&franchiseId=' + franchiseId : ''}`}
                className={classes.addVehicle}
              >
                <EditBtnIcon className={classes.addIcon} />
              </Link>
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
  franchiseId: PropTypes.any,
};

export default Report;
