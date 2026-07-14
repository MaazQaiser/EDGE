import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { defaultSplittedShift } from '../..';
import { useStyles } from '../../splitJob.styles';
import SingleShift from './SingleShift';
import SplitDetail from './SplitDetail';

const CustomSplit = ({
  shiftDetail,
  splittedShifts,
  setSplittedShifts,
  setShiftDetail,
  setDeletedSplittedShifts,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const addSplittedShift = () => {
    setSplittedShifts((prev) => {
      const key = (prev?.[prev?.length - 1]?.key || null) + 1;
      return [
        ...prev,
        {
          ...defaultSplittedShift,
          key: key,
        },
      ];
    });
  };

  const removeSplittedShift = (key) => {
    setDeletedSplittedShifts((prev) => {
      const deleted = splittedShifts?.find((shift) => shift?.key === key);
      return [...prev, deleted];
    });

    setSplittedShifts((prev) => {
      const filteredShifts = prev?.filter((shift) => shift?.key !== key) || [];
      return [...filteredShifts];
    });
  };

  // count allocated and unallocated hours on weely bases
  useEffect(() => {
    const allocatedHours = splittedShifts?.reduce((acc, cur) => {
      const numberOfSelectedDays = cur?.selectedDays?.length ?? 0;
      const totalHours = cur?.allocatedHours * numberOfSelectedDays;
      return acc + totalHours;
    }, 0);
    const unallocatedHours = shiftDetail?.durationInHrsForWeek - allocatedHours;

    setShiftDetail((prev) => ({
      ...prev,
      allocatedHoursForWeek: allocatedHours,
      unallocatedHoursForWeek: unallocatedHours,
    }));
  }, [splittedShifts, shiftDetail?.durationInHrsForWeek]);

  const lastShift = splittedShifts?.[splittedShifts?.length - 1];
  const enableAddShift =
    lastShift?.startsAt && lastShift?.endsAt && lastShift?.selectedDays?.length > 0;

  return (
    <Box className={classes.splitCustomDuty}>
      <Box className={classes.splitCustomDutyBox}>
        {splittedShifts?.map((splittedShift, index) => (
          <SingleShift
            key={splittedShift?.key}
            index={index}
            splittedShift={splittedShift}
            noOfSplittedShifts={splittedShifts?.length ?? 0}
            removeSplittedShift={removeSplittedShift}
            setSplittedShifts={setSplittedShifts}
            shiftDetail={shiftDetail}
          />
        ))}

        <SplitDetail shiftDetail={shiftDetail} />
      </Box>
      <Box className={classes.splitCustomDutyAction}>
        <Button
          variant="secondaryGrey"
          className={classes.splitCustomDutyBtn}
          onClick={addSplittedShift}
          disabled={!enableAddShift}
        >
          <PlusIcon />
        </Button>
        <Typography
          variant="subtitle2"
          className={
            enableAddShift
              ? classes.splitCustomDutyActionText
              : classes.splitCustomDutyActionTextDisabled
          }
        >
          {t('obx.schedules.assignDedicatedDuty.splitDuties.splitType.custom.splitBtn')}
        </Typography>
      </Box>
      <Box className={classes.customSplitErrorsBottom}>
        {shiftDetail?.errors?.map((error, index) => (
          <Box className={classes.invalidFeedback} key={index}>
            {error}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CustomSplit;

CustomSplit.propTypes = {
  shiftDetail: PropTypes.object,
  splittedShifts: PropTypes.array,
  setSplittedShifts: PropTypes.func,
  setShiftDetail: PropTypes.func,
  setDeletedSplittedShifts: PropTypes.func,
};
