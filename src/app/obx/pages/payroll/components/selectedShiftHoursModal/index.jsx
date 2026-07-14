import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { ReactComponent as FeaturedIcon } from 'src/assets/svg/FeaturedIcon.svg?react';

import { useStyles } from './selectedShiftHoursModal.styles';

const SelectedShiftHours = ({ open, onClose, onSave, loading }) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const addSelectedHoursBody = (
    <Box className={classes.rejectModal}>
      <FeaturedIcon />
      <Box className={classes.rejectModalContent}>
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('obx.payroll.approveSelected')}
        </Typography>
        <Typography className={classes.subText} variant="subtitle2">
          {' '}
          {t('obx.payroll.approveSelectedText')}
        </Typography>
      </Box>

      <Box className={classes.rejectModalActions}>
        <Button variant="secondaryGrey" onClick={onClose} disabled={loading}>
          {t('obx.payroll.cancel')}
        </Button>
        <Button variant="primary" onClick={onSave} disabled={loading}>
          {t('obx.payroll.approveLock')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addSelectedHoursBody} />;
};

SelectedShiftHours.propTypes = {
  open: PropTypes.bool,
  loading: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
};

export default SelectedShiftHours;
