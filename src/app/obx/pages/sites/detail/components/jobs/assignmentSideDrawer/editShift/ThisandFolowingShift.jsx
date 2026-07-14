import { Box, InputLabel, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import FieldError from 'src/app/components/common/fieldError';
import { getDaysBetweenDatesRangeWrtStandardDate } from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as InfoIcon } from 'src/assets/svg/infoCurrentColor.svg?react';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from '../assignmentSideDrawer.styles';
import OfficerDropdown from '../AssignShift/OfficerDropdown';

const ThisAndFollowingShift = ({
  formData = {},
  handleInputChange = () => {},
  errorMessages = {},
  locations = [],
  allOfficers,
  setAssignmentValue = () => {},
  shiftDetail = {},
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const missingShiftStatus =
    shiftDetail == null ||
    typeof shiftDetail !== 'object' ||
    !Object.hasOwn(shiftDetail || {}, 'shiftStatus');

  const actionStartDate = formData?.actionStartDate;
  const actionEndDate = formData?.actionEndDate;

  useEffect(() => {
    if (!actionStartDate || !actionEndDate) return;

    const selectedDates = [actionStartDate, actionEndDate];
    let selectedDaysFromDates = [];

    if (selectedDates.length) {
      const days = getDaysBetweenDatesRangeWrtStandardDate(
        selectedDates[0].format('YYYY-MM-DD'),
        selectedDates[1].format('YYYY-MM-DD'),
      );
      selectedDaysFromDates = days.filter((day) => shiftDetail?.shiftDays?.includes(day));
    }

    const fallbackShiftDays = shiftDetail?.shiftDays?.length
      ? shiftDetail?.shiftDays
      : getDaysBetweenDatesRangeWrtStandardDate(actionStartDate, actionEndDate) || [];

    const enabledDays = selectedDaysFromDates.length ? selectedDaysFromDates : fallbackShiftDays;

    setAssignmentValue((prev) => ({
      ...prev,
      startDate: actionStartDate,
      endDate: actionEndDate,
      officer: {
        ...prev?.officer,
        selectedDates,
        selectedDays: enabledDays,
      },
    }));
  }, [
    actionStartDate,
    actionEndDate,
    setAssignmentValue,
    shiftDetail?.officer?.shiftDays,
    shiftDetail?.selectedShiftStartTime,
    shiftDetail?.shiftDays,
  ]);

  // Switch states

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
                disabled={missingShiftStatus}
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
                disabled={missingShiftStatus || isObjectEmpty(allOfficers)}
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
      </Box>
    </Box>
  );
};

ThisAndFollowingShift.propTypes = {
  formData: PropTypes.object,
  handleInputChange: PropTypes.func,
  errorMessages: PropTypes.object,
  locations: PropTypes.array,
  allOfficers: PropTypes.object,
  setAssignmentValue: PropTypes.func,
  shiftDetail: PropTypes.object,
};

export default ThisAndFollowingShift;
