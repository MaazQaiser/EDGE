import { Box, Typography } from '@mui/material';
import { ReactComponent as ChevronRightIcon } from 'assets/svg/chevron-right.svg?react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';

import { dayjsWithStandardOffset } from '../../schedules/helper';
import { useStyles } from '../notifications.styles';

const Notification = ({ notification, reference }) => {
  const classes = useStyles();
  const { formatDayjsDateTime } = useDateTime();
  const history = useHistory();

  const notificationRedirectUrl = notification?.data?.redirectUrl;
  const handleRedirect = () => {
    if (notificationRedirectUrl) {
      history.push(`/${notificationRedirectUrl}`);
    }
  };

  return (
    <Box
      className={`${classes.notificationsMenuItemWrapper} ${
        !notificationRedirectUrl ? classes.notificationItemNoRedirect : ''
      }`}
    >
      <Box
        ref={reference}
        role="button"
        onClick={handleRedirect}
        className={classes.notificationsMenuItem}
      >
        <img src={notification?.iconUrl} className={classes.notificationsMenuItemIcon} />

        <Box className={classes.notificationsMenuItemDetail}>
          <Typography variant="subtitle1" className={classes.notificationsMenuItemTitle}>
            {notification?.title}
          </Typography>
          <Box className={classes.dateWrapper}>
            <Typography variant="body3" className={classes.notificationsMenuItemDate}>
              {dayjsWithStandardOffset(notification?.createdAt).format('MMM DD ')}
              {formatDayjsDateTime({
                value: notification?.createdAt,
                formatType: dayjsFormatsEnum.time,
              })}
            </Typography>
            {notificationRedirectUrl && (
              <Box className={classes.notificationsMenuItemAction}>
                <ChevronRightIcon />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Typography variant="body3" className={classes.notificationsMenuItemText}>
        {notification?.body}
      </Typography>
    </Box>
  );
};

Notification.propTypes = {
  notification: PropTypes.object,
  loading: PropTypes.bool,
  notificationTypeColors: PropTypes.object,
  reference: PropTypes.any,
};

export default Notification;
