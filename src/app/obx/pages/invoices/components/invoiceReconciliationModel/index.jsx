import { Box, Checkbox, InputLabel } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { DownloadCloud } from 'src/assets/svg';
import { ReactComponent as Regular } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as Iregular } from 'src/assets/svg/checkbox-checked.svg?react';
import { getHttpRequest } from 'src/helper/axios';
import { PAYROLL_SERVICE } from 'src/services/payroll.services';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { getDateRangeWrtFranchiseTimezone } from '../../../schedules/helper';
import { useStyles } from './invoiceReconciliationModel';

const initialFormdata = {
  startDate: '',
  endDate: '',
  splitShiftsInTwoAtMidnight: true,
};

const ExportInvoiceModel = ({ open, onClose }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState(initialFormdata);
  const [errorMessages, setErrorMessages] = useState(null);
  const csvRef = useRef(null);
  const [csvPayload, _setCSVPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
        endDate: t('obx.invoice.endDateError'),
        startDate: t('obx.invoice.startDateError'),
      });
      return;
    } else {
      setErrorMessages({});
    }
    try {
      setLoading(true);

      const { startDate: windowStartDateWrtFranchise, endDate: windowEndDateWrtFranchise } =
        getDateRangeWrtFranchiseTimezone([formData?.startDate, formData?.endDate]);

      const payload = {
        windowStart: windowStartDateWrtFranchise,
        windowEnd: windowEndDateWrtFranchise,
        enableCuttOffTime: formData?.splitShiftsInTwoAtMidnight,
      };

      const query = queryString.stringify(payload, {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      });

      const response = await getHttpRequest(
        `${PAYROLL_SERVICE}/shiftActivityLog/payrollCSV?${query}`,
      );

      if (response && response?.statusCode === 200) {
        const crlfCSVPayload = convertLfToCrlf(response?.data);
        const blob = new Blob([crlfCSVPayload], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        downloadLocalPDf(url);

        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

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

  const downloadLocalPDf = (url) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoices${dayjs().format('MM_DD_YYYY_hh_mm_a')}.csv`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.log({ e });
    }
  };

  const handleChange = (event) => {
    setFormData((prevState) => ({
      ...prevState,
      [event?.target?.name]: event?.target?.checked,
    }));
  };

  useEffect(() => {
    if (csvPayload) {
      csvRef?.current?.link?.click();
    }
  }, [csvPayload]);

  useEffect(() => {
    if (open) {
      setFormData(initialFormdata);
      setErrorMessages(null);
    }
  }, [open]);

  const addSelectedHoursBody = (
    <Box className={classes.rejectModal}>
      <CSVLink
        filename={`approved_payroll${dayjs().format('MM_DD_YYYY_hh_mm_a')}.csv`}
        ref={csvRef}
        data={csvPayload || []}
      ></CSVLink>

      <Box className={classes.rejectModalInner}>
        <DownloadCloud />
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('obx.invoice.exportInvoice')}
        </Typography>
        <Typography className={classes.subText} variant="subtitle2">
          {t('obx.invoice.exportInvoiceText')}
        </Typography>

        <Box className={classes.inlinefield}>
          <Box>
            <InputLabel>
              {t('obx.invoice.from')} <RequiredAsterik />
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
              {t('obx.invoice.to')} <RequiredAsterik />
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
        <Box className={classes.internalMapBox}>
          <Checkbox
            checked={formData?.splitShiftsInTwoAtMidnight}
            onClick={handleChange}
            name="splitShiftsInTwoAtMidnight"
            icon={<Regular />}
            checkedIcon={<Iregular />}
            className={classes.checkBoxCustom}
          />
          <InputLabel>{t('obx.invoice.splitShiftsInTwoAtMidnight')}</InputLabel>
        </Box>
        <Typography variant="info" className={classes.subText}>
          <Typography className={classes.Boldtext}>{t('obx.invoice.disclaimer')}</Typography>{' '}
          {t('obx.invoice.disclaimerTextExportInvoice')}
        </Typography>
      </Box>
      <Box className={classes.rejectModalActions}>
        <Button
          disabled={loading}
          variant="secondaryGrey"
          onClick={() => {
            setFormData(initialFormdata);
            setErrorMessages(null);
            onClose();
          }}
        >
          {t('obx.invoice.cancel')}
        </Button>
        <Button disabled={loading} variant="primary" onClick={handleSubmit}>
          {t('obx.invoice.export')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addSelectedHoursBody} />;
};

ExportInvoiceModel.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  // refetchPayroll: PropTypes.func,
  // isPatrol: PropTypes.bool,
};

ExportInvoiceModel.defaultProps = {
  open: false,
  onClose: () => {},
};

export default ExportInvoiceModel;
