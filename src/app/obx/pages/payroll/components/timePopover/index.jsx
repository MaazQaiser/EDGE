import { Box, Button, InputLabel } from '@mui/material';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PropTypes } from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
// import { ReactComponent as Regular } from 'src/assets/svg/checkbox.svg';
// import { ReactComponent as Iregular } from 'src/assets/svg/checkbox-checked.svg';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';

import { useStyles } from './timePopover';

const StartTimePopover = ({
  value,
  secondValue,
  onSave,
  disabled = false,
  isLoading = false,
  isSinglePopover = false,
  noApprovedHours = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');

  const [anchorEl, setAnchorEl] = useState(null);

  const [time, setTime] = useState(dayjsWithStandardOffset(value));
  const [secondTime, setSecondTime] = useState(dayjsWithStandardOffset(secondValue));
  const [checked, setChecked] = useState(false);
  const { formatDayjsDateTime } = useDateTime();

  const handleClick = (event) => {
    if (!disabled) {
      setTime(time);
      setSecondTime(secondTime);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setTime(dayjsWithStandardOffset(value));
    setSecondTime(dayjsWithStandardOffset(secondValue));
    setChecked(noApprovedHours);
    setAnchorEl(null);
  };

  const handleSave = async () => {
    if (isSinglePopover)
      await onSave({
        startTime: time,
        endTime: secondTime,
        // noApprovedHours: checked,
      });
    else onSave(time);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Box className={classes.centerBox}>
      <TextField
        className={isSinglePopover ? classes.startEndHoursFiled : classes.hourFiled}
        variant="outlined"
        type="text"
        value={
          isSinglePopover && !noApprovedHours
            ? `${formatDayjsDateTime({ value: time, formatType: dayjsFormatsEnum.time })} 
            - ${formatDayjsDateTime({ value: secondTime, formatType: dayjsFormatsEnum.time })}`
            : isSinglePopover && noApprovedHours
              ? `${NA} - ${NA}`
              : `${formatDayjsDateTime({ value: time, formatType: dayjsFormatsEnum.time })}` ||
                'N/A'
        }
        aria-describedby={id}
        onClick={handleClick}
        disabled={disabled}
      />
      <Popover
        className={isSinglePopover ? classes.singlePopoverWrapper : classes.popverWrapper}
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box className={classes.popContent}>
          <Typography variant="h4" className={classes.title}>
            {t('obx.payroll.updateApprovedHours')}
          </Typography>
          <InputLabel>
            {t('obx.payroll.start')} & {t('obx.payroll.endTime')}
          </InputLabel>
          <Box className={isSinglePopover && classes.singlePopoverBoxSpace}>
            <Box className={classes.boxSpace}>
              <ResponsiveTimePickers
                value={time}
                format="hh:mm aa"
                onChange={(val) => {
                  setTime(dayjsWithStandardOffset(val));
                }}
                disabled={disabled || checked}
                // timezone={'system'}
              />
            </Box>
            {isSinglePopover && (
              <Box className={classes.boxSpace}>
                <ResponsiveTimePickers
                  value={secondTime}
                  format="hh:mm aa"
                  onChange={(val) => {
                    setSecondTime(dayjsWithStandardOffset(val));
                  }}
                  disabled={disabled || checked}
                  // timezone={'system'}
                />
              </Box>
            )}
          </Box>
          {/*{isSinglePopover && (*/}
          {/*  <Box className={classes.checkbox}>*/}
          {/*    <Checkbox*/}
          {/*      icon={<Regular />}*/}
          {/*      checkedIcon={<Iregular />}*/}
          {/*      checked={checked}*/}
          {/*      onChange={() => setChecked((prev) => !prev)}*/}
          {/*      disabled={disabled}*/}
          {/*      className="custom-checkbox"*/}
          {/*    />*/}
          {/*    <Typography variant="body2">{t('obx.payroll.noApprovedHours')}</Typography>*/}
          {/*  </Box>*/}
          {/*)}*/}
        </Box>
        <Box className={classes.popFooter}>
          <Button variant="secondaryGrey" onClick={handleClose}>
            {t('obx.payroll.cancel')}
          </Button>
          <Button disabled={isLoading} variant="primary" onClick={handleSave}>
            {t('obx.payroll.save')}
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

StartTimePopover.propTypes = {
  value: PropTypes.string,
  secondValue: PropTypes.string,
  onSave: PropTypes.func,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  isSinglePopover: PropTypes.bool,
  noApprovedHours: PropTypes.bool,
};

export default StartTimePopover;
