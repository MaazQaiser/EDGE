import { Box, Typography } from '@mui/material';
import { ReactComponent as UserIcon } from 'assets/svg/user.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DaysSelection from 'src/app/components/common/daysSelection';
import FieldError from 'src/app/components/common/fieldError';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import {
  dayjsWithStandardOffset,
  getDaysBetweenDatesRangeWrtStandardDate,
  getDisabledDaysFromEnabledDays,
  isShiftAssignmentFrozen,
} from 'src/app/obx/pages/schedules/helper';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { daysOfWeekWithVal } from 'src/utils/constants';

import { useStyles } from '../assignmentSideDrawer.styles';
import OfficerDropdown from './OfficerDropdown';

const OfficerAssignment = ({
  assignmentValue,
  setAssignmentValue,
  handleChangeValue,
  setChangeDate,
  shiftDetail,
  allOfficers,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const assignmentFrozen = isShiftAssignmentFrozen(shiftDetail);
  const [disabledDays, setDisabledDays] = useState([]);
  const isDateMounted = useRef();
  const isDefaultDaysSelectionMounted = useRef();

  const updateSelectedDaysInOfficerAssignment = (days) => {
    setAssignmentValue((prev) => {
      return {
        ...prev,
        officer: {
          ...prev?.officer,
          selectedDays: days,
          error: {
            ...prev?.officer.error,
            days: [],
          },
        },
      };
    });
  };

  const key = 'officer';

  const clearOfficerValueFromAssignment = () => {
    setAssignmentValue((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: {},
      },
    }));
  };
  const setDates = (dates) => {
    if (!isDateMounted.current) {
      isDateMounted.current = true;
      return;
    }

    clearOfficerValueFromAssignment();
    setChangeDate(key)(dates);
  };
  const errorMsg = assignmentValue?.officer?.error?.value;

  const selectDaysHandler = (e) => {
    clearOfficerValueFromAssignment();
    updateSelectedDaysInOfficerAssignment(e.target.value);
  };

  const start = assignmentValue?.officer?.selectedDates?.[0];
  const end = assignmentValue?.officer?.selectedDates?.[1];
  useEffect(() => {
    if (start && end && shiftDetail?.shiftDays) {
      const selectedDaysFromDates = getDaysBetweenDatesRangeWrtStandardDate(start, end);
      const enabledDays = shiftDetail?.assignmentReadOnlyMode
        ? []
        : selectedDaysFromDates.filter((day) => shiftDetail?.shiftDays.includes(day));
      const disabledDays = getDisabledDaysFromEnabledDays(enabledDays, t);
      setDisabledDays(disabledDays);

      const firstCall =
        !isDefaultDaysSelectionMounted.current && !shiftDetail?.officer?.shiftDays?.length; // for first call, check if officer is assigned on specific days. If yes, then don't set enabled days as default selection of officer days
      const otherCalls = isDefaultDaysSelectionMounted.current; // for all other call except first call
      if (firstCall || otherCalls) {
        updateSelectedDaysInOfficerAssignment(enabledDays);
      }

      isDefaultDaysSelectionMounted.current = true;
    } else if (shiftDetail?.shiftDays) {
      // If start or end is not selected and shiftDays exists then disable all days
      setDisabledDays(daysOfWeekWithVal(t)?.map((val) => val.value));
    }
  }, [start, end, shiftDetail?.shiftDays]);

  return (
    <Box>
      <Box className={classes.titleWrapper}>
        <UserIcon className={classes.mapICon} />
        <Typography variant="subtitle1">
          {t('obx.schedules.assignDedicatedDuty.assignShift.title.officer', {
            officer: getLabel('roles', 'officer', t),
          })}
        </Typography>
      </Box>
      <Box className={classes.assignShiftBodyContentRow}>
        <Box className={classes.assignShiftBodyContentRowActions}>
          <Box className={classes.assignRangeDatePickers}>
            <DateRangePickerWithButtons
              selectedDates={
                assignmentValue?.officer?.selectedDates?.length > 0
                  ? [dayjsWithStandardOffset(start), dayjsWithStandardOffset(end)]
                  : assignmentValue?.officer?.selectedDates
              }
              setDates={setDates}
              // minDate={shiftDetail?.assignmentMinDate}
              // maxDate={dayjs(shiftDetail?.shiftEndDate)}
              disabled={
                shiftDetail?.assignmentReadOnlyMode ||
                shiftDetail?.isTimeUpdated ||
                assignmentFrozen
              }
            />
            <FieldError error={assignmentValue?.officer?.error?.date} />
          </Box>
        </Box>
      </Box>
      <Box className={classes.dayContent}>
        <Box className={classes.dayWrapper}>
          <DaysSelection
            name="weekDays"
            selectedDays={assignmentValue?.officer?.selectedDays}
            data={daysOfWeekWithVal(t)}
            handleChange={selectDaysHandler}
            truncateTo={3}
            styledClass={classes.splitCustomDutyToggles}
            disabled={
              assignmentFrozen ? daysOfWeekWithVal(t)?.map((val) => val.value) : disabledDays
            }
          />
        </Box>
        <FieldError error={assignmentValue?.officer?.error?.days} />
      </Box>
      <Box className={classes.assignShiftBodyContentRow}>
        <Box className={classes.assignShiftBodyContentRowActionsDrop}>
          <OfficerDropdown
            {...{
              handleChangeValue,
              // assignmentValue,
              selectedValue: assignmentValue?.[key]?.value,
              allOfficers,
              name: key,
              errorMsg,
              disabled: shiftDetail?.assignmentReadOnlyMode || assignmentFrozen,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default OfficerAssignment;

OfficerAssignment.propTypes = {
  setChangeDate: PropTypes.func,
  handleChangeValue: PropTypes.func,
  assignmentValue: PropTypes.object,
  setAssignmentValue: PropTypes.func,
  shiftDetail: PropTypes.object,
  allOfficers: PropTypes.array,
};
