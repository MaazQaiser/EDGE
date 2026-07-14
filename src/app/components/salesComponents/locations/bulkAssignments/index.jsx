import { Box, Divider, Typography } from '@mui/material';
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { LocationDropDownEventConstant } from '../newLocationsDrawer/location.constant';
import SalesPersonsAndInterns from '../salesPersonsAndInterns';
import { useStyles } from './bulkAssignments';

const BulkAssignment = ({
  formData,
  salesPersons,
  interns,
  inputChangedHandler,
  selectedItems,
  filtersData,
  isInternChecked,
  setIsInternChecked,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Box className={classes.BulkAssignWraper}>
      {filtersData && Object.keys(filtersData).length > 0 ? (
        <Box className={classes.bulkTopWrapper}>
          <Typography variant="body2" className={classes.bulkHeading}>
            {t('sales.locations.appliedFilters')}
          </Typography>
          <Box className={classes.bulkChipsWrapper}>
            {Object.keys(filtersData).map((filterKey) => {
              const filter = filtersData[filterKey];
              if (Array.isArray(filter) && filter.length > 0) {
                /**
                 * Handle arrays like 'state' and 'city'
                 */
                return filter.map((item) => (
                  <Chip key={item.value} label={item.label} className={classes.bulkChips} />
                ));
              } else if (
                typeof filter === LocationDropDownEventConstant.OBJECT &&
                Object.keys(filter).length > 0 &&
                !Array.isArray(filter)
              ) {
                /**
                 * Handle objects like 'companyAssociated' and 'assignedTo'
                 */
                return (
                  <Chip
                    key={filter.value}
                    label={filter.label || filter.name}
                    className={classes.bulkChips}
                  />
                );
              } else if (filter && typeof filter === LocationDropDownEventConstant.STRING) {
                /**
                 * Handle other types like 'id' and 'postalCode'
                 */
                const label =
                  filterKey === LocationDropDownEventConstant.ID ? `#${filter}` : filter;
                return <Chip key={filterKey} label={label} className={classes.bulkChips} />;
              }
            })}
          </Box>
        </Box>
      ) : (
        <></>
      )}

      <Divider className={classes.divide} />
      <Box className={classes.conditionWrapper}>
        <SalesPersonsAndInterns
          formData={formData}
          salesPersons={salesPersons}
          interns={interns}
          isInternChecked={isInternChecked}
          setIsInternChecked={setIsInternChecked}
          inputChangedHandler={inputChangedHandler}
        />
        <Box className={classes.conditionMessage}>
          {selectedItems?.length} {''}
          {selectedItems?.length === 1
            ? t('sales.locations.BulkStatus')
            : t('sales.locations.BulkStatuses')}
        </Box>
      </Box>
    </Box>
  );
};

BulkAssignment.propTypes = {
  formData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  salesPersons: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  interns: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  inputChangedHandler: PropTypes.func,
  selectedItems: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  filtersData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  isInternChecked: PropTypes.bool,
  setIsInternChecked: PropTypes.func,
};

export default BulkAssignment;
