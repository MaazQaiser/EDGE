import { Box, Button, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import OfficerDropdown from 'src/app/obx/pages/sites/detail/components/jobs/assignmentSideDrawer/AssignShift/OfficerDropdown';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import {
  assignmentToRunsheet,
  assignmentToSplittedRunsheet,
  getActiveAndInActivePatrolOfficers,
  getActiveAndInActivePatrolVehicles,
} from 'src/services/duty.services';
import { toastSettings } from 'src/utils/constants';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import {
  dayjsWithStandardOffset,
  getDaysWrtTimezoneAsPerStandardTime,
  getEmbededDateAndTimeWRTStandardOffset,
} from '../../../helper';
import { ASSIGN_RUNSHEET_OPTIONS } from '../..';
import PatrolHeader from '../patrolHeader';
import { useStyles } from './AssignmentOnRunsheet';
const unassignValue = 'unassign';

const DaysTitle = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const AssignmentOnRunsheet = ({
  handleBackBtn,
  callbackUponAssignment,
  shiftData,
  closeDrawer,
  runsheetId,
  name,
  isParent,
  isChild,
  shiftType,
}) => {
  const isOfficer = name === ASSIGN_RUNSHEET_OPTIONS.OFFICER; // if false --> then its vehicle
  const assignedValue = shiftData?.[name];
  const isEdit = !!assignedValue;

  const [selectedDates, setSelectedDates] = useState(
    isParent || isChild || shiftType === SCHEDULE_DUTIES.DISPATCH
      ? [
          dayjsWithStandardOffset(shiftData?.runsheetDetails?.startsAt),
          dayjsWithStandardOffset(shiftData?.runsheetDetails?.endsAt),
        ]
      : assignedValue
        ? [
            dayjsWithStandardOffset(assignedValue?.startsAt),
            dayjsWithStandardOffset(assignedValue?.endsAt),
          ]
        : [],
  );
  const [selectedValue, setSelectedValue] = useState(null);
  const [listData, setListData] = useState([]);

  const [assignLoading, setAssignLoading] = useState(false);

  const { getNewApiController } = useApiControllers();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();

  const selectDatesHandler = (dates) => {
    const firstDate = dayjs(dates?.[0]).format('YYYY-MM-DD');
    const secondDate = dayjs(dates?.[1]).format('YYYY-MM-DD');
    const startDate = getEmbededDateAndTimeWRTStandardOffset(shiftData?.startsAt, firstDate);
    const endDate = getEmbededDateAndTimeWRTStandardOffset(shiftData?.startsAt, secondDate);

    setSelectedDates([startDate, endDate]);
  };

  const handleChangeValue = (e) => {
    setSelectedValue(e.target.value);
  };

  const getOfficersData = async ({ shiftId, start, end }) => {
    const apiController = getNewApiController();

    if (!start || !end) {
      setListData({});
      return;
    }

    try {
      setListData(undefined);
      const queryParams = {
        start,
        end,
      };
      if (isParent || isChild || shiftType === SCHEDULE_DUTIES.DISPATCH)
        queryParams.isReassigned = true;
      const config = { signal: apiController.signal };
      let response;
      if (isOfficer) {
        response = await getActiveAndInActivePatrolOfficers({
          runsheetId: shiftId,
          queryParams,
          config,
        });
      } else {
        response = await getActiveAndInActivePatrolVehicles({
          runsheetId: shiftId,
          queryParams,
          config,
        });
      }

      const data = response?.data || {};
      const assignMe = data?.assignMe && {
        ...data.assignMe,
        disabled: data.assignMe?.isAssigned,
      };
      const assigned = data?.assigned?.map((val) => ({
        ...val,
        disabled: val?.isAssigned,
        ...(isOfficer
          ? {
              role: val?.label,
              label: val?.name,
            }
          : {}),
      }));
      const unassigned = data?.unassigned?.map((officer) => ({
        ...officer,
        reason: 'available',
        ...(isOfficer
          ? {
              role: officer?.label,
              label: officer?.name,
            }
          : {}),
      }));
      const isOfficerAlreadyAssigned = shiftData?.[name]?.id;

      let unassignOfficer = null;
      if (shiftType === SCHEDULE_DUTIES.DISPATCH && isOfficer) {
        unassignOfficer = null;
      } else if (isOfficerAlreadyAssigned) {
        unassignOfficer = {
          id: unassignValue,
          name: isOfficer
            ? t('obx.schedules.assignDedicatedDuty.assignShift.unassignOfficer', {
                officer: getLabel('terms', 'officer', t),
              })
            : t('obx.schedules.assignDedicatedDuty.assignShift.unassignVehicle'),
          imageUrl: null,
          role: 'Officer',
          label: isOfficer
            ? t('obx.schedules.assignDedicatedDuty.assignShift.unassignOfficer', {
                officer: getLabel('terms', 'officer', t),
              })
            : t('obx.schedules.assignDedicatedDuty.assignShift.unassignVehicle'),
          value: unassignValue,
          isAssigned: false,
        };
      }

      setListData({ ...data, assigned, assignMe, unassignOfficer, unassigned });
    } catch (error) {
      if (!apiController.signal.aborted) {
        setListData(null);
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  useEffect(() => {
    if (isParent || isChild || shiftType === SCHEDULE_DUTIES.DISPATCH) {
      if (shiftData?.startsAt && shiftData?.endsAt)
        getOfficersData({
          shiftId: runsheetId,
          start: shiftData?.startsAt,
          end: shiftData?.endsAt,
        });
      return;
    }
    if (
      selectedDates?.[0] &&
      selectedDates?.[1] &&
      dayjs(selectedDates?.[0]).isValid() &&
      dayjs(selectedDates?.[1]).isValid()
    ) {
      getOfficersData({
        shiftId: runsheetId,
        start: selectedDates[0]?.toISOString(),
        end: selectedDates[1]?.toISOString(),
      });
    }
  }, [selectedDates?.[0], selectedDates?.[1], isParent, isChild, shiftType]);

  const handleClickCancel = () => {
    closeDrawer();
  };

  const handleClickAssign = async () => {
    try {
      if (!selectedValue?.id) {
        const errorMsg = isOfficer
          ? t('obx.schedules.dutyDetail.assignOnRunsheet.officerRequiredError', {
              officer: getLabel('terms', 'officer', t),
            })
          : t('obx.schedules.dutyDetail.assignOnRunsheet.vehicleRequiredError');
        return toaster.error({
          text: errorMsg,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      setAssignLoading(true);
      let response;
      if (isParent || isChild || shiftType === SCHEDULE_DUTIES.DISPATCH) {
        // officer | vehicle
        const payload = {
          id: selectedValue?.id === unassignValue ? undefined : selectedValue?.id,
          assignmentType: name,
          // TODO: Updating patrol shift time will be handled in future
          isTimeUpdated: false,
        };
        response = await assignmentToSplittedRunsheet({
          shiftActivityLogId: shiftData?.shiftActivityLogId,
          payload,
        });
      } else {
        // officer | vehicle
        const payload = {
          [name]: {
            id: selectedValue?.id === unassignValue ? undefined : selectedValue?.id,
            assignmentDuration: {
              start: selectedDates[0],
              end: selectedDates[1],
            },
          },
          // TODO: Updating patrol shift time will be handled in future
          isTimeUpdated: false,
        };
        response = await assignmentToRunsheet({ runsheetId, payload });
      }

      setAssignLoading(false);

      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      handleBackBtn();
      callbackUponAssignment?.();
    } catch (error) {
      setAssignLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (!assignedValue) return;

    setSelectedValue({
      ...(assignedValue || {}),
      value: assignedValue?.id,
      label: assignedValue?.name,
    });
  }, [assignedValue]);

  const runsheetDay = getDaysWrtTimezoneAsPerStandardTime(
    shiftData?.startsAt,
    shiftData?.shiftDays,
  )?.[0];

  const shouldDisableDate = (date) => {
    const day = date.day();
    return day !== runsheetDay;
  };

  return (
    <Box className={classes.mainWrapper}>
      <PatrolHeader
        {...{
          handleBackBtn,
          shiftData,
          closeDrawer,
          headerTitle: isEdit
            ? t('obx.schedules.dutyDetail.assignOnRunsheet.updateAssignment')
            : isOfficer
              ? t('obx.schedules.dutyDetail.assignOnRunsheet.assignOfficer', {
                  officer: getLabel('terms', 'officer', t),
                })
              : t('obx.schedules.dutyDetail.assignOnRunsheet.assignVehicle'),
          subTitleText: shiftData.name,
        }}
      />
      <Box className={classes.InnerWrapper}>
        <Box className={classes.mainWrapper}>
          <Box>
            <Typography className={classes.labelText} variant="subtitle3">
              {t('obx.schedules.dutyDetail.assignOnRunsheet.startEndDate')}
            </Typography>
            <DateRangePickerWithButtons
              placeHolder="MM/DD/YYYY - MM/DD/YYYY"
              selectedDates={
                selectedDates?.length > 0
                  ? [
                      dayjsWithStandardOffset(selectedDates[0]),
                      dayjsWithStandardOffset(selectedDates[1]),
                    ]
                  : selectedDates
              }
              setDates={selectDatesHandler}
              shouldDisableDate={shouldDisableDate}
              disabled={isParent || isChild || shiftType === SCHEDULE_DUTIES.DISPATCH}
              minDate={dayjs(shiftData?.minAssignmentDate)}
              // minDate={
              //   shiftData?.runsheetDetails?.startsAt
              //     ? dayjsWithStandardOffset(shiftData?.runsheetDetails?.startsAt)
              //     : null
              // }
            />
          </Box>
          <Box className={classes.dayText}>
            <Typography variant="body2">
              {t('obx.schedules.dutyDetail.assignOnRunsheet.selectedDay')} :{' '}
              <Box component="span">{DaysTitle[runsheetDay]}</Box>
            </Typography>
          </Box>
          <Box>
            <Typography className={classes.labelText} variant="subtitle3">
              {isOfficer
                ? t('obx.schedules.dutyDetail.assignOnRunsheet.selectOfficer', {
                    officer: getLabel('terms', 'officer', t),
                  })
                : t('obx.schedules.dutyDetail.assignOnRunsheet.selectVehicle')}
            </Typography>

            <OfficerDropdown
              {...{
                handleChangeValue,
                selectedValue,
                allOfficers: listData,
                name: name,
                label: isOfficer
                  ? null
                  : t('obx.schedules.dutyDetail.assignOnRunsheet.selectVehicle'),
                placeHolder: isOfficer
                  ? null
                  : t('obx.schedules.dutyDetail.assignOnRunsheet.selectVehicle'),
                errorMsg: '',
              }}
            />
          </Box>
        </Box>
        <Box className={classes.footerButton}>
          <Button onClick={handleClickCancel} disableRipple variant="secondaryGrey">
            {t('obx.schedules.dutyDetail.assignOnRunsheet.cancelBtn')}
          </Button>
          <Button
            disabled={assignLoading}
            onClick={handleClickAssign}
            disableRipple
            variant="primary"
          >
            {isEdit
              ? t('obx.schedules.dutyDetail.assignOnRunsheet.update')
              : t('obx.schedules.dutyDetail.assignOnRunsheet.assign')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AssignmentOnRunsheet;

AssignmentOnRunsheet.propTypes = {
  closeDrawer: PropTypes.func,
  callbackUponAssignment: PropTypes.func,
  handleBackBtn: PropTypes.func,
  shiftData: PropTypes.object,
  runsheetId: PropTypes.string,
  name: PropTypes.string,
  isParent: PropTypes.bool,
  isChild: PropTypes.bool,
  shiftType: PropTypes.string,
};
