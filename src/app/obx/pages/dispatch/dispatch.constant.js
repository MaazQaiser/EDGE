import { ReactComponent as AssignedIcon } from 'src/assets/svg/AssignedIcon.svg?react';
import { ReactComponent as CallReceivedIcon } from 'src/assets/svg/CallReceivedIcon.svg?react';
import { ReactComponent as DispacthClosedIcon } from 'src/assets/svg/DispacthClosedIcon.svg?react';
import { ReactComponent as incidentToReportIcons } from 'src/assets/svg/incidentToReportIcons.svg?react';
import { ReactComponent as NewAlramIcon } from 'src/assets/svg/NewAlramIcon.svg?react';
import { ReactComponent as OnSiteAllClearIcon } from 'src/assets/svg/OnSiteAllClearIcon.svg?react';
import { ReactComponent as OnSiteIcon } from 'src/assets/svg/OnSiteIcon.svg?react';
import { ReactComponent as OnTheWayIcon } from 'src/assets/svg/OnTheWayIcon.svg?react';
import { ReactComponent as ReportCompletedIcon } from 'src/assets/svg/ReportCompletedIcon.svg?react';

export const DISPATCH_STATUS_ENUM = (t) => ({
  unassigned: {
    label: t('obx.dispatch.statusFilter.unassigned'),
    value: 'unassigned',
    color: 'primary',
    statusClass: '',
    icon: '',
  },
  assigned: {
    statusClass: 'assigned',
    label: t('obx.dispatch.statusFilter.assigned'),
    value: 'assigned',
    color: 'primary',
    icon: AssignedIcon,
  },
  new_alarm: {
    label: t('obx.dispatch.statusFilter.newAlarm'),
    value: 'new_alarm',
    color: 'error',
    icon: NewAlramIcon,
    statusClass: 'newAlarm',
  },
  call_received: {
    label: t('obx.dispatch.statusFilter.callReceived'),
    value: 'call_received',
    color: 'success',
    icon: CallReceivedIcon,
    statusClass: 'callReceived',
  },
  acknowledged: {
    statusClass: 'acknowledged',
    label: t('obx.dispatch.statusFilter.acknowledged'),
    value: 'acknowledged',
    color: 'info',
    icon: NewAlramIcon,
  },
  on_the_way: {
    statusClass: 'onTheWay',
    label: t('obx.dispatch.statusFilter.onTheWay'),
    value: 'on_the_way',
    color: 'error',
    icon: OnTheWayIcon,
  },
  on_site: {
    statusClass: 'onSite',
    label: t('obx.dispatch.statusFilter.onSite'),
    color: 'error',
    value: 'on_site',
    icon: OnSiteIcon,
  },
  on_site_all_clear: {
    statusClass: 'onSiteAllClear',
    label: t('obx.dispatch.statusFilter.onSiteAllClear'),
    value: 'on_site_all_clear',
    color: 'success',
    icon: OnSiteAllClearIcon,
  },
  incident_to_report: {
    statusClass: 'incidentToReport',
    label: t('obx.dispatch.statusFilter.incidentToReport'),
    color: 'error',
    value: 'incident_to_report',
    icon: incidentToReportIcons,
  },
  completed: {
    statusClass: 'reportCompleted',
    label: t('obx.dispatch.statusFilter.completed'),
    value: 'completed',
    color: 'success',
    icon: ReportCompletedIcon,
  },
  close: {
    statusClass: 'close',
    label: t('obx.dispatch.statusFilter.closed'),
    value: 'close',
    color: 'info',
    icon: DispacthClosedIcon,
  },
});

export const TIME_ELAPSED_OPTIONS = (t) => [
  {
    label: t('obx.dispatch.timeElapsedOptions.all'),
    value: '',
  },
  {
    label: t('obx.dispatch.timeElapsedOptions.upTo10Mins'),
    value: 'upto-10',
  },
  {
    label: t('obx.dispatch.timeElapsedOptions.10to30'),
    value: '10-30',
  },
  {
    label: t('obx.dispatch.timeElapsedOptions.30to60'),
    value: '30-60',
  },
  {
    label: t('obx.dispatch.timeElapsedOptions.moreThan1Hour'),
    value: 'more_than_1_hour',
  },
];

export const SHIFT_TIME_OPTIONS = (t) => [
  {
    label: t('obx.dispatch.shiftTime.oneHour'),
    value: 60,
  },
  {
    label: t('obx.dispatch.shiftTime.twoHours'),
    value: 120,
  },
  {
    label: t('obx.dispatch.shiftTime.fourHours'),
    value: 240,
  },
  {
    label: t('obx.dispatch.shiftTime.sixHours'),
    value: 360,
  },
  {
    label: t('obx.dispatch.shiftTime.eightHours'),
    value: 480,
  },
  {
    label: t('obx.dispatch.shiftTime.tenHours'),
    value: 600,
  },
  {
    label: t('obx.dispatch.shiftTime.twelveHours'),
    value: 720,
  },
];

export const DISPATCH_STATUS_OPTIONS = (t) =>
  Object.keys(DISPATCH_STATUS_ENUM(t)).map((key) => ({
    value: key,
    label: DISPATCH_STATUS_ENUM(t)?.[key].label,
  }));

export const DEFAULT_CENTER = {
  lat: 40.7128,
  lng: -74.006,
};

export const STATUS_FILTER_DATA_DISPATCH = (t) => [
  { value: 'all', label: t('obx.schedules.filters.status.all'), hideOptionsForTabs: [] },
  {
    value: 'inProgress',
    label: t('obx.schedules.filters.status.inProgress'),
    hideOptionsForTabs: [3],
  },
  {
    value: 'notStarted',
    label: t('obx.schedules.filters.status.notStarted'),
    hideOptionsForTabs: [3],
  },
  {
    value: 'upcoming',
    label: t('obx.schedules.calendar.scheduleStatus.upComing'),
    hideOptionsForTabs: [3],
  },
  {
    value: 'available',
    label: t('dispatchStatus.available'),
    hideOptionsForTabs: [1, 2],
  },
  {
    value: 'clockedIn',
    label: t('dispatchStatus.clockedIn'),
    hideOptionsForTabs: [1, 2],
  },
];
