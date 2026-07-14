import { Avatar, Box, Skeleton, Typography } from '@mui/material';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useDateTime from 'src/hooks/useDateTime';
import { getActivityLogs } from 'src/services/dispatch.services';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './DispatchActivityLogs';

const DispatchActivityLogs = ({ dispatchId }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const result = await getActivityLogs({ model_name: 'Dispatch', model_id: dispatchId });
      setActivities(result.data || []);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setActivities([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    dispatchId && fetchActivityLogs();
  }, [dispatchId]);

  if (loading)
    return (
      <Box className={classes.dispatchSkelton}>
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
        <Skeleton variant="text" height={'50px'} />
      </Box>
    );

  return (
    <>
      <Typography variant="h3" className={classes.intabHeading}>
        {t('obx.schedules.dutyDetail.logs.title')}
      </Typography>
      <Box className={classes.activityDrawer}>
        <Box className={classes?.drawerInner}>
          {activities?.map((activity) => (
            <Box className={classes.activityBox} key={activity.id}>
              <Box>
                <Avatar
                  className={classes.eventAvatar}
                  src={activity?.user.image || '/static/images/avatar/1.jpg'}
                />
              </Box>
              <Box>
                <Typography variant="body2">
                  {activity.change_set?.name || t('commonText.nA')}
                </Typography>
                <Typography variant="body3">
                  {formatDayjsDateTime({
                    value: activity?.timestamp,
                    formatType: dayjsFormatsEnum.dateTime,
                  })}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {!activities?.length && !loading && (
          <Box className={classes.notRecordFounWrapper}>
            <Box className={classes.noRecordFound}>
              <NoDataIcon />
              <Typography variant="h2">{t('commonText.table.noRecordFound')}</Typography>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

DispatchActivityLogs.propTypes = {
  dispatchId: PropTypes.string,
};

export default DispatchActivityLogs;
