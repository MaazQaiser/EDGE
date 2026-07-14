import {
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  Skeleton,
  Typography,
} from '@mui/material';
import { ReactComponent as DeleteChipIcon } from 'assets/svg/DeleteChipIcon.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import { useTenantLabel } from 'src/helper/utilityHooks';
import {
  addJobsAndRunsheetToBreakRule,
  getDedicatedJobs,
  getRunsheets,
} from 'src/services/breakRules.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { daysOfWeekWithVal, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './AddJobsRunsheets';

const OPTIONS_ENUM = {
  DEDICATED_JOB: 'job',
  RUNSHEET: 'runsheet',
};

const AddJobsRunsheetsModal = ({
  openModal,
  handleCloseModal,
  selectedBreakRule,
  fetchAssociatedList,
}) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const [loadingStates, setLoadingStates] = useState({
    dedicatedJobs: false,
    runsheets: false,
  });
  const [dedicatedJobsOptions, setDedicatedJobsOptions] = useState([]);
  const [runsheetOptions, setRunsheetOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(OPTIONS_ENUM.DEDICATED_JOB);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedRunsheet, setSelectedRunsheet] = useState([]);
  const [selectedDedicatedJob, setSelectedDedicatedJob] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const classes = useStyles();

  const fetchRunsheets = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, runsheets: true }));
      const response = await getRunsheets();
      if (response && response?.statusCode === 200) {
        const runsheets = response?.data?.map((runsheet) => {
          const dayName = daysOfWeekWithVal(t).find((data) => data?.value === runsheet?.day)?.label;
          return {
            ...runsheet,
            name: `${runsheet?.runsheetName} • ${dayName.slice(0, 3)}`,
          };
        });
        setRunsheetOptions(transformArrayForOptions(runsheets, 'name', 'id'));
        setLoadingStates((prev) => ({ ...prev, runsheets: false }));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchDedicatedJobs = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, dedicatedJobs: true }));
      const response = await getDedicatedJobs();
      if (response && response?.statusCode === 200) {
        const dedicatedJobs = response?.data?.map((job) => ({
          ...job,
          name: `${
            job?.serviceName
              ? job?.serviceName
              : t('obx.settings.preferences.breakRules.extraJob', {
                  extra: getLabel('terms', 'extra', t),
                })
          } • ${job?.siteName}`,
        }));
        const transformedData = transformArrayForOptions(dedicatedJobs, 'name', 'id');
        setDedicatedJobsOptions(transformedData);
        setFilteredOptions(transformedData);
        setLoadingStates((prev) => ({ ...prev, dedicatedJobs: false }));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (selectedBreakRule?.id) {
      if (!dedicatedJobsOptions?.length) fetchDedicatedJobs();
      if (!runsheetOptions?.length) fetchRunsheets();
    }
  }, []);

  const handleRadioChange = (event) => {
    setSelectedValue(event.target.value);
    if (event.target.value === OPTIONS_ENUM.DEDICATED_JOB) {
      setFilteredOptions(dedicatedJobsOptions);
    } else {
      setFilteredOptions(runsheetOptions);
    }
  };

  const handleChange = (event) => {
    if (selectedValue === OPTIONS_ENUM.DEDICATED_JOB) {
      setSelectedDedicatedJob(event.target.value);
    } else {
      setSelectedRunsheet(event.target.value);
    }
  };

  const handleDelete = (id) => {
    const updatedSelection =
      selectedValue === OPTIONS_ENUM.DEDICATED_JOB
        ? selectedDedicatedJob.filter((job) => job.value !== id)
        : selectedRunsheet.filter((sheet) => sheet.value !== id);

    if (selectedValue === OPTIONS_ENUM.DEDICATED_JOB) {
      setSelectedDedicatedJob(updatedSelection);
    } else {
      setSelectedRunsheet(updatedSelection);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedBreakRule?.id) return;
      setIsLoading(true);
      const payload = {
        breakRuleId: selectedBreakRule?.id,
        dedicatedIds: selectedDedicatedJob?.map((job) => job?.value),
        patrolIds: selectedRunsheet?.map((sheet) => sheet?.value),
      };
      const response = await addJobsAndRunsheetToBreakRule(payload);
      if (response && response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleCloseModal();
        fetchAssociatedList();
        setSelectedDedicatedJob([]);
        setSelectedRunsheet([]);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteModalBody = (
    <Box className={classes.modalWrapper}>
      <Box className={classes.modalWrapperIn}>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.settings.preferences.breakRules.addJobsRunsheets', {
            runsheets: getLabel('terms', 'runsheets', t)?.toLowerCase(),
          })}
          !
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.settings.preferences.breakRules.addJobText', {
            runsheets: getLabel('terms', 'runsheets', t)?.toLowerCase(),
          })}
        </Typography>
      </Box>
      <Box className={classes.radioOption}>
        <FormControl>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="female"
            name="radio-buttons-group"
            onChange={handleRadioChange}
            value={selectedValue}
          >
            <FormControlLabel value="job" control={<Radio />} label="Job" />
            <FormControlLabel value="runsheet" control={<Radio />} label="Runsheet" />
          </RadioGroup>
        </FormControl>
      </Box>
      <Box className={classes.selectWrapper}>
        <InputLabel htmlFor={'label'}>
          {selectedValue === OPTIONS_ENUM.DEDICATED_JOB ? 'Dedicated Jobs' : 'Runsheets'}
        </InputLabel>

        {loadingStates?.dedicatedJobs && !dedicatedJobsOptions?.length ? (
          <Skeleton className={classes.skeletonDropdown} />
        ) : (
          <CustomDropDown
            name={selectedValue === OPTIONS_ENUM.DEDICATED_JOB ? 'job' : 'runsheet'}
            label={selectedValue === OPTIONS_ENUM.DEDICATED_JOB ? 'job' : 'runsheet'}
            placeholder={
              selectedValue === OPTIONS_ENUM.DEDICATED_JOB
                ? 'Select Dedicated Jobs'
                : 'Select Runsheets'
            }
            options={filteredOptions || []}
            selectedValues={
              selectedValue === OPTIONS_ENUM.DEDICATED_JOB ? selectedDedicatedJob : selectedRunsheet
            }
            handleChange={handleChange}
            isError={false}
            bordered={true}
            className={'selectInnerWrapper'}
            multiSelect
            checkmark
            searchable
            maxWidth="452px"
          />
        )}
        <Box className={classes.chipWrapper}>
          {(selectedValue === OPTIONS_ENUM.DEDICATED_JOB
            ? selectedDedicatedJob
            : selectedRunsheet
          )?.map((item) => (
            <Chip
              key={item?.value}
              color="primary"
              label={item?.label}
              deleteIcon={<DeleteChipIcon />}
              onDelete={() => handleDelete(item?.value)}
            />
          ))}
        </Box>
      </Box>
      <Box className={classes.inlineButtons}>
        <Button onClick={() => handleCloseModal()} variant="secondaryGrey">
          {t('obx.settings.preferences.breakRules.cancel')}
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {t('obx.settings.preferences.breakRules.addJobsRunsheets', {
            runsheets: getLabel('terms', 'runsheets', t)?.toLowerCase(),
          })}
          !
        </Button>
      </Box>
    </Box>
  );

  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={deleteModalBody}
    />
  );
};

AddJobsRunsheetsModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  selectedBreakRule: PropTypes.object,
  fetchAssociatedList: PropTypes.func,
};

export default AddJobsRunsheetsModal;
