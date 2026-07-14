import { useSelector } from 'react-redux';

/**
 * Universal hook to update labels in an object or array
 * based on Redux API-provided label mappings.
 *
 * @param {Object|Array} source - Original object or array
 * @param {string} selectorPath - Dot path to Redux state containing updated labels
 * @param {'key'|'value'} matchBy - How to match items for updating ('key' for object keys, 'value' for arrays)
 * @returns {Object|Array} Same-structured data with updated labels
 */
export const useLabels = (source, selectorPath, matchBy = 'key') => {
  const updatedLabels = useSelector((state) => {
    const keys = selectorPath.split('.');
    return keys.reduce((acc, key) => acc?.[key], state);
  });

  if (!updatedLabels) return source;

  // ✅ CASE 1: Object (hash)
  if (!Array.isArray(source) && typeof source === 'object') {
    return Object.keys(source).reduce((acc, key) => {
      const base = source[key];
      const newLabel = updatedLabels?.[key]?.label || updatedLabels?.[key] || base.label;

      acc[key] = { ...base, label: newLabel, name: newLabel };
      return acc;
    }, {});
  }

  // ✅ CASE 2: Array
  if (Array.isArray(source)) {
    return source.map((item) => {
      const keyToMatch = item[matchBy];
      const newLabel =
        updatedLabels?.[keyToMatch]?.label || updatedLabels?.[keyToMatch] || item.label;

      return { ...item, label: newLabel, name: newLabel };
    });
  }

  return source;
};

/**
 * Usage
 *
 */

// const response = useLabels(
//   {
//     home_officer: { label: 'Home Office', value: 'home_office' },
//     franchise_owner: { label: 'Franchise Owner', value: 'franchise_owner' },
//     director: { label: 'Director', value: 'director' },
//     supervisor: { label: 'Supervisor', value: 'supervisor' },
//     coordinator: { label: 'Coordinator', value: 'coordinator' },
//     sales_manager: { label: 'Sales Manager', value: 'sales_manager' },
//     sales_person: { label: 'Sales Person', value: 'sales_person' },
//   },
//   'roles', // key you want to pick from redux
// );

// const response = useLabels(
//   [
//     { label: 'Tenant', value: locationAffiliationValues.tenant },
//     { label: 'Managed', value: locationAffiliationValues.managed },
//     { label: 'Shared', value: locationAffiliationValues.shared },
//     { label: 'Head Quarters', value: locationAffiliationValues.headquarters },
//     { label: 'Owned', value: locationAffiliationValues.owned },
//     { label: 'Regional Office', value: locationAffiliationValues.regional_office },
//   ],
//   'meta.locationAffiliationLabels',
//   'value',
// );
