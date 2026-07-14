import { Box, InputLabel } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { DownloadCloud } from 'src/assets/svg';
import { exportOfficerWorklogCSV, exportReconcilationReport } from 'src/services/payroll.services';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { appendDefaultStartAndEndTimeWithDates } from '../../../schedules/helper';
import { useStyles } from './exportWorklogModal';

const initialFormdata = {
  startDate: '',
  endDate: '',
};

const ExportWorkLogModal = ({ open, onClose, isPatrol, isHoExport }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState(initialFormdata);
  const [errorMessages, setErrorMessages] = useState(null);
  const csvRef = useRef(null);
  const [csvPayload, setCSVPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { name: franchiseName } = useSelector((store) => store.auth?.franchiseInfo);
  const [selectedDates, setSelectedDates] = useState([]);

  const convertLfToCrlf = (data) => {
    const csvRows = data?.map((row) => row.join(','));
    return csvRows?.join('\r\n');
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
      const convertedDates = appendDefaultStartAndEndTimeWithDates([
        formData?.startDate,
        formData?.endDate,
      ]);
      const startDate = convertedDates[0] ? convertedDates[0] : null;
      const endDate = convertedDates[1] ? convertedDates[1] : null;

      // Setting the dates for naming the CSV
      setSelectedDates([
        formData?.startDate?.format('MM/DD/YYYY'),
        formData?.endDate?.format('MM/DD/YYYY'),
      ]);

      const payload = {
        windowStart: startDate,
        windowEnd: endDate,
      };

      if (isPatrol) payload.isPatrol = true;

      const response = isHoExport
        ? await exportOfficerWorklogCSV(payload)
        : await exportReconcilationReport(payload);

      if (response && response?.statusCode === 200) {
        const crlfCSVPayload = convertLfToCrlf(response?.data);
        setCSVPayload(crlfCSVPayload);
        setTimeout(() => {
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
  // Added this function to replace the forward slash with the unicode fraction slash
  const formatFilenameDate = (dateString = '') => {
    return dateString?.replace(/\//g, '⁄');
  };

  useEffect(() => {
    if (csvPayload) {
      csvRef?.current?.link?.click();
      toaster.success({
        text: t('obx.payroll.exportWorklogSuccess'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  }, [csvPayload]);

  const addSelectedHoursBody = (
    <Box className={classes.rejectModal}>
      <CSVLink
        filename={`${franchiseName} - Employee Worklogs [${formatFilenameDate(selectedDates[0])} - ${formatFilenameDate(selectedDates[1])}]`}
        ref={csvRef}
        data={csvPayload || []}
      ></CSVLink>

      <Box className={classes.rejectModalInner}>
        <DownloadCloud />
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {isHoExport
            ? t('obx.payroll.exportOfficerWorkLogsHo')
            : t('obx.payroll.exportOfficerWorklogs')}
        </Typography>
        <Typography className={classes.subText} variant="subtitle2">
          {t('obx.payroll.exportWorkLogText')}
        </Typography>

        <Box className={classes.inlinefield}>
          <Box>
            <InputLabel>
              {t('obx.payroll.from')} <RequiredAsterik />
            </InputLabel>
            <ResponsiveDatePickers
              placeholder="12/24/2023"
              value={formData?.startDate || null}
              format="MM/DD/YYYY"
              inputFormat="MM/DD/YYYY"
              onChange={(value) => {
                const isValidDate = !isNaN(value['$d']);
                if (isValidDate)
                  setFormData((prevState) => ({
                    ...prevState,
                    startDate: value,
                  }));
                else
                  setFormData((prevState) => ({
                    ...prevState,
                    startDate: null,
                  }));
              }}
              error={!!errorMessages?.startDate}
              helperText={errorMessages && errorMessages?.startDate}
            />
          </Box>

          <Box>
            <InputLabel>
              {t('obx.payroll.to')} <RequiredAsterik />
            </InputLabel>
            <ResponsiveDatePickers
              placeholder="12/24/2023"
              value={formData?.endDate || null}
              format="MM/DD/YYYY"
              inputFormat="MM/DD/YYYY"
              onChange={(value) => {
                const isValidDate = !isNaN(value['$d']);
                if (isValidDate)
                  setFormData((prevState) => ({
                    ...prevState,
                    endDate: value,
                  }));
                else
                  setFormData((prevState) => ({
                    ...prevState,
                    endDate: null,
                  }));
              }}
              error={!!errorMessages?.endDate}
              helperText={errorMessages && errorMessages?.endDate}
              maxDate={dayjs()}
            />
          </Box>
        </Box>
        {/* <Typography variant="info" className={classes.subText}>
          <Typography className={classes.Boldtext}>{t('obx.payroll.disclaimer')}</Typography>{' '}
          {t('obx.payroll.disclaimerTextExport')}
        </Typography> */}
      </Box>
      <Box className={classes.rejectModalActions}>
        <Button disabled={loading} variant="secondaryGrey" onClick={onClose}>
          {t('obx.payroll.cancel')}
        </Button>
        <Button disabled={loading} variant="primary" onClick={handleSubmit}>
          {isHoExport
            ? t('obx.payroll.exportOfficerWorkLogsHo')
            : t('obx.payroll.exportOfficerWorklogs')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addSelectedHoursBody} />;
};

ExportWorkLogModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  refetchPayroll: PropTypes.func,
  isPatrol: PropTypes.bool,
  isHoExport: PropTypes.bool,
};

ExportWorkLogModal.defaultProps = {
  open: false,
  onClose: () => {},
  refetchPayroll: () => {},
  isPatrol: false,
  isHoExport: false,
};

export default ExportWorkLogModal;
