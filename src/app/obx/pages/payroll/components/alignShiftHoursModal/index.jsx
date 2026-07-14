import LoadingButton from '@mui/lab/LoadingButton';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { Trans, useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { ReactComponent as BlueEditPencilIcon } from 'src/assets/svg/edit-bg.svg?react';

import { useStyles } from './alignShiftHoursModal.styles';

const AlignShiftHoursModal = ({ open, onClose, onSave, loading, count }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const handleModalClose = () => {
    if (loading) return;
    onClose();
  };

  const alignHoursBody = (
    <Box className={classes.rejectModal}>
      <BlueEditPencilIcon />
      <Box className={classes.rejectModalContent}>
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {t('obx.payroll.alignApprovedHoursTitle')}
        </Typography>
        <Typography className={classes.subText} variant="subtitle2" component="p">
          <Trans
            i18nKey="obx.payroll.alignApprovedHoursDescription"
            values={{ count }}
            components={{ b: <b /> }}
          />
        </Typography>
      </Box>

      <Box className={classes.rejectModalActions}>
        <Button variant="secondaryGrey" onClick={handleModalClose} disabled={loading}>
          {t('links.cancel')}
        </Button>
        <LoadingButton variant="primary" loading={loading} onClick={onSave}>
          {t('obx.payroll.alignApprovedHoursCta', { count })}
        </LoadingButton>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={handleModalClose} body={alignHoursBody} />;
};

AlignShiftHoursModal.propTypes = {
  open: PropTypes.bool,
  loading: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  count: PropTypes.number,
};

export default AlignShiftHoursModal;
