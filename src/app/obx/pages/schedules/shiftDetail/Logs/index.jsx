import { Avatar, Box, Typography } from '@mui/material';
import { ReactComponent as DotIcon } from 'assets/svg/dot.svg?react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogsSkeleton from 'src/app/components/common/skeletonLoader/logsSkeleton';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { fetchShiftLogsById } from 'src/services/duty.services';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { LogsAction, SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { useStyles } from './logs.styles';

dayjs.extend(relativeTime);

const Logs = ({ logId, shiftDate, shiftType, name }) => {
  const classes = useStyles();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const getShiftLogsDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchShiftLogsById({ logId, shiftDate });
      if (response?.statusCode === 200) {
        setLoading(false);
        return setLogs(response?.data?.logs || []);
      }
      setLoading(false);
      setLogs([]);
    } catch (error) {
      setLoading(false);
      setLogs([]);
    }
  };

  useEffect(() => {
    getShiftLogsDetail(logId);
  }, []);

  if (loading) {
    return (
      <Box className={classes.dutyDetailLogs}>
        <LogsSkeleton noOfRows={8} />
      </Box>
    );
  }

  return (
    <Box className={classes.dutyDetailLogs}>
      {logs?.length > 0 ? (
        <>
          {logs?.map((log) => (
            <LogItem key={log?.id} log={log} shiftType={shiftType} name={name} />
          ))}
        </>
      ) : (
        <Box className={classes.dutyDetailLogsCentered}>
          <NoRecordFound type="listing" data={logs} />
        </Box>
      )}
    </Box>
  );
};

Logs.propTypes = {
  logId: PropTypes.string,
  shiftDate: PropTypes.string,
  shiftType: PropTypes.string,
  name: PropTypes.string,
};

export default Logs;

