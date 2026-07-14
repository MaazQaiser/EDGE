import { Box, TableCell, TableRow } from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CustomDropDown from 'commonComponents/customDropDown';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PaginationComponent from 'src/app/components/common/pagination';
import SearchComponent from 'src/app/components/common/search';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
const DailyRunsheetReport = lazy(
  () => import('src/app/obx/pages/reports/components/dailyrunsheetReport'),
);
const SiteSummaryReports = lazy(
  () => import('src/app/obx/pages/reports/components/siteSummaryReports'),
);
import { useApiControllers } from 'src/helper/axios';
import { useDeepEffect } from 'src/helper/utilityHooks';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { getFranchiseReports, getOfficersDropDown } from 'src/services/reports.services';
import { getAllSites } from 'src/services/sites.services';
import { getTemplateReportTypes } from 'src/services/template.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import {
  // dataReportCheckPointShiftSummary,
  // dataReportShiftSummary,
  // dataShiftTourReports,
  paginationOptions,
  // runsheetDayEndReport,
  toastSettings,
} from 'src/utils/constants';
import {
  extractValuesByKeyFromInput,
  removeAllFromSelected,
} from 'src/utils/dropdownValueExtractor';
import { toaster } from 'src/utils/toast';

import { dayjsWithStandardOffset } from '../../schedules/helper';
import ReportTable, { i18ColumnName, statusValidationEnum } from '../components/reportsTable';
import { useStyles } from './reportsListing.styles';

const today = dayjsWithStandardOffset();
const startOfMonth = today.subtract(7, 'day');
const endOfMonth = today.startOf('day');

const filterStatusEnums = {
  pending: 'submitted',
  approved: 'accepted',
  rejected: 'rejected',
};
const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  reportType: [],
  title: [],
  site: [],
  officer: [],
  sortBy: '',
  submittedAt: null,
  status: filterStatusEnums.pending,
  orderBy: '',
  selectedDates: [startOfMonth, endOfMonth],
  runsheets: [],
};

const order = {
  orderBy: 'title',
  orderType: 'asc',
};

const FILTER_REPORTS_TYPES = [
  'visitorsCheckIn',
  'visitorsCheckOut',
  'loadsCheckIn',
  'loadsCheckOut',
];

