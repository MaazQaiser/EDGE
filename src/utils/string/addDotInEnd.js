/**
 * It will add a dot (.) at the end of the string if not exist.
 * Unable to add punctuation from the Joi validation that's why customizing it from here
 * @param {string} str - The input string.
 */
export const checkAndAddDot = (str) => {
  if (str.endsWith('.')) {
    return str;
  } else {
    return str + '.';
  }
};
