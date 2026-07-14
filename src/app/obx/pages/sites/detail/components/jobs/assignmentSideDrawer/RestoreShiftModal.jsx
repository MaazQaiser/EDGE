import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';
import { ReactComponent as RestoreShiftIcon } from 'assets/svg/restoreShift.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './assignmentSideDrawer.styles';

const RestoreShiftModal = ({ open = false, onClose = () => {}, onConfirm = () => {} }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (open) {
      setIsRestoring(false);
    }
  }, [open]);

  const handleClose = () => {
    if (!isRestoring) {
      onClose?.();
    }
  };

  const handleConfirm = async () => {
    if (isRestoring) return;

    setIsRestoring(true);
    try {
      const isSuccess = await onConfirm?.();
      if (!isSuccess) {
        setIsRestoring(false);
      }
    } catch {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="body"
      PaperProps={{
        className: classes.cancelShiftDialogPaper,
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        <Box className={classes.cancelShiftHeaderRow}>
          <RestoreShiftIcon />
          <Box>
            <Typography variant="h3" className={classes.cancelShiftTitle}>
              {t('obx.schedules.restoreShiftModal.title')}
            </Typography>
            <Typography variant="body2" className={classes.cancelShiftSubtitle}>
              {t('obx.schedules.restoreShiftModal.subtitle')}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.cancelShiftActions}>
          <Button variant="secondaryGrey" onClick={handleClose} disabled={isRestoring}>
            {t('obx.schedules.restoreShiftModal.close')}
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={isRestoring}>
            {t('obx.schedules.restoreShiftModal.confirm')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

RestoreShiftModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default RestoreShiftModal;
