import { Avatar, Box, Chip, Skeleton, Tooltip, Typography } from '@mui/material';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';

// import usePersistentApiData from 'src/hooks/usePresistantApiData';
// import { getDispatchTypes } from 'src/services/dispatch.services';
import { DISPATCH_STATUS_ENUM } from '../../../dispatch/dispatch.constant';
import { getTimeDiff, getTimeDiffWithFormat } from '../../../schedules/helper';
import { useStyles } from './NewRunsheetHit';
const showTimeElapsedWarning = (dispatch, t) => {
  return (
    getTimeDiff(dispatch?.createdAt, new Date(), 'minute') > dispatch?.threshold &&
    dispatch?.status === DISPATCH_STATUS_ENUM(t).assigned.value
  );
};
const NewRunsheetHit = ({ fetchingHitLoading, hitDetails }) => {
  const classes = useStyles();
  const { formatDayjsDateTime } = useDateTime();
  // const { data: DISPATCH_TYPE_ENUM } = usePersistentApiData('dispatch-types', getDispatchTypes);

  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const NA = t('commonText.nA');

  const renderLog = (log) => {
    const Icon = DISPATCH_STATUS_ENUM(t)?.[log?.status]?.icon;
    return (
      <Box key={log.id} className={classes.activityBox}>
        <Box>
          {Icon ? (
            <Box className={classes.eventIcon}>
              <Icon />
            </Box>
          ) : (
            <Avatar className={classes.eventAvatar} src="/static/images/avatar/1.jpg" />
          )}
        </Box>
        <Box>
          <Typography variant="body2">
            {DISPATCH_STATUS_ENUM(t)?.[log?.status]?.label || log?.status}
          </Typography>
          <Typography variant="body3">
            {formatDayjsDateTime({
              value: log.datetime,
              formatType: dayjsFormatsEnum.dateTime,
            })}
          </Typography>
        </Box>
      </Box>
    );
  };
  const warning = showTimeElapsedWarning(hitDetails, t);
  return fetchingHitLoading ? (
    <Box className={classes.hitCardWrapper}>
      <Box className={classes.hitSkeleton}>
        <Skeleton />
      </Box>
      <Box className={classes.hitSkeleton}>
        <Skeleton />
      </Box>
      <Box className={classes.hitSkeleton}>
        <Skeleton />
      </Box>
      <Box className={classes.hitSkeleton}>
        <Skeleton />
      </Box>
    </Box>
  ) : (
    <Box className={classes.dipacthDetails}>
      <Box className={classes.dipatchInfoRow}>
        <Box className={classes.dipatchRowBox}>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.id', { dispatch: getLabel('terms', 'dispatch', t) })}`}
            </Typography>
            <Typography variant="subtitle2" className={classes.textDetail}>
              {hitDetails?.uuid}
            </Typography>
          </Box>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.dispatchType', { dispatch: getLabel('terms', 'dispatch', t) })}`}
            </Typography>
            <Typography variant="subtitle2" className={classes.textDetail}>
              {hitDetails?.dispatchType || NA}
            </Typography>
          </Box>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.status')}`}
            </Typography>

            <Chip
              label={DISPATCH_STATUS_ENUM(t)?.[hitDetails?.status]?.label || hitDetails?.status}
              color={DISPATCH_STATUS_ENUM(t)?.[hitDetails?.status]?.color}
              className={classes.textLabelChip}
            />
          </Box>
        </Box>
        <Box className={classNames(classes.dipatchRowBox, classes.dipatchRowDateFull)}>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.timeElapsed')}`}
            </Typography>
            {warning ? (
              <Tooltip
                title={`${t('obx.dispatch.alertsMRTsTooltip', { dispatch: getLabel('terms', 'dispatch', t).toLowerCase(), officer: getLabel('roles', 'officer', t).toLowerCase() })}`}
                arrow
              >
                <Chip
                  label={getTimeDiffWithFormat(hitDetails?.createdAt, new Date())}
                  className={classes.pulseAnimation}
                />
              </Tooltip>
            ) : (
              <Chip
                label={getTimeDiffWithFormat(hitDetails?.createdAt, new Date())}
                className={classes.textLabelChip}
              />
            )}
          </Box>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.createdBy')}`}
            </Typography>
            <Typography variant="subtitle2" className={classes.textDetail}>
              {hitDetails?.createdBy || NA}
            </Typography>
          </Box>
          <Box className={classes.dipatchRowDate}></Box>
        </Box>
      </Box>
      <Box className={classes.space}></Box>
      <Box className={classes.dipatchInfoRow}>
        <Box className={classes.dipatchRowBox}>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.callerPhoneNo')}`}
            </Typography>
            <Typography variant="subtitle2" className={classes.textDetail}>
              {hitDetails?.callerDetail?.phoneNo || NA}
            </Typography>
          </Box>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.callerName')}`}
            </Typography>
            <Typography variant="subtitle2" className={classes.textDetail}>
              {hitDetails?.callerDetail?.callerName || NA}
            </Typography>
          </Box>
          <Box className={classes.dipatchRowDate}>
            <Typography variant="body3" className={classes.textLabel}>
              {`${t('obx.dispatch.buildingNumber')}`}
            </Typography>
            <Typography variant="subtitle2" className={classes.textDetail}>
              {hitDetails?.callerDetail?.buildingNumber || NA}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.dipatchRowDateFull}>
          <Typography variant="body3" className={classes.textLabel}>
            {`${t('obx.dispatch.callerAddress')}`}
          </Typography>
          <Typography variant="subtitle2" className={classes.textDetail}>
            {hitDetails?.callerDetail?.address || NA}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.space}></Box>
      <Box className={classes.dipatchInfoRow}>
        <Box className={[classes.dipatchRowDateFull, classes.dipatchRowDate]}>
          <Typography variant="h5" className={classes.textDetail}>
            {`${t('obx.dispatch.callDescription')}`}
          </Typography>
          <Typography variant="body3" className={classes.textDetail}>
            <Box
              dangerouslySetInnerHTML={{
                __html: hitDetails?.callerDetail?.description || NA,
              }}
            />
          </Typography>
        </Box>
      </Box>
      <Box className={classes.space}></Box>
      <Typography variant="h4" className={classes.intabHeading}>
        {`${t('obx.dispatch.dispatchLogs', {
          dispatch: getLabel('terms', 'dispatch', t),
        })}`}
      </Typography>
      <Box className={classes.activityBoxs}>
        {!hitDetails?.logs?.length ? (
          <Box className={classes.notRecordFounWrapper}>
            <Box className={classes.noRecordFound}>
              <NoDataIcon />
              <Typography variant="h6">{t('commonText.table.noRecordFound')}</Typography>
            </Box>
          </Box>
        ) : (
          hitDetails?.logs.map((log) => renderLog(log))
        )}
      </Box>
    </Box>
  );
};

export default NewRunsheetHit;

NewRunsheetHit.propTypes = {
  hitDetails: PropTypes.object,
  fetchingHitLoading: PropTypes.bool,
};
