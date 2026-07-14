import { Box, Button, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { ReactComponent as DeleteIconBin } from 'assets/svg/DeleteIconBin.svg?react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { locationSortingTypes } from 'salesComponents/users/newLocationsDrawer/location.constant';
import { getMapRoutes, getScoutListings } from 'services/scout.service';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table/index.jsx';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { paginationOptions } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';

import { useStyles } from './listing.js';

const i18ColumnName = (t) => {
  return [
    {
      id: 'lineItem',
      label: `${t('obx.invoice.lineItem')}`,
    },
    {
      id: 'quantity',
      label: `${t('obx.invoice.quantity')}`,
    },
    {
      id: 'unitPrice',
      label: `${t('obx.invoice.unitPrice')}`,
    },
    {
      id: 'total',
      label: `${t('obx.invoice.total')}`,
    },
    {
      id: 'action',
      label: `${t('obx.invoice.action')}`,
    },
  ];
};
const stubbedData = [
  {
    id: 1,
    lineItem: 'Dedicated Job 12:00p - 01:00p Parking Lot',
    quantity: '7',
    unitPrice: '45',
    total: '234',
  },
  {
    id: 2,
    lineItem: 'Remote Monitoring',
    quantity: '7',
    unitPrice: '45',
    total: '234',
  },
  {
    id: 3,
    lineItem: 'Dedicated Job 12:00p - 01:00p',
    quantity: '7',
    unitPrice: '45',
    total: '234',
  },
  {
    id: 4,
    lineItem: 'Admin Fee',
    quantity: '7',
    unitPrice: '45',
    total: '234',
  },
];

const params = {
  pageNo: paginationOptions.defaultPerPage,
  rowsPerPage: paginationOptions.perPageRows,
  // perPageOptions: paginationOptions.perPageOptions,
  search: '',
  sortBy: '',
  orderBy: '',
  userType: {},
  date: dayjs(),
  windowEnd: null,
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  action: 'action',
};

const LineItemTable = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const classDealName = classes.dealNameTD;
  const columns = i18ColumnName(t, classDealName);

  // const [data, setData] = useState([]);

  const [queryParams, setQueryParams] = useState(params);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const [orderState, setOrderState] = useState(order);

  const [currentObject, setCurrentObject] = useState({});

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      pageNo: newPage + 1,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      pageNo: paginationOptions.defaultPerPage,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.action) {
      return (
        <>
          <Button
            disableRipple
            className={classes.notesCloseBtn}
            variant="onlyText"
            startIcon={<DeleteIconBin />}
          ></Button>
        </>
      );
    }
    return <>{row[column.id]}</>;
  };

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const handleSort = (columnId) => {
    const isAsc = orderState.orderBy === columnId && orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState.orderType);
  };

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : locationSortingTypes.ASC;
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
      pageNo: paginationOptions.defaultPerPage,
    }));
  };

  /**
   * Fetch scout listing
   * @param {*} page
   * @param {*} query
   */
  const fetchScouts = async (queryParams) => {
    setLoading(true);
    try {
      const params = {
        ...queryParams,
        userType:
          extractValuesByKeyFromInput(queryParams.userType, 'value') !== 'all'
            ? extractValuesByKeyFromInput(queryParams.userType, 'value')
            : '',
        date: queryParams.date
          ? queryParams.date.format(dateFormat)
          : dayjs(new Date()).format(dateFormat), //dayjs(new Date()).format(dateFormat)
      };
      const response = await getScoutListings(params);
      if (response && response?.statusCode === 200) {
        setData(response?.data?.routes || []);
        setRouteData([]);
        const total = response?.pagination?.totalCount;
        setTotalRows(total);
        setCurrentObject(response?.data?.routes?.[0] || {});
        if (response?.data?.routes?.length < 1 && isObjectEmpty(response?.data?.routes?.[0]))
          setRouteLoading(false);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    } finally {
      setLoading(false);
    }
  };

  const fetchMapRoutes = async (routeId) => {
    setRouteLoading(true);
    try {
      const response = await getMapRoutes(routeId);
      if (response && response?.statusCode === 200) {
        setRouteData(response?.data?.visits || []);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    } finally {
      setRouteLoading(false);
    }
  };

  const _getClickedObjectVisits = (row) => {
    setRouteData([]);
    setCurrentObject(row);
    fetchMapRoutes(row.routeId);
  };

  useEffect(() => {
    fetchScouts(queryParams);
  }, [queryParams]);

  useEffect(() => {
    if (currentObject.routeId) fetchMapRoutes(currentObject.routeId);
  }, [currentObject]);

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} sortDirection={sortDirection(column)}>
              {column.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column.id)}
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

  const applySelectedClass = (id) => {
    return `${currentObject.routeId === id && classes.selectedRowColor}`;
  };

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound
          data={data}
          noOfColumns={columns.length}
          t={t}
          title={t('sales.scouting.noScoutingRouteFound')}
          description={t('sales.scouting.noScoutingRouteFoundDesc')}
        />
        {data.length > 0 &&
          data?.map((row) => (
            <TableRow
              key={`${row.routeId}-${row.id}`}
              className={`${applySelectedClass(row.routeId)}`}
            >
              {columns.map((column) => (
                <TableCell className={`${column.className}`} key={column.id}>
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  return (
    <Box className={classes.scoutingWrapper}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}

      <Box className={classNames(classes.locationListing)}>
        <TableComponent
          data={stubbedData}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={false}
          page={queryParams.pageNo - 1}
          rowsPerPage={queryParams.rowsPerPage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          applySorting={applySorting}
        />
      </Box>
    </Box>
  );
};

export default LineItemTable;
