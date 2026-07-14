import { Box, InputLabel, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDateTimePickers from 'src/app/components/common/dateTimePicker';
import FieldError from 'src/app/components/common/fieldError';
import {
  dayjsWithStandardOffset,
  getDaysBetweenDatesRangeWrtStandardDate,
} from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as InfoIcon } from 'src/assets/svg/infoCurrentColor.svg?react';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { ShiftStatus } from 'src/utils/constants/schedules';

import { useStyles } from '../assignmentSideDrawer.styles';
import AutoClockOut from '../AssignShift/AutoClockOut';
import OfficerDropdown from '../AssignShift/OfficerDropdown';

const ThisShift = ({
  formData = {},
  handleInputChange = () => {},
  errorMessages = {},
  locations = [],
  allOfficers,
  shiftDetail = {},
  setAssignmentValue = () => {},
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const missingShiftStatus =
    shiftDetail == null ||
    typeof shiftDetail !== 'object' ||
    !Object.hasOwn(shiftDetail || {}, 'shiftStatus');

  const shiftStartDateTime = dayjsWithStandardOffset(shiftDetail?.selectedShiftStartTime);
  const shiftEndDateTime = dayjsWithStandardOffset(shiftDetail?.selectedShiftEndTime);

  useEffect(() => {
    if (!shiftDetail?.selectedShiftStartTime || !shiftDetail?.shiftDays?.length) {
      return;
    }

    const shiftStartRef = dayjsWithStandardOffset(shiftDetail.selectedShiftStartTime);

    const selectedDates = shiftStartRef?.isValid?.() ? [shiftStartRef, shiftStartRef] : [];
    const occurrenceDay = shiftStartRef?.isValid?.() ? shiftStartRef.day() : null;
    const selectedDaysFromDates =
      occurrenceDay != null && shiftDetail?.shiftDays?.length
        ? [occurrenceDay].filter((day) => shiftDetail.shiftDays.includes(day))
        : getDaysBetweenDatesRangeWrtStandardDate(shiftStartRef, shiftStartRef);
    setAssignmentValue((prev) => ({
      ...prev,
      startDate: shiftStartRef,
      endDate: shiftStartRef,
      officer: {
        ...prev?.officer,
        selectedDates,
        startDate: shiftStartRef,
        endDate: shiftStartRef,
        selectedDays: selectedDaysFromDates,
      },
    }));
  }, [setAssignmentValue, shiftDetail?.shiftDays, shiftDetail?.selectedShiftStartTime]);

  return (
    <Box>
      <Box className={classes.assignShiftBodyW}>
        <Box className={classes.assignShiftBodyContentRow}>
          <Box className={classes.assignShiftBodyContentRowActions}>
            <Box className={classes.createToursInput}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.title.location')}
              </InputLabel>
              <CustomDropDown
                label={t('obx.schedules.assignDedicatedDuty.assignShift.locationPlaceholder')}
                placeHolder={t('obx.schedules.assignDedicatedDuty.assignShift.locationPlaceholder')}
                name="location"
                selectedValues={formData?.location?.value || {}}
                options={locations}
                handleChange={handleInputChange}
                bordered
                className={classes.assignShiftBodyDropDown}
                isError={!!formData?.location?.error?.value}
                disabled={
                  missingShiftStatus || shiftDetail?.shiftStatus === ShiftStatus.SHIFT_STARTED
                }
              />
              <FieldError error={formData?.location?.error?.value} />
              <Box className={classes.locationInfoWrapper}>
                <Box className={classes.titleWrapper}>
                  <InfoIcon className={classes.locationInfoIcon} />
                  <Typography variant="body2" className={classes.thisShiftSettingTextDescription}>
                    {t('obx.schedules.assignDedicatedDuty.assignShift.locationInfo', {
                      defaultValue: 'Applies within the selected date range only',
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box className={classes.createToursInput}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.title.officer', {
                  officer: getLabel('roles', 'officer', t),
                })}
              </InputLabel>
              <OfficerDropdown
                handleChangeValue={handleInputChange}
                selectedValue={formData?.officer?.value || {}}
                allOfficers={allOfficers}
                name={'officer'}
                errorMsg={errorMessages['officer']}
                disabled={
                  missingShiftStatus ||
                  isObjectEmpty(allOfficers) ||
                  shiftDetail?.shiftStatus === ShiftStatus.SHIFT_STARTED
                }
                label={t('obx.schedules.assignDedicatedDuty.assignShift.officerPlaceholder', {
                  officer: getLabel('roles', 'officer', t),
                })}
                placeHolder={t('obx.schedules.assignDedicatedDuty.assignShift.officerPlaceholder', {
                  officer: getLabel('roles', 'officer', t),
                })}
                maxWidth="400px"
              />
              <FieldError error={errorMessages['officer']} />
            </Box>
          </Box>
        </Box>
        <Box className={classes.assignShiftBodyContentRow}>
          <Box className={classes.assignShiftBodyContentRowActions}>
            <Box className={classes.createToursInput}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.thisShift.startDateTime')}
              </InputLabel>
              <ResponsiveDateTimePickers
                value={shiftStartDateTime ? dayjsWithStandardOffset(shiftStartDateTime) : null}
                onChange={() => {}}
                placeholder={t(
                  'obx.schedules.assignDedicatedDuty.assignShift.thisShift.startDateTimePlaceholder',
                )}
                disabled
              />
              <FieldError error={errorMessages['startDateTime']} />
            </Box>
            <Box className={classes.createToursInput}>
              <InputLabel>
                {t('obx.schedules.assignDedicatedDuty.assignShift.thisShift.endDateTime')}
              </InputLabel>
              <ResponsiveDateTimePickers
                value={shiftEndDateTime ? dayjsWithStandardOffset(shiftEndDateTime) : null}
                onChange={() => {}}
                placeholder={t(
                  'obx.schedules.assignDedicatedDuty.assignShift.thisShift.endDateTimePlaceholder',
                )}
                disabled
              />
              <FieldError error={errorMessages['endDateTime']} />
            </Box>
          </Box>
        </Box>

        {/* Settings Section */}
        <Box className={classes.wrapper}>
          {/* Auto-Clockout Shift */}
          {shiftDetail?.logId && !missingShiftStatus && <AutoClockOut shiftDetail={shiftDetail} />}
        </Box>
      </Box>
    </Box>
  );
};

ThisShift.propTypes = {
  formData: PropTypes.object,
  handleInputChange: PropTypes.func,
  errorMessages: PropTypes.object,
  locations: PropTypes.array,
  allOfficers: PropTypes.object,
  disabled: PropTypes.bool,
  shiftDetail: PropTypes.object,
  setFormData: PropTypes.func,
  setAssignmentValue: PropTypes.func,
  setReassignmentErrors: PropTypes.func,
  setChangeDate: PropTypes.func,
  reassignmentErrors: PropTypes.object,
};

export default ThisShift;
