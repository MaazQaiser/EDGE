import { Box, Button, Skeleton, Typography } from '@mui/material';
import { ReactComponent as ResetIcon } from 'assets/svg/reset-clock.svg?react';
import classNames from 'classnames';
// import LoaderComponent from 'commonComponents/loader';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getUsersAvailability, updateUsersAvailability } from 'services/user.services';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import AvailabilitySelectionRow from 'src/app/obx/pages/users/detail/components/availability/components/availabilitySelectionRow';
import { ACL_OBX_USERS_AVAILABILITY_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { getErrorKey, removeKey } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './avalibilityStyle';
dayjs.extend(utc);
const enums = {
  availability: 'availability',
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Availability = ({ id }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const { is24Hours } = useDateTime();

  const classes = useStyles();

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});

  // const NA = t('commonText.nA');

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await getUsersAvailability(id);

      if (response?.statusCode === 200) {
        const afterRevertion = revertDays(response?.data?.availability);
        setData(afterRevertion);
      }

      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const revertDays = (schedule) => {
    return schedule.map((item) => {
      let { startTime, endTime, day } = item;

      let startObj = { value: 'none', label: 'none' };
      let endObj = { value: 'none', label: 'none' };

      if (startTime && startTime !== 'none') {
        const utcStart = dayjs.utc(startTime, 'hh:mm A');

        // use existing offset logic
        const localStart = dayjsWithStandardOffset(utcStart);

        // ⬅️ if moved to earlier day, roll back weekday
        if (localStart.date() < utcStart.date()) {
          const currentIndex = days.indexOf(day);
          day = days[(currentIndex - 1 + 7) % 7];
        }

        // Display according to franchise settings
        const displayFormat = is24Hours ? 'HH:mm' : 'hh:mm A';
        startObj = {
          value: localStart.format(displayFormat),
          label: localStart.format(displayFormat),
        };
      }

      if (endTime && endTime !== 'none') {
        // API always returns times in 12-hour AM/PM format ('hh:mm A')
        const utcEnd = dayjs.utc(endTime, 'hh:mm A');
        const localEnd = dayjsWithStandardOffset(utcEnd);

        if (localEnd.date() < utcEnd.date()) {
          const currentDayIndex = days.indexOf(day);
          const prevDayIndex = (currentDayIndex - 1 + 7) % 7;
          day = days[prevDayIndex];
        }

        // Display according to franchise settings
        const displayFormat = is24Hours ? 'HH:mm' : 'hh:mm A';
        endObj = {
          value: localEnd.format(displayFormat),
          label: localEnd.format(displayFormat),
        };
      }

      return {
        ...item,
        day,
        startTime: startObj,
        endTime: endObj,
      };
    });
  };

  const convertDay = (schedule) => {
    schedule.forEach((item, index) => {
      let startTime = item?.startTime === 'none' ? '' : item?.startTime;
      let endTime = item?.endTime === 'none' ? '' : item?.endTime;
      const inputFormat = is24Hours ? 'HH:mm' : 'hh:mm A';

      if (startTime) {
        // Parse user input using franchise display format
        const selectedStartTime = dayjs(startTime, inputFormat);
        const localStart = dayjsWithStandardOffset()
          .set('hour', selectedStartTime.hour())
          .set('minute', selectedStartTime.minute());
        const utcStart = localStart.utc();
        if (utcStart.date() > localStart.date()) {
          // ✅ roll over → belongs to next day
          const currentDayIndex = index;
          const nextDayIndex = (currentDayIndex + 1) % 7;
          item.day = days[nextDayIndex];
        }

        // Always save in 12-hour AM/PM format since API expects this format
        item.startTime = utcStart.format('hh:mm A');
      }

      if (endTime) {
        // Parse user input using franchise display format
        const selectedEndTime = dayjs(endTime, inputFormat);
        const localEnd = dayjsWithStandardOffset()
          .set('hour', selectedEndTime.hour())
          .set('minute', selectedEndTime.minute());
        const utcEnd = localEnd.utc();

        if (utcEnd.date() > localEnd.date()) {
          // ✅ roll over → belongs to next day
          const currentDayIndex = index;
          const nextDayIndex = (currentDayIndex + 1) % 7;
          item.day = days[nextDayIndex];
        }

        // Always save in 12-hour AM/PM format since API expects this format
        item.endTime = utcEnd.format('hh:mm A');
      }
    });

    return schedule;
  };

  const resetAvailability = () => {
    // Reset to midnight according to franchise time format
    const resetTimeValue = is24Hours ? '00:00' : '12:00 AM';
    const resetTimeLabel = is24Hours ? '00:00' : '12:00 AM';
    const resetTimeObj = { value: resetTimeValue, label: resetTimeLabel };

    const resetData = days.map((day, index) => ({
      id: index + 1,
      day,
      startTime: resetTimeObj,
      endTime: resetTimeObj,
    }));

    setData(resetData);
  };

  const updateAvailability = async () => {
    try {
      const validateFormData = {
        availability: data?.map((a) => {
          return {
            id: a?.id,
            startTime: a?.startTime?.value,
            endTime: !a?.endTime?.value ? undefined : a?.endTime?.value,
            day: a?.day,
          };
        }),
      };
      let finalPayload = JSON.parse(JSON.stringify(validateFormData));
      const errors = await formValidatorJoi(finalPayload, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages((prev) => ({ ...prev, ...errors }));

        return;
      }
      setLoading(true);

      const convertedSchedule = convertDay(JSON.parse(JSON.stringify(finalPayload.availability)));

      const payload = {
        availability: convertedSchedule.map((a) => {
          let startTime = a?.startTime === 'none' ? '' : a?.startTime;

          let endTime = a?.endTime || '';

          return {
            ...a,
            id: a?.id,
            startTime: startTime,
            endTime: endTime,
          };
        }),
      };

      const response = await updateUsersAvailability(id, payload);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const handleAvailabilityChanges = (name, value, index, removeError = true) => {
    const formDataAvailability = [...data];

    formDataAvailability[index][name] = value;

    setData(formDataAvailability);

    if (removeError) {
      const errorKey = getErrorKey(name, enums.availability, index);

      setErrorMessages((prev) => removeKey([errorKey], prev));
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [id]);

  return (
    <Box className={classes.sitesListingCommonContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}

      <Box className={classes.availabilityHeader}>
        <Box className={classes.availabilityHeaderLeft}>
          <Typography variant="h4" className={classes.zoneCustomText}>
            {t('obx.users.usersAvailability.heading', {
              officer: getLabel('roles', 'officer', t),
            })}
          </Typography>
          <Typography variant="body2" className={classes.zoneDetailText}>
            {t('obx.users.usersAvailability.desc', {
              officers: getLabel('terms', 'officers', t),
            })}
          </Typography>
        </Box>
        <RenderIfHasPermission name={ACL_OBX_USERS_AVAILABILITY_UPDATE}>
          <Button
            variant="primary"
            type="button"
            startIcon={<ResetIcon />}
            onClick={resetAvailability}
          >
            {t('obx.buttons.resetTo247')}
          </Button>
        </RenderIfHasPermission>
      </Box>

      <Box className={classes.tableWrapperOne}>
        <Box className={classes.timeHeader}>
          <Typography
            variant="subtitle3"
            className={classNames(classes.tableCalendarHeading, classes.tableCalendarHeadingOne)}
          >
            {t('obx.users.usersAvailability.listing.columns.days')}
          </Typography>
          <Typography
            variant="subtitle3"
            className={classNames(classes.tableCalendarHeading, classes.tableCalendarHeadingTwo)}
          >
            {t('obx.users.usersAvailability.listing.columns.startTime')}
          </Typography>
          <Typography
            variant="subtitle3"
            className={classNames(classes.tableCalendarHeading, classes.tableCalendarHeadingThree)}
          >
            {t('obx.users.usersAvailability.listing.columns.endTime')}
          </Typography>

          {/*<Typography*/}
          {/*  variant="subtitle3"*/}
          {/*  className={classNames(classes.tableCalendarHeading, classes.tableCalendarHeadingFour)}*/}
          {/*>*/}
          {/*  {t('obx.users.usersAvailability.listing.columns.dayEnd')}*/}
          {/*</Typography>*/}
        </Box>

        <Box className={classes.tableWrapperCalendar}>
          {loading ? (
            <>
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
              <Skeleton className={classes.rowSkeleton} />
            </>
          ) : (
            data?.map((a, index) => {
              return (
                <React.Fragment key={index}>
                  <AvailabilitySelectionRow
                    index={index}
                    data={a}
                    onAvailabilityChange={handleAvailabilityChanges}
                    errors={errorMessages}
                  />
                </React.Fragment>
              );
            })
          )}
        </Box>
      </Box>
      <RenderIfHasPermission name={ACL_OBX_USERS_AVAILABILITY_UPDATE}>
        <Box className={classes.saveBtnWrapper}>
          <Button variant="primary" type="button" onClick={updateAvailability}>
            {t('obx.buttons.save')}
          </Button>
        </Box>
      </RenderIfHasPermission>
    </Box>
  );
};

Availability.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Availability;
