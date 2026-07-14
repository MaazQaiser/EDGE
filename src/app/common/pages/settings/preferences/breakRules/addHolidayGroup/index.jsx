import { Box, Button, Chip, Skeleton, TextField, Typography } from '@mui/material';
import { ReactComponent as DeleteIcon } from 'assets/svg/x-primary.svg?react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import CustomDropDown from 'src/app/components/common/customDropDown';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import {
  dayjsWithStandardOffset,
  getCurrentTimeWithDisabledDlsInIso,
} from 'src/app/obx/pages/schedules/helper';
import { COMMON_SETTING } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import {
  createHolidayGroup,
  getGoogleHolidays,
  getHolidayGroupById,
  updateHolidayGroup,
} from 'src/services/holidays.service';
import {
  calendarRegionWrtCountry,
  countryNameWrtTimezone,
  toastSettings,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './addHolidayGroup';

const params = {
  selectedHolidays: [],
  groupName: '',
};

const HolidayGroup = () => {
  const classes = useStyles();
  const [holidays, setHolidays] = useState([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [isSaving, setIsSaving] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const { franchiseTimeZone } = useSelector((state) => state.auth);
  const { id } = useParams();

  const { t } = useTranslation();

  const goBack = () => {
    history.push(`${COMMON_SETTING}?activeTab=preferences`);
  };

  const fetchHolidays = async () => {
    setIsLoadingHolidays(true);
    try {
      const currentYear = dayjsWithStandardOffset().get('year');
      const countryName = countryNameWrtTimezone?.[franchiseTimeZone];
      const calendarRegion = calendarRegionWrtCountry?.[countryName] || 'en.usa';
      const response = await getGoogleHolidays(calendarRegion, currentYear);
      if (response && response.status === 200) {
        setHolidays(
          (response?.data?.items || []).map((holiday) => ({
            startDate: getCurrentTimeWithDisabledDlsInIso(holiday?.start?.date),
            endDate: getCurrentTimeWithDisabledDlsInIso(holiday?.end?.date),
            name: holiday?.summary,
            label: holiday?.summary,
            value: holiday.summary?.toLowerCase()?.split(' ')?.join('_'),
          })),
        );
        setIsLoadingHolidays(false);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setQueryParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchHolidayGroup = async () => {
    try {
      const response = await getHolidayGroupById(id);
      if (response && response.statusCode === 200) {
        setQueryParams((prev) => ({
          ...prev,
          selectedHolidays: response?.data?.holidays?.map((holiday) => ({
            startDate: holiday?.start,
            endDate: holiday?.end,
            name: holiday?.name,
            label: holiday?.name,
            value: holiday?.name.toLowerCase()?.split(' ')?.join('_'),
          })),
          groupName: response?.data?.name,
        }));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (!holidays?.length) fetchHolidays();
    if (id) fetchHolidayGroup();
  }, []);

  const isDisabled = () => {
    // Returning disabled true if the user has not selected any holiday, or group name, or saved is clicked
    return !queryParams?.selectedHolidays?.length || !queryParams?.groupName || isSaving;
  };

  const removeHolidaySelection = (holiday) => {
    setQueryParams((prev) => ({
      ...prev,
      selectedHolidays: prev.selectedHolidays.filter((h) => h.value !== holiday.value),
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    if (isDisabled()) return;
    try {
      const payload = {
        name: queryParams?.groupName,
        year: dayjsWithStandardOffset().get('year'),
        holidayNames: queryParams?.selectedHolidays.map((holiday) => holiday.name),
        holidaysData: queryParams?.selectedHolidays.map((holiday) => ({
          name: holiday?.name,
          start: holiday.startDate,
          end: holiday?.endDate,
        })),
      };
      let response;
      if (id) response = await updateHolidayGroup(id, payload);
      else response = await createHolidayGroup(payload);

      if (response && response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        goBack();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box className={classes.mainWrapper}>
      <Box className={classes.grayWrapper}>
        <Box className={classes.selectWrapper}>
          <Typography variant="h4" className={classes.label}>
            {t('obx.settings.preferences.holidayGroups.groupName')}
            {<RequiredAsterik />}
          </Typography>
          <TextField
            value={queryParams?.groupName || ''}
            onChange={(e) => handleChange(e)}
            name={'groupName'}
            placeholder={t('obx.settings.preferences.holidayGroups.addGroupName')}
            className={classes.SelectGroup}
          />
        </Box>
      </Box>
      <Box className={classes.grayWrapper}>
        <Box className={classes.selectWrapper}>
          <Typography variant="h4" className={classes.label}>
            {t('obx.settings.preferences.holidayGroups.selectHolidays')}
            {<RequiredAsterik />}
          </Typography>
          {isLoadingHolidays ? (
            <Skeleton className={classes.dropDownSkeleton} />
          ) : (
            <CustomDropDown
              label={`${t('Select')}`}
              options={holidays}
              selectedValues={queryParams?.selectedHolidays || []}
              handleChange={(e) => handleChange(e)}
              name={'selectedHolidays'}
              multiSelect
              checkmark
              searchable
              isError={false}
              disabled={false}
              bordered={true}
              maxWidth="616px"
              className={classes.SelectGroup}
            />
          )}
        </Box>
        <Box className={classes.chipsWrapper}>
          {queryParams?.selectedHolidays?.length
            ? [
                ...(viewAll
                  ? queryParams.selectedHolidays
                  : queryParams.selectedHolidays.slice(0, 3)),
              ]?.map((holiday) => {
                return (
                  <Chip
                    key={holiday?.value}
                    label={holiday?.name}
                    size="small"
                    color="primary"
                    onDelete={() => removeHolidaySelection(holiday)}
                    deleteIcon={<DeleteIcon />}
                  />
                );
              })
            : null}
          {queryParams?.selectedHolidays?.length > 3 && !viewAll ? (
            <Chip
              label={`View All (${queryParams?.selectedHolidays?.length})`}
              size="small"
              color="primary"
              variant="filled-primary"
              className={classes.blueChip}
              onClick={() => setViewAll(true)}
            />
          ) : null}
          {viewAll ? (
            <Chip
              label="View less"
              size="small"
              color="primary"
              variant="filled-primary"
              className={classes.blueChip}
              onClick={() => setViewAll(false)}
            />
          ) : null}
        </Box>
      </Box>

      <Box className={classes.footerWrapper}>
        <Button variant="secondaryGrey" disableRipple onClick={goBack}>
          {t('obx.settings.preferences.holidayGroups.cancel')}
        </Button>
        <Button variant="primary" disableRipple onClick={handleSubmit} disabled={isDisabled()}>
          {id
            ? t('obx.settings.preferences.holidayGroups.updateGroup')
            : t('obx.settings.preferences.holidayGroups.createGroup')}
        </Button>
      </Box>
    </Box>
  );
};
export default HolidayGroup;
