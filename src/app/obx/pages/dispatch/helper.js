import { useLabels } from 'src/hooks/updateObjectLabelsHook';

import { dayjsWithStandardOffset } from '../schedules/helper';

export const stateToQueryParams = (obj, key) => {
  if (Array.isArray(obj[key])) {
    return obj[key].map((item) => item.value);
  } else if (typeof obj[key] === 'object' && obj[key] !== null && 'value' in obj[key]) {
    return obj[key].value;
  }
  return obj[key];
};

export const getTimeElapsed = (optionValue) => {
  const now = dayjsWithStandardOffset();
  const timeRanges = {
    'upto-10': [10, 0],
    '10-30': [30, 10],
    '30-60': [60, 30],
    more_than_1_hour: [60 * 24, 60],
  };
  if (timeRanges[optionValue]) {
    const [fromMinutes, toMinutes] = timeRanges[optionValue];
    return [
      dayjsWithStandardOffset(now.valueOf() - fromMinutes * 60 * 1000).toISOString(),
      dayjsWithStandardOffset(now.valueOf() - toMinutes * 60 * 1000).toISOString(),
    ];
  }
  return [];
};

// Create Dispatch - Hardcoded Options for Dispatch Type Dropdown
export const dispatchTypeOptions = [
  { value: 'alarmResponse', label: 'Alarm Response' },
  { value: 'newAlarm', label: 'New Alarm' },
];

// Create Dispatch - Hardcoded Options for Caller Request Officer Call Back
export const callerRequestOfficerCallBackOptions = (t) => [
  { value: true, label: t('obx.dispatch.callerRequestOfficerOption.yes') },
  { value: false, label: t('obx.dispatch.callerRequestOfficerOption.no') },
];

// Create Dispatch - Hardcoded Options for Call from Monitoring Service Type
export const callFromMonitoringServiceTypeOptions = (t) => [
  { value: 'N/A', label: t('obx.dispatch.monitoringService.noService') },
  {
    value: 'MapCommunications(SpanishSpeaking)',
    label: t('obx.dispatch.monitoringService.mapCommunications'),
  },
  { value: 'RSPNDR', label: t('obx.dispatch.monitoringService.rspndr') },
  { value: 'securitas', label: t('obx.dispatch.monitoringService.securitas') },
  { value: 'stealthMonitoring', label: t('obx.dispatch.monitoringService.stealthMonitoring') },
  { value: 'stMoritz', label: t('obx.dispatch.monitoringService.stMoritz') },
  { value: 'verisure', label: 'Verisure' },
];

export const useCallFromMonitoringServiceTypeOptions = (t) =>
  useLabels(
    callFromMonitoringServiceTypeOptions(t),
    'tenantConfigs.labels.monitoring_service_type',
    'value',
  );

export const monitoringServiceTypeEnum = (t) =>
  callFromMonitoringServiceTypeOptions(t).reduce((acc, current) => {
    const value = { [current.value]: current.label };
    return { ...acc, ...value };
  }, {});

export const dispatchRequestTypeOptions = [
  { label: 'All', value: 'all' },
  { label: 'Ticket', value: 'ticket' },
  { label: 'Dispatch', value: 'dispatch' },
];
