/** Truncates toward zero to `decimalPlaces` (no rounding). */
export function truncateToDecimalPlaces(value, decimalPlaces = 2) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (value?.toString()?.split('.')?.[1]?.length === decimalPlaces) {
    return value;
  }

  const num = Number(value);
  if (Number.isNaN(num)) {
    return '';
  }
  const factor = 10 ** decimalPlaces;
  const truncated = Math.trunc(num * factor) / factor;
  return truncated.toFixed(decimalPlaces);
}

export function formatNumber(
  value,
  decimal = 2,
  maxCount = 20,
  prevValue = '',
  allowNegative = false,
) {
  let processedValue = value;
  if (typeof value === 'number') {
    processedValue = value.toString();
  } else if (typeof value === 'string') {
    processedValue = value;
  } else {
    // Handle unexpected types
    return '';
  }

  // Allow empty string as a valid input
  if (processedValue === '') {
    return '';
  }

  // Typing "-" after existing digits (e.g. "0" + "-" at end of field) yields "0-",
  // which does not match the negative pattern; reinterpret as "-0", "-12.34", etc.
  if (
    allowNegative &&
    processedValue.length > 1 &&
    processedValue.endsWith('-') &&
    !processedValue.startsWith('-')
  ) {
    const withoutTrailingMinus = processedValue.slice(0, -1);
    if (/[0-9]/.test(withoutTrailingMinus) && /^\d*\.?\d*$/.test(withoutTrailingMinus)) {
      processedValue = `-${withoutTrailingMinus}`;
    }
  }

  // If the input is '0' and a new digit is being added, replace '0' with the new digit
  if (processedValue.length > 1 && processedValue.startsWith('0') && processedValue[1] !== '.') {
    processedValue = processedValue.slice(1);
  }

  // Regex to allow:
  // - '0' by itself
  // - Numbers starting with a digit 1-9, followed by up to (maxCount - 1) digits
  // - Optional decimal point with up to 'decimal' places
  const regex = allowNegative
    ? new RegExp(`^-?$|^-?(0|[1-9]\\d{0,${maxCount - 1}})(\\.|\\.\\d{0,${decimal}})?$`)
    : new RegExp(`^(0|[1-9]\\d{0,${maxCount - 1}})(\\.|\\.\\d{0,${decimal}})?$`);

  const match = processedValue.match(regex);

  if (allowNegative) {
    if (match) {
      const sign = processedValue.startsWith('-') ? '-' : '';
      const integerPart = match[1] ?? '';
      const decimalPart = match[2] ?? '';
      processedValue = sign + integerPart + decimalPart.slice(0, decimal + 1);
    } else {
      processedValue = prevValue;
    }
  } else {
    if (match) {
      // If the input matches the pattern, process it
      processedValue = match[1]; // Digits before the decimal point
      if (match[2]) {
        // If there's a decimal part, include up to 'decimal' places
        processedValue += match[2].substring(0, decimal + 1);
      }
    } else {
      processedValue = prevValue;
    }
  }
  return processedValue;
}
