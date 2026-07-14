import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export function convertISODateTimeToMMMdYYYY(isoDateStr) {
  let date = new Date(isoDateStr);
  return date.toLocaleString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const nthNumber = (number) => {
  if (number > 3 && number < 21) return 'th';
  switch (number % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

export function convertISODateTimeToMMMDoYYYY(isoDateStr) {
  const dateObj = new Date(isoDateStr);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-CA', { month: 'short' });
  const year = dateObj.getFullYear();

  const date = `${month} ${day}${nthNumber(day)}, ${year}`;
  return date; // "Jan 1st, 2023"
}

/**
 * Converts the "MM/DD/YYYY" string to DayJsObject
 */
export const convertMMDDYYYYToDayJsDate = (value) => {
  if (!value) return null;

  if (dayjs.isDayjs(value)) return value;

  return dayjs(new Date(value).toISOString()).utc(true);
};

/**
 * Converts the "hh:mm A" string to DayJsObject
 */
export const convertHHMMAToDayJsDate = (value) => {
  if (dayjs.isDayjs(value)) return value;

  const [hours, minutes, period] = value?.replace(' ', ':')?.split(':') ?? [];

  const isPMTime = period === 'PM' && hours !== '12';
  const is12AMTime = period === 'AM' && hours === '12';
  const militaryHours = isPMTime ? parseInt(hours, 10) + 12 : is12AMTime ? 0 : parseInt(hours, 10);

  const date = new Date();
  date.setHours(militaryHours);
  date.setMinutes(minutes);
  return dayjs(date.toISOString()).utc(true);
};

/**
 * Converts the dayJs Date object to strings:
 * 1. "MM/DD/YYYY" format if formatType = "date"
 * 2. "hh:mm A" format if formatType = "time"
 */
export const formatDayJsDate = (dayJsDate, formatType = 'time' | 'date') => {
  if (!dayjs.isDayjs(dayJsDate) || isNaN(dayJsDate['$d'])) return '';
  return formatType === 'date' ? dayJsDate.format('MM/DD/YYYY') : dayJsDate.format('hh:mm A');
};
