import { Box, FormControlLabel, Radio, RadioGroup, Skeleton, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SPLIT_TYPE } from 'src/utils/constants/schedules';

import { useStyles } from '../splitJob.styles';
import CustomSplit from './CustomSplit';
import Default from './Default';

const SplitJob = ({
  shiftDetail,
  customSplittedShifts,
  setCustomSplittedShifts,
  defaultSplittedShifts,
  setDefaultSplittedShifts,
  setShiftDetail,
  defaultShiftDurationInHrs,
  selectSplitType,
  setSelectSplitType,
  setDeletedSplittedShifts,
  loading,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const chooseSplitType = (value) => {
    setSelectSplitType(value);
  };

  return (
    <Box className={classes.splitDrawerBody}>
      <Box className={classes.splitDrawerBodyTop}>
        <Box className={classes.splitDrawerBodyTopFlex}>
          <Typography className={classes.splitDrawerBodyTitle} variant="h4">
            {t('obx.schedules.assignDedicatedDuty.splitDuties.subTitle')}
          </Typography>
          <Typography className={classes.splitDrawerBodySubTitle} variant="subtitle2">
            {t('obx.schedules.assignDedicatedDuty.splitDuties.splitOnwards')}
          </Typography>
        </Box>
        <Typography className={classes.splitDrawerBodyText} variant="body2">
          {t('obx.schedules.assignDedicatedDuty.splitDuties.subtitleDescription')}
        </Typography>
      </Box>
      {loading ? (
        <Box className={classes.splitBodySkeletons}>
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
        </Box>
      ) : (
        <RadioGroup className={classes.splitDrawerContent}>
          {/* Default Job */}
          <RadioButton
            {...{
              label: t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.default.title'),
              description: t(
                'obx.schedules.assignDedicatedDuty.splitDuties.splitType.default.description',
              ),
              value: SPLIT_TYPE.DEFAULT,
              checked: selectSplitType === SPLIT_TYPE.DEFAULT,
              chooseSplitType,
              defaultShiftDurationInHrs,
            }}
          />
          {selectSplitType === SPLIT_TYPE.DEFAULT && (
            <Default
              {...{
                defaultShiftDurationInHrs,
                shiftDetail,
                splittedShifts: defaultSplittedShifts,
                setSplittedShifts: setDefaultSplittedShifts,
              }}
            />
          )}

          {/* Custom Job */}
          <RadioButton
            {...{
              label: t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.title'),
              description: t(
                'obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.description',
              ),
              value: SPLIT_TYPE.CUSTOM,
              checked: selectSplitType === SPLIT_TYPE.CUSTOM,
              chooseSplitType,
            }}
          />
          {selectSplitType === SPLIT_TYPE.CUSTOM && (
            <CustomSplit
              {...{
                shiftDetail,
                splittedShifts: customSplittedShifts,
                setSplittedShifts: setCustomSplittedShifts,
                setShiftDetail,
                setDeletedSplittedShifts,
              }}
            />
          )}
        </RadioGroup>
      )}
    </Box>
  );
};

export default SplitJob;

SplitJob.propTypes = {
  shiftDetail: PropTypes.object,
  customSplittedShifts: PropTypes.array,
  setCustomSplittedShifts: PropTypes.func,
  defaultSplittedShifts: PropTypes.array,
  setDefaultSplittedShifts: PropTypes.func,
  setShiftDetail: PropTypes.func,
  defaultShiftDurationInHrs: PropTypes.number,
  selectSplitType: PropTypes.string,
  setSelectSplitType: PropTypes.func,
  setDeletedSplittedShifts: PropTypes.func,
  loading: PropTypes.bool,
};

const RadioButton = ({
  label,
  description,
  value,
  checked,
  chooseSplitType,
  defaultShiftDurationInHrs,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box
      className={`${classes.splitDrawerDefaultRadio} ${
        checked ? classes.splitDrawerDefaultRadioShow : classes.splitDrawerDefaultRadioClose
      }`}
      onClick={() => chooseSplitType(value)}
    >
      <Box>
        <FormControlLabel
          value={value}
          control={<Radio disableRipple />}
          label={label}
          checked={checked}
          className={classes.splitDrawerDefaultRadioControl}
        />
        <Typography
          variant="body2"
          className={`${classes.splitDefaultShiftText} ${
            checked ? classes.splitDefaultShiftTextShow : ''
          }`}
        >
          {description}
        </Typography>
      </Box>
      {value === SPLIT_TYPE.DEFAULT && (
        <Box>
          <Typography variant="body3" className={classes.splitDefaultShiftSmallText}>
            {t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.default.defaultTiming')}
          </Typography>
          <Typography variant="subtitle2" className={classes.splitDefaultShiftSubTitle}>
            {t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.default.shiftDuration', {
              number: defaultShiftDurationInHrs,
            })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

RadioButton.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  description: PropTypes.string,
  checked: PropTypes.bool,
  chooseSplitType: PropTypes.func,
  defaultShiftDurationInHrs: PropTypes.number,
};
