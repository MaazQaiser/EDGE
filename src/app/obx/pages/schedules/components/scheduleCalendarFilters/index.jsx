import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import SearchComponent from 'src/app/components/common/search';
import sortByLabelAsc from 'src/utils/array/sortByLabelAsc';
import {
  DAY_GRID,
  DUTIES_FILTER_DATA,
  STATUS_FILTER_DATA,
  TIME_GRID,
} from 'src/utils/constants/schedules';

import {
  getDedicatedShiftTypeOptions,
  getPatrolShiftTypeOptions,
} from '../../config/scheduleTabConfigs';

const getAllShiftsOption = (t) => ({
  value: '',
  label: t('obx.schedules.filters.duties.all'),
});

const getPatrolStatusFilterOptions = (t) => [
  { value: undefined, label: t('obx.schedules.filters.status.all') },
  { value: 'cancelled', label: t('obx.schedules.filters.status.cancelled') },
  { value: 'completed', label: t('obx.schedules.filters.status.completed') },
  { value: 'inProgress', label: t('obx.schedules.filters.status.inProgress') },
  { value: 'notStarted', label: t('obx.schedules.filters.status.notStarted') },
  { value: 'requiresAttention', label: t('obx.schedules.filters.status.unassigned') },
];

const EMPTY_SINGLE_SELECT = {};
const EMPTY_MULTI_SELECT = [];

const toMultiSelectValue = (value) => (Array.isArray(value) ? value : EMPTY_MULTI_SELECT);

const toSingleSelectValue = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : EMPTY_SINGLE_SELECT;

/** Keep "All" / empty options first; sort the rest A–Z by label. */
const isPinnedAllOption = (option) => {
  const value = option?.value;
  return value === '' || value === undefined || value === null || value === 'all';
};

const sortFilterOptionsAlphabetically = (options = []) => {
  const pinned = [];
  const rest = [];

  (options || []).forEach((option) => {
    if (isPinnedAllOption(option)) pinned.push(option);
    else rest.push(option);
  });

  return [...pinned, ...sortByLabelAsc(rest)];
};

const getShiftFilterOptions = (filters, t, getLabel, services) => {
  const allShifts = getAllShiftsOption(t);

  if (filters.shiftTypeOptionsKey === 'dedicated') {
    return sortFilterOptionsAlphabetically([
      allShifts,
      ...getDedicatedShiftTypeOptions(t, getLabel, services),
    ]);
  }
  if (filters.shiftTypeOptionsKey === 'patrol') {
    return sortFilterOptionsAlphabetically([
      allShifts,
      ...getPatrolShiftTypeOptions(t, getLabel, services),
    ]);
  }
  // Legacy: static arrays from older tab configs
  if (Array.isArray(filters.shiftTypeOptions)) {
    return sortFilterOptionsAlphabetically([allShifts, ...filters.shiftTypeOptions]);
  }
  return sortFilterOptionsAlphabetically(DUTIES_FILTER_DATA(t, getLabel, services) || []);
};

