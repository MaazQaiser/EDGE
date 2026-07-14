import { Checkbox, InputLabel, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { getTimezoneOptions } from 'src/services/settings.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { joiValidateErrors } from 'src/utils/formValidator/formValidator.requiredCheck';
import { convertMMDDYYYYToDayJsDate, formatDayJsDate } from 'src/utils/passTime/time';
import { toaster } from 'src/utils/toast';

import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { useStyles } from './listingMoreFilter.js';

const FormKeys = {
  NAME: 'name',
  TIMEZONE: 'timezone',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
};

const initialFormState = {
  [FormKeys.NAME]: '',
  [FormKeys.TIMEZONE]: null,
  [FormKeys.START_DATE]: '',
  [FormKeys.END_DATE]: '',
};

const ContractDrawer = ({ anchor, filterCloseDrawer, width, createProposal }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [areDatesToBeDecided, setAreDatesToBeDecided] = useState(false);
  const [timezoneOptions, setTimezoneOptions] = useState([]);

  const [formData, setFormData] = useState(initialFormState);
  const [errorMessages, setErrorMessages] = useState({});

  /**
   * Fetch timezone options
   */
  const fetchTimezoneOptions = async () => {
    try {
      const response = await getTimezoneOptions();
      if (response.statusCode === 200) {
        setTimezoneOptions(response?.data?.timezones);
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
    fetchTimezoneOptions();
  }, []);

  const handleChangeTBD = () => {
    setAreDatesToBeDecided((prevVal) => {
      if (prevVal) {
        setFormData({ ...formData, [FormKeys.START_DATE]: '', [FormKeys.END_DATE]: '' });
      } else {
        const {
          [FormKeys.START_DATE]: _startDate,
          [FormKeys.END_DATE]: _endDate,
          ...restFormData
        } = formData;
        setFormData(restFormData);
      }
      return !prevVal;
    });
  };
  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const removeErrorKey = (name) => {
    const { [name]: _, ...rest } = errorMessages;
    setErrorMessages(rest);
  };

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      removeErrorKey(name);
    }
    updateFormHandler(name, value);
  };

  const handleDateChange = (customEvent) => {
    const { name, value } = customEvent;
    const isValidDate = !isNaN(value?.['$d']);
    if (isValidDate) {
      removeErrorKey(name);
    }
    updateFormHandler(name, isValidDate ? value : null);
  };

  const handleSubmit = async () => {
    const validatePayload = {
      ...formData,
      ...(!areDatesToBeDecided
        ? {
            [FormKeys.START_DATE]: formatDayJsDate(formData[FormKeys.START_DATE], 'date'),
            [FormKeys.END_DATE]: formatDayJsDate(formData[FormKeys.END_DATE], 'date'),
          }
        : {}),
    };
    const errors = await joiValidateErrors({
      data: validatePayload,
      t,
    });

    if (errors) {
      setErrorMessages(errors);
      return;
    }

    createProposal({ ...validatePayload, [FormKeys.TIMEZONE]: formData[FormKeys.TIMEZONE].id });
  };

  const getError = (key) => {
    return errorMessages[`${key}`];
  };

  return (
    <Box
      className={classes?.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
    >
      <Box className={classes?.sideHeader}>
        <DrawerHeader
          title={t('sales.deals.createProposalDrawer')}
          handleCloseDrawer={filterCloseDrawer}
          anchor={anchor}
          className={classes.moreFilterHeader}
        />
      </Box>
      <Box className={classes?.moreFilterForm}>
        <Box className={classes?.fieldWrapper}>
          <InputLabel>
            {t('sales.deals.proposalName')}
            <RequiredAsterik />
          </InputLabel>
          <TextField
            name={FormKeys.NAME}
            id={FormKeys.NAME}
            type="text"
            className={classes?.textFiledFilter}
            placeholder={t('sales.deals.addProposalName')}
            fullWidth
            value={formData[FormKeys.NAME]}
            onChange={inputChangedHandler}
            error={!!getError(FormKeys.NAME)}
            helperText={getError(FormKeys.NAME)}
            inputProps={{ maxLength: 55 }}
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>
            {t('sales.contract.timeZone')}
            <RequiredAsterik />
          </InputLabel>
          <CustomDropDown
            name={FormKeys.TIMEZONE}
            id={FormKeys.TIMEZONE}
            placeHolder={t('sales.deals.selectTimeZone')}
            placeHolderClassName={classes.placeHolderColor}
            // searchPlaceholder={t('sales.contract.selectTimeZone')}
            options={transformArrayForOptions(timezoneOptions, 'name', 'id')}
            selectedValues={formData[FormKeys.TIMEZONE] || {}} // Change here to an array
            handleChange={inputChangedHandler}
            className={classes.dropdownWrap}
            isError={!!getError(FormKeys.TIMEZONE)}
            searchable
            bordered
          />
        </Box>
        <Box>
          <div className={classes.invalidFeedback}>
            {!!getError(FormKeys.TIMEZONE) && t('sales.contract.timezoneRequired')}
          </div>
        </Box>
        <Box className={classes?.fieldWrapper}>
          <Box className={classes.checkBoxPoint}>
            <Checkbox id="datesTBD" checked={areDatesToBeDecided} onChange={handleChangeTBD} />
            <Typography variant="body2" className={classes?.previewQuestionOptionText}>
              {`${t('sales.deals.Dateendstart')}`}
            </Typography>
          </Box>
        </Box>
        {!areDatesToBeDecided && (
          <>
            <Box className={classes?.fieldWrapper}>
              <InputLabel>{t('sales.deals.startDate')}</InputLabel>
              <ResponsiveDatePickers
                value={
                  formData[FormKeys.START_DATE]
                    ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE])
                    : null
                }
                onChange={(value) => handleDateChange({ name: FormKeys.START_DATE, value })}
                minDate={convertMMDDYYYYToDayJsDate(new Date())}
                maxDate={
                  formData[FormKeys.END_DATE]
                    ? convertMMDDYYYYToDayJsDate(formData[FormKeys.END_DATE]).subtract(1, 'd')
                    : null
                }
                placeholder={`${t('sales.deals.selectstartDate')}`}
                format="MM/DD/YYYY"
                inputFormat="MM/DD/YYYY"
                error={!!getError(FormKeys.START_DATE)}
                helperText={getError(FormKeys.START_DATE)}
                className={classes.createdDatePicker}
              />
            </Box>
            <Box className={classes?.fieldWrapper}>
              <InputLabel>{t('sales.deals.endDate')}</InputLabel>
              <ResponsiveDatePickers
                value={
                  formData[FormKeys.END_DATE]
                    ? convertMMDDYYYYToDayJsDate(formData[FormKeys.END_DATE])
                    : null
                }
                minDate={
                  formData[FormKeys.START_DATE]
                    ? convertMMDDYYYYToDayJsDate(formData[FormKeys.START_DATE]).add(1, 'd')
                    : null
                }
                onChange={(value) => handleDateChange({ name: FormKeys.END_DATE, value })}
                disabled={!formData[FormKeys.START_DATE]}
                placeholder={`${t('sales.deals.selectEndDate')}`}
                format="MM/DD/YYYY"
                inputFormat="MM/DD/YYYY"
                error={!!getError(FormKeys.END_DATE)}
                helperText={getError(FormKeys.END_DATE)}
                className={classes.createdDatePicker}
              />
            </Box>
          </>
        )}
      </Box>

      <DrawerFooter
        bulkApply={t('sales.deals.createProposalDrawer')}
        bulkCancel={t('sales.deals.cancel')}
        handleCloseDrawer={filterCloseDrawer}
        onSubmit={handleSubmit}
        anchor={anchor}
        type="submit"
        classNameFooter={classes.moreFilterFooter}
      />
    </Box>
  );
};

ContractDrawer.propTypes = {
  anchor: PropTypes.string,
  filterCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  createProposal: PropTypes.func,
};

export default ContractDrawer;
