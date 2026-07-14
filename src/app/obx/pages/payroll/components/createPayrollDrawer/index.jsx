import { Box, Button, InputLabel, Skeleton, Typography } from '@mui/material';
import LoaderComponent from 'commonComponents/loader';
import dayjs from 'dayjs';
import { t } from 'i18next';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { getAllTypeOfSites } from 'services/sites.services';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import {
  appendDefaultStartAndEndTimeWithDates,
  dayjsWithStandardOffset,
  getStartEndTimeWithDesiredDate,
} from 'src/app/obx/pages/schedules/helper';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import useFormHook from 'src/hooks/useFormHook';
import {
  createAddHockInvoice,
  getFranchiseSiteContracts,
  getShiftAvailableOfficers,
  getShiftLocations,
} from 'src/services/invoice.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './createPayrollDrawer';

const emptyState = {
  site: {},
  contract: {},
  location: {},
  shiftStartDate: null,
  shift: null,
  shiftStartTime: null,
  shiftEndTime: null,
  officer: {},
  punchInTime: null,
  punchOutTime: null,
};

const enumnConsts = {
  site: 'site',
  contract: 'contract',
  shiftStartDate: 'shiftStartDate',
  location: 'location',
  shiftStartTime: 'shiftStartTime',
  shiftEndTime: 'shiftEndTime',
  officer: 'officer',
  punchInTime: 'punchInTime',
  punchOutTime: 'punchOutTime',
};

// const initialParams = {
//   sites: [],
//   selectedDates: { startDate: null, endDate: null },
// };

