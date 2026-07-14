import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFranchisesOptions } from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toaster } from 'src/utils/toast';

import CustomDropDown from '../customDropDown';
const ALL_TYPE = (t) => ({
  value: 'all',
  label: t('obx.franchiseMap.allFranchises'),
  name: 'all',
  id: 'all',
});
const useStyles = makeStyles(() => ({
  franchiseListDropDown: {
    flex: '1',
  },
}));
const FranchiseListDropDown = ({
  formKey = 'franchises',
  selectedValues = [],
  dependentValue = [],
  refetch = false,
  showAll = true,
  updataFormHandler = () => {},
  setRefetch = () => {},
  multiSelect = true,
  checkmark = true,
  bordered = true,
  searchable = true,
  disabled = false,
  withTiles = true,
}) => {
  const [franchises, setFranchises] = useState([]);
  const forceClose = true;
  const { t } = useTranslation();
  const classes = useStyles();

  const getData = async () => {
    try {
      let payload = {};
      /** Handle states filter */
      if (dependentValue?.length > 0) {
        let selectedStates = dependentValue?.map((state) => state?.id);
        payload = { ...payload, states: selectedStates };
      } else {
        let { states: _deletedStates, ...rest } = payload;
        payload = rest;
      }

      let api = await getFranchisesOptions(payload?.states ? payload : null);

      if (api?.statusCode === 200) {
        api = transformArrayForOptions(api?.data?.franchises, 'name', 'name');
        setFranchises(api);
        return;
      }
      setFranchises([]);
    } catch (e) {
      setFranchises([]);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: 2000,
      });
    }
  };

  useEffect(() => {
    if (refetch) {
      getData();
      setRefetch(false);
    }
  }, [refetch]);
  const allFranchises = showAll ? [ALL_TYPE(t), ...franchises] : franchises;
  return (
    <CustomDropDown
      disabled={disabled || !franchises?.length}
      label={t('sideNavBar.linkText.franchises')}
      name="franchises"
      enableForceClose={forceClose}
      options={allFranchises || []}
      selectedValues={selectedValues || []}
      handleChange={(e) => {
        updataFormHandler(e, formKey);
      }}
      multiSelect={multiSelect}
      className={classes.franchiseListDropDown}
      checkmark={checkmark}
      bordered={bordered}
      searchable={searchable}
      withTiles={withTiles}
      placeHolder={`${t('sideNavBar.linkText.franchises')}`}
    />
  );
};
FranchiseListDropDown.propTypes = {
  formKey: PropTypes.string,
  selectedValues: PropTypes.array,
  dependentValue: PropTypes.array,
  refetch: PropTypes.bool,
  showAll: PropTypes.bool,
  updataFormHandler: PropTypes.func,
  setRefetch: PropTypes.func,
  multiSelect: PropTypes.bool,
  checkmark: PropTypes.bool,
  bordered: PropTypes.bool,
  searchable: PropTypes.bool,
  disabled: PropTypes.bool,
  withTiles: PropTypes.bool,
};
export default FranchiseListDropDown;
