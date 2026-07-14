import { Avatar, Box, Dialog, IconButton, Skeleton, Typography } from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useDateTime from 'src/hooks/useDateTime';
import { getReleaseNotificationById } from 'src/services/releaseNotifications.service';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import NotificationStatusChip from '../components/NotificationStatusChip';
import { useStyles } from './styles';

const statusColorMap = {
  sent: 'success',
  draft: 'warning',
  scheduled: 'primary',
};

const SkeletonLoader = ({ classes }) => (
  <>
    <Box className={classes.header}>
      <Skeleton animation="wave" pb={'6px'} variant="rounded" width="60%" height={28} />
    </Box>
    <Box className={classes.bodySkeleton}>
      <Skeleton animation="wave" variant="rounded" width="100%" height={12} />
      <Skeleton animation="wave" variant="rounded" width="90%" height={12} sx={{ mt: 1.5 }} />
      <Skeleton animation="wave" variant="rounded" width="75%" height={12} sx={{ mt: 1.5 }} />
    </Box>
    <Box className={classes.footer}>
      <Skeleton animation="wave" variant="rounded" width={90} height={28} />
      <Skeleton animation="wave" variant="rounded" width={180} height={16} />
    </Box>
  </>
);

SkeletonLoader.propTypes = {
  classes: PropTypes.object.isRequired,
};

const NotificationDetailModal = ({ isOpen, onClose, notificationId }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!notificationId || !isOpen) {
      setNotification(null);
      return;
    }

    const fetchNotification = async () => {
      setLoading(true);
      try {
        const response = await getReleaseNotificationById(notificationId);
        if (response?.statusCode === 200) {
          setNotification(response?.data);
        }
      } catch (error) {
        console.error('Error fetching notification details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [notificationId, isOpen]);

  const title = notification?.title;
  const message = notification?.message;
  const status = notification?.status;
  const createdBy = notification?.createdBy;
  const createdAt = notification?.createdAt;
  const createdByImage = createdBy?.image || '';
  const createdByName = capitalizeFirstLetter(createdBy?.name) || '';
  const formattedDate = createdAt
    ? formatDayjsDateTime({ value: createdAt, formatType: dayjsFormatsEnum.date })
    : '';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
    >
      {loading ? (
        <SkeletonLoader classes={classes} />
      ) : (
        <>
          <Box className={classes.header}>
            <Typography variant="h3" className={classes.title}>
              {capitalizeFirstLetter(title)}
            </Typography>
            <IconButton onClick={onClose} className={classes.closeButton}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box className={classes.body}>
            <Typography variant="info" className={classes.messageText}>
              {message}
            </Typography>
          </Box>

          <Box className={classes.footer}>
            <NotificationStatusChip
              status={status}
              statusColorMap={statusColorMap}
              statusChipClassName={classes.statusChip}
              tooltipPlacement="top"
              tooltipArrow={false}
              scheduledAt={notification?.scheduledAt}
              sentAt={notification?.sentAt}
              triggeredAt={notification?.triggeredAt}
              createdAt={notification?.createdAt}
            />
            <Box className={classes.createdBySection}>
              <Typography variant="body2" className={classes.createdByLabel}>
                {t('obx.notificationRelease.table.columns.createdBy', {
                  defaultValue: 'Created by',
                })}
              </Typography>
              <Avatar className={classes.avatar} src={createdByImage}>
                {createdByName.charAt(0)}
              </Avatar>
              <Typography variant="body2" className={classes.createdByText}>
                {createdByName}
                {formattedDate ? ` at ${formattedDate}` : ''}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Dialog>
  );
};

NotificationDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  notificationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default NotificationDetailModal;
