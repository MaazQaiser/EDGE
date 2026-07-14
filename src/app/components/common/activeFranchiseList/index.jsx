import { Box, Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { HO_FRANCHISE_LISTING, OBX_DISPATCH, OBX_SITES } from 'src/app/router/constant/ROUTE';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import {
  setAccessControlPermissions,
  setCountryConfiguration,
  setFranchiseId,
  setFranchiseInfo,
  setFranchiseTimeZone,
  setTimeFormat,
} from 'src/redux/store/slices/auth';
import { getActiveFranchises, getHOActiveFranchises } from 'src/services/franchise.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { rolesEnumWithName, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import CustomDropDown from '../customDropDown';
export const useStyles = makeStyles((theme) => ({
  chipWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    '& .MuiChip-root': {
      [theme.breakpoints.down(786)]: {
        display: 'none',
      },
    },
  },
}));
const ActiveFranchiseList = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    franchises: allFranchises,
    defaultCountryConfiguration,
    franchiseId,
  } = useSelector((state) => state.auth);

  const permissions = useSelector((state) => state?.user?.info?.accessControlList);
  const userRoleType = useSelector((state) => state?.user?.info?.roleableType);
  const userRoleSlug = useSelector((state) => state.auth.userRole?.slug);

  // const franchiseTimeZone = useSelector((state) => state.user.info.franchiseTimezone);
  const [selectedActiveFranchise, setSelectedActiveFranchise] = useState({});
  const [selectedUserType, _setSelectedUserType] = useState({
    name: 'Home Office View',
    value: null,
    id: 'HO',
  });

  const isHomeOfficeOrAgent =
    userRoleSlug === rolesEnumWithName.home_officer.slug ||
    userRoleSlug === rolesEnumWithName.ho_agent.slug;

  const [activeFranchises, setActiveFranchises] = useState([]);
  const getActiveFranchiseData = async () => {
    try {
      const response = isHomeOfficeOrAgent
        ? await getHOActiveFranchises()
        : await getActiveFranchises();

      if (response && response?.statusCode === 200) {
        const data = isHomeOfficeOrAgent
          ? response?.data?.franchises
          : response?.data?.activeFranchises;

        const selectedFranchise = data?.find((franchise) => franchise?.id == franchiseId);
        setSelectedActiveFranchise(selectedFranchise);
        setActiveFranchises(data);
        dispatch(setFranchiseInfo(selectedFranchise));
        dispatch(setTimeFormat(selectedFranchise?.format));

        // Setting the country configuration from API response
        if (franchiseId) {
          if (selectedFranchise?.countryConfiguration) {
            dispatch(setCountryConfiguration(selectedFranchise.countryConfiguration));
          } else if (!isObjectEmpty(allFranchises)) {
            dispatch(setCountryConfiguration(allFranchises?.[franchiseId]?.countryConfiguration));
          }
        } else {
          // Only for HO users when "Home Office View" is selected (no franchiseId)
          dispatch(setCountryConfiguration(defaultCountryConfiguration));
        }
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setActiveFranchises([]);
    }
  };
  useEffect(() => {
    getActiveFranchiseData();
  }, []);

  const updateFranchiseAPI = async (id) => {
    try {
      const selectedValue = activeFranchises?.find((franchise) => franchise?.id == id);
      const selectedTimezone = isHomeOfficeOrAgent
        ? selectedValue?.timezone
        : selectedValue?.franchiseTimezone;

      setSelectedActiveFranchise(selectedValue);
      dispatch(setFranchiseId(selectedValue?.id));
      dispatch(setFranchiseTimeZone(selectedTimezone));
      dispatch(setFranchiseInfo(selectedValue));
      dispatch(setTimeFormat(selectedValue?.format));

      // Dispatch country configuration when franchise is selected
      if (selectedValue?.id) {
        if (selectedValue?.countryConfiguration) {
          dispatch(setCountryConfiguration(selectedValue.countryConfiguration));
        } else if (!isObjectEmpty(allFranchises)) {
          // Fallback to Redux state if not in API response (for both HO and FO)
          dispatch(
            setCountryConfiguration(allFranchises?.[selectedValue?.id]?.countryConfiguration),
          );
        }
      } else {
        dispatch(setCountryConfiguration(defaultCountryConfiguration));
      }

      if (userRoleType === 'Franchise') {
        let permissionsList = { ...permissions[selectedValue?.id] };

        if (['franchise_owner', 'coordinator', 'director'].includes(userRoleSlug)) {
          permissionsList = {
            ...permissionsList,
            OBXDashboard: { view: true },
          };
        }
        dispatch(setAccessControlPermissions(permissionsList));
      }
      /**
       *
       * added wait time of 1sec to store the changes in redux
       * instant reload wasn't leaving much room for redux to store and reflect changes
       * */
      setTimeout(() => {
        switch (userRoleSlug) {
          case rolesEnumWithName.home_officer.slug:
            window.location.href = selectedValue?.id ? OBX_SITES : HO_FRANCHISE_LISTING;
            break;
          case rolesEnumWithName.ho_agent.slug:
            window.location.href = OBX_DISPATCH;
            break;
          default:
            window.location.reload();
            break;
        }
      }, 1000);
      toaster.success({
        text: t('commonText.updateSuccess'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleUpdate = (e) => {
    const { value } = e.target;
    if (!isObjectEmpty(value)) {
      updateFranchiseAPI(value?.id);
    }
  };

  const selectedFranchise = !isObjectEmpty(selectedActiveFranchise)
    ? transformArrayForOptions([selectedActiveFranchise], 'name', 'id')?.[0]
    : {};

  const options =
    isHomeOfficeOrAgent && activeFranchises?.length && !isObjectEmpty(selectedFranchise)
      ? transformArrayForOptions([selectedUserType, ...activeFranchises], 'name', 'id')
      : transformArrayForOptions(activeFranchises, 'name', 'id');

  return (
    <Box className={classes.chipWrapper}>
      {/* <Chip label={`${franchiseTimeZone}`} size="small" color="primary" /> */}

      {franchiseId && <Chip label={`ID: ${franchiseId}`} size="small" color="primary" />}

      <CustomDropDown
        searchable
        label={t('obx.form.input.dropDown.selectFranchise.label')}
        name="activeFranchise"
        selectedValues={selectedFranchise}
        options={options}
        bordered
        checkmark
        handleChange={handleUpdate}
        className={classes.franchiseCustomDropDown}
        margin="set"
      />
    </Box>
  );
};

ActiveFranchiseList.propTypes = {
  type: PropTypes.string,
};

export default ActiveFranchiseList;
