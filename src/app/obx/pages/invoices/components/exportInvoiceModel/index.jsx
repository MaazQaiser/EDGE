import { Box, InputLabel } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { DownloadCloud } from 'src/assets/svg';
import { exportInvoices } from 'src/services/invoice.services.js';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from '../invoiceReconciliationModel/invoiceReconciliationModel';

const initialFormdata = {
  startDate: '',
  endDate: '',
};
const dateFormat = 'MM/DD/YYYY';

const ExportInvoiceModel = ({ open, onClose }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState(initialFormdata);
  const [errorMessages, setErrorMessages] = useState(null);
  const csvRef = useRef(null);
  const [csvPayload, _setCSVPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
      const payload = {
        periodStart: formData?.startDate ? formData?.startDate?.format(dateFormat) : '',
        periodEnd: formData?.endDate ? formData?.endDate?.format(dateFormat) : '',
      };

      const response = await exportInvoices(payload, {
        responseType: 'blob',
      });

      const blob = new Blob([response]);

      const url = URL.createObjectURL(blob);

      downloadLocalPDf(url);
      if (response) {
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
      toast.error(error?.message, {
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
          {t('obx.invoice.exportInvoiceButton')}
        </Typography>
        <Typography className={classes.subText} variant="subtitle2">
          {t('obx.invoice.exportText')}
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
          {t('obx.invoice.exportInvoiceButton')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addSelectedHoursBody} />;
};

ExportInvoiceModel.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

ExportInvoiceModel.defaultProps = {
  open: false,
  onClose: () => {},
};

export default ExportInvoiceModel;
