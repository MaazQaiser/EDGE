import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DaysSelection from 'src/app/components/common/daysSelection';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { getHoursDiff24HourFormat, getSplittedShiftName } from 'src/app/obx/pages/schedules/helper';
import { convertMinutesToHMFormat } from 'src/helper/utilityFunctions';
import { daysOfWeekWithVal } from 'src/utils/constants';

import { useStyles } from '../../splitJob.styles';

const SingleShift = ({
  index,
  splittedShift,
  removeSplittedShift,
  setSplittedShifts,
  noOfSplittedShifts,
  shiftDetail,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const updateSplittedShift = (key, value) => {
    setSplittedShifts((prev) => {
      return prev?.map((shift) => {
        if (shift?.key !== splittedShift?.key) return shift;

        return {
          ...shift,
          [key]: value,
        };
      });
    });
  };

  const handleSelectDays = (e) => {
    updateSplittedShift('selectedDays', e?.target?.value);
  };

  const onChangeDate = (key, value) => {
    if (!value || !value.isValid()) {
      updateSplittedShift(key, null);
      return;
    }
    let updatedValue = value?.isValid() ? value.set('seconds', 0).set('millisecond', 0) : null;
    updateSplittedShift(key, updatedValue);
  };

  useEffect(() => {
    if (
      splittedShift?.startsAt?.isValid?.() &&
      splittedShift?.endsAt?.isValid?.() &&
      splittedShift?.selectedDays?.length > 0
    ) {
      const hoursDiff = getHoursDiff24HourFormat(splittedShift?.startsAt, splittedShift?.endsAt);
      updateSplittedShift('allocatedHours', hoursDiff);
      return;
    }

    updateSplittedShift('allocatedHours', 0);
  }, [splittedShift?.startsAt, splittedShift?.endsAt, splittedShift?.selectedDays]);

  return (
    <Box className={classes.splitCustomDutyDivider}>
      <Box className={classes.splitCustomDutyBoxRow}>
        <Typography className={classes.splitCustomDutyBoxRowText} variant="subtitle2">
          {getSplittedShiftName(t, shiftDetail?.shiftNumber, index)}:
        </Typography>
        <Box className={classes.splitCustomDutyBoxRowTimer}>
          <Box className={classes.splitCustomDutyBoxRowTimerBox}>
            <ResponsiveTimePickers
              {...{
                value: splittedShift?.startsAt || null,
                onChange: (value) => onChangeDate('startsAt', value),
                placeholder: t(
                  'obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.startTime',
                ),
              }}
            />
            <Typography variant="body2" className={classes.splitCustomDutyBoxRowTimerText}>
              (
              {convertMinutesToHMFormat(
                splittedShift?.allocatedHours * splittedShift?.selectedDays?.length * 60,
              )}
              )
            </Typography>
          </Box>
          {'-'}
          <ResponsiveTimePickers
            {...{
              value: splittedShift?.endsAt || null,
              onChange: (value) => onChangeDate('endsAt', value),
              placeholder: t(
                'obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.endTime',
              ),
            }}
          />
        </Box>
        {noOfSplittedShifts > 1 && (
          <Button
            variant="secondaryGrey"
            className={classes.splitCustomDutyBoxRowBtn}
            onClick={() => removeSplittedShift(splittedShift?.key)}
          >
            <CloseIcon />
          </Button>
        )}
      </Box>

      <Box className={classes.splitCustomDutyBoxRowDays}>
        <Typography className={classes.splitCustomDutyBoxRowText} variant="subtitle2">
          {t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.specifyDays')}:
        </Typography>
        <Box className={classes.splitCustomDutyBoxRowToggle}>
          <DaysSelection
            name="weekDays"
            selectedDays={splittedShift?.selectedDays}
            data={daysOfWeekWithVal(t)}
            handleChange={handleSelectDays}
            truncateTo={3}
            disabled={shiftDetail?.disabledShiftDays || []}
            styledClass={classes.splitCustomDutyToggles}
          />
        </Box>
      </Box>

      <Box className={classes.customSplitErrors}>
        {splittedShift?.errors?.map((error, index) => (
          <Box className={classes.invalidFeedback} key={index}>
            {error}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SingleShift;

SingleShift.propTypes = {
  index: PropTypes.number,
  removeSplittedShift: PropTypes.func,
  setSplittedShifts: PropTypes.func,
  splittedShift: PropTypes.object,
  setAllocatedHours: PropTypes.func,
  noOfSplittedShifts: PropTypes.number,
  shiftDetail: PropTypes.shiftDetail,
};
