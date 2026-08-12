/**
 * Compatibility re-export. Schedule view-model lives under schedules/.
 * Prefer importing from schedules/hooks/useScheduleCalendarViewModel.
 */
export {
  buildSortedDayViewData,
  useScheduleCalendarViewModel as useCalendarViewModel,
} from 'src/app/obx/pages/schedules/hooks/useScheduleCalendarViewModel';
