import {
  Box,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CheckBoxRegular } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxChecked } from 'src/assets/svg/checkbox-checked.svg?react';

import { hourlyRateAssignmentFor } from '..';
import { useStyles } from '../assignmentSideDrawer.styles';

const HourlyRateAssignment = ({ assignmentValue, shiftDetail, setAssignmentValue }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const checkedHourlyRate = assignmentValue?.hourlyRate?.checked;

  const allowHourlyRateChange = (checked) => {
    setAssignmentValue((prev) => ({
      ...prev,
      hourlyRate: {
        ...prev.hourlyRate,
        checked,
        error: {
          value: '',
        },
      },
    }));
  };

  const handleChangeHourlyRate = (e) => {
    setAssignmentValue((prev) => ({
      ...prev,
      hourlyRate: {
        ...prev.hourlyRate,
        value: e.target?.value,
        error: {
          value: '',
        },
      },
    }));
  };
  const handleChangeHourlyRateAssignmentFor = (e) => {
    setAssignmentValue((prev) => ({
      ...prev,
      hourlyRate: {
        ...prev.hourlyRate,
        assignmentFor: e.target?.value,
      },
    }));
  };

  return (
    <Box className={classes.checkboxLabel}>
      <Box className={classes.hourlyRateTitle}>
        <Checkbox
          name="hourlyRate"
          disableRipple={true}
          id="hourly-rate"
          checked={checkedHourlyRate}
          icon={<CheckBoxRegular opacity={shiftDetail?.assignmentReadOnlyMode ? 0.5 : 1} />}
          checkedIcon={<CheckBoxChecked />}
          className={classes.checkBoxCustom}
          onClick={() => {
            allowHourlyRateChange(!checkedHourlyRate);
          }}
          disabled={shiftDetail?.assignmentReadOnlyMode}
        />
        <InputLabel className={classes.checkboxLabelText} htmlFor="hourly-rate">
          {t('obx.schedules.assignDedicatedDuty.assignShift.changeHourlyRate')}
        </InputLabel>
      </Box>
      <Box className={classes.labelArea}>
        {checkedHourlyRate && (
          <Box className={classes.inputStyle}>
            <TextField
              type="number"
              value={assignmentValue?.hourlyRate?.value}
              name="hourlyRate"
              onChange={handleChangeHourlyRate}
              className={classes.rateLabelField}
              error={!!assignmentValue?.hourlyRate?.error?.value}
              helperText={assignmentValue?.hourlyRate?.error?.value}
              placeholder={t(
                'obx.schedules.assignDedicatedDuty.assignShift.changeHourlyRatePlaceholder',
              )}
              disabled={shiftDetail?.assignmentReadOnlyMode}
            />
            <Box className={classes.radioWrapper}>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                className={classes.radioDiv}
                value={assignmentValue?.hourlyRate?.assignmentFor}
                onChange={handleChangeHourlyRateAssignmentFor}
              >
                <FormControlLabel
                  value={hourlyRateAssignmentFor.THIS_SHIFT}
                  control={<Radio />}
                  label={t('obx.schedules.assignDedicatedDuty.assignShift.thisShiftOnly')}
                />
                <FormControlLabel
                  value={hourlyRateAssignmentFor.UPCOMMING_SHIFT_OMWARDS}
                  control={<Radio />}
                  label={t('obx.schedules.assignDedicatedDuty.assignShift.upcomminShiftOnwards')}
                />
              </RadioGroup>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HourlyRateAssignment;

HourlyRateAssignment.propTypes = {
  shiftDetail: PropTypes.object,
  assignmentValue: PropTypes.object,
  setAssignmentValue: PropTypes.func,
};
