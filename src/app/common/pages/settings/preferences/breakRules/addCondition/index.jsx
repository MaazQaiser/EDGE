import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { dayjsWithStandardOffset, differenceInMinutes } from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as BackIcon } from 'src/assets/svg/arrow-left.svg?react';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useFormHook from 'src/hooks/useFormHook';
import { getBreakTypes } from 'src/services/breakRules.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { BREAK_DURATION, toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './addConditionStyle';
const CONDITION_TYPES = {
  FIXED: 'fixed',
  RANGE: 'range',
};

const params = {
  breakType: {},
  duration: {},
  conditionType: CONDITION_TYPES.FIXED,
  breakStartsOffset: {},
  breakEndsOffset: {},
  preBreakAlert: {},
  payable: false,
};

const AddCondition = ({ handleClose, handleAddCondition, editingCondition = null }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const classes = useStyles();
  // const [errorMessages, setErrorMessages] = useState({});
  const [selectedTab, setSelectedTab] = useState(CONDITION_TYPES.FIXED);
  const [breakTypeOptions, setBreakTypeOptions] = useState([]);
  const [loadingBreakTypes, setLoadingBreakTypes] = useState(false);
  const { handleInputChange, formData, setFormData, errorMessages, setErrorMessages } = useFormHook(
    { defaultFormData: params },
  );
  const handleSelection = (value) => {
    setSelectedTab(value);
    setFormData((prev) => ({ ...prev, conditionType: value }));
  };

  console.log({ formData });

  useEffect(() => {
    if (editingCondition) setFormData(editingCondition);
    setSelectedTab(editingCondition?.conditionType || CONDITION_TYPES.FIXED);
  }, [editingCondition]);

  const handleChange = async (name, value) => {
    // Setting 60 minutes if user selects greater than 60 minutes
    if (name === 'preBreakAlert') {
      if (Number(differenceInMinutes(value)) > 60) {
        value = dayjsWithStandardOffset().hour(0).minute(60).second(0).millisecond(0);
      }
    }
    handleInputChange({ target: { name, value } });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const checkValidation = async () => {
    const {
      duration,
      breakType,
      breakStartsOffset,
      breakEndsOffset,
      preBreakAlert,
      conditionType,
    } = formData || {};

    const validatePayload = {
      duration: duration?.value || null,
      breakType: breakType?.value || null,
      breakStartsOffset:
        (!isObjectEmpty(breakStartsOffset) && String(differenceInMinutes(breakStartsOffset))) ||
        null,
      ...(conditionType?.toLowerCase() === CONDITION_TYPES.RANGE && {
        breakEndsOffset:
          (!isObjectEmpty(breakEndsOffset) && String(differenceInMinutes(breakEndsOffset))) || null,
      }),
      preBreakAlert:
        (!isObjectEmpty(preBreakAlert) && String(differenceInMinutes(preBreakAlert))) || null,
    };

    const errors = await joiValidate(validatePayload, t);

    if (errors) {
      const preBreakAlertInMinutes = Number(differenceInMinutes(preBreakAlert));
      const breakStartsOffsetInMinutes = Number(differenceInMinutes(breakStartsOffset));
      const breakEndsOffsetInMinutes = Number(differenceInMinutes(breakEndsOffset));

      // Setting an error if break start time in minutes is zero
      if (breakStartsOffsetInMinutes === 0) {
        errors.breakStartsOffset = t('obx.settings.preferences.breakRules.breakStartTimeNullError');
      }

      // Setting an error if break end time in minutes is zero
      if (breakEndsOffsetInMinutes === 0) {
        errors.breakEndsOffset = t('obx.settings.preferences.breakRules.breakEndTimeNullError');
      }

      // Setting an error if pre-alert break time in minutes is zero
      if (preBreakAlertInMinutes === 0) {
        errors.preBreakAlert = t('obx.settings.preferences.breakRules.preBreakTimeNullError');
      }

      // Setting an error if break ends before the break start time offset
      if (breakStartsOffsetInMinutes > breakEndsOffsetInMinutes) {
        errors.breakStartsOffset = t(
          'obx.settings.preferences.breakRules.breakEndBeforeBreakStartError',
        );
      }

      // Setting an error if pre-alert break is before the break start time offset
      if (preBreakAlertInMinutes > breakStartsOffsetInMinutes) {
        errors.preBreakAlert = t(
          'obx.settings.preferences.breakRules.preBreakBeforeStartTimeError',
        );
      }

      if (errors.breakEndsOffset && errors.breakStartsOffset) {
        errors.breakStartsOffset = t(
          'obx.settings.preferences.breakRules.breakStartEndOffsetMissing',
        );
      }

      if (Object.keys(errors).length) {
        setErrorMessages(errors);
        return errors;
      }
    }

    return {};
  };

  const handleSubmit = async () => {
    const errors = await checkValidation();
    if (!Object.keys(errors)?.length) handleAddCondition(formData);
  };

  const fetchBreakTypes = async () => {
    try {
      setLoadingBreakTypes(true);
      const response = await getBreakTypes();
      if (response && response?.statusCode === 200) {
        setBreakTypeOptions(transformArrayForOptions(response?.data?.breakTypes, 'name', 'id'));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoadingBreakTypes(false);
    }
  };

  useEffect(() => {
    if (breakTypeOptions?.length && formData?.breakType?.name) {
      const matchingBreakType = breakTypeOptions.find(
        (option) => option.name === formData.breakType.name,
      );
      if (matchingBreakType) {
        setFormData((prev) => ({
          ...prev,
          breakType: matchingBreakType,
        }));
      }
    }
  }, [breakTypeOptions]);

  useEffect(() => {
    fetchBreakTypes();
  }, []);

  return (
    <Box className={classes.breakTypeWrapper}>
      <Box className={classes.header}>
        <Box className={classes.headerTitleWrapper}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={(theme) => ({
              color: theme.palette.grey[500],
            })}
            className={classes.backIconBtn}
          >
            <BackIcon />
          </IconButton>
          <Typography variant="h3" className={classes.headerTitle}>
            {t('obx.settings.preferences.breakRules.addCondition')}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 24,
            top: 24,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box className={classes.formWrapper}>
        <Box className={classes.selectWrapper}>
          <Typography variant="h4" className={classes.breakConditionTitle}>
            {t('obx.settings.preferences.breakRules.breakType')}
            <RequiredAsterik />
          </Typography>
          {loadingBreakTypes ? (
            <Skeleton className={classes.skeletonDropdown} />
          ) : (
            <Box>
              <CustomDropDown
                name={'breakType'}
                // label={t('obx.settings.preferences.breakRules.breakType')}
                placeholder={t('obx.settings.preferences.breakRules.placeholders.breakType')}
                options={breakTypeOptions || []}
                selectedValues={formData?.breakType || {}}
                handleChange={(e) => handleChange('breakType', e.target.value)}
                isError={!!errorMessages?.breakType}
                bordered={true}
                className={'selectInnerWrapper'}
              />
              {!!errorMessages?.breakType && (
                <Box>
                  <div className={classes.invalidFeedback}>{errorMessages?.breakType}</div>
                </Box>
              )}
            </Box>
          )}
        </Box>
        <Box className={classes.selectWrapper}>
          <Typography variant="h4" className={classes.breakConditionTitle}>
            {t('obx.settings.preferences.breakRules.breakDuration')}
            <RequiredAsterik />
          </Typography>

          <Box>
            <CustomDropDown
              name={'duration'}
              // label={t('obx.settings.preferences.breakRules.breakDuration')}
              placeholder={t('obx.settings.preferences.breakRules.placeholders.breakDuration')}
              options={BREAK_DURATION}
              selectedValues={formData?.duration || {}}
              handleChange={(e) => handleChange('duration', e.target.value)}
              isError={!!errorMessages?.duration}
              bordered={true}
              className={'selectInnerWrapper'}
            />
            {!!errorMessages?.duration && (
              <Box>
                <div className={classes.invalidFeedback}>{errorMessages?.duration}</div>
              </Box>
            )}
          </Box>
        </Box>
        <Box className={classes.conditionWrapper}>
          <Typography variant="h4" className={classes.breakConditionTitle}>
            {t('obx.settings.preferences.breakRules.breakCondition')}
            <RequiredAsterik />
          </Typography>
          <Box className={classes.fixRangeWrapper}>
            <Box className={classes.buttonsBarWrapper}>
              <ToggleButtonGroup
                value={selectedTab}
                exclusive
                onChange={(_, value) => handleSelection(value)}
                aria-label="toggle button tabs"
                className={classes.statesButtons}
              >
                <ToggleButton value={CONDITION_TYPES.FIXED} aria-label="tab 1" disableRipple>
                  {t('obx.settings.preferences.breakRules.fixed')}
                </ToggleButton>
                <ToggleButton value={CONDITION_TYPES.RANGE} aria-label="tab 2" disableRipple>
                  {t('obx.settings.preferences.breakRules.range')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box>
              {selectedTab === CONDITION_TYPES.FIXED && (
                <Box className={classes.horizontalWrapper}>
                  <Typography variant="subtitle2" className={classes.horizontalLabel}>
                    {t('obx.settings.preferences.breakRules.breakStarts')}
                  </Typography>

                  <ResponsiveTimePickers
                    format="hh:mm"
                    value={formData?.breakStartsOffset}
                    onChange={(value) => handleChange('breakStartsOffset', value)}
                    name="breakStartsOffset"
                    enableAmPm={false}
                    error={!!errorMessages?.breakStartsOffset}
                    timeStepsMinutes={1}
                  />
                  <Typography variant="subtitle2" className={classes.horizontalLabel}>
                    {t('obx.settings.preferences.breakRules.afterClockingIn')}
                  </Typography>
                </Box>
              )}
              {selectedTab === CONDITION_TYPES.RANGE && (
                <Box className={classes.horizontalWrapper}>
                  <Typography variant="subtitle2" className={classes.horizontalLabel}>
                    {t('obx.settings.preferences.breakRules.breakStartsFrom')}
                  </Typography>
                  <ResponsiveTimePickers
                    format="hh:mm"
                    value={formData?.breakStartsOffset}
                    onChange={(value) => handleChange('breakStartsOffset', value)}
                    name="breakStartsOffset"
                    enableAmPm={false}
                    error={!!errorMessages?.breakStartsOffset}
                    timeStepsMinutes={1}
                  />
                  <Typography variant="subtitle2" className={classes.horizontalLabel}>
                    {t('obx.settings.preferences.breakRules.to')}
                  </Typography>
                  <ResponsiveTimePickers
                    format="hh:mm"
                    value={formData?.breakEndsOffset}
                    onChange={(value) => handleChange('breakEndsOffset', value)}
                    name="breakEndsOffset"
                    enableAmPm={false}
                    error={!!errorMessages?.breakEndsOffset}
                    timeStepsMinutes={1}
                  />
                  <Typography variant="subtitle2" className={classes.horizontalLabel}>
                    {t('obx.settings.preferences.breakRules.afterClockingIn')}
                  </Typography>
                </Box>
              )}
              {!!errorMessages?.breakStartsOffset && (
                <Box>
                  <div className={classes.invalidFeedback}>{errorMessages?.breakStartsOffset}</div>
                </Box>
              )}
              {!errorMessages?.breakStartsOffset && !!errorMessages?.breakEndsOffset && (
                <Box>
                  <div className={classes.invalidFeedback}>{errorMessages?.breakEndsOffset}</div>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        <Box className={classes.conditionWrapper}>
          <Typography variant="h4" className={classes.breakConditionTitle}>
            {t('obx.settings.preferences.breakRules.notifyUser')}
            <RequiredAsterik />
          </Typography>
          <Box>
            <Box className={classes.horizontalWrapper}>
              <Typography variant="subtitle2" className={classes.horizontalLabel}>
                {t('obx.settings.preferences.breakRules.notifyTheUser')}
              </Typography>
              <ResponsiveTimePickers
                format="hh:mm"
                value={formData?.preBreakAlert}
                onChange={(value) => handleChange('preBreakAlert', value)}
                name="preBreakAlert"
                enableAmPm={false}
                error={!!errorMessages?.preBreakAlert}
                timeStepsMinutes={1}
                maxValue={dayjsWithStandardOffset().hour(0).minute(60).second(0).millisecond(0)}
              />
              <Typography variant="subtitle2" className={classes.horizontalLabel}>
                {t('obx.settings.preferences.breakRules.beforeStartOfTheBreak')}
              </Typography>
            </Box>
            <Box>
              {!!errorMessages?.preBreakAlert && (
                <div className={classes.invalidFeedback}>{errorMessages?.preBreakAlert}</div>
              )}
            </Box>
          </Box>
        </Box>
        <Box className={classes.conditionWrapper}>
          <Typography variant="h4" className={classes.breakConditionTitle}>
            {t('obx.settings.preferences.breakRules.payOfficerForBreak', {
              officer: getLabel('terms', 'officer', t)?.toLowerCase(),
            })}
            <RequiredAsterik />
          </Typography>
          <Box className={classes.radioWrapper}>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              className={classes.radioDiv}
              value={formData?.payable ?? null}
              name={'isBreakPayable'}
              onChange={(e) => handleChange('payable', JSON.parse(e.target.value))}
            >
              <FormControlLabel
                control={<Radio />}
                value={true}
                label={t('obx.settings.preferences.breakRules.yes')}
              />
              <FormControlLabel
                control={<Radio />}
                value={false}
                label={t('obx.settings.preferences.breakRules.no')}
              />
            </RadioGroup>
          </Box>
        </Box>
      </Box>
      <Box className={classes.footer}>
        <Button variant="secondaryGrey" onClick={handleClose}>
          {t('obx.settings.preferences.breakRules.cancel')}
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {t('obx.settings.preferences.breakRules.addCondition')}
        </Button>
      </Box>
    </Box>
  );
};

export default AddCondition;
AddCondition.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleAddCondition: PropTypes.func.isRequired,
  editingCondition: PropTypes.object,
};
