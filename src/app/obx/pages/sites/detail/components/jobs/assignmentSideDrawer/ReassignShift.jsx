import { Box, Chip, InputLabel } from '@mui/material';
import { ReactComponent as AlertIcon } from 'assets/svg/alertCircle.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import {
  adjustHourForTimePayloadInIso,
  getCurrentStandardTimeInIsoWrtTimezone,
} from 'src/app/obx/pages/schedules/helper';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './assignmentSideDrawer.styles';
import OfficerDropdown from './AssignShift/OfficerDropdown';

const ReassignShift = ({
  handleChangeValue,
  assignmentValue,
  allOfficers,
  shiftDetail,
  setChangeDate,
  setReassignmentErrors,
  reassignmentErrors,
  setAssignmentValue,
}) => {
  const { t } = useTranslation();
  const name = 'reassignedOfficer';
  const classes = useStyles();
  const { getLabel } = useTenantLabel();

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
    <Box className={classes.reassignShift}>
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

              setDates([updatedValue, adjustHourForTimePayloadInIso(shiftDetail?.shiftEndTime)]);
            }}
            placeholder={t(
              'obx.schedules.assignDedicatedDuty.assignShift.reassignment.startTimePlaceholder',
            )}
            helperText={reassignmentErrors['startTime']}
            error={!!reassignmentErrors['startTime']}
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
          />
        </Box>
      </Box>

      <Box>
        <InputLabel>
          {t('obx.schedules.assignDedicatedDuty.assignShift.reassignment.officerDropdown', {
            officer: getLabel('terms', 'officer', t),
          })}
        </InputLabel>
        <OfficerDropdown
          {...{
            handleChangeValue: updatedHandleChangeValue,
            // assignmentValue,
            selectedValue: assignmentValue?.[name]?.value,
            allOfficers: filteredOfficers(),
            name,
            classNew: classes.reassignShiftOfficer,
            errorMsg: reassignmentErrors['officer'],
          }}
        />
      </Box>

      <Box className={classes.reassignShiftChip}>
        <Chip
          icon={<AlertIcon />}
          label={t('obx.schedules.assignDedicatedDuty.assignShift.reassignment.chipText')}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ReassignShift;

ReassignShift.propTypes = {
  handleChangeValue: PropTypes.func,
  assignmentValue: PropTypes.object,
  allOfficers: PropTypes.array,
  shiftDetail: PropTypes.object,
  setChangeDate: PropTypes.func,
  reassignmentErrors: PropTypes.object,
  setReassignmentErrors: PropTypes.func,
  setAssignmentValue: PropTypes.func,
};
