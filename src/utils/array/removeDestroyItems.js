/**
 *@description it will remove the items from list where _destroy will be true
 * @param {*} items array of items
 * @returns
 */
export const filterActiveData = (items) => {
  return items?.filter((data) => !data?._destroy) ?? [];
};
