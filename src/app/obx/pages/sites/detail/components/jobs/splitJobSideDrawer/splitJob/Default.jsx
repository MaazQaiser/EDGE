import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  dayjsWithStandardOffset,
  getSplittedShiftName,
  selectDayNumber,
} from 'src/app/obx/pages/schedules/helper';
import { convertMinutesToHMFormat, getDaysStringFromNumbers } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { SPLIT_TYPE } from 'src/utils/constants/schedules';

import { useStyles } from '../splitJob.styles';

const Default = ({ shiftDetail, defaultShiftDurationInHrs, splittedShifts, setSplittedShifts }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();

  const getShiftDays = (firstShiftStartsAt, shiftStartsAt) => {
    firstShiftStartsAt = dayjsWithStandardOffset(firstShiftStartsAt);
    shiftStartsAt = dayjsWithStandardOffset(shiftStartsAt);

    // get incomming day midnight WRT first shift startsAt
    const incomingDayMidnight = firstShiftStartsAt
      .date(firstShiftStartsAt.date() + 1)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);

    // if shift falls from one day to other and splitted shift start time is after incomming day 12 AM, it means day is at next day
    const isNextDay =
      shiftDetail?.isEndTimeOnNextDateWrtStandardTime &&
      (shiftStartsAt?.isAfter(incomingDayMidnight) || shiftStartsAt?.isSame(incomingDayMidnight));

    const shiftDays = isNextDay
      ? shiftDetail?.shiftDays?.map((day) => {
          return selectDayNumber(day + 1);
        })
      : shiftDetail?.shiftDays;

    return shiftDays;
  };

  const generateDefaultShifts = () => {
    const remainder = shiftDetail?.shiftDurationInHrs % defaultShiftDurationInHrs;
    const quotient = shiftDetail?.shiftDurationInHrs / defaultShiftDurationInHrs;
    const noOfShifts = Math.ceil(quotient);

    let shifts = [];

    for (let i = 0; i < noOfShifts; i++) {
      const isLastShift = i + 1 === noOfShifts;
      const isFirstShift = i === 0;

      let durationInHrs = isLastShift
        ? remainder || defaultShiftDurationInHrs
        : defaultShiftDurationInHrs;

      const startsAt = isFirstShift ? dayjs(shiftDetail?.shiftStartTime) : shifts?.[i - 1]?.endsAt;
      const endsAt = isLastShift
        ? dayjs(shiftDetail?.shiftEndTime)
        : dayjs(startsAt)?.add(durationInHrs, 'h');

      const firstShiftStartsAt = isFirstShift
        ? dayjs(shiftDetail?.shiftStartTime)
        : shifts[0]?.startsAt;

      shifts.push({
        key: i + 1,
        startsAt: dayjs(startsAt),
        endsAt: dayjs(endsAt),
        selectedDays: getShiftDays(firstShiftStartsAt, startsAt) || [],
        allocatedHours: durationInHrs,
      });
    }

    return shifts;
  };

  useEffect(() => {
    if (
      !shiftDetail?.id ||
      shiftDetail?.splitType === SPLIT_TYPE.DEFAULT ||
      !defaultShiftDurationInHrs
    )
      return;

    setSplittedShifts(generateDefaultShifts());
  }, [shiftDetail]);

  const timeRange = (shift) =>
    formatDayjsDateTime({
      value: shift?.startsAt,
      formatType: dayjsFormatsEnum.time,
    }) +
    ' - ' +
    formatDayjsDateTime({
      value: shift?.endsAt,
      formatType: dayjsFormatsEnum.time,
    });

  return (
    <Box className={classes.splitDefaultDuty}>
      {splittedShifts?.map((shift, index) => (
        <Box key={shift?.key} className={classes.splitDefaultDutyBox}>
          <Typography variant="subtitle2" className={classes.splitDefaultDutyBoxText}>
            {getSplittedShiftName(t, shiftDetail?.shiftNumber, index)}: {timeRange(shift)}
            <Box component="span">
              {' '}
              ({convertMinutesToHMFormat(shift?.allocatedHours * 60)} x{' '}
              {shift?.selectedDays?.length}days =
              {convertMinutesToHMFormat(shift?.allocatedHours * 60 * shift?.selectedDays?.length)})
            </Box>
          </Typography>
          <Typography variant="body2" className={classes.splitDefaultDutyBoxSubText}>
            ({getDaysStringFromNumbers(shift?.selectedDays)})
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default Default;

Default.propTypes = {
  shiftDetail: PropTypes.array,
  defaultShiftDurationInHrs: PropTypes.number,
  splittedShifts: PropTypes.array,
  setSplittedShifts: PropTypes.func,
};
