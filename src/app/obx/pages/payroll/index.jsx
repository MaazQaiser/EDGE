import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PropTypes from 'prop-types';
import * as React from 'react';
import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import { DownloadCloud } from 'src/assets/svg';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { rolesEnumWithName } from 'src/utils/constants';

import { dayjsWithStandardOffset } from '../schedules/helper';
import { useStyles } from './PayrollTabs';

const LockedPayruns = lazy(() => import('./lockedPayruns'));
const OfficerWorkLogs = lazy(() => import('./officersWorkLogs'));
const Payroll = lazy(() => import('./payrollListing'));
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{
        display: value === index ? 'flex' : 'none', // Use display: flex when active
      }}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const today = dayjsWithStandardOffset().startOf('day');

const mostRecentSaturday = today.subtract((today.day() + 1) % 7, 'day').endOf('day');

const followingFriday = mostRecentSaturday.add(6, 'day');

const params = {
  selectedDates: [mostRecentSaturday, followingFriday],
};

const SECTIONS = {
  PAYROLL: 0,
  LOCKED_PAYRUN: 1,
  OFFICERS_WORK_LOGS: 2,
};

const PayrollTabs = () => {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [queryParams, setQueryParams] = useState(params);
  const [errors, _setErrors] = useState({});
  const [exportModal, setExportModal] = useState(false);
  const [exportWorkLogsModal, setExportWorkLogsModal] = useState(false);
  const [exportWorkLogsHoModal, setExportWorkLogsHoModal] = useState(false);
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const authUser = useSelector((state) => state?.auth?.userRole?.slug);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleDateRange = (name, dates) => {
    const [startDate, endDate] = dates;
    if (
      startDate.isSame(queryParams.selectedDates[0]) &&
      endDate.isSame(queryParams.selectedDates[1])
    )
      return;
    // const differenceInDays = Math.abs(startDate?.diff(endDate, 'day')) || null;
    // if (differenceInDays > 30) {
    //   setErrors({ ...errors, selectedDates: 'You can select maximum 30 days data' });
    //   return;
    // }
    // delete errors.selectedDates;
    // setErrors({ ...errors });
    updateFormHandler(name, dates);
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const shouldDisableDate = (date) => {
    // Getting selected dates from the state
    const [startDate, endDate] = queryParams.selectedDates || [];

    // Getting first-render initial dates
    const [initialStart, initialEnd] = [mostRecentSaturday, followingFriday];

    // Getting the day from the rendering-date of picket
    const day = date.day();

    // Getting the start date selected of state is same as initial start date
    const isSameAsInitialStart =
      startDate.format('DD-MM-YYYY') === initialStart.format('DD-MM-YYYY');

    // Getting the end date selected of state is same as initial end date
    const isSameAsInitialEnd = endDate.format('DD-MM-YYYY') === initialEnd.format('DD-MM-YYYY');

    // Getting the start date selected of state is same as end date selected of state
    const isStartEndDate = startDate.format('DD-MM-YYYY') === endDate.format('DD-MM-YYYY');

    // If the selected date is not same as the end date
    // then disabling all the dates before the selected date
    // Use case: User can select Saturday as start date and Friday as the end date
    // but we are considering the smaller date as start date and the larger date as end date
    if (isStartEndDate && date.isBefore(startDate, 'day')) return true;

    // If both the start date and end date are same as initial start and end date
    // then it will return enable Saturday in the picker only
    if (isSameAsInitialStart && isSameAsInitialEnd && date.isBefore(followingFriday, 'day'))
      return day !== 6;

    // If the start date is not same as initial start date but the end date is same as initial end date
    // then it will return enable Friday in the picker only
    // if (!isSameAsInitialStart && isSameAsInitialEnd) return day !== 5;

    // If only one day is selected and the start and end date of state are same
    // then it will return enable Friday in the picker only
    if (isStartEndDate) return day !== 5;

    // If both the start and end date are selected and the start and end date of state are not same
    // then it will return enable Saturday in the picker only
    if (!isStartEndDate && date.isBefore(followingFriday, 'day')) return day !== 6;

    // By default returning enable Saturday in the picker
    return day !== 5;
  };

  return (
    <Box sx={{ width: '100%' }} className={classes.tabWrapper}>
      <Box
        className={
          // value === SECTIONS.LOCKED_PAYRUN
          //   ? classes.lockedPayrollTabButtonTop
          //   :
          classes.payrollTabButtonTop
        }
      >
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label={t('obx.payroll.title')} {...a11yProps(0)} />
          <Tab label={t('obx.payroll.lockedPayruns')} {...a11yProps(1)} />
          <Tab
            label={t('obx.payroll.officerWorklogs', {
              officers: getLabel('terms', 'officers', t),
            })}
            {...a11yProps(2)}
          />
        </Tabs>
        <Box className={classes.userSection}>
          <Box className={classes.invoicesDateRange}>
            {errors?.selectedDates && <span className={classes.error}>{errors.selectedDates}</span>}
            <DateRangePickerWithButtons
              syncSelectedDatesOnStateChange
              selectedDates={queryParams?.selectedDates}
              setDates={(dates) => {
                handleDateRange('selectedDates', dates);
              }}
              maxDate={followingFriday}
              shouldDisableDate={value === 2 ? shouldDisableDate : false}
            />
          </Box>
          {/* {value !== SECTIONS.LOCKED_PAYRUN && ( */}
          <Button
            variant="secondaryGrey"
            startIcon={<DownloadCloud />}
            onClick={() =>
              value === SECTIONS.OFFICERS_WORK_LOGS
                ? setExportWorkLogsModal(true)
                : setExportModal(true)
            }
          >
            {`${t(value === SECTIONS.OFFICERS_WORK_LOGS ? 'obx.payroll.exportOfficerWorklogs' : 'obx.payroll.exportPayrun')}`}
          </Button>
          {value === SECTIONS.OFFICERS_WORK_LOGS &&
            authUser === rolesEnumWithName.home_officer.slug && (
              <Button
                variant="secondaryGrey"
                startIcon={<DownloadCloud />}
                onClick={() => {
                  setExportWorkLogsHoModal(true);
                }}
              >
                {t('obx.payroll.exportOfficerWorkLogsHo')}
              </Button>
            )}

          {/* )} */}
        </Box>
      </Box>
      <CustomTabPanel className={classes.tabContent} value={value} index={0}>
        <Suspense fallback={null}>
          <Payroll
            selectedDates={queryParams?.selectedDates}
            exportModal={exportModal}
            setExportModal={setExportModal}
          />
        </Suspense>
      </CustomTabPanel>
      <CustomTabPanel className={classes.tabContent} value={value} index={1}>
        <Suspense fallback={null}>
          <LockedPayruns
            selectedDates={queryParams?.selectedDates}
            exportModal={exportModal}
            setExportModal={setExportModal}
          />
        </Suspense>
      </CustomTabPanel>
      <CustomTabPanel className={classes.tabContent} value={value} index={2}>
        <Suspense fallback={null}>
          <OfficerWorkLogs
            selectedDates={queryParams?.selectedDates}
            exportWorkLogsModal={exportWorkLogsModal}
            setExportWorkLogsModal={setExportWorkLogsModal}
            exportWorkLogsHoModal={exportWorkLogsHoModal}
            setExportWorkLogsHoModal={setExportWorkLogsHoModal}
          />
        </Suspense>
      </CustomTabPanel>
    </Box>
  );
};

export default PayrollTabs;