export default function SitesListing() {
  const { t } = useTranslation();
  const classes = useStyles();

  const _statusEnum = {
    submitted: t('buttons.pending'),
    approves: t('buttons.approved'),
    rejected: t('buttons.rejected'),
  };

  const [data, setData] = useState([]);
  // const [shiftData, setShiftData] = useState([]);
  const [templateTypes, setTemplatTypes] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [allOfficers, setAllOfficers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [queryParams, setQueryParams] = useState(params);
  const [totalRows, setTotalRows] = useState(0);
  const columnsWithOutFilter = i18ColumnName(t);
  const { getNewApiController } = useApiControllers();

  const [value, setValue] = useState(0);
  const [orderState, setOrderState] = useState(order);
  const { getLabel } = useTenantLabel();

  // const [totalIncidentReport, setTotalIncidentReport] = useState(0);
  // const [allIncidentReport, setAllIncidentReport] = useState([]);

  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
    setQueryParams(params);
  };
  let columns = useMemo(() => {
    return queryParams?.status !== statusValidationEnum.rejected
      ? columnsWithOutFilter.filter((col) => col.id !== 'reason')
      : columnsWithOutFilter;
  }, [queryParams.status]);

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const _handleToggle = (event, newAlignment) => {
    if (newAlignment)
      setQueryParams((prevState) => {
        return {
          ...prevState,
          page: paginationOptions.defaultPerPage,
          status: newAlignment,
        };
      });
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: paginationOptions.defaultPerPage,
        [name]: value,
      };
    });
  };

  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const fetchShiftReports = async () => {
    const apiController = getNewApiController();
    try {
      setLoading(true);

      const response = await getFranchiseReports(
        {
          sortBy: queryParams?.sortBy,
          sortOrder: queryParams?.orderBy,
          page: queryParams?.page,
          perPage: queryParams?.perPage,
          search: queryParams?.search,
          officerId: removeAllFromSelected(
            extractValuesByKeyFromInput(queryParams.officer, 'value'),
            'all',
          ),
          siteIds: removeAllFromSelected(
            extractValuesByKeyFromInput(queryParams?.site, 'value'),
            'all',
          ),
          templateType: removeAllFromSelected(
            extractValuesByKeyFromInput(queryParams?.reportType, 'value'),
            'all',
          ),
          submittedAt: queryParams?.submittedAt?.format(),
          windowStart: queryParams?.selectedDates?.[0]
            ? dayjs(queryParams.selectedDates[0]).format('YYYY-MM-DD')
            : '',
          windowEnd: queryParams?.selectedDates?.[1]
            ? dayjs(queryParams.selectedDates[1]).format('YYYY-MM-DD')
            : '',
        },
        { signal: apiController.signal },
      );
      if (response?.statusCode === 200 && response?.data) {
        // const updateDataModel = response?.data?.shifts?.map((d) => {
        //   const updateDataPossible = { ...d };

        //   if (d?.shiftStatus === 'shiftEnded' || d?.shiftStatus === 'shiftAutoEnded') {
        //     if (updateDataPossible?.siteName) {
        //       updateDataPossible.reports.push({
        //         ...dataShiftTourReports,
        //         reportId: null,
        //         templateableType: 'tourReports',
        //         shiftId: d?.reports[0]?.shiftId,
        //         sendShiftId: true,
        //       });
        //     } else {
        //       updateDataPossible.reports = [
        //         ...updateDataPossible.reports,

        //         {
        //           ...runsheetDayEndReport,
        //           reportId: null,
        //           templateableType: 'runsheetSummaryReport',
        //           shiftId: d?.reports[0]?.shiftId,
        //           sendShiftId: true,
        //         },
        //       ];
        //     }
        //   }

        //   if (d?.isSummaryAvailable) {
        //     if (updateDataPossible?.siteName) {
        //       updateDataPossible.reports = [
        //         ...updateDataPossible.reports,

        //         {
        //           ...dataReportCheckPointShiftSummary,
        //           reportId: null,
        //           templateableType: 'checkpointSummaryReport',
        //           shiftId: d?.reports[0]?.shiftId,
        //           sendShiftId: true,
        //         },

        //         {
        //           ...dataReportShiftSummary,
        //           reportId: null,
        //           templateableType: 'shiftSummaryReport',
        //           shiftId: d?.reports[0]?.shiftId,
        //           sendShiftId: true,
        //         },
        //       ];
        //     } else {
        //       updateDataPossible.reports = [
        //         ...updateDataPossible.reports,

        //         {
        //           ...runsheetDayEndReport,
        //           reportId: null,
        //           templateableType: 'runsheetSummaryReport',
        //           shiftId: d?.reports[0]?.shiftId,
        //           sendShiftId: true,
        //         },
        //       ];
        //     }
        //   }

        //   if (updateDataPossible?.visits) {
        //     const visitMapped = updateDataPossible?.visits
        //       ?.filter((f) => f?.tour?.reportId)
        //       .map((visit) => {
        //         return {
        //           title: visit?.tour?.title || '',
        //           reportId: visit?.tour?.reportId || '',
        //           siteId: visit?.siteId || '',
        //           status: visit?.tour?.reportId ? 'submitted' : 'notSubmitted',
        //           visitType: visit?.visitType,
        //           templateableType: visit?.visitType === 'dispatch' ? 'dispatch' : 'siteHitReport',
        //           submittedAt: null,
        //           isVisits: true,
        //           siteName: visit?.siteName || '',
        //           visitedAt: visit?.visitedAt || null,
        //           sendSiteId: visit?.visitType === 'dispatch',
        //         };
        //       });

        //     updateDataPossible.reports = [...updateDataPossible.reports, ...visitMapped];
        //   }

        //   return updateDataPossible;
        // });

        setData(response?.data?.reports);
        setLoading(false);

        setTotalRows(response?.data?.pagination?.totalCount);
        return;
      }
      setData([]);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
      }
    }
  };

  const fetchTemplateTypes = async () => {
    try {
      const response = await getTemplateReportTypes();

      if (response?.statusCode == 200) {
        let tempTypes = response?.data?.responseTypes || {};
        const tempTypesArray = Object.keys(tempTypes)
          .filter((key) => !FILTER_REPORTS_TYPES?.includes(key))
          .map((key) => ({ value: key, label: tempTypes[key] }));
        setTemplatTypes([{ value: 'all', label: 'All Reports' }, ...tempTypesArray]);
        return;
      }
      setTemplatTypes([]);
    } catch (error) {
      //error handling
    }
  };
  const fetchAllSites = async () => {
    try {
      const response = await getAllSites();

      if (response?.statusCode === 200) {
        let transformedSites = transformArrayForOptions(response?.data?.sites, 'name', 'id') || [];

        setAllSites([
          { value: 'all', label: t('obx.form.input.dropDown.selectSites.label') },
          ...transformedSites,
        ]);
      }
    } catch (error) {
      //error handling
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchAllOfficers = async () => {
    try {
      const response = await getOfficersDropDown();
      if (response?.data?.statusCode === 200) {
        const transformedUsers = transformArrayForOptions(response?.data?.users, 'name', 'id');
        setAllOfficers([
          {
            value: 'all',
            label: t('obx.schedules.filters.officers.label', {
              officers: getLabel('terms', 'officers', t),
            }),
            image: 'someDefaultImageString',
          },
          ...transformedUsers,
        ]);
      }
    } catch (error) {
      //error handling
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useDeepEffect(() => {
    if (value === 0) {
      fetchShiftReports();
    }
  }, [queryParams, value]); // unnecessary api call due to shallow Comparison, thats why converting into string and check in dependency array

  useEffect(() => {
    fetchTemplateTypes();
    fetchAllSites();
    fetchAllOfficers();
  }, []);

  const tableSkeletonBody = (_data = {}, columns) => {
    return <TableSkeleton numberOfRows={5} columns={columns} />;
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      [name]: value,
    }));
  };
  return (
    <Box>
      <Box className={classes.functionalDiv}>
        <Tabs
          variant="scrollable"
          scrollButtons="auto"
          value={value}
          onChange={handleChangeTab}
          className={classes.tabContainer}
        >
          <Tab label={t('obx.shiftReports.tabtitle.shift')} />
          <Tab
            label={t('obx.shiftReports.tabtitle.dailyRunsheet', {
              runsheet: getLabel('terms', 'runsheet', t),
            })}
          />
          <Tab label={t('obx.shiftReports.tabtitle.incident')} disabled />
          <Tab label={t('obx.shiftReports.tabtitle.siteSummaryReport')} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Box className={classes.reportsListings}>
          <Box className={classes.reportsListingsHeader}>
            <Box className={classes.reportsListingsHeaderLeft}>
              <Box className={classes.reportsListingsFilters}>
                <SearchComponent
                  name="search"
                  value={queryParams?.name || ''}
                  placeholder={t('obx.settings.preferences.breakRules.searchbyName')}
                  onSearch={handleSearch}
                />
                <CustomDropDown
                  label={t('obx.shiftReports.filters.reports.label')}
                  name="reportType"
                  options={templateTypes}
                  selectedValues={queryParams?.reportType || []}
                  handleChange={inputChangedHandler}
                  searchPlaceholder={t('obx.shiftReports.filters.reports.search')}
                  searchable={true}
                  checkmark
                  multiSelect={true}
                  clearAll={true}
                />

                <CustomDropDown
                  label={t('obx.shiftReports.filters.sites.label')}
                  name="site"
                  clearAll
                  searchable
                  options={allSites}
                  selectedValues={queryParams?.site || []}
                  handleChange={inputChangedHandler}
                  searchPlaceholder={t('obx.shiftReports.filters.sites.searchPlaceholder')}
                  checkmark
                  multiSelect={true}
                />

                <CustomDropDown
                  label={t('obx.shiftReports.filters.users.label')}
                  name="officer"
                  searchable
                  options={allOfficers}
                  selectedValues={queryParams?.officer || []}
                  handleChange={inputChangedHandler}
                  searchPlaceholder={t('obx.shiftReports.filters.users.searchPlaceholder')}
                  checkmark={true}
                  multiSelect={true}
                  clearAll={true}
                />
              </Box>
            </Box>
            <Box className={classes.reportsListingsHeaderRight}>
              <Box className={classes.reportsListingsHeaderRightDate}>
                <DateRangePicker
                  selectedDates={queryParams?.selectedDates}
                  setDates={(dates) => {
                    updateFormHandler('selectedDates', dates);
                  }}
                />
              </Box>
            </Box>
          </Box>
          {loading ? (
            <Box className={classes.reportsListingsContent}>
              <TableComponent
                data={{}}
                columns={columns}
                tableHead={() => (
                  <>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell key={column.id}>{column.label}</TableCell>
                      ))}
                    </TableRow>
                  </>
                )}
                tableBody={tableSkeletonBody}
                pagination={false}
              />
            </Box>
          ) : (
            <>
              {!loading && data?.length <= 0 && (
                <Box className={classes.shiftRecordsNoRecord}>
                  <NoRecordFound data={data} t={t} type={'listing'} />
                </Box>
              )}
              {data?.length > 0 && (
                <>
                  <Box className={classes.reportsListingsContent}>
                    <ReportTable
                      selectedStatus={queryParams.status}
                      queryParams={queryParams}
                      data={data || []}
                      setData={setData}
                      fetchReport={fetchShiftReports}
                      setQueryParams={setQueryParams}
                      orderState={orderState}
                      setOrderState={setOrderState}
                      showAIBadges
                    />
                  </Box>
                </>
              )}
            </>
          )}

          <Box className={classes.reportsListingsPagination}>
            <PaginationComponent
              page={queryParams.page - 1}
              perPage={queryParams.perPage}
              totalRecords={totalRows}
              handleChangePage={handleChangePage}
              perPageOptions={paginationOptions.perPageOptions}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Box>
        </Box>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Suspense fallback={null}>
          <DailyRunsheetReport
            params={params}
            setQueryParams={setQueryParams}
            value={value}
            sites={allSites}
            officers={allOfficers}
          />
        </Suspense>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}></CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <Suspense fallback={null}>
          <SiteSummaryReports
            params={params}
            setQueryParams={setQueryParams}
            value={value}
            sites={allSites}
            officers={allOfficers}
            allSites={allSites}
          />
        </Suspense>
      </CustomTabPanel>
    </Box>
  );
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();

  return (
    <Box
      role="tabpanel"
      className={classes.faqTabPanel}
      id={`simple-tabpanel-${index}`}
      hidden={value !== index}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Box>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
