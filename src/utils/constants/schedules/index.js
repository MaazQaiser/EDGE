import { ACL_OBX_SITE_EXTRA_JOB_CREATE } from 'src/app/router/constant/OBXMODULE';
import userHasPermission from 'src/utils/auth/userHasPermission';

export const TIME_GRID = {
  DAY: 'timeGridDay',
  LIST: 'listMonth',
};
export const DAY_GRID = {
  MONTH: 'dayGridMonth',
  // WEEK: 'dayGridWeek',
  WEEK: 'resourceTimelineWeek',
  DAY: 'dayGridDay',
};

export const DEFAULT_CALENDER_VIEW = DAY_GRID.WEEK;

export const SCHEDULE_DUTIES = {
  DEDICATED: 'dedicated',
  PATROL: 'patrol',
  EXTRA: 'extra',
  DISPATCH: 'dispatch',
  HIT: 'hit',
};
export const SCHEDULE_DUTIES_TOUR_TEMPLATES = {
  DEDICATED: 'Dedicated',
  PATROL: 'Patrol',
};

export const SCHEDULES_SLA_STATUS = {
  NOT_STARTED: 'notStarted',
  ON_TIME: 'onTime',
  LATE_STARTED: 'lateStarted',
  EARLY_LEFT: 'earlyLeft',
  OVER_TIME: 'overTime',
  MISSED_CHECKPOINT: 'missedCheckpoint',
  MISSED_REPORT: 'missedReport',
  COMPLETED: 'completed',
  PENDING_APPROVAL: 'pendingApproval',
  ESCALATED: 'escalated',
  APPROVED: 'approved',
};

export const ASSIGNMENT_STATUS = {
  FUNCTIONAL: 'functional',
  REQUIRES_ATTENTION: 'requiresAttention',
};

export const TIME_KEYS = {
  START_TIME: 'startTime',
  END_TIME: 'endTime',
};

export const TOUR_KEYS = {
  NAME: 'tourName',
  CHECKPOINTS: 'tourCheckpoints',
  REPORT: 'tourReport',
  EXTRA: 'Extra Duty',
  START_TIME: TIME_KEYS.START_TIME,
  END_TIME: TIME_KEYS.END_TIME,
  INSTRUCTIONS: 'isInstructions',
};

export const SPLIT_TYPE = {
  DEFAULT: 'default',
  EQUAL: 'equal',
  CUSTOM: 'custom',
};

export const STEP_NUMBER = {
  SPLIT_DUTY: 0,
  ASSIGN_DUTY: 1,
};

export const OFFICERS_ASSIGNED = {
  OFFICERS_ASSIGNED: 'officersAssigned',
};

export const ACTION_TYPE = {
  ADD: 'add',
  DELETE: 'delete',
  UPDATE: 'update',
};

export const DRAWER_TYPE = {
  DETAIL: 'DEATIL', // dedicated/extra duty detail
  SPLIT: 'SPLIT', // Split Dedicated Duty
  ASSIGN: 'ASSIGN', // assign dedicated duty
  TOUR_TEMPLATE: 'TOUR_TEMPLATE', // Create Tour Template
  REASSIGNMENT: 'REASSIGNMENT', // Shift Reassignment
  EDIT_REASSIGNMENT: 'EDIT_REASSIGNMENT', // Edit Reassignment
  EDIT_EXTRA: 'EDIT_EXTRA', // Edit Extra Duty
  TOUR_ASSIGNMENT: 'TOUR_ASSIGNMENT', // Tour Assignment on a Patrol Hit
  TOUR_TEMPLATE_PATROL: 'TOUR_TEMPLATE_PATROL', // Create Tour Template on a Patrol Hit
  DEDICATED_SPLIT_SHIFT: 'DEDICATED_SPLIT_SHIFT',
};

export const SHIFT_ASSIGNMENT_DURATION = {
  TODAY_ONLY: 'todayOnly',
  TODAY_ONWARDS: 'todayOnwards',
};

export const DUTIES_FILTER_DATA = (t, getLabel, services = {}) => {
  // Get translation strings and replace placeholders
  const replacePlaceholders = (translationKey) => {
    const translation = t(translationKey);
    return translation
      .replace(/\{\{patrol\}\}/g, getLabel('terms', 'patrol', t))
      .replace(/\{\{dedicated\}\}/g, getLabel('terms', 'dedicated', t))
      .replace(/\{\{extra\}\}/g, getLabel('terms', 'extra', t))
      .replace(/\{\{dispatch\}\}/g, getLabel('terms', 'dispatch', t));
  };

  const filterOptions = [{ value: '', label: t('obx.schedules.filters.duties.all') }];

  // Only include PATROL if services.patrol is true
  if (services?.patrol === true) {
    filterOptions.push({
      value: SCHEDULE_DUTIES.PATROL,
      label: replacePlaceholders('obx.schedules.filters.duties.patrol'),
    });
  }

  // Only include DEDICATED if services.dedicated is true
  if (services?.dedicated === true) {
    filterOptions.push({
      value: SCHEDULE_DUTIES.DEDICATED,
      label: replacePlaceholders('obx.schedules.filters.duties.dedicated'),
    });
  }

  // EXTRA is only included if user has permission
  if (userHasPermission(ACL_OBX_SITE_EXTRA_JOB_CREATE)) {
    filterOptions.push({
      value: SCHEDULE_DUTIES.EXTRA,
      label: replacePlaceholders('obx.schedules.filters.duties.extra'),
    });
  }

  // Only include DISPATCH if services.dispatch is true
  if (services?.dispatch === true) {
    filterOptions.push({
      value: SCHEDULE_DUTIES.DISPATCH,
      label: replacePlaceholders('obx.schedules.filters.duties.dispatch'),
    });
  }

  return filterOptions;
};