const ScheduleCalendarFilters = ({
  classes,
  tabConfig,
  selectedViewType,
  queryParams,
  onSearch,
  onSelectFilter,
  isSitesModule,
  isUsersModule,
  filterLocationOptions,
  filterOfficerOptions,
  services,
  getLabel,
  trailingFilter = null,
}) => {
  const { t } = useTranslation();
  const { filters } = tabConfig;
  const isWeekView = selectedViewType !== DAY_GRID.DAY && selectedViewType !== DAY_GRID.MONTH;
  const showMainScheduleFilters = isWeekView && !isSitesModule && !isUsersModule;

  const shiftFilterOptions = getShiftFilterOptions(filters, t, getLabel, services);
  const statusFilterOptions = sortFilterOptionsAlphabetically(
    filters.patrolStatusOptions ? getPatrolStatusFilterOptions(t) : STATUS_FILTER_DATA(t) || [],
  );

  const siteOptions = sortByLabelAsc(
    (queryParams.allSites || []).map((site) => {
      const label = `${site?.name || site?.siteName || site?.title || site?.label || ''}`.trim();
      return {
        ...site,
        value: `${site?.id ?? site?.value ?? ''}`,
        label,
      };
    }),
    ['label'],
  );
  const locationOptions = sortFilterOptionsAlphabetically(
    isSitesModule ? queryParams.siteLocations || [] : filterLocationOptions || [],
  );
  const officerOptions = sortByLabelAsc(
    (filterOfficerOptions || []).map((officer) => {
      const label = `${officer?.label || officer?.name || officer?.title || ''}`.trim();
      return {
        ...officer,
        value: `${officer?.value ?? officer?.id ?? ''}`,
        label,
      };
    }),
    ['label'],
  );

  const officersLabel =
    t('obx.schedules.filters.officers.label', {
      officers: getLabel?.('terms', 'officers', t) || 'Officers',
    }) || 'Officers';

  return (
    <>
      {selectedViewType === TIME_GRID.LIST && (
        <SearchComponent
          name="search"
          placeholder={t('form.input.textField.search.placeHolder')}
          onSearch={onSearch}
        />
      )}

      <Box className={classes.scheduleCalendarHeaderFilters}>
        {filters.showShiftType && (
          <CustomDropDown
            name="duties"
            label={t('obx.schedules.filters.duties.label')}
            className={classes.scheduleCalendarFilterDropdown}
            options={shiftFilterOptions}
            selectedValues={toSingleSelectValue(queryParams.filter.selectedDutyType)}
            handleChange={(event) => onSelectFilter(event, 'selectedDutyType')}
          />
        )}

        {!isSitesModule && (
          <CustomDropDown
            name="sites"
            label={t('obx.schedules.filters.sites.fieldLabel')}
            className={classes.scheduleCalendarFilterDropdown}
            options={siteOptions}
            selectedValues={toMultiSelectValue(queryParams.filter.selectedSites)}
            handleChange={(event) => onSelectFilter(event, 'selectedSites')}
            multiSelect
            searchPlaceholder={t('form.input.textField.search.placeHolder')}
            checkmark
            searchable
            clearAll
            additionalOption={<Box className={classes.scheduleCalendarFilterSearchDivider} />}
          />
        )}

        {isSitesModule && (
          <CustomDropDown
            label={t('obx.schedules.filters.locations.fieldLabel')}
            name="location"
            className={classes.scheduleCalendarFilterDropdown}
            options={locationOptions}
            selectedValues={toSingleSelectValue(queryParams.filter.selectedLocations)}
            handleChange={(event) => onSelectFilter(event, 'selectedLocations')}
            searchPlaceholder={t('form.input.textField.search.placeHolder')}
            searchable
            additionalOption={<Box className={classes.scheduleCalendarFilterSearchDivider} />}
          />
        )}

        {showMainScheduleFilters && filters.showLocation && (
          <CustomDropDown
            name="location"
            label={t('obx.schedules.filters.locations.fieldLabel')}
            className={classes.scheduleCalendarFilterDropdown}
            options={locationOptions}
            selectedValues={toMultiSelectValue(queryParams.filter.selectedLocations)}
            handleChange={(event) => onSelectFilter(event, 'selectedLocations')}
            multiSelect
            checkmark
            searchable
            searchPlaceholder={t('form.input.textField.search.placeHolder')}
            clearAll
            disableWhenEmpty={false}
            additionalOption={<Box className={classes.scheduleCalendarFilterSearchDivider} />}
          />
        )}

        {showMainScheduleFilters && filters.showOfficer && (
          <CustomDropDown
            name="officer"
            label={officersLabel}
            className={classes.scheduleCalendarFilterDropdown}
            options={officerOptions}
            selectedValues={toMultiSelectValue(queryParams.filter.selectedOfficers)}
            handleChange={(event) => onSelectFilter(event, 'selectedOfficers')}
            multiSelect
            checkmark
            searchable
            searchPlaceholder={t('form.input.textField.search.placeHolder')}
            clearAll
            disableWhenEmpty={false}
            additionalOption={<Box className={classes.scheduleCalendarFilterSearchDivider} />}
          />
        )}

        {!isUsersModule && (
          <CustomDropDown
            name="status"
            label={t('obx.schedules.filters.status.label')}
            className={classes.scheduleCalendarFilterDropdown}
            options={statusFilterOptions}
            selectedValues={toSingleSelectValue(queryParams.filter.selectedStatus)}
            handleChange={(event) => onSelectFilter(event, 'selectedStatus')}
          />
        )}

        {/* A tab-specific filter belongs with the filters, not in the action
            cluster on the far side of the toolbar — it narrows what you are
            looking at, which is what everything else in this row does. */}
        {trailingFilter}
      </Box>
    </>
  );
};

ScheduleCalendarFilters.propTypes = {
  classes: PropTypes.object.isRequired,
  tabConfig: PropTypes.object.isRequired,
  selectedViewType: PropTypes.string,
  queryParams: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
  onSelectFilter: PropTypes.func.isRequired,
  isSitesModule: PropTypes.bool,
  isUsersModule: PropTypes.bool,
  filterLocationOptions: PropTypes.array,
  filterOfficerOptions: PropTypes.array,
  services: PropTypes.object,
  getLabel: PropTypes.func,
  trailingFilter: PropTypes.node,
};

export default memo(ScheduleCalendarFilters);
