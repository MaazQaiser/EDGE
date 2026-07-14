/**
 * @description Format number to currency format (USD by default)
 * @param {number} value - The number to format
 * @param {'USD' | 'EUR' | 'GBP'} [currency='USD'] - Optional currency code
 * @returns {string}
 */

export const numberToCurrencyFormat = (value, currency = 'USD') =>
  // eslint-disable-next-line no-undef
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);

export const numberToAmountFormat = (value, locale = 'en-US') =>
  new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

/**
 * @description Format number to K, million, billion format
 * Also add commas where required
 * @param {*} number
 * @returns {string}
 */
export const formatCurrencyWithCommasAndSuffix = (number) => {
  if (isNaN(number) || !number) {
    return '0';
  }

  const suffixes = ['', 'k', 'M', 'B', 'T'];

  let suffixIndex = 0;
  if (number >= 10000) {
    while (number >= 1000 && suffixIndex < suffixes.length - 1) {
      number /= 1000;
      suffixIndex++;
    }
  }

  const isInteger = number % 1 === 0;

  const formattedNumber = isInteger
    ? number.toLocaleString()
    : number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return formattedNumber + suffixes[suffixIndex];
};

/**
 * Localize number and add commas for better understanding
 * @param {*} number
 * @returns {string}
 */
export const fomatNumbersWithCommas = (number) => {
  if (isNaN(number) || !number) {
    return '0';
  }

  const isInteger = number % 1 === 0;

  const formattedNumber = isInteger
    ? number.toLocaleString()
    : number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return formattedNumber;
};
