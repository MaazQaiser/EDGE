import { Box, InputLabel, Skeleton } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import { useTenantLabel } from 'src/helper/utilityHooks';
import {
  addJobsAndRunsheetToBreakRule,
  getBreakRulesDropdownListing,
} from 'src/services/breakRules.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './BreakRuleConfigurationModal';

const BreakRuleConfigurationModal = ({ open, onClose, refetchJobs, selectedJob }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    breakRule: {},
    payable: null,
  });

  const [errorMessages, setErrorMessages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBreakRules, setIsLoadingBreakRules] = useState(true);
  const [breakRules, setBreakRules] = useState([]);

  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const NA = t('commonText.nA');
  const jobName = {
    [SCHEDULE_DUTIES.DEDICATED]: getLabel('terms', 'dedicated', t),
    [SCHEDULE_DUTIES.EXTRA]: getLabel('terms', 'extra', t),
    [SCHEDULE_DUTIES.PATROL]: getLabel('terms', 'patrol', t),
  };

  useEffect(() => {
    if (selectedJob?.id) {
      fetchBreakRules();
    }
  }, []);

  useEffect(() => {
    if (selectedJob?.id && !isLoadingBreakRules)
      setFormData((prev) => ({
        ...prev,
        breakRule: breakRules.find((rule) => rule.id === selectedJob?.breakRuleId) || {},
      }));
  }, [selectedJob?.id, breakRules]);

  const handleSubmit = async () => {
    const validatePayload = {
      breakRule: formData?.breakRule?.value || null,
      // payable: formData?.payable?.toString() ?? null,
    };
    const error = await joiValidate(validatePayload, t);
    if (error && Object.keys(error).length) {
      setErrorMessages(error);
      return;
    }
    try {
      setIsLoading(true);
      const payload = {
        dedicatedIds: [selectedJob?.id],
        breakRuleId: formData?.breakRule?.id,
      };

      const response = await addJobsAndRunsheetToBreakRule(payload);

      if (response && response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        refetchJobs();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      onClose();
      setIsLoading(false);
    }
  };

  const fetchBreakRules = async () => {
    setIsLoadingBreakRules(true);
    try {
      const response = await getBreakRulesDropdownListing();
      if (response && response?.statusCode === 200) {
        setBreakRules(transformArrayForOptions(response?.data?.breakRules, 'name', 'id'));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoadingBreakRules(false);
    }
  };

  const handleChange = (event) => {
    let { name, value } = event.target;
    if (name === 'payable') value = JSON.parse(value);
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessages((prev) => ({ ...prev, [name]: null }));
  };

  const addSelectedHoursBody = (
    <Box className={classes.rejectModal}>
      <Box className={classes.rejectModalInner}>
        <Typography variant="h3" className={classes.rejectModalTitle}>
          {` ${selectedJob?.dutyType === 'extra' ? jobName[selectedJob?.dutyType] : selectedJob?.serviceName ? selectedJob?.serviceName : NA} ${t('obx.sites.jobs.breakRuleConfiguration.details')} `}
        </Typography>
        <Typography className={classes.subText} variant="subtitle2">
          {t('obx.sites.jobs.breakRuleConfiguration.description')}
        </Typography>

        <InputLabel htmlFor="payOfficerForBreaks">
          {t('obx.sites.jobs.breakRuleConfiguration.breakRule')}
        </InputLabel>
        {isLoadingBreakRules && !breakRules?.length ? (
          <Skeleton className={classes.skeletonDropdown} />
        ) : (
          <>
            <CustomDropDown
              name="breakRule"
              label="Select Break Rule"
              placeholder="Select Break Rule"
              options={breakRules || []}
              selectedValues={formData?.breakRule || {}}
              handleChange={handleChange}
              isError={!!errorMessages?.breakRule}
              bordered={true}
              className={'selectInnerWrapper'}
              searchable
            />
            {errorMessages?.breakRule && (
              <span className="errorMessage">{errorMessages?.breakRule}</span>
            )}
          </>
        )}
        {/* <Typography variant="subtitle2" className={classes.rejectModalTitle}>
          {t('obx.sites.jobs.breakRuleConfiguration.payable')}
        </Typography> */}
        {/* <Box className={classes.radioOption}>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="payable"
              onChange={handleChange}
              value={formData?.payable ?? null}
            >
              <FormControlLabel value={true} control={<Radio />} label="Yes" />
              <FormControlLabel value={false} control={<Radio />} label="No" />
            </RadioGroup>
            {errorMessages?.payable && (
              <span className="errorMessage">{errorMessages?.payable}</span>
            )}
          </FormControl>
        </Box> */}
      </Box>
      <Box className={classes.rejectModalActions}>
        <Button variant="secondaryGrey" onClick={onClose}>
          {t('obx.sites.jobs.breakRuleConfiguration.cancel')}
        </Button>
        <Button variant="primary" disabled={isLoading} onClick={handleSubmit}>
          {t('obx.sites.jobs.breakRuleConfiguration.saveChanges')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addSelectedHoursBody} />;
};

BreakRuleConfigurationModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  refetchJobs: PropTypes.func,
  selectedJob: PropTypes.object,
};

BreakRuleConfigurationModal.defaultProps = {
  open: false,
  onClose: () => {},
  refetchJobs: () => {},
  selectedJob: null,
};

export default BreakRuleConfigurationModal;
