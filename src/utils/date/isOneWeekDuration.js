import dayjs from 'dayjs';

/**
 * @description it will check if the duration is one week or more
 * @param {*} startDate
 * @param {*} endDate
 * @returns
 */
export const isOneWeekDuration = (startDate, endDate) => {
  if (!startDate && !endDate) return;

  // Parse the start and end dates using Day.js
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  // Calculate the difference in days between the two dates
  const durationInDays = end.diff(start, 'day');

  // Check if the duration is within a week
  return durationInDays < 7; // less than 7 days - one week duration
};
