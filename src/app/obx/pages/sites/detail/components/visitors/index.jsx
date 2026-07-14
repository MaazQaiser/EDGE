import {
  Button,
  // Button,
  Chip,
  TableCell,
  TableRow,
  TableSortLabel,
  Tooltip,
  // Typography,
} from '@mui/material';
import { Box } from '@mui/material';
// import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg';
import { ReactComponent as DownloadCloud } from 'assets/images/downloadcloud.svg?react';
// import { ReactComponent as BanIcon } from 'assets/svg/ban-icon.svg';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import SideDrawer from 'commonComponents/sideDrawer';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import TableImage from 'commonComponents/tableImage';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import { getDateRangeWrtFranchiseTimezone } from 'src/app/obx/pages/schedules/helper';
import EditVisitData from 'src/app/obx/pages/sites/detail/components/visitors/components/editVisitData';
import VisitorsLoadsPreview from 'src/app/obx/pages/sites/detail/components/visitorsLoadsPreview';
import { useApiControllers } from 'src/helper/axios';
import useDateTime from 'src/hooks/useDateTime';
import {
  exportPDF,
  getManagementTypeOptions,
  getVisitorsLoadsLogs,
} from 'src/services/visitorsLoads.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import {
  dayjsFormatsEnum,
  paginationOptions,
  toastSettings,
  VisitorStatusEnum,
} from 'src/utils/constants';
import { defaultImage } from 'src/utils/constants';
import capitalize from 'src/utils/string/capitalize';
import { toaster } from 'src/utils/toast';

import { useStyles } from './visitorStyles';

export const VisitorLoadsStatusEnum = {
  banned: 'Banned',
  allowed: 'Allowed',
};

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'name',
      label: `${t('obx.visitors.tables.listing.columns.name')}`,
      sortable: true,
      className: hoverIconClass,
      hasImage: true,
      module: ['visitors'],
    },

    {
      id: 'vehicleNumber',
      label: `${t('obx.visitors.tables.listing.columns.vehicleNumber')}`,
      sortable: false,
      className: hoverIconClass,
      module: ['loads'],
    },
    // {
    //   id: 'driverName',
    //   label: `${t('obx.visitors.tables.listing.columns.driverName')}`,
    //   sortable: true,
    //   hasImage: true,
    //   className: hoverIconClass,
    //   module: ['loads'],
    // },
    {
      id: 'status',
      label: `${t('obx.visitors.tables.listing.columns.status')}`,
      sortable: false,
      module: ['visitors', 'loads'],
    },
    {
      id: 'visitorType',
      label: `${t('obx.visitors.tables.listing.columns.visitorType')}`,
      sortable: false,
      module: ['visitors'],
    },
    {
      id: 'loadType',
      label: `${t('obx.visitors.tables.listing.columns.loadType')}`,
      sortable: false,
      module: ['loads'],
    },
    {
      id: 'phone',
      label: `${t('obx.visitors.tables.listing.columns.phoneNumber')}`,
      sortable: false,
      module: ['visitors'],
    },

    {
      id: 'inBound',
      label: `${t('obx.visitors.tables.listing.columns.inBound')}`,
      sortable: false,
      module: ['loads'],
    },
    {
      id: 'outBound',
      label: `${t('obx.visitors.tables.listing.columns.outBound')}`,
      sortable: false,
      module: ['loads'],
    },

    {
      id: 'checkIn',
      label: `${t('obx.visitors.tables.listing.columns.lastCheckIn')}`,
      sortable: false,
      module: ['visitors'],
    },
    {
      id: 'checkOut',
      label: `${t('obx.visitors.tables.listing.columns.lastCheckOut')}`,
      sortable: false,
      module: ['visitors'],
    },

    {
      id: 'createdBy',
      label: `${t('obx.visitors.tables.listing.columns.createdBy')}`,
      sortable: false,
      module: ['visitors', 'loads'],
    },
  ];
};

const i18Filters = (t) => [
  { value: 'all', label: t('obx.visitors.tables.listing.filters.all') },
  { value: 'allowed', label: t('obx.visitors.tables.listing.filters.allowed') },
  { value: 'banned', label: t('obx.visitors.tables.listing.filters.banned') },
];

const columnIdsEnum = {
  name: 'name',
  driverName: 'driverName',
  status: 'status',
  visitorType: 'visitorType',
  phoneNumber: 'phone',
  lastCheckInDateAndTime: 'checkIn',
  lastCheckOutDateAndTime: 'checkOut',
  createdBy: 'createdBy',
  inBound: 'inBound',
  outBound: 'outBound',
  vehicleNumber: 'vehicleNumber',
};

