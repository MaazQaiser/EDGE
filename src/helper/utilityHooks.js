import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

function isDeepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useDeepEffect(callback, dependencies) {
  const prevDepsRef = useRef();

  useEffect(() => {
    if (!prevDepsRef.current || !isDeepEqual(prevDepsRef.current, dependencies)) {
      callback();
      prevDepsRef.current = dependencies;
    }
  }, [JSON.stringify(dependencies)]); // depend on a stable deep-compare key
}

/**
 * Custom React hook to retrieve tenant-specific labels.
 *
 * This hook looks up a label string from the Redux store (`tenantConfigs.tenantLabels.labels`)
 * based on the given category and key. If the label is not found in Redux,
 * it falls back to the provided translation function (`t`).
 *
 * @example
 * // Usage inside a component
 * import { useTenantLabel } from 'hooks/useTenantLabel';
 * import { useTranslation } from 'react-i18next';
 *
 * function DashboardHeader() {
 *   const { t } = useTranslation();
 *   const { getLabel } = useTenantLabel();
 *
 *   // Retrieve a label by category and key
 *   const titleLabel = getLabel('terms', 'dashboardTitle', t);
 *
 *   return <h1>{titleLabel}</h1>;
 * }
 *
 * @returns {Object}
 * @returns {Function} getLabel - Function to fetch a label by category and key.
 */
export function useTenantLabel() {
  // Access all tenant-specific labels from Redux state
  const tenantLabels = useSelector((state) => state.tenantConfigs?.labels);

  /**
   * Retrieves a label from tenant labels or translation fallback.
   *
   * @param {string} [category='terms'] - The category under which the label is stored.
   * @param {string} key - The key identifying the specific label.
   * @param {Function} t - The translation function from react-i18next for fallback.
   * @returns {string} - The resolved label text.
   */
  const getLabel = (category = 'terms', key, t) => {
    if (!key) return '';

    const reduxLabel = tenantLabels?.[category]?.[key];
    if (reduxLabel) return reduxLabel;

    if (typeof t === 'function') {
      const fromStatus = t(`status.${key}`, { defaultValue: '' });
      if (fromStatus) return fromStatus;
    }

    return '';
  };

  return { getLabel };
}
