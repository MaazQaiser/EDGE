import { Box, InputLabel, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { UPDATE_RUNSHEET_STATE } from 'src/redux/reducers/runSheetReducer';
import {
  getActiveAndInActivePatrolOfficers,
  getActiveAndInActivePatrolVehicles,
} from 'src/services/duty.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import OfficerDropdown from '../../../sites/detail/components/jobs/assignmentSideDrawer/AssignShift/OfficerDropdown';
import { useStyles } from './AssignRunsheetTab';
const AssignRunsheetTab = (props) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const { state, dispatch, isSplitRunsheet } = props;
  const [officers, setOfficers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const handleChangeValue = (e) => {
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: 'officerId', value: e.target.value },
    });
  };

  const handleVehicleValue = (e) => {
    console.log(e);
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: { key: 'vehicleId', value: e.target.value },
    });
  };

  const location = useLocation();
  const urlArray = location.pathname.split('/');
  // Extract the unique identifier
  const runSheetId = urlArray[urlArray.length - 2];
  const getOfficersData = async () => {
    try {
      setOfficers(undefined);
      const queryParams = {
        start: state?.tempNewRunsheetDates?.startsAt,
        end: state?.tempNewRunsheetDates?.endsAt,
      };
      if (isSplitRunsheet) {
        queryParams.isReassigned = true;
        queryParams.forSplit = true;
      }
      const config = {};
      let response;
      response = await getActiveAndInActivePatrolOfficers({
        runsheetId: runSheetId,
        queryParams,
        config,
      });

      const data = response?.data || {};

      const assigned = data?.assigned?.map((val) => ({
        ...val,
        disabled: val?.isAssigned,
        role: val?.label,
        label: val?.name,
      }));
      const unassigned = data?.unassigned?.map((officer) => ({
        ...officer,
        reason: 'available',
        role: officer?.label,
        label: officer?.name,
      }));

      setOfficers({ ...data, assigned, unassigned });
    } catch (error) {
      console.log(error);
      setOfficers(null);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const getVehiclesData = async () => {
    try {
      setVehicles(undefined);
      const queryParams = {
        start: state?.tempNewRunsheetDates?.startsAt,
        end: state?.tempNewRunsheetDates?.endsAt,
      };
      if (isSplitRunsheet) queryParams.isReassigned = true;
      const config = {};
      let response;

      response = await getActiveAndInActivePatrolVehicles({
        runsheetId: runSheetId,
        queryParams,
        config,
      });

      const data = response?.data || {};

      const assigned = data?.assigned?.map((val) => ({
        ...val,
        disabled: val?.isAssigned,
      }));

      setVehicles({ ...data, assigned });
    } catch (error) {
      setVehicles(null);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    Promise.all([getOfficersData(), getVehiclesData()]);
  }, []);

  const classes = useStyles();
  return (
    <Box className={classes.assignWrapper}>
      <Box className={classes.inlineText}>
        <Typography variant="h5">
          {t('obx.runsheet.assignHeading', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
            officer: getLabel('roles', 'officer', t).toLowerCase(),
          })}
        </Typography>
        <Typography variant="caption">{t('obx.runsheet.optional')}</Typography>
      </Box>
      <Box>
        <InputLabel htmlFor="runsheetName">
          {t('obx.runsheet.selectOfficer', {
            officer: getLabel('terms', 'officer', t),
          })}
        </InputLabel>
        <OfficerDropdown
          {...{
            handleChangeValue,
            selectedValue: state?.officerId,
            allOfficers: officers,
            name: 'officer',
            label: null,
            placeHolder: null,
            errorMsg: '',
          }}
        />
      </Box>
      <Box>
        <InputLabel htmlFor="runsheetName">{t('obx.runsheet.selectVehicle')}</InputLabel>
        <OfficerDropdown
          {...{
            handleChangeValue: handleVehicleValue,
            selectedValue: state?.vehicleId,
            allOfficers: vehicles,
            name: 'vehicle',
            label: 'Select Vehicle',
            placeHolder: 'Select Vehicle',
            errorMsg: '',
          }}
        />
      </Box>
    </Box>
  );
};

AssignRunsheetTab.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
  isSplitRunsheet: PropTypes.bool,
  // runSheetDetails: PropTypes.object.isRequired,
};

export default AssignRunsheetTab;
