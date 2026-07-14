import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { ReactComponent as UnlockModalIcon } from 'src/assets/svg/UnlockModalIcon.svg?react';

import { useStyles } from './unLockPayrollModal';

const UnLockPayroll = ({ open, onClose }) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const addSelectedHoursBody = (
    <Box className={classes.rejectModal}>
      <UnlockModalIcon />
      <Box className={classes.rejectModalContent}>
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('obx.payroll.unlockPayroll!')}
        </Typography>
        <Typography className={classes.subText} variant="subtitle2">
          {t('obx.payroll.unLockText')}
        </Typography>
      </Box>

      <Box className={classes.rejectModalActions}>
        <Button variant="secondaryGrey" onClick={onClose}>
          {t('obx.payroll.cancel')}
        </Button>
        <Button variant="primary">{t('obx.payroll.unlock')}</Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addSelectedHoursBody} />;
};

UnLockPayroll.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default UnLockPayroll;
