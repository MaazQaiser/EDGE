const LOCALE_COMPARE_OPTIONS = { sensitivity: 'base' };

const getComparableText = (item, keys = ['label', 'name', 'title']) => {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && `${value}`.trim() !== '') {
      return `${value}`;
    }
  }
  return '';
};

/**
 * Ascending A–Z sort by label/name/title using localeCompare with base sensitivity.
 * Does not mutate the input array.
 */
export const sortByLabelAsc = (items = [], keys = ['label', 'name', 'title']) =>
  [...(items || [])].sort((itemA, itemB) =>
    getComparableText(itemA, keys).localeCompare(
      getComparableText(itemB, keys),
      undefined,
      LOCALE_COMPARE_OPTIONS,
    ),
  );

export default sortByLabelAsc;
