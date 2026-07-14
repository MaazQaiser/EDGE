import { Box, Typography } from '@mui/material';
import { ReactComponent as MapPinIcon } from 'assets/svg/DedicatedDuty/map-pin.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import FieldError from 'src/app/components/common/fieldError';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import { isShiftAssignmentFrozen } from 'src/app/obx/pages/schedules/helper';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import useDateTime from 'src/hooks/useDateTime';

import { useStyles } from '../assignmentSideDrawer.styles';

const LocationAssignment = ({
  assignmentValue,
  handleChangeValue,
  setChangeDate,
  shiftDetail,
  locations,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const assignmentFrozen = isShiftAssignmentFrozen(shiftDetail);
  const { dateTimeFormat } = useDateTime();

  const start = assignmentValue?.location?.selectedDates?.[0];
  const end = assignmentValue?.location?.selectedDates?.[1];

  return (
    <Box>
      <Box className={classes.titleWrapper}>
        <MapPinIcon className={classes.mapICon} />
        <Typography variant="subtitle1">
          {t('obx.schedules.assignDedicatedDuty.assignShift.title.location')}
        </Typography>
      </Box>
      <Box className={classes.assignShiftBodyContentRow}>
        <Box className={classes.assignShiftBodyContentRowActions}>
          <Box className={classes.assignRangeDatePickers}>
            <DateRangePickerWithButtons
              selectedDates={
                assignmentValue?.location?.selectedDates?.length > 0
                  ? [dayjsWithStandardOffset(start), dayjsWithStandardOffset(end)]
                  : assignmentValue?.location?.selectedDates
              }
              placeHolder={dateTimeFormat}
              setDates={setChangeDate('location')}
              // minDate={shiftDetail?.assignmentMinDate}
              // maxDate={dayjs(shiftDetail?.shiftEndDate)}
              disabled={
                shiftDetail?.assignmentReadOnlyMode ||
                shiftDetail?.isTimeUpdated ||
                assignmentFrozen
              }
            />
            <FieldError error={assignmentValue?.location?.error?.date} />
          </Box>
          <Box>
            <CustomDropDown
              label={t('obx.schedules.assignDedicatedDuty.assignShift.locationPlaceholder')}
              name="location"
              placeHolder={t('obx.schedules.assignDedicatedDuty.assignShift.locationPlaceholder')}
              selectedValues={assignmentValue?.location?.value || {}}
              options={locations}
              handleChange={handleChangeValue}
              bordered
              className={classes.assignShiftBodyDropDown}
              isError={assignmentValue?.location?.error?.value}
              disabled={shiftDetail?.assignmentReadOnlyMode || assignmentFrozen}
            />
            <FieldError error={assignmentValue?.location?.error?.value} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LocationAssignment;

LocationAssignment.propTypes = {
  setChangeDate: PropTypes.func,
  handleChangeValue: PropTypes.func,
  assignmentValue: PropTypes.object,
  shiftDetail: PropTypes.object,
  locations: PropTypes.array,
};
