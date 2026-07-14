import { Avatar, Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogsSkeleton from 'src/app/components/common/skeletonLoader/logsSkeleton';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { Clossicon } from 'src/assets/svg';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { getActivityLogsByPatrolId } from 'src/services/runsheet.services';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './ActivityLogsDrawer';

const PatrolActions = {
  CREATED: 'Runsheet Created',
  HIT_ADDED: 'added a hit',
  HIT_DELETED: 'deleted a hit',
  SEQUENCE_CHANGED: 'changed the sequence',
  START_END_LOCATION_UPDATED: 'Starting & ending point updated',
  START_END_TIME_UPDATED: 'Runsheet start/end time updated',
  RUNSHEET_START_END_TIME_UPDATED: 'Runsheet start/end time updated',
};

function translatePatrolAction(action) {
  if (!action) return null;

  // Dynamic duplicate runsheet handling
  const duplicateMatch = action.match(/^Duplicate Runsheet created for (.+)$/i);

  if (duplicateMatch) {
    const days = duplicateMatch[1]
      .split(',')
      .map((day) => day.trim().toLowerCase())
      .join(', ');

    return {
      key: 'createdDuplicateRunsheet',
      days,
    };
  }

  const actionMap = {
    [PatrolActions.CREATED]: { key: 'created' },
    [PatrolActions.HIT_ADDED]: { key: 'hitAdded' },
    [PatrolActions.HIT_DELETED]: { key: 'hitDeleted' },
    [PatrolActions.SEQUENCE_CHANGED]: { key: 'sequenceChanged' },
    [PatrolActions.START_END_LOCATION_UPDATED]: { key: 'startEndLocationUpdated' },
    [PatrolActions.START_END_TIME_UPDATED]: { key: 'startEndTimeUpdated' },
    [PatrolActions.RUNSHEET_START_END_TIME_UPDATED]: { key: 'startEndTimeUpdated' },
  };

  return actionMap[action] || { key: action };
}

const ActivityLogDrawer = ({ setShowDrawer, patrolTemplateId }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const { formatDayjsDateTime } = useDateTime();

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const [activityLogsLoading, setActivityLogsLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchActivityLogs = async () => {
    try {
      const response = await getActivityLogsByPatrolId(patrolTemplateId);
      if (response.statusCode === 200) {
        setData(response?.data || []);
      }
      setActivityLogsLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setActivityLogsLoading(false);
    }
  };

  useEffect(() => {
    if (patrolTemplateId) {
      fetchActivityLogs();
    }
  }, [patrolTemplateId]);

  return (
    <Box className={classes.activityDrawer}>
      <Box className={classes.drawerHeader}>
        <Typography variant="h2">{t('obx.runsheet.activityLogs')}</Typography>
        <Button
          className={classes.cancelIcon}
          disableRipple
          variant="onlyText"
          onClick={() => {
            closeDrawer();
          }}
        >
          <Clossicon />
        </Button>
      </Box>

      <Box className={classes?.drawerInner}>
        {activityLogsLoading ? (
          <LogsSkeleton noOfRows={8} />
        ) : data?.length > 0 ? (
          data.map((item, index) => (
            <Box key={index} className={classes.activityBox}>
              <Box>
                <Avatar className={classes.eventAvatar} src={item.image} />
              </Box>
              <Box>
                <Typography variant="body2">
                  {item.username}{' '}
                  <Box
                    component={'span'}
                    sx={{
                      textTransform: [
                        PatrolActions.CREATED,
                        PatrolActions.START_END_LOCATION_UPDATED,
                      ].includes(item.action)
                        ? 'none'
                        : 'lowercase',
                    }}
                  >
                    {t(`obx.runsheet.actions.${translatePatrolAction(item.action)?.key}`, {
                      runsheet: getLabel('terms', 'runsheet', t),
                      hit: getLabel('terms', 'hit', t),
                      days: translatePatrolAction(item.action)?.days,
                    })}
                  </Box>
                </Typography>
                <Typography variant="body3">{item.siteName}</Typography>
                <Typography variant="body3">
                  {formatDayjsDateTime({
                    value: item?.time,
                    formatType: dayjsFormatsEnum.dateTime,
                  })}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Box className={classes.dutyDetailLogsCentered}>
            <NoRecordFound type="listing" data={[]} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

ActivityLogDrawer.propTypes = {
  setShowDrawer: PropTypes.func,
  patrolTemplateId: PropTypes.number,
};

export default ActivityLogDrawer;
