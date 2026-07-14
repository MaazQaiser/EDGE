import { Box, Button, InputLabel, TextField, Tooltip, Typography } from '@mui/material';
import { EditorState } from 'draft-js';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import FieldError from 'src/app/components/common/fieldError';
import RichTextEditor from 'src/app/components/common/richText';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
// import { ReactComponent as CheckICon } from 'src/assets/svg/BlueTickIcon.svg';
import { ReactComponent as InfoIcon } from 'src/assets/svg/greyInfoIcon.svg?react';
import { ReactComponent as PlusIcon } from 'src/assets/svg/plus.svg?react';
// import { ReactComponent as CrossIcon } from 'src/assets/svg/red-cross.svg';
import { ReactComponent as TrashIcon } from 'src/assets/svg/trash.svg?react';
import { formatDeviceTypeName } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { defaultCreateTourTemplateValues } from '..';
import { useStyles } from '../assignmentSideDrawer.styles';

const CreateTourTemplate = ({
  formData,
  handleInputChange,
  children,
  reports,
  checkpoints,
  errorMessages,
  setFormData,
  setErrorMessages,
  isCreateTourTemplate,
  readOnlyMode,
  isPatrol,
  maxServiceTime,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const handleChangeStartTime = (value) => {
    const updatedValue = value?.isValid() ? value.set('seconds', 0).set('millisecond', 0) : null;

    const e = {
      target: {
        name: 'startTime',
        value: updatedValue,
      },
    };
    return handleInputChange(e);
  };

  const handleChangeMoreDescription = (value, checkpoint) => {
    handleMoreDescription(value, checkpoint);
  };
  const handleAddMoreDescription = (checkpoint) => {
    let value = null;
    if (checkpoint?.moreDescription?.getSelection()?.focusOffset === 0) {
      value = null;
    } else if (checkpoint?.moreDescription) {
      value = checkpoint?.moreDescription;
    } else {
      // checkpoint?.moreDescription === null || checkpoint?.moreDescription === undefined
      value = EditorState.createEmpty();
    }

    handleMoreDescription(value, checkpoint);
  };

  const handleMoreDescription = (value, checkpoint) => {
    const checkpointsWithMoreDescription = formData?.checkpoints?.map((chkpt) => {
      if (chkpt?.id !== checkpoint?.id) return chkpt;

      return {
        ...chkpt,
        moreDescription: value,
      };
    });

    const e = {
      target: {
        name: 'checkpoints',
        value: checkpointsWithMoreDescription,
      },
    };
    return handleInputChange(e);
  };

  const deleteSelectedCheckpoint = (selectedCheckpoint) => {
    const e = {
      target: {
        name: 'checkpoints',
        value: formData.checkpoints?.filter(
          (checkpoint) => checkpoint?.id !== selectedCheckpoint?.id,
        ),
      },
    };
    return handleInputChange(e);
  };

  useEffect(() => {
    if (isCreateTourTemplate) {
      return () => {
        setFormData(defaultCreateTourTemplateValues);
        setErrorMessages({});
      };
    }
  }, []);

  return (
    <Box className={classes.createToursBody}>
      <Box className={classes.createToursBodyContent}>
        <Box className={classes.createToursInput}>
          <InputLabel htmlFor="tourName">
            {t('obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.nameLabel', {
              tour: getLabel('terms', 'tour'),
            })}
          </InputLabel>
          <TextField
            placeholder={t(
              'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.namePlaceholder',
            )}
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            helperText={errorMessages['name']}
            error={!!errorMessages['name']}
            disabled={readOnlyMode}
            inputProps={{ maxLength: 25 }} // Set character limit
          />
        </Box>
        <Box className={classes.createToursInput}>
          <InputLabel>
            {t('obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.checkpointsLabel')}
          </InputLabel>
          <CustomDropDown
            label={t(
              'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.checkpointsPlaceholder',
            )}
            placeHolder={t(
              'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.checkpointsPlaceholder',
            )}
            name="checkpoints"
            selectedValues={formData.checkpoints || []}
            multiSelect={true}
            options={checkpoints}
            handleChange={handleInputChange}
            bordered
            className={classes.createToursDropDown}
            checkmark
            isError={!!errorMessages['checkpoints']}
            disabled={readOnlyMode}
            searchable
          />
          <FieldError error={errorMessages['checkpoints']} />
        </Box>
        {formData?.checkpoints?.map((checkpoint) => (
          <Box className={classes.createToursCheckpoints} key={checkpoint?.id}>
            <Box className={classes.checkpointNameWrapper}>
              <Box className={classes.LeftListItem}>
                <Box className={classes.listNumber}>
                  {checkpoint?.imageUrl ? (
                    <Box className={classes.listIcon}>
                      <img src={checkpoint?.imageUrl} alt="checkpoint" />
                    </Box>
                  ) : (
                    <Typography variant="subtitle2" className={classes.BlueNumerICon}>
                      {checkpoint?.label ? checkpoint.label.charAt(0) : 'A'}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="h5" className={classes.createToursCheckpointsTitle}>
                    {formatDeviceTypeName(checkpoint?.label)}
                  </Typography>
                  <Typography variant="subtitle2" className={classes.createToursCheckpointsText}>
                    {checkpoint?.description}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.trashIcon}>
                <TrashIcon onClick={() => deleteSelectedCheckpoint(checkpoint)} />
              </Box>
            </Box>
            <Box className={classes.TextEditorwrapper}>
              {!checkpoint?.moreDescription && (
                <Button
                  className={classes.assignShiftBodyAddToursBtn}
                  disableRipple
                  variant="onlyText"
                  startIcon={<PlusIcon opacity={readOnlyMode ? 0.5 : 1} />}
                  onClick={() => handleAddMoreDescription(checkpoint)}
                  disabled={readOnlyMode}
                >
                  {t('obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.descriptionBtn')}
                </Button>
              )}
              {checkpoint?.moreDescription && (
                <>
                  <RichTextEditor
                    handleChange={(e) => handleChangeMoreDescription(e.target.value, checkpoint)}
                    name={'instructions'}
                    placeholder={t('obx.obxExtraDuty.placeholders.descriptions')}
                    value={checkpoint?.moreDescription || EditorState.createEmpty()}
                    readOnly={readOnlyMode}
                  />
                  {/* <Box className={classes.editorButton}>
                    <Button className={classes.crossIcon}>
                      <CrossIcon />
                    </Button>
                    <Button className={classes.checkIcon}>
                      <CheckICon />
                    </Button>
                  </Box> */}
                </>
              )}
            </Box>
          </Box>
        ))}
        <Box className={classes.createToursInput}>
          <InputLabel>
            {t('obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.reportLabel')}{' '}
          </InputLabel>
          <CustomDropDown
            label={t(
              'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.reportPlaceholder',
            )}
            placeHolder={t(
              'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.reportPlaceholder',
            )}
            name="report"
            selectedValues={formData.report || {}}
            options={reports}
            handleChange={handleInputChange}
            bordered
            className={classes.createToursDropDown}
            isError={!!errorMessages['report']}
            disabled={readOnlyMode}
          />
          <FieldError error={errorMessages['report']} />
        </Box>
        {isPatrol ? (
          <Box className={classes.createToursTime}>
            <Box className={classes.createToursTimePicker}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.serviceTimeLabel')}
                <Tooltip
                  arrow
                  slotProps={{
                    popper: {
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: [0, -14],
                          },
                        },
                      ],
                      sx: { cursor: 'pointer' },
                    },
                  }}
                  title={t(
                    'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.serviceTimeLabelInfo',
                    {
                      officer: getLabel('terms', 'officer', t)?.toLowerCase(),
                    },
                  )}
                  placement="bottom"
                >
                  <InfoIcon />
                </Tooltip>
              </InputLabel>
              <TextField
                placeholder={t(
                  'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.between',
                  { max: maxServiceTime ?? 120 },
                )}
                id="serviceTime"
                name="serviceTime"
                value={formData.serviceTime}
                onChange={handleInputChange}
                helperText={errorMessages['serviceTime']}
                error={!!errorMessages['serviceTime']}
                disabled={readOnlyMode}
                type="number"
              />
            </Box>
          </Box>
        ) : (
          <Box className={classes.createToursTime}>
            <Box className={classes.createToursTimePicker}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.startTimeLabel')}
              </InputLabel>
              <ResponsiveTimePickers
                name="startTime"
                value={formData.startTime ? formData.startTime : null}
                onChange={handleChangeStartTime}
                placeholder={t(
                  'obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.startTimePlaceholder',
                )}
                helperText={errorMessages['startTime']}
                error={!!errorMessages['startTime']}
                disabled={readOnlyMode}
              />
            </Box>
            <Box className={classes.createToursDuration}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.tourtemplate.duration')}
              </InputLabel>
              <CustomDropDown
                label={t('obx.jobs.duration')}
                placeHolder={t('obx.jobs.duration')}
                name="duration"
                selectedValues={formData?.duration}
                options={durationOptions}
                handleChange={handleInputChange}
                bordered
                className={classes.createToursDropDown}
                isError={!!errorMessages['duration']}
                disabled={readOnlyMode}
              />
              <FieldError error={errorMessages['duration']} />
            </Box>
          </Box>
        )}

        {/* Occurances */}
        {children}
      </Box>
    </Box>
  );
};

export default CreateTourTemplate;
CreateTourTemplate.propTypes = {
  formData: PropTypes.object,
  handleInputChange: PropTypes.func,
  children: PropTypes.node,
  reports: PropTypes.array,
  checkpoints: PropTypes.array,
  errorMessages: PropTypes.array,
  setFormData: PropTypes.func,
  setErrorMessages: PropTypes.func,
  isCreateTourTemplate: PropTypes.bool,
  readOnlyMode: PropTypes.bool,
  isPatrol: PropTypes.bool,
  maxServiceTime: PropTypes.number,
};

CreateTourTemplate.defaultProps = {
  formData: {},
  handleInputChange: () => {},
  children: null,
  reports: [],
  checkpoints: [],
  errorMessages: [],
  setFormData: () => {},
  setErrorMessages: () => {},
  isCreateTourTemplate: false,
  readOnlyMode: false,
  isPatrol: false,
  maxServiceTime: 120,
};

const durationOptions = [
  '10',
  '20',
  '30',
  '40',
  '50',
  '60',
  '70',
  '80',
  '90',
  '100',
  '110',
  '120',
]?.map((a) => {
  return {
    value: a,
    label: a,
  };
});
