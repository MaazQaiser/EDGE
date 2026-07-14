import { Box, InputLabel } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { ReactComponent as CsvDownaloadIcon } from 'src/assets/svg/CsvDownaloadIcon.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './downloadPayrollModal';

const DownloadPayrollModal = ({ open, onClose }) => {
  const classes = useStyles();

  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const addSelectedHoursBody = (
    <Box className={classes.rejectModal}>
      <Box className={classes.innerContent}>
        <CsvDownaloadIcon />
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('obx.lockedPayruns.downloadOfficersPayroll', {
            officers: getLabel('terms', 'officers', t),
          })}
        </Typography>
        <Box className={classes.onecols}>
          <InputLabel>
            {t('obx.lockedPayruns.selectDateRange')} <RequiredAsterik />
          </InputLabel>
          <DateRangePickerWithButtons />
        </Box>
      </Box>
      <Box className={classes.rejectModalActions}>
        <Button variant="secondaryGrey" onClick={onClose}>
          {t('obx.lockedPayruns.cancel')}
        </Button>
        <Button variant="primary">{t('obx.lockedPayruns.downloadCSV')}</Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addSelectedHoursBody} />;
};

DownloadPayrollModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default DownloadPayrollModal;
