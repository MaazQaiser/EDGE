import { Box, Button, Dialog, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from '../optimizeRoute.styles';

/**
 * Every client the accepted changes would affect, in one list, reviewed once.
 *
 * This is the only place in the product where a scheduling action sends
 * customer-facing mail. That makes it an explicit, checked-by-default control
 * naming exactly who gets contacted — never a silent background send, and never
 * two separate send paths for the same arrival time moving.
 */
const NotifyDialog = ({ open, onClose, notifications, optedOut, onToggle }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.optimize.${key}`, options);

  const selectedCount = notifications.filter((item) => !optedOut.has(item.id)).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box className={classes.notifyDialog}>
        <Box>
          <Typography className={classes.notifyTitle}>{tt('notifyTitle')}</Typography>
          <Typography className={classes.notifySubtitle}>{tt('notifySubtitle')}</Typography>
        </Box>

        <Box className={classes.notifyList}>
          {notifications.map((item) => {
            const checked = !optedOut.has(item.id);

            return (
              <Box
                key={item.id}
                component="label"
                className={classes.notifyRow}
                htmlFor={`notify-${item.id}`}
              >
                <input
                  id={`notify-${item.id}`}
                  type="checkbox"
                  className={classes.checkbox}
                  checked={checked}
                  onChange={() => onToggle(item.id)}
                />
                <Box className={classes.notifyBody}>
                  <Typography className={classes.notifyContact}>{item.contact}</Typography>
                  {/* Says what they will be told, not merely that they will be told. */}
                  <Typography className={classes.notifyReason}>
                    {tt(`notifyReason.${item.reason}`)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {selectedCount < notifications.length && (
          <Box className={classes.notifyWarning}>
            {tt('notifySilent', { count: notifications.length - selectedCount })}
          </Box>
        )}

        <Box className={classes.notifyFooter}>
          <Button disableRipple variant="primary" onClick={onClose}>
            {tt('notifyDone', { count: selectedCount })}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

NotifyDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  notifications: PropTypes.array,
  optedOut: PropTypes.object,
  onToggle: PropTypes.func,
};

export default NotifyDialog;