const CreatePayrollDrawer = ({ setShowDrawer, refreshData, isPatrol }) => {
  const classes = useStyles();
  const { getLabel } = useTenantLabel();
  const { is24Hours, formatDayjsDateTime } = useDateTime();
  const [sitesData, setSitesData] = useState([]);
  const [contractsData, setContractsData] = useState([]);
  const [shiftLocation, setShiftLocation] = useState([]);
  const [officers, setOfficers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [apiLoadings, setApiLoadings] = useState({
    contractLoading: false,
    siteLoading: false,
    shiftLoading: false,
    officeLoading: false,
  });

  const [notFoundObj, setNotFoundObj] = useState({
    contractNotFound: false,
    siteNotFound: false,
    shiftNotFound: false,
    officeNotFound: false,
  });

  const {
    formData,
    errorMessages,
    setErrorMessages,
    setDisabled,
    disabled,
    updateFormHandler,
    removeError,
  } = useFormHook({ defaultFormData: emptyState });

  // Placeholder Data
  // const [queryParams, _setQueryParams] = useState(initialParams);
  const changeLoadingState = (name, status) => {
    setApiLoadings((data) => {
      return {
        ...data,
        [name]: status,
      };
    });
  };

  const changesetNotFoundObjState = (name, status) => {
    setNotFoundObj((data) => {
      return {
        ...data,
        [name]: status,
      };
    });
  };
  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const fetchFranchiseSites = async () => {
    try {
      changeLoadingState('siteLoading', true);
      const response = await getAllTypeOfSites();
      if (response?.statusCode === 200) {
        if (response?.data?.sites?.length < 1) {
          changesetNotFoundObjState('siteNotFound', true);
        } else {
          changesetNotFoundObjState('siteNotFound', false);
        }
        setSitesData(transformArrayForOptions(response?.data?.sites, 'name', 'id'));
      }
      changeLoadingState('siteLoading', false);
    } catch (error) {
      changeLoadingState('siteLoading', false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchFranchiseSiteContracts = async (siteId) => {
    try {
      changeLoadingState('contractLoading', true);
      const response = await getFranchiseSiteContracts(siteId);
      if (response?.statusCode === 200) {
        if (response?.data?.contracts?.length < 1) {
          changesetNotFoundObjState('contractNotFound', true);
        } else {
          changesetNotFoundObjState('contractNotFound', false);
        }
        setContractsData(transformArrayForOptions(response?.data?.contracts, 'name', 'id'));
      }
      changeLoadingState('contractLoading', false);
    } catch (error) {
      changeLoadingState('contractLoading', false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchAvailableOfficersAgainstShiftId = async (shiftId, officerId) => {
    try {
      changeLoadingState('officeLoading', true);

      const response = await getShiftAvailableOfficers(shiftId);

      if (response?.statusCode === 200) {
        let alreadySelectedOfficer = response?.data?.unassigned?.find((a) => a.id == officerId);
        if (!isObjectEmpty(alreadySelectedOfficer)) {
          updateFormHandler(
            enumnConsts?.officer,
            transformArrayForOptions(
              [{ ...alreadySelectedOfficer }],
              'name',
              'id',
              '',
              'imageUrl',
            )[0],
          );
        }

        if (response?.data?.unassigned?.length < 1) {
          changesetNotFoundObjState('officeNotFound', true);
        } else {
          changesetNotFoundObjState('officeNotFound', false);
        }
        let unassignedOfficer = response?.data?.unassigned;
        setOfficers(transformArrayForOptions(unassignedOfficer, 'name', 'id', '', 'imageUrl'));
      }
      changeLoadingState('officeLoading', false);
    } catch (error) {
      changeLoadingState('officeLoading', false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchShiftLocations = async (shiftStartDate) => {
    try {
      changeLoadingState('shiftLoading', true);
      const payload = {
        windowStart: appendDefaultStartAndEndTimeWithDates([shiftStartDate, shiftStartDate])[0],
        siteId: formData?.site?.id,
        contractId: formData?.contract?.id,
      };

      // Passing isPatrol flag if the selected tab is patrol
      if (isPatrol) payload.isPatrol = true;

      const response = await getShiftLocations(payload);
      if (response?.statusCode === 200) {
        const data = response?.data?.adhocShifts.map((shift) => {
          return {
            ...shift,
            description: `${formatDayjsDateTime({ value: shift?.startsAt })} - ${formatDayjsDateTime({ value: shift?.endsAt })}`,
          };
        });
        setShiftLocation(transformArrayForOptions(data, 'name', 'id', 'description'));
        if (response?.data?.adhocShifts?.length < 1) {
          changesetNotFoundObjState('shiftNotFound', true);
        } else {
          changesetNotFoundObjState('shiftNotFound', false);
        }
      }
      changeLoadingState('shiftLoading', false);
    } catch (error) {
      changeLoadingState('shiftLoading', false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const createAddHockPayroll = async () => {
    try {
      const validatePayload = {
        officer: formData?.officer?.id || null,
        punchInTime: formData?.punchInTime?.toISOString() || null,
        punchOutTime: formData?.punchOutTime?.toISOString() || null,
        shiftStartDate: formData?.shiftStartDate?.toISOString() || null,
        location: formData?.location?.id || null,
      };

      if (!isPatrol) {
        validatePayload.contract = formData?.contract?.id || null;
        validatePayload.site = formData?.site?.id || null;
      }

      const errors = await formValidatorJoi(validatePayload, t);

      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }
      setLoading(true);
      setDisabled(true);

      const conversationOfDateAndTime = getStartEndTimeWithDesiredDate(
        formData?.shiftStartDate,
        formData?.punchInTime,
        formData?.punchOutTime,
      );

      const payload = {
        officerId: formData?.officer?.id,
        punchInTime: conversationOfDateAndTime?.startTime,
        punchOutTime: conversationOfDateAndTime?.endTime,
        paycorEmployeeId: formData?.officer?.paycorEmployeeId,
        paycorDepartmentId: formData?.officer?.paycorDepartmentId,
        paycorLegalEntityId: formData?.officer?.paycorLegalEntityId,
        adpAssociateId: formData?.officer?.adpAssociateId,
      };

      const response = await createAddHockInvoice(formData?.location?.id, payload);
      setDisabled(false);

      if (response?.statusCode === 200) {
        setShowDrawer(false);
        refreshData();
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setDisabled(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const resetValuesToNull = () => {
    updateFormHandler(enumnConsts.shiftStartDate, null);
    updateFormHandler(enumnConsts.shiftStartTime, null);
    updateFormHandler(enumnConsts.shiftEndTime, null);
    updateFormHandler(enumnConsts.location, {});
    updateFormHandler(enumnConsts.shiftStartDate, null);
    updateFormHandler(enumnConsts.officer, {});
    setOfficers([]);
    setShiftLocation([]);
    setNotFoundObj({
      contractNotFound: false,
      siteNotFound: false,
      shiftNotFound: false,
      officeNotFound: false,
    });
  };

  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);

    if (name === enumnConsts.site) {
      updateFormHandler(enumnConsts.contract, {});

      resetValuesToNull();
      setContractsData([]);
      fetchFranchiseSiteContracts(value?.id);
    }
    if (name === enumnConsts.contract) {
      resetValuesToNull();
    }

    if (name === enumnConsts.shiftStartDate) {
      updateFormHandler(enumnConsts?.location, {});
      updateFormHandler(enumnConsts?.shiftStartTime, null);
      updateFormHandler(enumnConsts?.shiftEndTime, null);
      updateFormHandler(enumnConsts?.officer, {});
      setOfficers([]);
      setShiftLocation([]);
      fetchShiftLocations(value);
    }

    if (name === enumnConsts?.location) {
      updateFormHandler(enumnConsts?.officer, {});

      if (value?.startsAt) {
        updateFormHandler(enumnConsts?.shiftStartTime, dayjsWithStandardOffset(value?.startsAt));
        removeError(enumnConsts.shiftStartTime);
      }

      if (value?.endsAt) {
        updateFormHandler(enumnConsts?.shiftEndTime, dayjsWithStandardOffset(value?.endsAt));
        removeError(enumnConsts.shiftEndTime);
      }

      setOfficers([]);
      if (isObjectEmpty(value)) {
        updateFormHandler(enumnConsts?.shiftStartTime, null);
        updateFormHandler(enumnConsts?.shiftEndTime, null);
      }

      if (value?.id) {
        fetchAvailableOfficersAgainstShiftId(value?.id, value?.officerId);
      }
    }

    if (name === enumnConsts.officer) {
      updateFormHandler(enumnConsts?.punchInTime, null);
      updateFormHandler(enumnConsts?.punchOutTime, null);
    }

    removeError(name);
  };

  useEffect(() => {
    fetchFranchiseSites();
  }, []);

  return (
    <Box className={classes.drawerWrapper}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.drawerHeader}>
        <Typography className={classes.drawerHeaderTitle} variant="h3">
          {t('obx.payroll.createPayroll')}
        </Typography>
      </Box>

      <Box className={classes.headerArea}>
        <Box className={classes.fieldWrapper}>
          {!isPatrol && (
            <Box className={classes.fieldArea}>
              <InputLabel>{t('obx.payroll.sites')}</InputLabel>
              {!apiLoadings?.siteLoading ? (
                <CustomDropDown
                  label={'sites'}
                  name="site"
                  placeHolder={`${t('obx.payroll.select')} ${t('obx.payroll.sites')}`}
                  placeHolderClassName={classes.placeHolderColor}
                  options={sitesData || []}
                  selectedValues={formData?.site} // This seems to be incorrect. It should have its own selected values.
                  handleChange={inputChangedHandler}
                  className={classes.dropdownWrap}
                  bordered
                  isError={!!errorMessages?.site}
                  searchable={true}
                />
              ) : (
                <Skeleton className={classes.skeletonDropdown} />
              )}
              {notFoundObj?.siteNotFound && (
                <Box className={classes.invalidFeedback}>{t('errors.data.notFound')}</Box>
              )}
              {!!errorMessages?.site && (
                <Box className={classes.invalidFeedback}>{errorMessages?.site}</Box>
              )}
            </Box>
          )}
          {!isPatrol && (
            <Box className={classes.fieldArea}>
              <InputLabel>{t('obx.payroll.contract')}</InputLabel>
              {!apiLoadings?.contractLoading ? (
                <CustomDropDown
                  label={'contract'}
                  name="contract"
                  placeHolder={`${t('obx.payroll.select')} ${t('obx.payroll.contract')}`}
                  placeHolderClassName={classes.placeHolderColor}
                  options={contractsData || []}
                  selectedValues={formData?.contract}
                  handleChange={inputChangedHandler}
                  className={classes.dropdownWrap}
                  bordered
                  isError={!!errorMessages?.contract}
                  searchable={true}
                />
              ) : (
                <Skeleton className={classes.skeletonDropdown} />
              )}

              {notFoundObj?.contractNotFound && (
                <Box className={classes.invalidFeedback}>{t('errors.data.notFound')}</Box>
              )}

              {!!errorMessages?.contract && (
                <Box className={classes.invalidFeedback}>{errorMessages?.contract}</Box>
              )}
            </Box>
          )}
          <Box className={classes.fieldArea}>
            <InputLabel>
              {!isPatrol
                ? t('obx.payroll.shiftStartDate')
                : t('obx.payroll.runSheetStartDate', {
                    runsheet: getLabel('terms', 'runsheet', t),
                  })}
            </InputLabel>
            <ResponsiveDatePickers
              value={formData?.shiftStartDate}
              name="shiftStartDate"
              placeholder={`${t('obx.payroll.select')} ${t('obx.payroll.shiftStartDate')}`}
              format="MM/DD/YYYY"
              onChange={(e) =>
                inputChangedHandler({
                  target: { name: 'shiftStartDate', value: e },
                })
              }
              error={!!errorMessages?.shiftStartDate}
              helperText={!!errorMessages?.shiftStartDate && errorMessages?.shiftStartDate}
              maxDate={dayjs()}
              disabled={isPatrol ? false : !formData?.contract?.id}
              timezone="UTC"
            />
          </Box>
          <Box className={classes.fieldArea}>
            <InputLabel>
              {!isPatrol
                ? t('obx.payroll.shiftLocation')
                : t('obx.payroll.runSheetLocation', {
                    runsheet: getLabel('terms', 'runsheet', t),
                  })}
            </InputLabel>
            {!apiLoadings?.shiftLoading ? (
              <CustomDropDown
                label={'location'}
                name="location"
                placeHolder={`${t('obx.payroll.select')} ${t('obx.payroll.shiftLocation')}`}
                placeHolderClassName={classes.placeHolderColor}
                options={shiftLocation}
                selectedValues={formData?.location}
                handleChange={inputChangedHandler}
                className={classes.dropdownWrap}
                bordered
                isError={!!errorMessages?.location}
                searchable={true}
              />
            ) : (
              <Skeleton className={classes.skeletonDropdown} />
            )}

            {notFoundObj?.shiftNotFound && (
              <Box className={classes.invalidFeedback}>{t('errors.data.notFound')}</Box>
            )}

            {!!errorMessages?.location && (
              <Box className={classes.invalidFeedback}>{errorMessages?.location}</Box>
            )}
          </Box>
          <Box className={classes.fieldArea}>
            <InputLabel>
              {!isPatrol
                ? t('obx.payroll.shiftStartTime')
                : t('obx.payroll.runSheetStartTime', {
                    runsheet: getLabel('terms', 'runsheet', t),
                  })}
            </InputLabel>
            <ResponsiveTimePickers
              placeholder={`${t('obx.payroll.select')} ${t('obx.payroll.shiftStartTime')}`}
              value={formData.shiftStartTime || null}
              timezone={'system'}
              timeStepsMinutes={1}
              onChange={(e) =>
                inputChangedHandler({
                  target: { name: 'shiftStartTime', value: e },
                })
              }
              error={!!errorMessages?.shiftStartTime}
              helperText={!!errorMessages?.shiftStartTime && errorMessages?.shiftStartTime}
              disabled
              enableAmPm={!is24Hours}
            />
          </Box>
          <Box className={classes.fieldArea}>
            <InputLabel>
              {!isPatrol
                ? t('obx.payroll.shiftEndTime')
                : t('obx.payroll.runSheetEndTime', {
                    runsheet: getLabel('terms', 'runsheet', t),
                  })}
            </InputLabel>
            <ResponsiveTimePickers
              placeholder={`${t('obx.payroll.select')} ${t('obx.payroll.shiftEndTime')}`}
              value={formData.shiftEndTime || null}
              timezone={'system'}
              timeStepsMinutes={1}
              onChange={(e) =>
                inputChangedHandler({
                  target: { name: 'shiftEndTime', value: e },
                })
              }
              error={!!errorMessages?.shiftEndTime}
              helperText={!!errorMessages?.shiftEndTime && errorMessages?.shiftEndTime}
              disabled
              enableAmPm={!is24Hours}
            />
          </Box>
          <Box className={classes.fieldArea}>
            <InputLabel>
              {t('obx.payroll.assignOfficer', { officer: getLabel('roles', 'officer', t) })}
            </InputLabel>
            {!apiLoadings?.officeLoading ? (
              <CustomDropDown
                label={'officer'}
                name="officer"
                placeHolder={`${t('obx.payroll.select')} ${t('obx.payroll.assignOfficer', { officer: getLabel('roles', 'officer', t) })}`}
                placeHolderClassName={classes.placeHolderColor}
                options={officers}
                selectedValues={formData?.officer}
                handleChange={inputChangedHandler}
                className={classes.dropdownWrap}
                bordered
                isError={!!errorMessages?.officer}
                searchable={true}
              />
            ) : (
              <Skeleton className={classes.skeletonDropdown} />
            )}
            {notFoundObj?.officeNotFound && (
              <Box className={classes.invalidFeedback}>{t('errors.data.notFound')}</Box>
            )}
            {!!errorMessages?.officer && (
              <Box className={classes.invalidFeedback}>{errorMessages?.officer}</Box>
            )}
          </Box>
          <Box className={classes.fieldArea}>
            <InputLabel>{t('obx.payroll.punchInTime')}</InputLabel>
            <ResponsiveTimePickers
              placeholder={`${t('obx.payroll.select')} ${t('obx.payroll.punchInTime')}`}
              value={formData.punchInTime || null}
              timeStepsMinutes={1}
              onChange={(e) =>
                inputChangedHandler({
                  target: { name: 'punchInTime', value: e },
                })
              }
              error={!!errorMessages?.punchInTime && !!formData?.officer?.id}
              helperText={
                formData?.officer?.id
                  ? !!errorMessages?.punchInTime && errorMessages?.punchInTime
                  : false
              }
              disabled={!formData?.officer?.id}
              timezone={'system'}
              enableAmPm={!is24Hours}
            />
          </Box>
          <Box className={classes.fieldArea}>
            <InputLabel>{t('obx.payroll.punchOutTime')}</InputLabel>
            <ResponsiveTimePickers
              placeholder={`${t('obx.payroll.select')} ${t('obx.payroll.punchOutTime')}`}
              value={formData.punchOutTime || null}
              timeStepsMinutes={1}
              onChange={(e) =>
                inputChangedHandler({
                  target: { name: 'punchOutTime', value: e },
                })
              }
              error={!!errorMessages?.punchOutTime && formData?.officer?.id}
              helperText={
                formData?.officer?.id
                  ? !!errorMessages?.punchOutTime && errorMessages?.punchOutTime
                  : false
              }
              disabled={!formData?.officer?.id}
              timezone={'system'}
              enableAmPm={!is24Hours}
            />
          </Box>
        </Box>
      </Box>

      <Box className={classes.footerArea}>
        <Button
          variant="secondaryGrey"
          onClick={() => {
            closeDrawer();
          }}
        >
          {t('obx.payroll.cancel')}
        </Button>
        <Button
          onClick={() => {
            createAddHockPayroll();
          }}
          variant="primary"
          disabled={disabled}
        >
          {t('obx.payroll.createPayroll')}
        </Button>
      </Box>
    </Box>
  );
};
CreatePayrollDrawer.propTypes = {
  setShowDrawer: PropTypes.func,
  refreshData: PropTypes.func,
  isPatrol: PropTypes.bool,
};
CreatePayrollDrawer.defaultProps = {
  setShowDrawer: () => {},
  refreshData: () => {},
  isPatrol: false,
};
export default CreatePayrollDrawer;
