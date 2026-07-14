/**
 * @description it will recieve address, city, state, and postalCode and return
 * the complete address to view as one
 * @param {*} address
 * @param {*} city
 * @param {*} state
 * @param {*} postalCode
 * @returns
 */
export const formatAddress = (address, city, state, postalCode) => {
  const components = [address, city, state, postalCode].filter(Boolean); // Remove falsy values
  // return null if all are empty
  if (components.length === 0) return null;

  // format the address
  const formattedAddress = components.join(', ');
  return formattedAddress.replace(/,\s*$/, ''); // Remove trailing comma and spaces
};
