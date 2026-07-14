/**
 * @description
 * A utility function to transform any string into its capitalized form; just like in CSS `text-transform: capitalize;`
 * @param {string} input Input string to transform
 * @param {boolean} shouldUpperCaseFirstLetterOnly capitalize only first letter and keep the rest of case as is
 * @returns {string} Transformed string
 */

export default function capitalize(input, shouldUpperCaseFirstLetterOnly = false) {
  if (!input || typeof input !== 'string') {
    return;
  }

  if (shouldUpperCaseFirstLetterOnly)
    return input.replace(/\b\w/g, function (m) {
      return m.toUpperCase();
    });

  return input.toLowerCase().replace(/\b\w/g, function (m) {
    return m.toUpperCase();
  });
}