const LogItem = ({ log, shiftType, name }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const { formatDayjsDateTime } = useDateTime();

  const getShiftTimeChangeSummary = (key) => {
    const oldTime = log?.oldTime?.[key];
    const newTime = log?.newTime?.[key];

    if (!oldTime || !newTime) return null;

    const format = (value) =>
      formatDayjsDateTime({
        value,
        formatType: dayjsFormatsEnum.dateTime,
      });

    return {
      type: key,
      oldTime: format(oldTime),
      newTime: format(newTime),
    };
  };

  const officerName =
    log?.officer?.name ||
    t('obx.schedules.dutyDetail.logs.defaultOfficerName', {
      officer: getLabel('terms', 'officer', t),
    });
  const actionByName = log?.actionBy?.name || officerName;
  const dedicatedLogShiftName = name || getLabel('terms', 'dedicated', t);
  console.log('dedicatedLogShiftName', dedicatedLogShiftName);
  const dedicatedLogShiftTime =
    log?.oldTime?.start && log?.oldTime?.end
      ? `(${formatDayjsDateTime({
          value: log.oldTime.start,
          formatType: dayjsFormatsEnum.dateTime,
        })}–${formatDayjsDateTime({
          value: log.oldTime.end,
          formatType: dayjsFormatsEnum.dateTime,
        })})`
      : '';

  const vehicleName = log?.vehicle?.name || t('obx.schedules.dutyDetail.logs.defaultVehicleName');
  const hitCancelledSiteName = log?.site?.name;
  const hitCancelledActionBy = log?.officer?.name
    ? t('obx.schedules.dutyDetail.logs.actions.hitCancelledActionBy', {
        name: log.officer.name,
      })
    : '';
  const replaceTermsWithLabels = (text) => {
    if (!text) return '';

    const replacements = {
      Runsheet: getLabel('terms', 'runsheet', t),
      hit: getLabel('terms', 'hit', t),
      tour: getLabel('terms', 'tour', t),
    };

    return Object.entries(replacements).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(key, 'gi'), value),
      text,
    );
  };
  const reportTypesLogsMsgs = {
    equipmentInspection: t(
      'obx.schedules.dutyDetail.logs.actions.reportTypes.equipmentInspection',
      { name: officerName },
    ),
    vehicleInspection: t('obx.schedules.dutyDetail.logs.actions.reportTypes.vehicleInspection', {
      name: officerName,
    }),
    tourReports: t('obx.schedules.dutyDetail.logs.actions.reportTypes.tourReports', {
      name: officerName,
      tour: getLabel('terms', 'tour', t).toLowerCase(),
    }),
    shiftDayEndReport: t('obx.schedules.dutyDetail.logs.actions.reportTypes.shiftDayEndReport', {
      name: officerName,
    }),
    incidentReport: t('obx.schedules.dutyDetail.logs.actions.reportTypes.incidentReport', {
      name: officerName,
    }),
    checkpoints: t('obx.schedules.dutyDetail.logs.actions.reportTypes.checkpoints', {
      name: officerName,
    }),
    dispatch: t('obx.schedules.dutyDetail.logs.actions.reportTypes.dispatch', {
      name: officerName,
      dispatch: getLabel('terms', 'dispatch', t).toLowerCase(),
    }),
    activityReport: t('obx.schedules.dutyDetail.logs.actions.reportTypes.activityReport', {
      name: officerName,
    }),
    reportSubmitted: t('obx.schedules.dutyDetail.logs.actions.reportTypes.reportSubmitted', {
      name: officerName,
    }),
  };
  const logMessage = {
    [LogsAction.BREAK_STARTED]: t('obx.schedules.dutyDetail.logs.actions.breakStarted', {
      name: officerName,
    }),
    [LogsAction.BREAK_ENDED]: t('obx.schedules.dutyDetail.logs.actions.breakEnded', {
      name: officerName,
    }),
    [LogsAction.SHIFT_STARTED]: t(
      shiftType === SCHEDULE_DUTIES.PATROL
        ? 'obx.schedules.dutyDetail.logs.actions.clockedIn'
        : 'obx.schedules.dutyDetail.logs.actions.shiftStarted',
      {
        name: officerName,
      },
    ),
    [LogsAction.SHIFT_ENDED]: t(
      shiftType === SCHEDULE_DUTIES.PATROL
        ? 'obx.schedules.dutyDetail.logs.actions.clockedOut'
        : 'obx.schedules.dutyDetail.logs.actions.shiftEnded',
      {
        name: officerName,
      },
    ),
    [LogsAction.REPORT_SUBMITTED]:
      reportTypesLogsMsgs?.[log?.reportType] || reportTypesLogsMsgs?.reportSubmitted,
    [LogsAction.INCIDENT_REPORT_SUBMITTED]: t(
      'obx.schedules.dutyDetail.logs.actions.incidentReportSubmitted',
      { name: officerName },
    ),
    [LogsAction.TOUR_COMPLETED]: t('obx.schedules.dutyDetail.logs.actions.tourCompleted', {
      name: officerName,
      tour: getLabel('terms', 'tour', t).toLowerCase(),
    }),
    [LogsAction.TOUR_STARTED]: t('obx.schedules.dutyDetail.logs.actions.tourStarted', {
      name: officerName,
      tour: getLabel('terms', 'tour', t).toLowerCase(),
    }),
    [LogsAction.CHECKPOINT_CHECKED]: t('obx.schedules.dutyDetail.logs.actions.checkpointChecked', {
      name: officerName,
    }),
    [LogsAction.CHECKPOINT_COMPLETED]: t(
      'obx.schedules.dutyDetail.logs.actions.checkpointCompleted',
      {
        name: officerName,
      },
    ),
    [LogsAction.NOT_STARTED]: t('obx.schedules.dutyDetail.logs.actions.notStarted', {
      name: officerName,
    }),
    [LogsAction.SHIFT_AUTO_ENDED]: t('obx.schedules.dutyDetail.logs.actions.shiftAutoEnded', {
      name: officerName,
    }),

    [LogsAction.NAVIGATION_STARTED]: t('obx.schedules.dutyDetail.logs.actions.navigationStarted', {
      name: officerName,
    }),
    [LogsAction.NAVIGATION_ENDED]: t('obx.schedules.dutyDetail.logs.actions.navigationEnded', {
      name: officerName,
    }),
    [LogsAction.END_LOC_VISITED]: t('obx.schedules.dutyDetail.logs.actions.endLocationVisited', {
      name: officerName,
    }),
    [LogsAction.NAVIGATION_CANCELLED]: t(
      'obx.schedules.dutyDetail.logs.actions.navigationCancelled',
      {
        name: officerName,
      },
    ),
    [LogsAction.INITIAL_NAVIGATION]: t('obx.schedules.dutyDetail.logs.actions.initialNavigation', {
      name: officerName,
    }),
    [LogsAction.VISIT_ENDED]: t('obx.schedules.dutyDetail.logs.actions.visitEnded', {
      name: officerName,
    }),
    [LogsAction.VISITED_SITE]: t('obx.schedules.dutyDetail.logs.actions.visitedSite', {
      name: officerName,
    }),
    [LogsAction.OFFICER_ASSIGNED]: t('obx.schedules.dutyDetail.logs.actions.officerAssigned', {
      name: officerName,
    }),
    [LogsAction.OFFICER_UNASSIGNED]: t('obx.schedules.dutyDetail.logs.actions.officerUnassigned', {
      name: officerName,
    }),
    [LogsAction.VEHICLE_ASSIGNED]: t('obx.schedules.dutyDetail.logs.actions.vehicleAssigned', {
      name: vehicleName,
    }),
    [LogsAction.VEHICLE_UNASSIGNED]: t('obx.schedules.dutyDetail.logs.actions.vehicleUnassigned', {
      name: vehicleName,
    }),
    [LogsAction.IS_PAYROLL_APPROVED]: t('obx.schedules.dutyDetail.logs.actions.payrollApproved', {
      name: officerName,
    }),
    [LogsAction.AD_HOC_PAYROLL]: t('obx.schedules.dutyDetail.logs.actions.adhocPayrollAdded', {
      name: officerName,
    }),
    [LogsAction.HIT_ADDED]: t('obx.schedules.dutyDetail.logs.actions.hitAdded', {
      name: officerName,
      hit: getLabel('terms', 'hit', t),
    }),
    [LogsAction.HIT_REMOVED]: t('obx.schedules.dutyDetail.logs.actions.hitRemoved', {
      name: officerName,
      hit: getLabel('terms', 'hit', t),
    }),
    [LogsAction.HIT_CANCELLED]: t('obx.schedules.dutyDetail.logs.actions.hitCancelled', {
      site: hitCancelledSiteName,
      hit: getLabel('terms', 'hit', t),
      actionBy: hitCancelledActionBy,
    }),
    [LogsAction.CLOCKED_IN_AGAIN]: t('obx.schedules.dutyDetail.logs.actions.clockedInAgain', {
      name: officerName,
    }),
    [LogsAction.START_TIME_UPDATED]: t('obx.schedules.dutyDetail.logs.actions.shiftTimeUpdated', {
      name: officerName,
      ...getShiftTimeChangeSummary('start'),
      interpolation: { escapeValue: false },
    }),
    [LogsAction.END_TIME_UPDATED]: t('obx.schedules.dutyDetail.logs.actions.shiftTimeUpdated', {
      name: officerName,
      ...getShiftTimeChangeSummary('end'),
      interpolation: { escapeValue: false },
    }),
    [LogsAction.SPLIT_SHIFT]: t('obx.schedules.dutyDetail.logs.actions.splittedTheShift', {
      name: officerName,
      shiftName: log?.name,
      oldTime: `${formatDayjsDateTime({ value: log?.oldTime?.start })}–${formatDayjsDateTime({ value: log?.oldTime?.end })}`,
      interpolation: { escapeValue: false },
    }),
    [LogsAction.DEDICATED_SHIFT_CANCELLED]: t(
      'obx.schedules.dutyDetail.logs.actions.dedicatedShiftCancelled',
      {
        userName: actionByName,
        shiftName: dedicatedLogShiftName,
        shiftTime: dedicatedLogShiftTime,
        reason: (log?.description && String(log.description).trim()) || '—',
        interpolation: { escapeValue: false },
      },
    ),
    [LogsAction.DEDICATED_SHIFT_RESTORED]: t(
      'obx.schedules.dutyDetail.logs.actions.dedicatedShiftRestored',
      {
        userName: actionByName,
        shiftName: dedicatedLogShiftName,
        shiftTime: dedicatedLogShiftTime,
        interpolation: { escapeValue: false },
      },
    ),
  };

  const _logDiscription = {
    [LogsAction.HIT_ADDED]: log?.reassignInfo
      ?.map((a) => {
        return (
          <>
            {a?.siteName} <DotIcon className={classes.dot} /> {getLabel('terms', 'hit', t)}(s){' '}
            {a?.hitCount}
          </>
        );
      })
      .join(', '),
    [LogsAction.HIT_REMOVED]: log?.reassignInfo
      ?.map((a) => {
        return (
          <>
            {a?.siteName} <DotIcon className={classes.dot} /> {getLabel('terms', 'hit', t)}(s){' '}
            {a?.hitCount}
          </>
        );
      })
      .join(', '),
  };

  const isVehicleLog = [LogsAction.VEHICLE_ASSIGNED, LogsAction.VEHICLE_UNASSIGNED].includes(
    log?.action,
  );
  const isDedicatedCancelOrRestoreLog = [
    LogsAction.DEDICATED_SHIFT_CANCELLED,
    LogsAction.DEDICATED_SHIFT_RESTORED,
  ].includes(log?.action);

  const logName = isVehicleLog ? log?.vehicle?.name : log?.officer?.name;
  const avatarSrc = isVehicleLog ? log?.vehicle?.imageUrl : log?.officer?.imageUrl;
  return (
    <Box className={classes.log}>
      <Avatar className={classes.logAvatar} alt={logName} src={avatarSrc}>
        {name?.[0]}
      </Avatar>
      <Box className={classes.logContent}>
        <Box className={classes.logHeader}>
          <Typography variant="subtitle2" className={classes.logTitle}>
            {logMessage?.[log?.action]}
          </Typography>
        </Box>

        {log?.actionBy?.name && !isDedicatedCancelOrRestoreLog ? (
          <Typography variant="body3" className={classes.logTimeName}>
            By {log?.actionBy?.name}
          </Typography>
        ) : null}
        {log?.reassignInfo?.length ? (
          <Typography variant="body3" className={classes.logTimeName}>
            {log?.reassignInfo?.map((a, index) => {
              return (
                <>
                  {a?.siteName} <DotIcon className={classes.dot} /> {getLabel('terms', 'hit', t)}(s){' '}
                  {a?.hitCount} {log?.reassignInfo?.length - 1 == index ? '' : ','}
                </>
              );
            })}
          </Typography>
        ) : null}
        {log?.hitAddedTo && (
          <Typography variant="body3" className={classes.logTimeName}>
            {t('obx.schedules.dutyDetail.logs.actions.hitAddedTo', {
              name: `${replaceTermsWithLabels(log?.hitAddedTo)} - ${dayjsWithStandardOffset(log?.time).format('ddd')}`,
              hit: getLabel('terms', 'hit', t),
            })}
          </Typography>
        )}
        {log?.hitAddedFrom && (
          <Typography variant="body3" className={classes.logTimeName}>
            {t('obx.schedules.dutyDetail.logs.actions.hitAddedFrom', {
              name: `${replaceTermsWithLabels(log?.hitAddedFrom)} - ${dayjsWithStandardOffset(log?.time).format('ddd')}`,
              hit: getLabel('terms', 'hit', t),
            })}
          </Typography>
        )}
        {log?.isVisited === false ? (
          <Typography variant="body3" className={classes.logTimeName}>
            {getLabel('terms', 'hit', t)} Type : Missed {getLabel('terms', 'hit', t)}
          </Typography>
        ) : null}

        {log?.action === LogsAction.SPLIT_SHIFT && log?.splitTimes?.length > 0 && (
          <Typography variant="body3" className={classes.logTime}>
            {t('obx.schedules.dutyDetail.logs.actions.splittedTheShiftContent', {
              name: officerName,
              shiftName: log?.name,
              oldTime: `${formatDayjsDateTime({ value: log?.oldTime?.start })}–${formatDayjsDateTime({ value: log?.oldTime?.end })}`,
              splitDetails: log?.splitTimes
                .map((split, index) => {
                  const start = formatDayjsDateTime({ value: split.start });
                  const end = formatDayjsDateTime({ value: split.end });
                  return index === 0
                    ? `${log?.name} (${start}–${end})`
                    : `Split - ${log?.name} (${start}–${end})`;
                })
                .join(' and '),
              actionTime: formatDayjsDateTime({
                value: log?.time,
                formatType: dayjsFormatsEnum.dateTime,
              }),
              interpolation: { escapeValue: false },
            })}
          </Typography>
        )}

        <Typography variant="body3" className={classes.logTime}>
          {formatDayjsDateTime({ value: log?.time, formatType: dayjsFormatsEnum.dateTime })}
        </Typography>
      </Box>
    </Box>
  );
};

LogItem.propTypes = {
  log: PropTypes.object,
  shiftType: PropTypes.string,
  name: PropTypes.string,
};