const enumTypeOptions = {
  visitors: 'visitorsCheckIn',
  loads: 'loadsCheckIn',
};

const enumTypeCategory = {
  visitors: 'visitors',
  loads: 'loads',
};

const initialParams = (categoryType) => ({
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  siteId: '',
  name: '',
  dateRange: [],
  ...(categoryType === enumTypeCategory.loads ? { loadsTypes: [] } : {}),
  ...(categoryType === enumTypeCategory.visitors ? { visitorsTypes: [] } : {}),
});

const Visitors = ({ siteId, categoryType }) => {
  const { t } = useTranslation();
  const { getNewApiController } = useApiControllers();

  const classes = useStyles();

  const NA = t('commonText.nA');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalRows, setTotalRows] = useState(0);
  const [profileId, setProficeId] = useState(null);

  const [typeOptions, setTypeOptions] = useState([]);
  const [showPreviewVisitorDrawer, setShowPreviewVisitorDrawer] = useState(false);

  const hoverIconClass = classes.SitesTD;
  const filters = i18Filters(t);

  const columns = i18ColumnName(t, hoverIconClass).filter((a) => a.module.includes(categoryType));

  const userCountryConfiguration = useSelector((state) => state?.auth?.countryConfiguration);

  const [queryParams, setQueryParams] = useState(initialParams(categoryType));
  const [selectedRow, setSelectedRow] = useState({});
  const { formatDayjsDateTime } = useDateTime();
  const [showEditVisitProfile, setShowEditVisitProfile] = useState(false);

  const handleClosePreviewVisitorDrawer = () => {
    setShowPreviewVisitorDrawer(false);
  };
  const handleOpenProfileViewModal = (row) => {
    setShowPreviewVisitorDrawer(true);
    setSelectedRow(row);
  };

  const fetchPDF = async () => {
    try {
      if (queryParams?.dateRange?.length === 0) return;
      const response = await exportPDF({ ...queryParams, category: categoryType, siteId: siteId });
      if (response && response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchVisitorsLoadsLogs = async (categoryType, { ...queryParams }) => {
    const apiController = getNewApiController();

    const { startDate, endDate } = getDateRangeWrtFranchiseTimezone(queryParams.dateRange);

    try {
      setLoading(true);
      let params = {
        ...queryParams,
        siteId: siteId,

        dateRange: [startDate, endDate],
        ...(categoryType === enumTypeCategory.loads
          ? { loadsTypes: queryParams.loadsTypes.map((a) => a.label) }
          : {}),
        ...(categoryType === enumTypeCategory.visitors
          ? { visitorsTypes: queryParams.visitorsTypes.map((a) => a.label) }
          : {}),
      };

      if (categoryType === 'loads') {
        params.search = params.name;
        params.name = '';
      }

      const response = await getVisitorsLoadsLogs(categoryType, params, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setLoading(false);
        setData(response.data[categoryType]);
        setTotalRows(response?.data?.pagination?.totalCount);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const fetchManagementOption = async () => {
    try {
      const query = {
        templateableType: [enumTypeOptions[categoryType]],
        siteId: siteId,
      };

      const response = await getManagementTypeOptions(query);

      if (response?.statusCode === 200) {
        setTypeOptions(transformArrayForOptions(response?.data?.templates, 'title', 'id'));
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.name || column.id === columnIdsEnum.driverName) {
      return (
        <Box className={classes.franchiseName}>
          <TableImage imageUrl={row?.profileImage || defaultImage} alt="" />
          <Box className={classes.franchiseNameText}>{capitalize(row[column.id]) || NA}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.vehicleNumber) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{capitalize(row[column.id]) || NA}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.phone) {
      return <Box>{row[column.id] || NA}</Box>;
    }

    if (column.id === columnIdsEnum.status) {
      return (
        <>
          {row.status === VisitorStatusEnum.banned ? (
            <Chip
              label={row.status}
              size="small"
              color={row.status === VisitorStatusEnum.banned ? 'error' : 'success'}
            />
          ) : (
            <Chip label={row.status} size="small" color={'success'} />
          )}
        </>
      );
    }

    if (column.id === columnIdsEnum.lastCheckInDateAndTime || column.id === columnIdsEnum.inBound) {
      return (
        <>
          {row[column.id]
            ? formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.dateTime })
            : NA}
        </>
      );
    }

    if (column.id === columnIdsEnum.createdBy) {
      return <>{row?.createdBy?.email || NA}</>;
    }

    if (
      column.id === columnIdsEnum.lastCheckOutDateAndTime ||
      column.id === columnIdsEnum.outBound
    ) {
      return (
        <>
          {row[column.id]
            ? formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.dateTime })
            : NA}
        </>
      );
    }

    return <>{row[column.id] || NA}</>;
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

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns?.map((column) => (
            <TableCell key={column?.id}>
              {column?.sortable ? (
                <TableSortLabel>{column?.label}</TableSortLabel>
              ) : (
                `${column?.label}`
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.length > 0 &&
          data.map((row) => (
            <TableRow
              key={row.id}
              className={row.status === VisitorLoadsStatusEnum.banned && classes.tableBannedRow}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  className={column.className}
                  onClick={() => handleOpenProfileViewModal(row)}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  useEffect(() => {
    if (siteId) {
      fetchVisitorsLoadsLogs(categoryType, queryParams);
      fetchManagementOption();
    }
  }, [categoryType, siteId, queryParams]);

  return (
    <Box className={classes.visitors}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.visitorsHeader}>
        <Box className={classes.visitorsHeaderSearch}>
          <SearchComponentWithQuery
            name="name"
            placeHolder={t(
              categoryType === 'loads' ? 'loads.searchByVehicalNumber' : 'visitor.search',
            )}
            value={queryParams?.name}
            onSearch={inputChangedHandler}
            className={classes.searchCustomClass}
          />
          <CustomDropDown
            label={t('obx.visitors.dropdownTypeLabel')}
            name={`${categoryType}Types`}
            options={typeOptions}
            selectedValues={queryParams.loadsTypes || queryParams.visitorsTypes}
            handleChange={inputChangedHandler}
            clearAll
            searchable
            checkmark
            multiSelect
          />
          <CustomDropDown
            label={`${t('obx.form.input.dropDown.selectVisitors.label')}`}
            options={filters}
            name={'status'}
            selectedValues={queryParams.status}
            handleChange={inputChangedHandler}
          />
        </Box>
        <Box className={classes.visitorsHeaderRight}>
          <Tooltip
            title={
              <>
                <strong>{t('links.buttonStartEndDate')}</strong>
              </>
            }
            arrow
          >
            <Button
              variant="secondaryGrey"
              onClick={fetchPDF}
              className={classes.exportBtn}
              // disabled={!siteId || !queryParams.dateRange.length}
              startIcon={<DownloadCloud />}
            >
              {`${t('links.export')}`}
            </Button>
          </Tooltip>

          <Box className={classes.visitorsDateRange}>
            <DateRangePicker
              placeHolder={`${userCountryConfiguration?.dateFormat} - ${userCountryConfiguration?.dateFormat}`}
              selectedDates={queryParams.dateRange}
              setDates={(data) => {
                inputChangedHandler({
                  target: {
                    value: [dayjs(data?.[0]).startOf('day'), dayjs(data?.[1]).endOf('day')],
                    name: 'dateRange',
                  },
                });
              }}
            />
          </Box>
        </Box>
      </Box>
      <TableComponent
        data={data}
        columns={columns}
        tableHead={tableHead}
        tableBody={tableBody}
        pagination={true}
        page={queryParams.page - 1}
        rowsPerPage={queryParams?.perPage}
        totalRecords={totalRows}
        handleChangePage={handleChangePage}
        rowsPerPageOptions={paginationOptions.perPageOptions}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      <SideDrawer isOpen={showPreviewVisitorDrawer} totalWidth="612px">
        {showPreviewVisitorDrawer && (
          <VisitorsLoadsPreview
            handleClosePreviewVisitorDrawer={handleClosePreviewVisitorDrawer}
            id={selectedRow?.id}
            isLoad={categoryType === 'loads'}
            isBan={false}
            setProfileId={setProficeId}
            setShowEditVisitProfile={setShowEditVisitProfile}
            profileId={selectedRow?.profileId}
          />
        )}
      </SideDrawer>

      <SideDrawer isOpen={showEditVisitProfile} totalWidth="624px">
        <EditVisitData
          id={profileId}
          handleCloseDrawerBanned={() => {
            setShowEditVisitProfile(false);
          }}
          refetchData={() => {}}
          refetchManagementStats={() => {
            fetchVisitorsLoadsLogs(categoryType, queryParams);
          }}
          isLoad={categoryType === 'loads'}
        />
      </SideDrawer>
    </Box>
  );
};

Visitors.propTypes = {
  siteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  categoryType: PropTypes.string,
};

export default Visitors;
