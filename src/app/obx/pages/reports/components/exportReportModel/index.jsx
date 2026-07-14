import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { exportReports } from 'services/reports.services';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import ModalComponent from 'src/app/components/common/modal';
import { DownloadCloud } from 'src/assets/svg';
import { downloadFileFromResponse } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { appendDefaultStartAndEndTimeWithDates } from '../../../schedules/helper';
import { useStyles } from './exportReportModel';

const initialFormdata = {
  startDate: '',
  endDate: '',
};

const ExportReportModel = ({
  open,
  onClose,
  fileNamePrefix,
  exportReportsService,
  fileExtension,
}) => {
  const classes = useStyles();
  const [formData, setFormData] = useState(initialFormdata);
  const [errorMessages, setErrorMessages] = useState(null);

  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();

  const handleCancel = () => {
    setFormData(initialFormdata);
    setErrorMessages(null);
    onClose();
  };
  const handleSubmit = async () => {
    const validatePayload = {
      startDate: formData?.startDate ? formData?.startDate?.format() : '',
      endDate: formData?.endDate ? formData?.endDate?.format() : '',
    };
    const error = await joiValidate(validatePayload, t);
    if (error && Object.keys(error).length) {
      setErrorMessages(error);
      return;
    }
    if (dayjs(formData?.endDate).isBefore(dayjs(formData?.startDate))) {
      setErrorMessages({
        endDate: t('obx.payroll.endDateError'),
        startDate: t('obx.payroll.startDateError'),
      });
      return;
    } else {
      setErrorMessages({});
    }
    try {
      setLoading(true);
      const _timezoneOffset = new Date().getTimezoneOffset();
      const convertedDates = appendDefaultStartAndEndTimeWithDates([
        formData?.startDate,
        formData?.endDate,
      ]);
      const startDate = convertedDates[0] ? convertedDates[0] : null;
      const endDate = convertedDates[1] ? convertedDates[1] : null;
      const payload = {
        windowStart: startDate,
        windowEnd: endDate,
      };

      const response = await exportReportsService(payload, { responseType: 'arraybuffer' });

      const extension = fileExtension?.toLowerCase();
      const mimeTypes = {
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        xls: 'application/vnd.ms-excel',
        csv: 'text/csv;charset=utf-8;',
      };
      const blobType = mimeTypes[extension] || 'application/octet-stream';
      const blobSource = new Blob([response], {
        type: blobType,
      });
      if (response) {
        const fileName = `${fileNamePrefix}${formatDayjsDateTime({
          formatType: dayjsFormatsEnum.dateTime,
        })}.${fileExtension}`;

        downloadFileFromResponse(blobSource, fileName);

        setTimeout(() => {
          setFormData(initialFormdata);
          setErrorMessages(null);
          onClose();
          setLoading(false);
        }, 100);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const addSelectedHoursBody = (
    // inside addSelectedHoursBody
    <Box className={classes.rejectModal}>
      <Box className={classes.rejectModalInner}>
        <DownloadCloud />
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('links.exportData') || 'Export Data'}
        </Typography>
        <Typography className={classes.subText} variant="subtitle2">
          {t('commonText.exportDescription') || 'Select the date range to export data'}
        </Typography>

        <Box className={classes.inlinefield}>
          <Box>
            <ResponsiveDatePickers
              label={t('obx.payroll.from')}
              value={formData?.startDate || null}
              // format="MM/DD/YYYY"
              // inputFormat="MM/DD/YYYY"
              maxDate={dayjs()}
              onChange={(value) => {
                const isValidDate = !isNaN(value?.['$d']);
                setFormData((s) => ({ ...s, startDate: isValidDate ? value : null }));
              }}
              error={!!errorMessages?.startDate}
              helperText={errorMessages && errorMessages?.startDate}
            />
          </Box>
          <Box>
            <ResponsiveDatePickers
              label={t('obx.payroll.to')}
              value={formData?.endDate || null}
              format="MM/DD/YYYY"
              // inputFormat="MM/DD/YYYY"
              maxDate={dayjs()}
              onChange={(value) => {
                const isValidDate = !isNaN(value?.['$d']);
                setFormData((s) => ({ ...s, endDate: isValidDate ? value : null }));
              }}
              error={!!errorMessages?.endDate}
              helperText={errorMessages && errorMessages?.endDate}
            />
          </Box>
        </Box>
      </Box>
      {/* Footer */}
      <Box className={classes.rejectModalActions}>
        <Button disabled={loading} variant="secondaryGrey" onClick={handleCancel}>
          {t('links.cancel')}
        </Button>
        <Button disabled={loading} variant="primary" onClick={handleSubmit}>
          {t('links.export') || 'Export'}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={handleCancel} body={addSelectedHoursBody} />;
};

ExportReportModel.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  refetchPayroll: PropTypes.func,
  isPatrol: PropTypes.bool,
  fileNamePrefix: PropTypes.string,
  exportReportsService: PropTypes.func,
  fileExtension: PropTypes.string,
};

ExportReportModel.defaultProps = {
  open: false,
  onClose: () => {},
  refetchPayroll: () => {},
  isPatrol: false,
  fileNamePrefix: 'SiteSummaryReports',
  exportReportsService: exportReports,
  fileExtension: 'csv',
};

export default ExportReportModel;
