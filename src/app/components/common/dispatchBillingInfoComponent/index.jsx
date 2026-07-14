import { Box, InputLabel, TextField, Tooltip } from '@mui/material';
import { ReactComponent as CautionIcon } from 'assets/svg/caution-thin.svg?react';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { removeKey } from 'src/helper/utilityFunctions.js';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { useCurrency } from 'src/hooks/useCurrency.jsx';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions.js';
import { regexValues } from 'src/utils/constants/index.js';

import CustomDropDown from '../customDropDown/index.jsx';
import RequiredAsterik from '../requiredAsterik/index.jsx';
import RichTextEditor from '../richText/index.jsx';
import { useStyles } from './index.js';

const billingOpions = (t) => [
  { id: 1, label: t('obx.sites.createSite.billingOptions.flatRate'), value: 'flatRate' },
  { id: 2, label: t('obx.sites.createSite.billingOptions.chargePerAlarm'), value: 'CPA' },
  { id: 3, label: t('obx.sites.createSite.billingOptions.nonBillable'), value: 'Non-Billable' },
];

const DispatchBillingInfoComponent = ({
  formDataKey = 'dispatchBillingInfo',
  errorMessages = {},
  formData = {},
  noCharge = false,
  handleFieldChange = () => {},
  index,
  parentKey = 'siteServices',
  setErrorMessages = () => {},
  flatRate = false,
}) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const getErrorKey = (key, formDataKey, index) => {
    return `${formDataKey},${index},${key}`;
  };
  const { currency: franchiseCurrency } = useCurrency();

  const showError = (key, formDataKey, index) => {
    return errorMessages?.[`${getErrorKey(key, formDataKey, index)}`];
  };
  const handleInputChange = (field, value) => {
    if ((field === 'billingRate' || field === 'peakHours') && !value.match(regexValues.price)) {
      return;
    }
    handleFieldChange(index, field, value, formDataKey);

    if (value) {
      let errorKey = parentKey
        ? getErrorKey(`${formDataKey},${field}`, parentKey, index)
        : getErrorKey(field, formDataKey, index);
      setErrorMessages((prev) => removeKey([errorKey], prev));
    }
  };

  const handleEditorChange = (event) => {
    const {
      target: { value },
    } = event;
    handleInputChange('instructions', value);
  };

  const showCustomErrors = (field, formDataKey) => {
    if (parentKey) {
      return showError(`${formDataKey},${field}`, parentKey, index, errorMessages);
    }
    return showError(field, formDataKey, index, errorMessages);
  };

  const filteredData = noCharge ? billingOpions(t)?.slice(0, -1) : billingOpions(t);
  return (
    <Box>
      {' '}
      <Box>
        {t('obx.sites.createSite.dispatchBillingInfoComponent', {
          dispatch: getLabel('terms', 'dispatch', t),
        })}
      </Box>
      <Box className={classes.siteDetaisFields}>
        <Box className={classes.fieldWrapper}>
          <InputLabel htmlFor="billingType">
            {t('obx.sites.createSite.billingType')} <RequiredAsterik />
          </InputLabel>
          <CustomDropDown
            label={t('obx.sites.createSite.billingType')}
            name="billingType"
            id="billingType"
            placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.billingType')}`}
            placeHolderClassName={classes.placeHolderColor}
            className={classes.dropdownWrap}
            options={transformArrayForOptions(filteredData, 'label', 'value')}
            selectedValues={formData?.[formDataKey]?.billingType || {}}
            handleChange={(e) => handleInputChange('billingType', e.target.value)}
            bordered
          />

          {!!showCustomErrors('billingType', formDataKey, index) && (
            <Box className={classes.invalidFeedback}>
              {showCustomErrors('billingType', formDataKey, index)}
            </Box>
          )}
        </Box>
        {formData?.[formDataKey]?.billingType?.value &&
          formData?.[formDataKey]?.billingType?.value !== filteredData[2]?.value && (
            <>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="billingRate">
                  {`${t('obx.sites.createSite.billingRate')} (${franchiseCurrency})`}{' '}
                  <RequiredAsterik />
                  <Tooltip
                    placement="right"
                    arrow
                    title={t('obx.sites.tooltips.applyFlatRateTooltip')}
                  >
                    <CautionIcon />
                  </Tooltip>
                </InputLabel>

                <TextField
                  name="billingRate"
                  id="billingRate"
                  fullWidth
                  placeholder={`${t('obx.sites.createSite.billingRate')} (${franchiseCurrency})`}
                  type="text"
                  disabled={flatRate}
                  value={formData?.[formDataKey]?.billingRate}
                  className={classes?.textFiledFilter}
                  onChange={(e) => handleInputChange('billingRate', e.target.value)}
                  error={!!showCustomErrors('billingRate', formDataKey, index)}
                  helperText={
                    !!showCustomErrors('billingRate', formDataKey, index)
                      ? showCustomErrors('billingRate', formDataKey, index)
                      : null
                  }
                />
              </Box>
              {formData?.[formDataKey]?.billingType?.value === filteredData[1]?.value && (
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="peakHours">
                    {`${t('obx.sites.createSite.peakHours')} (${franchiseCurrency})`}
                    <Tooltip
                      placement="right"
                      arrow
                      title={t('obx.sites.tooltips.applyFlatRateTooltip')}
                    >
                      <CautionIcon />
                    </Tooltip>
                  </InputLabel>

                  <TextField
                    name="peakHours"
                    id="peakHours"
                    fullWidth
                    placeholder={`${t('obx.sites.createSite.peakHours')} (${franchiseCurrency})`}
                    type="text"
                    disabled={flatRate}
                    value={formData?.[formDataKey]?.peakHours}
                    className={classes?.textFiledFilter}
                    onChange={(e) => handleInputChange('peakHours', e.target.value)}
                    error={!!showCustomErrors('peakHours', formDataKey, index)}
                    helperText={
                      !!showCustomErrors('peakHours', formDataKey, index)
                        ? showCustomErrors('peakHours', formDataKey, index)
                        : null
                    }
                  />
                </Box>
              )}
            </>
          )}
      </Box>
      <Box className={classes.createExtraDutyEditor}>
        <RichTextEditor
          handleChange={handleEditorChange}
          name={'instructions'}
          placeholder={t('obx.obxExtraDuty.placeholders.descriptions')}
          value={formData?.[formDataKey]?.instructions || EditorState.createEmpty()}
          customClassEditor={classes.createDutyEditor}
        />
        {!!errorMessages?.instructions && (
          <Box className={classes.invalidFeedback}>{errorMessages?.instructions}</Box>
        )}
      </Box>
    </Box>
  );
};

export default DispatchBillingInfoComponent;

DispatchBillingInfoComponent.propTypes = {
  formData: PropTypes.object,
  errorMessages: PropTypes.object,
  parentKey: PropTypes.string,
  noCharge: PropTypes.bool,
  formDataKey: PropTypes.string,
  setErrorMessages: PropTypes.func,
  handleFieldChange: PropTypes.func,
  index: PropTypes.number,
  flatRate: PropTypes.bool,
};
