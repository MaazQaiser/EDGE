import { Typography } from '@mui/material';
import { Box, Button, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import { Clossicon } from 'src/assets/svg';
import useDateTime from 'src/hooks/useDateTime';
import {
  dayjsFormatsEnum,
  defaultImage,
  paginationOptions,
  toastSettings,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './activityUserGroup';

const order = {
  orderBy: 'id',
  orderType: 'asc',
};
const ActivityUserGroup = ({ setShowDrawer }) => {
  const classes = useStyles();
  const closeDrawer = () => {
    setShowDrawer(false);
  };
  const sites = [
    { label: 'Site 1', value: 'site1' },
    { label: 'Site 2', value: 'site2' },
    { label: 'Site 3', value: 'site3' },
  ];
  const emptyQuery = {
    industryType: [],
    createdDate: null,
    lastActivityDate: null,
    cities: [],
    states: [],
    parentCompanyIds: [],
  };
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState(emptyQuery);
  const [orderState, setOrderState] = useState(order);
  const history = useHistory();
  const { formatDayjsDateTime } = useDateTime();
  console.log(page);

  const NA = t('commonText.nA');
  const [pagination, setPagination] = useState({ currentPage: 0, totalCount: 0, rowsPerPage: 10 });
  const i18Columns = [
    {
      id: 'timeStamp',
      label: t('obx.settings.userGroups.timeStamp'),
      sortable: false,
      className: classes.companyNameTD,
    },
    { id: 'group', label: t('obx.settings.userGroups.group'), sortable: false },
    { id: 'user', label: t('obx.settings.userGroups.user'), sortable: false },
    { id: 'action', label: t('obx.settings.userGroups.action'), sortable: false },
    { id: 'actionDetail', label: t('obx.settings.userGroups.actionDetail'), sortable: false },
  ];
  const stubbedData = [
    {
      timeStamp: '2024-01-01',
      group: 'Pine Meadows',
      user: 'Mike ',
      action: 'Created',
      actionDetail: 'Created',
    },
    {
      timeStamp: '2024-01-01',
      group: 'Pine Meadows',
      user: '789 ',
      action: 'Created',
      actionDetail: 'Created',
    },
  ];
  const fetchCompanies = async ({ page, query, rowsPerPage = 10 }) => {
    const apiController = getNewApiController();
    try {
      setLoading(true);
      const newQuery = { ...query };

      let cityIds = [];
      let stateIds = [];

      if (newQuery?.states?.length) stateIds = newQuery?.states.map((state) => state.id);
      if (newQuery?.cities?.length) cityIds = newQuery?.cities.map((city) => city.id);

      // Remove old keys
      delete newQuery.states;
      delete newQuery.cities;
      delete newQuery.parentCompany;

      const updatedQuery = {
        ...newQuery,
        stateIds,
        cityIds,
      };

      const response = await getCompanies(page, rowsPerPage, updatedQuery, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setData(response?.data.companies);
        setPagination({
          ...response?.pagination,
          rowsPerPage: rowsPerPage,
        });
        setTotalRows(response.pagination.totalCount);
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        if (error?.message) {
          toaster.error({
            text: error?.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
        setLoading(false);
      }
    }
  };

  const onChangeRowsPerPage = async (event) => {
    /**
     * update pagination object
     */
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      rowsPerPage: event.target.value,
    }));
    setPage(pagination.currentPage);

    /**
     * API call to get next page items for location
     */
    const params = {
      page: 1,
      rowsPerPage: event.target.value,
      query: query,
    };
    await fetchCompanies(params);
  };

  const handleChangePage = async (_, newPage) => {
    setPage(newPage);
    const params = {
      page: newPage + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: query,
    };
    await fetchCompanies(params);
  };

  const renderTableCell = (row, column) => {
    /**
     * show 'NA' if there is no value
     */
    if (!row[column.id]) {
      return <Box component="span">{NA}</Box>;
    }
    if (column.id === 'ownerName') {
      return (
        // <Box>
        //   <Box component="span" className="name-words">
        //     {getNameInitials(row[column.id]) || NA}
        //   </Box>
        //   {row[column.id]}
        // </Box>
        <Box className={classes.assignToClass}>
          <TableImage className={classes.assignAvatar} imageUrl={row.image || defaultImage} />
          <Box component="span" className={classes.assignToText}>
            {row[column.id]}
          </Box>
        </Box>
      );
    }

    if (column.id === 'name') {
      return (
        <Box className={classes.companyName}>
          <Box className={classes.companyNameText}>
            {capitalizeFirstLetter(row[column.id]) || NA}
          </Box>
          <Box className={classes.companyNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }
    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    if (column.id === 'parentCompany' || column.id === 'industry') {
      return <>{capitalizeFirstLetter(row[column.id]) || NA}</>;
    }

    if (column.id === 'createDate' || column.id === 'lastActivityDate')
      return (
        <>{formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date })}</>
      );

    return <>{row[column.id] || NA}</>;
  };

  const gotoCompanyDetail = (column, rowId) => {
    if (column.id === 'name') {
      history.push(`${SALES_COMPANY}/${rowId}`);
    }
  };

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };
  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };
  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState.orderType);
  };
  const applySorting = (sortBy, orderBy) => {
    setQuery((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
    const params = {
      page: 1,
      rowsPerPage: pagination.rowsPerPage,
      query: { ...query, sortBy: sortBy, orderBy: orderBy },
    };
    fetchCompanies(params);
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {i18Columns.map((column) => (
            <TableCell key={column.id} sortDirection={sortDirection(column)}>
              {column.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column.id)}
                  hideSortIcon={false}
                  sx={{
                    '& .MuiTableSortLabel-icon': {
                      opacity: 0.5, // Default opacity
                      transition: 'opacity 0.3s ease', // Smooth transition
                    },
                    '&.MuiTableSortLabel-active .MuiTableSortLabel-icon': {
                      opacity: 1, // Active state opacity
                    },
                  }}
                >
                  {column.label}
                </TableSortLabel>
              ) : (
                `${column.label}`
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const tableBody = (data, i18Columns) => {
    return loading ? (
      <TableSkeleton columns={i18Columns} />
    ) : (
      <>
        <NoRecordFound
          data={data}
          noOfColumns={i18Columns.length}
          t={t}
          text={t('sales.companies.noCompanies')}
          description={t('sales.companies.companiesDataSync')}
        />
        {data.length > 0 &&
          data.map((row) => (
            <TableRow key={row.id}>
              {i18Columns.map((column) =>
                column.id === 'name' ? (
                  <TableCell
                    onClick={() => gotoCompanyDetail(column, row.id)}
                    key={column.id}
                    className={column.className}
                  >
                    {renderTableCell(row, column)}
                  </TableCell>
                ) : (
                  <TableCell className={column.className} key={column.id}>
                    {renderTableCell(row, column)}
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
      </>
    );
  };

  return (
    <Box className={classes.activityDrawer}>
      <Box className={classes.drawerHeader}>
        <Typography variant="h2">{t('obx.settings.userGroups.activityLogs')}</Typography>
        <Button
          className={classes.cancelIcon}
          disableRipple
          variant="onlyText"
          onClick={() => {
            closeDrawer();
          }}
        >
          <Clossicon />
        </Button>
      </Box>

      <Box className={classes.drawerInner}>
        <Box className={classes.reportsListingsHeader}>
          <CustomDropDown
            label={`${t('obx.settings.userGroups.user')}`}
            options={sites}
            selectedValues={[]}
            handleChange={() => {}}
            name="associatedSites"
            multiSelect
            checkmark
            searchable
            isError={false}
          />
          <DateRangePicker
            placeHolder={t('obx.settings.userGroups.pickADate')}
            selectedDates={[]}
            setDates={(dates) => {
              console.log(dates);
            }}
          />
        </Box>
        <Box className={classes.drawerBody}>
          <TableComponent
            data={stubbedData}
            columns={i18Columns}
            tableHead={tableHead}
            tableBody={tableBody}
            pagination={false}
            page={pagination?.currentPage - 1}
            perPage={pagination?.rowsPerPage || perPage}
            totalRecords={totalRows}
            handleChangePage={handleChangePage}
            rowsPerPageOptions={paginationOptions.perPageOptions}
            onChangeRowsPerPage={onChangeRowsPerPage}
            rowsPerPage={pagination.rowsPerPage}
          />
        </Box>
      </Box>
    </Box>
  );
};

ActivityUserGroup.propTypes = {
  setShowDrawer: PropTypes.func,
};

export default ActivityUserGroup;
