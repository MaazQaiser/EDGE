/**
 * ENUM for location source options
 */
export const locationSourceOptions = [
  { value: 'direct', label: 'Direct' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'organic', label: 'Organic' },
];

/**
 * constant for Assign to options
 */
export const assignToOptions = [
  { label: 'Myself (Home Office)', value: 'home_office' },
  { label: 'Sales Person', value: 'sales_person' },
  { label: 'Intern', value: 'intern' },
];

/**
 * constant for Assign to enums
 */
export const assignToEnums = {
  HOME_OFFICE: 'home_office',
  SALES_PERSON: 'sales_person',
  INTERN: 'intern',
};

/**
 * constant for location options
 */

export const locationFilterOptions = [
  { label: 'All Locations', value: null },
  { label: 'Assigned', value: true },
  { label: 'Unassigned', value: false },
];

/**
 * status constant for location filters
 */
export const locationFilterStatus = {
  APPROVED: 2,
  PENDING: 0,
  REJECTED: 1,
};

/**
 * enum constant for location's status
 */
export const locationStatuses = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
};

/**
 * status constant for location filters
 */
export const LocationDropDownEventConstant = {
  STATE: 'state',
  CITY: 'city',
  ID: 'id',
  OBJECT: 'object',
  STRING: 'string',
};
export const locationVariableTypes = {
  OBJECT: 'object',
};

/**
 * status constant for location filters
 */
export const locationSortingTypes = {
  ASC: 'asc',
};

/**
 * status constant for location filters
 */
export const locationDrawerTypes = {
  RIGHT: 'right',
  LEFT: 'left',
};

/**
 * location type filter dropdown options in location filters
 */
export const locationTypeDropdownOptions = [
  {
    id: null,
    name: 'All',
  },
  {
    id: 0,
    name: 'New',
  },
  {
    id: 1,
    name: 'Existing',
  },
  {
    id: 2,
    name: 'Old',
  },
  {
    id: 3,
    name: 'Lost',
  },
];

/**
 * stage filter dropdown options in location filters
 */
export const stagesDropdownOptions = [
  {
    id: null,
    name: 'All',
  },
  {
    id: 0,
    name: 'Open Location',
  },
  {
    id: 1,
    name: 'Working',
  },
  {
    id: 2,
    name: 'Connected',
  },
  {
    id: 3,
    name: 'Qualified',
  },
];

/**
 * sites filter dropdown options in location filters
 */
export const sitesDropdownOptions = [
  {
    id: null,
    name: 'All',
  },
  {
    id: 'visited',
    name: 'Visited',
  },
  {
    id: 'unvisited',
    name: 'Unvisited',
  },
  {
    id: 'follow_up',
    name: 'Follow-up',
  },
];
