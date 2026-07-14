export const extractValuesByKeyFromInput = (input, key) => {
  // Check if the input is an array
  if (Array.isArray(input)) {
    // If it's an array, map through the objects and extract the values of the specified key
    return input.map((obj) => obj[key]);
  } else if (typeof input === 'object') {
    // If it's an object, return the value of the specified key
    return input[key] ? input[key] : '';
  } else {
    // If the input is neither an object nor an array, return an error message
    return 'Invalid input. Expected an object or an array.';
  }
};
export const removeAllFromSelected = (arr, keyName) => {
  return arr?.filter((i) => i !== keyName);
};
