/**
 * Clarity Tracking Utilities
 * Comprehensive event tracking for all user interactions
 */

/**
 * Track a custom event in Clarity
 * @param {string} eventName - Name of the custom event
 * @param {object} eventData - Optional data to send with the event
 */
export const trackClarityEvent = (eventName, eventData = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.clarity === 'function') {
    try {
      window.clarity('event', eventName, eventData);
      console.log(' Clarity Event Sent:', eventName, eventData);
    } catch (error) {
      console.error(' Clarity tracking error:', error);
    }
  }
};

/**
 * Track edit action (when user clicks edit button)
 * @param {string} entityType - Type of entity being edited (e.g., 'site', 'user', 'invoice')
 * @param {string|number} entityId - ID of the entity
 * @param {object} additionalData - Additional context data
 */
export const trackEditAction = (entityType, entityId, additionalData = {}) => {
  trackClarityEvent('edit_action', {
    entityType,
    entityId: String(entityId),
    action: 'edit',
    ...additionalData,
  });
};

/**
 * Track create action (when user creates new item)
 * @param {string} entityType - Type of entity being created
 * @param {object} additionalData - Additional context data
 */
export const trackCreateAction = (entityType, additionalData = {}) => {
  trackClarityEvent('create_action', {
    entityType,
    action: 'create',
    ...additionalData,
  });
};

/**
 * Track update action (when user saves changes)
 * @param {string} entityType - Type of entity being updated
 * @param {string|number} entityId - ID of the entity
 * @param {object} additionalData - Additional context data
 */
export const trackUpdateAction = (entityType, entityId, additionalData = {}) => {
  trackClarityEvent('update_action', {
    entityType,
    entityId: String(entityId),
    action: 'update',
    ...additionalData,
  });
};

/**
 * Track delete action (when user deletes item)
 * @param {string} entityType - Type of entity being deleted
 * @param {string|number} entityId - ID of the entity
 * @param {object} additionalData - Additional context data
 */
export const trackDeleteAction = (entityType, entityId, additionalData = {}) => {
  trackClarityEvent('delete_action', {
    entityType,
    entityId: String(entityId),
    action: 'delete',
    ...additionalData,
  });
};

/**
 * Track filter apply action (when user applies filters)
 * @param {string} filterType - Type of filter/page (e.g., 'sites', 'users', 'dispatch')
 * @param {object} filterData - Filter values applied
 * @param {object} additionalData - Additional context data
 */
export const trackFilterApply = (filterType, filterData = {}, additionalData = {}) => {
  // Count number of active filters
  const activeFilters = Object.keys(filterData).filter(
    (key) => filterData[key] !== null && filterData[key] !== undefined && filterData[key] !== '',
  ).length;

  trackClarityEvent('filter_apply', {
    filterType,
    activeFilters,
    filterData: Object.keys(filterData).length > 0 ? filterData : undefined,
    action: 'apply',
    ...additionalData,
  });
};

/**
 * Track filter change (when user changes a filter value)
 * @param {string} filterType - Type of filter/page
 * @param {string} filterName - Name of the filter field changed
 * @param {any} filterValue - New filter value
 * @param {object} additionalData - Additional context data
 */
export const trackFilterChange = (filterType, filterName, filterValue, additionalData = {}) => {
  trackClarityEvent('filter_change', {
    filterType,
    filterName,
    filterValue: filterValue !== null && filterValue !== undefined ? String(filterValue) : null,
    action: 'change',
    ...additionalData,
  });
};

/**
 * Track filter clear/reset action
 * @param {string} filterType - Type of filter/page
 * @param {object} additionalData - Additional context data
 */
export const trackFilterClear = (filterType, additionalData = {}) => {
  trackClarityEvent('filter_clear', {
    filterType,
    action: 'clear',
    ...additionalData,
  });
};
