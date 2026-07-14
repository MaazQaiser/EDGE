import { Box, Button, Chip, IconButton, InputLabel, Skeleton, Typography } from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/commonDropdown/close.svg?react';
import { ReactComponent as DeleteChipIcon } from 'assets/svg/DeleteChipIcon.svg?react';
import { ReactComponent as PlusIconPrimary } from 'assets/svg/plus.svg?react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import CustomInput from 'src/app/components/common/templates/customInput';
import { differenceInMinutes, minutesToDayjsTime } from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as PlusIcon } from 'src/assets/svg/WhitePlusIcon.svg?react';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useFormHook from 'src/hooks/useFormHook';
import {
  createBreakRule,
  getAssociatedRunsheetsAndDedicatedJobs,
  getBreakRuleById,
  getDedicatedJobs,
  getRunsheets,
  updateBreakRuleById,
} from 'src/services/breakRules.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { BREAK_DURATION, daysOfWeekWithVal, toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import AddCondition from '../addCondition';
import ConditionDetails from '../conditionDetails';
import { useStyles } from './addBreakTypeStyle';
const params = {
  name: '',
  runsheets: [],
  dedicatedJobs: [],
  conditions: [],
};

const AddBreakType = ({
  handleClose,
  selectedBreakRule,
  refreshBreakRules,
  handleCloseAddBreakType,
}) => {
  // const [formData, setFormData] = useState(params);
  const { handleInputChange, formData, setFormData, errorMessages, setErrorMessages } = useFormHook(
    { defaultFormData: params },
  );
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const [runsheetOptions, setRunsheetOptions] = useState([]);
  const [dedicatedJobsOptions, setDedicatedJobsOptions] = useState([]);
  const [isCondition, setIsCondition] = useState(false);
  const [editingCondition, setEditingCondition] = useState(null);
  const [deletedIndices, setDeletedIndices] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [existingBreakRule, setExistingBreakRule] = useState({
    dedicatedJobs: [],
    runsheets: [],
  });

  const [loadingStates, setLoadingStates] = useState({
    runsheets: false,
    dedicatedJobs: false,
    associatedRunsheetsAndJobs: false,
  });

  const handleDeleteRunsheet = (runsheetId) => {
    setFormData((prev) => ({
      ...prev,
      runsheets: prev.runsheets.filter((runsheet) => runsheet.value !== runsheetId),
    }));
  };

  const handleDeleteDedicatedJob = (dedicatedJobId) => {
    setFormData((prev) => ({
      ...prev,
      dedicatedJobs: prev.dedicatedJobs.filter(
        (dedicatedJob) => dedicatedJob.value !== dedicatedJobId,
      ),
    }));
  };

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
        setDedicatedJobsOptions(transformArrayForOptions(dedicatedJobs, 'name', 'id'));
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

  const handleCondition = () => {
    setIsCondition(true);
  };

  const handleAddCondition = (condition) => {
    // Throwing an error if the break type and break duration is same
    // const hasSameBreakTypeAndDuration = formData?.conditions?.some(
    //   (c) =>
    //     c?.breakType?.id &&
    //     c?.duration?.value &&
    //     c?.index !== condition?.index &&
    //     c?.breakType?.id === condition?.breakType?.id &&
    //     c?.duration?.value === condition?.duration?.value,
    // );
    // if (hasSameBreakTypeAndDuration) {
    //   toaster.error({
    //     text: t('obx.settings.preferences.breakRules.conditionAlreadyExists'),
    //     position: 'top-right',
    //     autoClose: toastSettings.AUTO_CLOSE,
    //   });
    //   return;
    // }

    // Throwing an error if the break type and break duration is same
    const conditionBreakStartsOffset = differenceInMinutes(condition?.breakStartsOffset);
    const hasSameBreakCondition = formData?.conditions?.some(
      (c) =>
        differenceInMinutes(c?.breakStartsOffset) === conditionBreakStartsOffset &&
        c?.index !== condition?.index,
    );
    if (hasSameBreakCondition) {
      toaster.error({
        text: t('obx.settings.preferences.breakRules.breakRuleAlreadyExists'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }
    setFormData((prev) => {
      if (editingCondition) {
        // Update existing condition
        const updatedConditions = prev.conditions.map((c) =>
          c.index === editingCondition.index ? { ...condition, index: editingCondition.index } : c,
        );
        return {
          ...prev,
          conditions: updatedConditions,
        };
      }

      // Add new condition with next available index
      const maxIndex = Math.max(-1, ...prev.conditions.map((c) => c.index), ...deletedIndices);
      return {
        ...prev,
        conditions: [...prev.conditions, { ...condition, index: maxIndex + 1 }],
      };
    });
    setIsCondition(false);
    setEditingCondition(null);
  };

  const handleEditCondition = (condition) => {
    setEditingCondition(condition);
    setIsCondition(true);
  };

  const handleDeleteCondition = (index) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((condition) =>
        condition.index === index ? { ...condition, _destroy: true } : condition,
      ),
    }));
    setDeletedIndices((prev) => [...prev, index]);
  };

  const handleChange = (e) => {
    // const { name, value } = e.target;
    handleInputChange(e);
    // setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getRemovedIds = (existing, current) => {
    return existing
      ?.filter((item) => !current?.map((currentItem) => currentItem?.value).includes(item?.id))
      ?.map((item) => item?.id);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    const validatePayload = {
      name: formData?.name || null,
    };
    const errors = await joiValidate(validatePayload, t);

    if (Object.keys(errors).length) {
      setErrorMessages(errors);
      setIsSaving(false);
      return;
    }

    const payload = {
      name: formData?.name,
      dedicatedIds: formData?.dedicatedJobs?.map((dedicatedJob) => dedicatedJob?.value),
      patrolIds: formData?.runsheets?.map((runsheet) => runsheet?.value),
      breakRuleConditionsAttributes: formData?.conditions?.map((condition) => {
        // If condition is marked for deletion, only return id and _destroy
        if (condition?._destroy) {
          return {
            id: condition.id,
            _destroy: true,
          };
        }

        // For new conditions, return full object
        return {
          ...(condition?.id && { id: condition?.id }),
          conditionType: condition?.conditionType?.toLowerCase(),
          breakDurationInMinutes: condition?.duration?.value
            ? Number(condition?.duration?.value)
            : null,
          breakStartOffsetMinutes: differenceInMinutes(condition?.breakStartsOffset),
          ...(condition?.conditionType?.toLowerCase() === 'range' && {
            breakEndOffsetMinutes: differenceInMinutes(condition?.breakEndsOffset),
          }),
          preBreakAlertMinutes: differenceInMinutes(condition?.preBreakAlert) || null,
          breakTypeId: condition?.breakType?.id,
          payable: condition?.payable,
        };
      }),
    };
    const removedDedicatedIds = getRemovedIds(
      existingBreakRule?.dedicatedJobs,
      formData?.dedicatedJobs,
    );
    const removedRunsheetIds = getRemovedIds(existingBreakRule?.runsheets, formData?.runsheets);

    if (!isObjectEmpty(selectedBreakRule)) {
      payload.breakRuleId = selectedBreakRule?.id;
      if (removedDedicatedIds?.length) payload.removedDedicatedIds = removedDedicatedIds;
      if (removedRunsheetIds?.length) payload.removedPatrolIds = removedRunsheetIds;
    }

    try {
      const response = isObjectEmpty(selectedBreakRule)
        ? await createBreakRule(payload)
        : await updateBreakRuleById(selectedBreakRule?.id, payload);
      if (response && response?.statusCode === 200) {
        refreshBreakRules();
        handleCloseAddBreakType();
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fetchBreakRuleById = async () => {
    try {
      const response = await getBreakRuleById(selectedBreakRule?.id);
      if (response && response?.statusCode === 200) {
        const breakRule = response?.data?.breakRule;
        setFormData({
          name: breakRule?.name,
          conditions: breakRule?.breakRuleConditions?.map((condition, index) => ({
            index,
            id: condition?.id,
            conditionType: condition?.conditionType,
            duration: BREAK_DURATION.find(
              ({ value }) => value === String(condition?.breakDurationInMinutes),
            ),
            breakStartsOffset: minutesToDayjsTime(condition?.breakStartOffsetMinutes),
            breakEndsOffset: minutesToDayjsTime(condition?.breakEndOffsetMinutes),
            preBreakAlert: minutesToDayjsTime(condition?.preBreakAlertMinutes),
            payable: condition?.payable,
            breakType: {
              name: condition?.breakTypeName,
              value: condition?.breakTypeId,
            },
          })),
        });
        fetchAssociatedRunsheetsAndDedicatedJobs();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchAssociatedRunsheetsAndDedicatedJobs = async () => {
    try {
      setLoadingStates((prev) => ({
        ...prev,
        associatedRunsheetsAndJobs: true,
      }));
      const response = await getAssociatedRunsheetsAndDedicatedJobs(selectedBreakRule?.id);
      if (response && response?.statusCode === 200) {
        setFormData((prev) => ({
          ...prev,
          dedicatedJobs: transformArrayForOptions(response?.data?.dedicated, 'siteName', 'id'),
          runsheets: transformArrayForOptions(response?.data?.patrol, 'runsheetName', 'id'),
        }));
        setExistingBreakRule({
          dedicatedJobs: response?.data?.dedicated,
          runsheets: response?.data?.patrol,
        });
        setLoadingStates((prev) => ({
          ...prev,
          associatedRunsheetsAndJobs: false,
        }));
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
    if (!runsheetOptions?.length) fetchRunsheets();
    if (!dedicatedJobsOptions?.length) fetchDedicatedJobs();
    if (!isObjectEmpty(selectedBreakRule)) fetchBreakRuleById();
  }, []);

  return (
    <>
      {!isCondition ? (
        <Box className={classes.breakTypeWrapper}>
          <Box className={classes.header}>
            <Typography variant="h3" className={classes.headerTitle}>
              {t('obx.settings.preferences.breakRules.addBreakRule')}
            </Typography>
            <CloseIcon onClick={handleClose} className={classes.closeDrawerIcon} />
          </Box>

          <Box className={classes.formWrapper}>
            <CustomInput
              label={t('obx.settings.preferences.breakRules.ruleName')}
              required
              placeholder={t('obx.settings.preferences.breakRules.placeholders.ruleName')}
              name={'name'}
              customWrapper="full-width"
              value={formData?.name}
              onChange={(e) => handleChange(e)}
              errorMessage={errorMessages?.name}
            />

            <Box className={classes.selectWrapper}>
              <InputLabel htmlFor={'label'}>
                {t('obx.settings.preferences.breakRules.runsheets', {
                  runsheets: getLabel('terms', 'runsheets', t),
                })}
              </InputLabel>

              {loadingStates?.runsheets && !runsheetOptions?.length ? (
                <Skeleton className={classes.skeletonDropdown} />
              ) : (
                <CustomDropDown
                  name="runsheets"
                  label={t('obx.settings.preferences.breakRules.runsheets', {
                    runsheets: getLabel('terms', 'runsheets', t),
                  })}
                  placeholder={t('obx.settings.preferences.breakRules.placeholders.runsheets', {
                    runsheets: getLabel('terms', 'runsheets', t),
                  })}
                  options={runsheetOptions || []}
                  selectedValues={formData?.runsheets || []}
                  handleChange={handleChange}
                  isError={false}
                  bordered={true}
                  className={'selectInnerWrapper'}
                  maxWidth="552px"
                  multiSelect
                  checkmark
                  searchable
                />
              )}
              <Box className={classes.chipWrapper}>
                {!isObjectEmpty(selectedBreakRule) && loadingStates?.associatedRunsheetsAndJobs && (
                  <Box>
                    <Skeleton width={540} height={30} />
                    <Skeleton width={540} height={30} />
                  </Box>
                )}
                {formData?.runsheets?.length
                  ? formData?.runsheets?.map((runsheet) => (
                      <Chip
                        key={runsheet?.value}
                        color="primary"
                        label={runsheet?.label}
                        onDelete={() => handleDeleteRunsheet(runsheet?.value)}
                        deleteIcon={<DeleteChipIcon />}
                      />
                    ))
                  : null}
              </Box>
            </Box>
            <Box className={classes.selectWrapper}>
              <InputLabel htmlFor={'label'}>
                {t('obx.settings.preferences.breakRules.dedicatedJobs', {
                  dedicated: getLabel('terms', 'dedicated', t),
                })}
              </InputLabel>

              {loadingStates?.dedicatedJobs && !dedicatedJobsOptions?.length ? (
                <Skeleton className={classes.skeletonDropdown} />
              ) : (
                <CustomDropDown
                  name="dedicatedJobs"
                  label={t('obx.settings.preferences.breakRules.dedicatedJobs', {
                    dedicated: getLabel('terms', 'dedicated', t),
                  })}
                  placeholder={t('obx.settings.preferences.breakRules.placeholders.dedicatedJobs', {
                    dedicated: getLabel('terms', 'dedicated', t),
                  })}
                  options={dedicatedJobsOptions || []}
                  selectedValues={formData?.dedicatedJobs || []}
                  handleChange={handleChange}
                  isError={false}
                  bordered={true}
                  className={'selectInnerWrapper'}
                  maxWidth="552px"
                  multiSelect
                  checkmark
                  searchable
                />
              )}
              <Box className={classes.chipWrapper}>
                {!isObjectEmpty(selectedBreakRule) && loadingStates?.associatedRunsheetsAndJobs && (
                  <Box>
                    <Skeleton width={540} height={30} />
                    <Skeleton width={540} height={30} />
                  </Box>
                )}
                {formData?.dedicatedJobs?.length
                  ? formData?.dedicatedJobs?.map((dedicatedJob) => (
                      <Chip
                        key={dedicatedJob?.value}
                        color="primary"
                        label={dedicatedJob?.label}
                        onDelete={() => handleDeleteDedicatedJob(dedicatedJob?.value)}
                        deleteIcon={<DeleteChipIcon />}
                      />
                    ))
                  : null}
              </Box>
            </Box>

            {!formData?.conditions?.filter((condition) => !condition?._destroy)?.length ? (
              <Box className={classes.noConditionWrapper}>
                <Typography variant="h4" className={classes.noConditionTitle}>
                  {t('obx.settings.preferences.breakRules.noConditionAdded')}
                </Typography>
                <Typography variant="body2" className={classes.noConditionDescription}>
                  {t('obx.settings.preferences.breakRules.noConditionAddedDescription')}
                </Typography>
                <Button variant="primary" onClick={handleCondition} startIcon={<PlusIcon />}>
                  {t('obx.settings.preferences.breakRules.addCondition')}
                </Button>
              </Box>
            ) : (
              <Box className={classes.conditionDetailsWrapper}>
                <Box className={classes.conditionDetailsHeader}>
                  <Typography variant="h4" className={classes.conditionDetailsTitle}>
                    {t('obx.settings.preferences.breakRules.breakConditions')}
                  </Typography>
                  <IconButton
                    aria-label="close"
                    className={classes.icnBtn}
                    onClick={handleCondition}
                  >
                    <PlusIconPrimary />
                  </IconButton>
                </Box>
                {formData?.conditions
                  ?.filter((condition) => !condition?._destroy)
                  ?.map((condition) => (
                    <ConditionDetails
                      key={condition?.index}
                      onDelete={handleDeleteCondition}
                      condition={editingCondition || condition}
                      onEdit={() => handleEditCondition(condition)}
                    />
                  ))}
              </Box>
            )}
          </Box>

          <Box className={classes.footer}>
            <Button onClick={handleClose} variant="secondaryGrey">
              {t('obx.settings.preferences.breakRules.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
              {t('obx.settings.preferences.breakRules.save')}
            </Button>
          </Box>
        </Box>
      ) : (
        <AddCondition
          handleClose={() => {
            setIsCondition(false);
            setEditingCondition(null);
          }}
          handleAddCondition={handleAddCondition}
          editingCondition={editingCondition}
        />
      )}
    </>
  );
};

export default AddBreakType;
AddBreakType.propTypes = {
  handleClose: PropTypes.func.isRequired,
  selectedBreakRule: PropTypes.object,
  refreshBreakRules: PropTypes.func.isRequired,
  handleCloseAddBreakType: PropTypes.func.isRequired,
};
