import { Avatar, InputLabel, Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ReactComponent as DotIcon } from 'assets/svg/dot.svg';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
// import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import SearchComponent from 'src/app/components/common/search';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { ReactComponent as WarningIcon } from 'src/assets/svg/warning.svg';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { fetchRunsheetList, reassignHitsToRunsheet } from 'src/services/duty.services';
import { getVisitorsLoadsOfficersOptions } from 'src/services/visitorsLoads.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';

import { NoRunsheetFound } from '../../../../runSheets/listing';
import { dayjsWithTimezone, getCurrentTimeWithDisabledDlsInIso, toRunsheetArray } from '../../../helper';
import PatrolHeader from '../../../shiftDetail/components/patrolHeader';
import { useStyles } from './reassignHitDrawerContent';

const HitReassignmentDrawerContent = ({
  closeDrawer,
  handleBackBtn,
  shiftData,
  headerTitle,
  loading,
  callbackUponReassignHit,
  selectedHits,
  id,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const { getNewApiController } = useApiControllers();

  const currentStandardDate = dayjs(dayjsWithTimezone().format('YYYY-MM-DD')); // date of franchise timezone as per DLS enabled or not
  const weekendWrtCurrentStandardDate = currentStandardDate.add(29, 'day').endOf('day');
  const [selectedDates, setSelectedDates] = useState([
    currentStandardDate.startOf('day'),
    currentStandardDate.endOf('day'),
  ]);

  const [queryParams, setQueryParams] = useState({
    search: '',
    selectedOfficers: [],
  });
  const [runsheetListOriginal, setRunsheetListOriginal] = useState(null);
  const [runsheetList, setRunsheetList] = useState(null);
  const [officersList, setOfficersList] = useState();
  const [selectedRunsheet, setSelectedRunsheet] = useState(null);

  const onChangeSearch = (e) => {
    const value = e.target?.value;
    setQueryParams((prev) => ({
      ...prev,
      search: value,
    }));

    // Filter runsheets as per filter value
    if (runsheetListOriginal?.length > 0) {
      const updatedList = runsheetListOriginal?.filter((val) =>
        val?.name?.toLowerCase()?.includes(value?.toLowerCase()),
      );
      setRunsheetList([...updatedList]);
    }
  };
  const handleChangeSelectedOfficers = (e) => {
    setQueryParams((prev) => ({
      ...prev,
      selectedOfficers: e.target?.value,
    }));
  };

  const selectDatesHandler = (dates) => {
    setSelectedDates([dates?.[0], dayjs(dates?.[1]).endOf('day')]);
  };

  const getRunsheetList = async ({ startsAt, endsAt, selectedOfficers }) => {
    const apiController = getNewApiController();
    try {
      setRunsheetList(undefined);
      setRunsheetListOriginal(undefined);
      const config = { signal: apiController.signal };

      const params = {
        startsAt: getCurrentTimeWithDisabledDlsInIso(startsAt),
        endsAt: getCurrentTimeWithDisabledDlsInIso(endsAt),
        officerId: selectedOfficers?.map((officer) => officer?.id),
        patrolTemplateId: id,
      };

      const response = await fetchRunsheetList({
        params,
        config,
      });
      /* **The same silent-blank bug `reassignHitDrawerContent` had, fixed the same way.**
         `fetchRunsheetList` answers with `{ runsheets, pagination }`, so `data || []` put an
         *object* in a field every reader treats as an array: `length === 0` is `undefined === 0`,
         so the empty state never draws, and a `length ? … : []` filter leaves nothing to map.
         The screen renders its controls over blank space with no rows and no error. Normaliser
         is shared now — see `toRunsheetArray` — because this defect arrives as a crash in one
         caller and as nothing at all in another. */
      const rows = toRunsheetArray(response?.data);
      setRunsheetList(rows);
      setRunsheetListOriginal(rows);
    } catch (err) {
      if (!apiController.signal.aborted) {
        setRunsheetList(null);
        setRunsheetListOriginal(null);
        toast.error(err?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };
  const getOfficersList = async () => {
    try {
      setOfficersList(undefined);
      const response = await getVisitorsLoadsOfficersOptions();
      setOfficersList(response?.data?.officers || []);
    } catch (err) {
      setOfficersList(null);
    }
  };

  // get runsheets listing as per selected date range
  useEffect(() => {
    if (
      selectedDates[0] &&
      selectedDates[1] &&
      dayjs(selectedDates[0]).isValid() &&
      dayjs(selectedDates[1]).isValid()
    ) {
      getRunsheetList({
        startsAt: selectedDates[0],
        endsAt: selectedDates[1],
        selectedOfficers: queryParams?.selectedOfficers,
      });
    }
  }, [selectedDates[0], selectedDates[1], queryParams?.selectedOfficers]);

  // Get Officers List
  useEffect(() => {
    getOfficersList();
  }, []);

  const showReassignHitConfirmationModal = (runsheet) => {
    setSelectedRunsheet(runsheet);
  };

  const handleCancelConfirmationModal = () => {
    setSelectedRunsheet(null);
  };

  const handleReassignHit = async () => {
    try {
      const payload = {
        // ids to be removed from source and added to the destination
        hitIds: selectedHits?.map((a) => a?.hitId),

        // source runsheet
        parent: {
          patrolTemplateId: id,
          startsAt: shiftData?.startsAt,
          endsAt: shiftData?.endsAt,
          activityLogId: shiftData?.shiftActivityLogId,
        },

        //destination runsheet
        child: {
          patrolTemplateId: selectedRunsheet?.id,
          startsAt: selectedRunsheet?.startsAt,
          endsAt: selectedRunsheet?.endsAt,
          activityLogId: selectedRunsheet?.activityLogId,
        },
      };
      const res = await reassignHitsToRunsheet(payload);

      if (res?.statusCode == 200) {
        handleCancelConfirmationModal();
        handleBackBtn();
        callbackUponReassignHit?.(res?.data?.parentLogId);

        toast.success(res?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      handleCancelConfirmationModal();
      toast.error(error?.message || error?.e, {
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const filteredRunsheetList = runsheetList?.length
    ? runsheetList?.filter((runsheet) =>
        runsheet?.name?.toLowerCase()?.includes(queryParams?.search?.toLowerCase()),
      )
    : [];

  return (
    <>
      <PatrolHeader
        {...{
          handleBackBtn,
          shiftData,
          closeDrawer,
          headerTitle,
          loading,
        }}
      />

      {/* Body */}
      <Box className={classes.drawerInnerNew}>
        <Box className={classes.drawerBodyTop}>
          <Typography variant="h5" className={classes.drawerBodyTitle}>
            {t('obx.schedules.dutyDetail.reassignHit.runsheetSelectionForHits', {
              hit: getLabel('terms', 'hit', t).toLowerCase(),
              runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
            })}
          </Typography>
          <Box className={classes.drawerDateRange}>
            <InputLabel htmlFor="start-date">
              {t('obx.schedules.dutyDetail.reassignHit.selectDatesLabel')}
            </InputLabel>
            <DateRangePickerWithButtons
              className={classes.drawerDateRangePicker}
              placeHolder="MM/DD/YYYY - MM/DD/YYYY"
              selectedDates={selectedDates}
              setDates={selectDatesHandler}
              minDate={currentStandardDate}
              maxDate={weekendWrtCurrentStandardDate}
              // disabled={true}
            />
          </Box>
          <Box className={classes.drawerFilters}>
            <SearchComponent
              className={classes.searchComponent}
              placeholder={t('obx.schedules.dutyDetail.reassignHit.searchPlaceholder', {
                runsheet: getLabel('terms', 'runsheet', t),
              })}
              onSearch={onChangeSearch}
            />

            <CustomDropDown
              label={t('obx.schedules.dutyDetail.reassignHit.officersLabel', {
                officers: getLabel('terms', 'officers', t),
              })}
              name="officers"
              options={transformArrayForOptions(officersList, 'name', 'id')}
              selectedValues={queryParams?.selectedOfficers}
              handleChange={handleChangeSelectedOfficers}
              multiSelect={true}
              checkmark={true}
              searchable={true}
              searchPlaceholder={t(
                'obx.schedules.dutyDetail.reassignHit.officersSearchPlaceholder',
                { officer: getLabel('terms', 'officer', t) },
              )}
              clearAll
            />
          </Box>
        </Box>

        <Box className={classes.drawerBody}>
          {runsheetList === undefined && (
            <Box className={classes.loaderBox}>
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
            </Box>
          )}
          {runsheetList?.length === 0 && <NoRunsheetFound />}

          {filteredRunsheetList?.map((runsheet, index) => {
            return (
              <Box
                key={index}
                className={classes.reassignHit}
                onClick={() => showReassignHitConfirmationModal(runsheet)}
              >
                <Typography variant="h4" className={classes.reassignHitTitle}>
                  {runsheet?.name}
                </Typography>
                <Box className={classes.reassignHitBody}>
                  <Typography variant="subtitle3" className={classes.reassignHitText}>
                    <DisplayDateTimeRange startsAt={runsheet?.startsAt} endsAt={runsheet?.endsAt} />
                    {/* <Box component={'span'}>12/12/2023 09:00am</Box> <Box component={'span'}>-</Box>
                <Box component={'span'}>12/12/2023 05:00pm</Box> */}
                  </Typography>
                  <DotIcon />
                  <Box className={classes.reassignHitUser}>
                    <Avatar alt={''} src={runsheet?.officer?.imageUrl} />
                    <Typography variant="subtitle3"> {runsheet?.officer?.name}</Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <SweetAlertModal
        type="warning"
        title={t('obx.schedules.dutyDetail.reassignHit.confirmationModal.title', {
          hit: getLabel('terms', 'hit', t).toLowerCase(),
        })}
        text={t('obx.schedules.dutyDetail.reassignHit.confirmationModal.description', {
          hit: getLabel('terms', 'hit', t).toLowerCase(),
          runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
        })}
        confirmButtonText={'Reassign'}
        cancelButtonText={'Cancel'}
        show={!!selectedRunsheet}
        handleConfirmButton={handleReassignHit}
        handleCancelButton={handleCancelConfirmationModal}
        reverseButtons={true}
        icon={<WarningIcon />}
      />
    </>
  );
};

export default HitReassignmentDrawerContent;

const DisplayDateTimeRange = ({ startsAt, endsAt }) => {
  const { formatDayjsDateTime } = useDateTime();

  return `${formatDayjsDateTime({
    value: startsAt,
    formatType: dayjsFormatsEnum.dateTime,
  })} - ${formatDayjsDateTime({
    value: endsAt,
    formatType: dayjsFormatsEnum.dateTime,
  })}`;
};

HitReassignmentDrawerContent.propTypes = {
  closeDrawer: PropTypes.func,
  handleBackBtn: PropTypes.func,
  shiftData: PropTypes.object,
  headerTitle: PropTypes.string,
  loading: PropTypes.bool,
  callbackUponReassignHit: PropTypes.func,
  selectedHits: PropTypes.array,
  id: PropTypes.string,
};
