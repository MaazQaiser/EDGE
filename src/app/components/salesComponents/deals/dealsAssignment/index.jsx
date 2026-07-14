import { InputLabel, Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { bulkDealAssignMent, getDealOwnerOptions } from 'src/services/deal.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { LocationDropDownEventConstant } from '../../locations/newLocationsDrawer/location.constant';
import { useStyles } from './dealsAssignment.js';

const DealsAssignment = ({
  anchor,
  assignmentCloseDrawer,
  width,
  selectedItems,
  setSelectedItems,
  filtersData,
  setSelectAll,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selected, setSelected] = useState({});
  const [dealOwners, setDealOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const isDOSelected = Object.keys(selected).length === 0;

  const onSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        dealOwnerId: selected?.id,
        dealIds: selectedItems,
      };
      const assignedResp = await bulkDealAssignMent(payload);
      if (assignedResp.statusCode === 200) {
        toaster.success({
          text: t('sales.deals.dealAssigned'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        /**
         * close the side drawer after successful response
         * and empty the selected items array
         */
        setSelectedItems([]);
        setSelectAll(false);
        setLoading(true);
        assignmentCloseDrawer(anchor);
      }
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(true);
    }
  };
  /**
   * Fetch deal ownders
   * @param {*} page
   * @param {*} query
   */
  const fetchDealOwners = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response?.statusCode === 200) {
        setDealOwners(response?.data?.owners);
      }
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    fetchDealOwners();
  }, []);

  return (
    <Box
      className={classes?.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
    >
      <Stack className={classes?.boxInner} justifyContent="space-between">
        <Box className={classes?.sideHeader}>
          <DrawerHeader
            title={t('sales.deals.dealsAssignment')}
            subtext={t('sales.deals.dealsAssignmentText')}
            handleCloseDrawer={assignmentCloseDrawer}
            anchor={anchor}
          />
          <Box className={classes.appliedFilters}>
            <Typography variant="subtitle2">{t('sales.locations.appliedFilters')}</Typography>
            <Box className={classes.filterNames}>
              {filtersData && Object.keys(filtersData).length > 0 ? (
                <Box className={classes.bulkTopWrapper}>
                  <Box className={classes.bulkChipsWrapper}>
                    {Object.keys(filtersData).map((filterKey) => {
                      const filter = filtersData[filterKey];
                      if (filter) {
                        if (Array.isArray(filter) && filter.length > 0) {
                          /**
                           * Handle arrays like 'state' and 'city'
                           */
                          return filter.map((item, itemIndex) => (
                            <Chip
                              key={`${itemIndex}-${item.value}`}
                              label={item.label}
                              className={classes.bulkChips}
                            />
                          ));
                        } else if (
                          typeof filter === LocationDropDownEventConstant.OBJECT &&
                          !Array.isArray(filter)
                        ) {
                          /**
                           * Handle objects like 'companyAssociated' and 'assignedTo'
                           */
                          return (
                            <Chip
                              key={`${filter.value}-${filter.name}`}
                              label={filter.label || filter.name}
                              className={classes.bulkChips}
                            />
                          );
                        } else if (
                          filter &&
                          typeof filter === LocationDropDownEventConstant.STRING
                        ) {
                          /**
                           * Handle other types like 'id' and 'postalCode'
                           */
                          const label =
                            filterKey === LocationDropDownEventConstant.ID ? `#${filter}` : filter;
                          return (
                            <Chip key={filterKey} label={label} className={classes.bulkChips} />
                          );
                        }
                      }
                    })}
                  </Box>
                </Box>
              ) : (
                <></>
              )}
            </Box>
          </Box>
          <Box className={classes.locationForm}>
            <Box className={classes.sideBySideCol}>
              <Box className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}>
                <InputLabel htmlFor="selectDealOwner">{t('sales.locations.dealOwner')}</InputLabel>
                <CustomDropDown
                  name="dealOwnerId"
                  id="dealOwnerId"
                  placeHolder={t('sales.locations.selectDealOwner')}
                  placeHolderClassName={classes.placeHolderColor}
                  options={transformArrayForOptions(dealOwners, 'name', 'id', 'email')}
                  label={selected?.description}
                  selectedValues={selected || {}}
                  handleChange={(e) => setSelected(e.target.value)}
                  className={classes.dropdownWrap}
                  bordered
                  searchable
                />
              </Box>
            </Box>
            <Typography variant="subtitle2" className={classes.conditionMessage}>
              {selectedItems?.length} {t('sales.deals.dealsNotes')}
            </Typography>
          </Box>
        </Box>

        <DrawerFooter
          bulkApply={t('sales.locations.assign')}
          bulkCancel={t('sales.locations.cancel')}
          handleCloseDrawer={assignmentCloseDrawer}
          anchor={anchor}
          type="submit"
          disabled={isDOSelected || loading}
          onSubmit={onSubmit}
        />
      </Stack>
    </Box>
  );
};

DealsAssignment.propTypes = {
  anchor: PropTypes.string,
  assignmentCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  selectedItems: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  setSelectedItems: PropTypes.func,
  filtersData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setSelectAll: PropTypes.func,
};

export default DealsAssignment;