export const numberToDays = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

export const LogsAction = {
  NOT_STARTED: 'notStarted',
  BREAK_STARTED: 'breakStarted',
  BREAK_ENDED: 'breakEnded',
  SHIFT_STARTED: 'shiftStarted',
  SHIFT_ENDED: 'shiftEnded',
  REPORT_SUBMITTED: 'reportSubmitted',
  INCIDENT_REPORT_SUBMITTED: 'incidentReportSubmitted',
  TOUR_COMPLETED: 'tourCompleted',
  TOUR_STARTED: 'tourStarted',
  CHECKPOINT_CHECKED: 'checkpointChecked',
  SHIFT_AUTO_ENDED: 'shiftAutoEnded',
  VISITED_SITE: 'visitedSite',
  END_LOC_VISITED: 'endLocationVisited',
  NAVIGATION_STARTED: 'navigationStarted',
  NAVIGATION_CANCELLED: 'navigationCancelled',
  INITIAL_NAVIGATION: 'initialNavigation',
  VISIT_ENDED: 'visitEnded',
  NAVIGATION_ENDED: 'navigationEnded',
  OFFICER_ASSIGNED: 'officerAssigned',
  VEHICLE_ASSIGNED: 'vehicleAssigned',
  OFFICER_UNASSIGNED: 'officerUnassigned',
  VEHICLE_UNASSIGNED: 'vehicleUnassigned',
  IS_PAYROLL_APPROVED: 'isApproved',
  AD_HOC_PAYROLL: 'adhocPayroll',
  HIT_ADDED: 'hitAdded',
  HIT_REMOVED: 'hitRemoved',
  HIT_CANCELLED: 'hitCancelled',
  CLOCKED_IN_AGAIN: 'clockedInAgain',
  CHECKPOINT_COMPLETED: 'checkpointCompleted',
  START_TIME_UPDATED: 'startTimeUpdated',
  END_TIME_UPDATED: 'endTimeUpdated',
  SPLIT_SHIFT: 'splitShift',
  DEDICATED_SHIFT_CANCELLED: 'dedicatedShiftCancelled',
  DEDICATED_SHIFT_RESTORED: 'dedicatedShiftRestored',
};

export const ShiftStatus = {
  SHIFT_NOT_STARTED: 'notStarted',
  ABSENT: 'absent',
  SHIFT_STARTED: 'shiftStarted',
  BREAK_STARTED: 'breakStarted',
  BREAK_ENDED: 'breakEnded',
  SHIFT_ENDED: 'shiftEnded',
  SHIFT_AUTO_ENDED: 'shiftAutoEnded',
  UPCOMING: 'upcoming',
  UNASSIGNED: 'unassigned',
};

export const calendarShiftStatusEnum = {
  NOT_STARTED: 'notStarted',
  SHIFT_STARTED: 'shiftStarted',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  UPCOMING: 'upcoming',
  UNASSIGNED: 'unassigned',
  MISSED: 'missed', // hit specific status
  CANCELLED: 'cancelled', // hit specific status
  INCOMPLETE: 'incomplete', // hit specific status
  SPLITTED_SHIFT: 'Splitted', // hit specific status
};

export const TourShiftStatusEnum = {
  NOT_STARTED: calendarShiftStatusEnum.NOT_STARTED,
  IN_PROGRESS: calendarShiftStatusEnum.IN_PROGRESS,
  COMPLETED: calendarShiftStatusEnum.COMPLETED,
  ON_SCHEDULE: 'onSchedule',
  BEHIND_SCHEDULE: 'behindSchedule',
};

export const STATUS_FILTER_DATA = (t) => [
  { value: undefined, label: t('obx.schedules.filters.status.all') },
  {
    value: 'completed',
    label: t('obx.schedules.filters.status.completed'),
  },
  {
    value: 'inProgress',
    label: t('obx.schedules.filters.status.inProgress'),
  },
  {
    value: 'notStarted',
    label: t('obx.schedules.filters.status.notStarted'),
  },
  // {
  //   value: 'functional,
  //   label: t('obx.schedules.filters.status.upcoming'),
  // },
  {
    value: 'requiresAttention',
    label: t('obx.schedules.filters.status.unassigned'),
  },
  {
    value: 'cancelled',
    label: t('obx.schedules.filters.status.cancelled'),
  },
];

export const LIVE_TRACKING_JOBS_DATA = (t, getLabel, services = {}) => {
  const filterOptions = [{ value: '', label: t('obx.schedules.filters.duties.all') }];

  // Only include PATROL if services.patrol is true
  if (services?.patrol === true) {
    filterOptions.push({
      value: SCHEDULE_DUTIES.PATROL,
      label: t('obx.schedules.filters.duties.patrol', { patrol: getLabel('terms', 'patrol', t) }),
    });
  }

  // Only include DEDICATED if services.dedicated is true
  if (services?.dedicated === true) {
    filterOptions.push({
      value: SCHEDULE_DUTIES.DEDICATED,
      label: t('obx.schedules.filters.duties.dedicated', {
        dedicated: getLabel('terms', 'dedicated', t),
      }),
    });
  }

  return filterOptions;
};
