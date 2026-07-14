/**
 * Truncates a string if it exceeds the specified length and appends "...".
 * @param {string} str - The input string to be truncated.
 * @param {number} maxLength - The maximum length before truncation.
 * @returns {string} - The truncated string or the original string if within the limit.
 */
export const truncateString = (str, maxLength) => {
  if (str?.length > maxLength) {
    return str?.substring(0, maxLength) + '...';
  } else {
    return str;
  }
};
