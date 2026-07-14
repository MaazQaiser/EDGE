import { Box, Chip, InputLabel, Switch, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import {
  adjustHourForTimePayloadInIso,
  getCurrentStandardTimeInIsoWrtTimezone,
} from 'src/app/obx/pages/schedules/helper';
import { AlertIcon } from 'src/assets/svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import { ShiftStatus } from 'src/utils/constants/schedules';

import { useStyles } from '../assignmentSideDrawer.styles';
import OfficerDropdown from './OfficerDropdown';

const ShiftReassignment = ({
  shiftDetail,
  setAssignmentValue,
  assignmentValue,
  handleChangeValue,
  setReassignmentErrors,
  setChangeDate,
  allOfficers,
  reassignmentErrors,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const name = 'reassignedOfficer';
  const isReassigned = !isObjectEmpty(shiftDetail?.reassignOfficer);
  const { is24Hours } = useDateTime();

  const isShiftNotNull = !isObjectEmpty(shiftDetail);
  const isShiftInProgress = shiftDetail?.shiftStatus === ShiftStatus.SHIFT_STARTED;

  const isShiftAvailableAndInProgress = isShiftNotNull && isShiftInProgress;

  const changeToggleShiftReassignment = (value) => {
    setAssignmentValue((prev) => ({
      ...prev,
      reassignedOfficer: {
        ...prev?.reassignedOfficer,
        reassignmentEnabled: value,
      },
    }));
  };

  useEffect(() => {
    if (isReassigned) {
      setAssignmentValue((prev) => ({
        ...prev,
        reassignedOfficer: {
          ...prev?.reassignedOfficer,
          reassignmentEnabled: true,
        },
      }));
    }
  }, isReassigned);

  const setDates = (dates) => {
    setAssignmentValue((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        value: {},
      },
    }));

    setChangeDate(name)(dates);
    setReassignmentErrors((prev) => ({
      ...prev,
      startTime: '',
    }));
  };

  const updatedHandleChangeValue = (e) => {
    handleChangeValue(e);
    setReassignmentErrors((prev) => ({
      ...prev,
      officer: '',
    }));
  };

  useEffect(() => {
    let startTime = dayjs(getCurrentStandardTimeInIsoWrtTimezone());
    let endTime = adjustHourForTimePayloadInIso(shiftDetail?.shiftEndTime);

    if (shiftDetail?.reassignOfficer) {
      startTime = dayjs(shiftDetail?.reassignOfficer?.startsAt);
      endTime = dayjs(shiftDetail?.reassignOfficer?.endsAt);

      const e = {
        target: {
          name,
          value: {
            ...shiftDetail?.reassignOfficer,
            id: shiftDetail?.reassignOfficer?.officerId,
            image: shiftDetail?.reassignOfficer?.imageUrl,
            label: shiftDetail?.reassignOfficer?.name,
          },
        },
      };
      handleChangeValue(e);
    }

    setChangeDate(name)([startTime, endTime]); // set initial start and end time

    return () => {
      // upon unmounting, remove officer selection
      const e = {
        target: {
          name,
          value: null,
        },
      };
      handleChangeValue(e);
      setReassignmentErrors({
        officer: '',
        startTime: '',
      });
    };
  }, []);

  const filteredOfficers = () => {
    // filter officer if it is already assigned to main shift

    return {
      ...(allOfficers?.assignMe?.id !== shiftDetail?.officer?.id && {
        assignMe: allOfficers?.assignMe,
      }), // remove assignMe option, if supervisor is already assigned to main shift
      assigned: allOfficers?.assigned?.filter(
        (assignedOfficer) => assignedOfficer?.id !== shiftDetail?.officer?.id,
      ), // get all assigned officers, except one which is already assigned to main shift
      unassigned: allOfficers?.unassigned?.filter(
        (unassignedOfficer) => unassignedOfficer?.id !== shiftDetail?.officer?.id,
      ), // get all assunigned officers, except one which is already assigned to main shift
    };
  };

  return (
    <Box>
      {isShiftAvailableAndInProgress && (
        <>
          {isReassigned && (
            <Box className={classes.reassigmentShiftChip}>
              <Chip
                icon={<AlertIcon />}
                label={t('obx.schedules.assignDedicatedDuty.assignShift.chipText')}
                color="primary"
              />
            </Box>
          )}
          <Box
            className={
              isReassigned ? classes.showReassignmentWrapper : classes.showReassignmentSection
            }
          >
            <Box className={classes.thisShiftSettingText}>
              <Typography variant="h5">
                {t('obx.schedules.assignDedicatedDuty.assignShift.shiftReassignmentSection.title')}
              </Typography>
              <Typography variant="body2" className={classes.thisShiftSettingTextDescription}>
                {t(
                  'obx.schedules.assignDedicatedDuty.assignShift.shiftReassignmentSection.description',
                )}
              </Typography>
            </Box>
            <Switch
              size="small"
              checked={assignmentValue?.reassignedOfficer?.reassignmentEnabled}
              onChange={(e) => changeToggleShiftReassignment(e.target.checked)}
              className={classes.thisShiftSwitch}
              disabled={isReassigned}
            />
          </Box>
          {/* Shift Reassignment Fields */}
          {assignmentValue?.reassignedOfficer?.reassignmentEnabled && (
            <>
              <Box className={classes.reassignShiftTimer}>
                <Box>
                  <InputLabel>
                    {t('obx.schedules.assignDedicatedDuty.assignShift.reassignment.startTimeLabel')}
                  </InputLabel>
                  <ResponsiveTimePickers
                    name="startTime"
                    value={assignmentValue?.reassignedOfficer?.selectedDates[0] || null}
                    onChange={(value) => {
                      const updatedValue = value?.isValid()
                        ? value.set('seconds', 0).set('millisecond', 0)
                        : null;

                      setDates([
                        updatedValue,
                        adjustHourForTimePayloadInIso(shiftDetail?.shiftEndTime),
                      ]);
                    }}
                    placeholder={t(
                      'obx.schedules.assignDedicatedDuty.assignShift.reassignment.startTimePlaceholder',
                    )}
                    helperText={reassignmentErrors['startTime']}
                    error={!!reassignmentErrors['startTime']}
                    timeStepsMinutes={1}
                    enableAmPm={!is24Hours}
                  />
                </Box>
                <Box>
                  <InputLabel>
                    {t('obx.schedules.assignDedicatedDuty.assignShift.reassignment.endTimeLabel')}
                  </InputLabel>
                  <ResponsiveTimePickers
                    name="endTime"
                    value={assignmentValue?.reassignedOfficer?.selectedDates[1] || null}
                    disabled
                    placeholder={t(
                      'obx.schedules.assignDedicatedDuty.assignShift.reassignment.endTimePlaceholder',
                    )}
                    enableAmPm={!is24Hours}
                  />
                </Box>
              </Box>

              <Box className={classes.chooseReassignOfficer}>
                <InputLabel>
                  {t(
                    'obx.schedules.assignDedicatedDuty.assignShift.shiftReassignmentSection.officerDropdown',
                  )}
                </InputLabel>
                <OfficerDropdown
                  handleChangeValue={(e) => updatedHandleChangeValue(e)}
                  selectedValue={assignmentValue?.reassignedOfficer?.value || {}}
                  allOfficers={filteredOfficers()}
                  name={'reassignedOfficer'}
                  errorMsg={reassignmentErrors['officer']}
                  disabled={isObjectEmpty(allOfficers)}
                  label={t(
                    'obx.schedules.assignDedicatedDuty.assignShift.shiftReassignmentSection.officerDropdown',
                  )}
                  placeHolder={t(
                    'obx.schedules.assignDedicatedDuty.assignShift.shiftReassignmentSection.officerPlaceholder',
                  )}
                  maxWidth="670px"
                />
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default ShiftReassignment;

ShiftReassignment.propTypes = {
  shiftDetail: PropTypes.object,
  setAssignmentValue: PropTypes.func,
  assignmentValue: PropTypes.object,
  handleChangeValue: PropTypes.func,
  setReassignmentErrors: PropTypes.func,
  setChangeDate: PropTypes.func,
  allOfficers: PropTypes.object,
  reassignmentErrors: PropTypes.object,
};
