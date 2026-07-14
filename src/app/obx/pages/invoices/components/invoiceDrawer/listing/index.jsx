import {
  Box,
  Button,
  Skeleton,
  TableCell,
  TableRow,
  TableSortLabel,
  TextField,
} from '@mui/material';
import { ReactComponent as DeleteIconBin } from 'assets/svg/DeleteIconBin.svg?react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { locationSortingTypes } from 'salesComponents/users/newLocationsDrawer/location.constant';
import { getMapRoutes, getScoutListings } from 'services/scout.service';
import CustomDropDown from 'src/app/components/common/customDropDown/index.jsx';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table/index.jsx';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { useApiControllers } from 'src/helper/axios/index.js';
import { useCurrency } from 'src/hooks/useCurrency.jsx';
import { getSageItemsDropdown } from 'src/services/invoice.services.js';
import { paginationOptions } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';

import { useStyles } from './listing.js';

const i18ColumnName = (t, franchiseCurrency) => {
  return [
    {
      id: 'sageItem',
      label: `${t('obx.invoice.lineItems')}`,
    },
    {
      id: 'description',
      label: `${t('obx.invoice.description')}`,
    },
    {
      id: 'quantity',
      label: `${t('obx.invoice.quantity')}`,
    },
    {
      id: 'price',
      label: `${t('obx.invoice.unitPrice')} (${franchiseCurrency})`,
    },
    {
      id: 'total_price',
      label: `${t('obx.invoice.total')} (${franchiseCurrency})`,
    },
    {
      id: 'action',
      label: `${t('obx.invoice.action')}`,
    },
  ];
};

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
  total_price: 'total_price',
  description: 'description',
  sageItem: 'sageItem',
  quantity: 'quantity',
  price: 'price',
};

const LineItemTable = ({
  lineItems,
  removeLineItem,
  handleUpdateItem,
  errorMessages,
  loadingInvoice,
  allowNegativeUnitPrice,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const classDealName = classes.dealNameTD;
  const { currency: franchiseCurrency } = useCurrency();
  const columns = i18ColumnName(t, franchiseCurrency, classDealName);

  // const [data, setData] = useState([]);

  const [queryParams, setQueryParams] = useState(params);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderState, setOrderState] = useState(order);
  const [loadingDropdown, setLoadingDropdown] = useState(true);
  const [sageItems, setSageitems] = useState([]);
  const { getNewApiController } = useApiControllers();
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

  const fetchSageItems = async () => {
    const apiController = getNewApiController();

    try {
      const response = await getSageItemsDropdown();

      if (response && response?.statusCode === 200) {
        setSageitems(response?.data);
        setLoadingDropdown(false);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoadingDropdown(false);
      }
    }
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.sageItem) {
      return (
        <>
          {loadingDropdown ? (
            <Skeleton className={classes.skeletonDropdown} />
          ) : (
            <>
              <CustomDropDown
                name="sageItem"
                placeHolder={`${t('obx.sites.createSite.select')} ${t('sales.contract.lineItem')}`}
                selectedValues={row[column.id] || {}}
                handleChange={(event) => handleUpdateItem(event, row.index)}
                bordered
                searchable
                options={sageItems || []}
                className={classes.addOfficerDropdownField}
                showLabelTooltip={true}
              />
              <>
                {!!errorMessages?.[`lineItems,${row.index},${column.id}`] && (
                  <Box className={classes.invalidFeedback}>
                    {errorMessages?.[`lineItems,${row.index},${column.id}`]}
                  </Box>
                )}
              </>
            </>
          )}
        </>
      );
    }

    if (column.id === columnIdsEnum.action) {
      return (
        <>
          <Button
            disableRipple
            className={classes.notesCloseBtn}
            variant="onlyText"
            startIcon={<DeleteIconBin />}
            onClick={() => removeLineItem(row.index)}
            disabled={lineItems.length === 1}
          ></Button>
        </>
      );
    }
    if (column.id === columnIdsEnum.description) {
      return (
        <>
          <TextField
            className={classes.lineField}
            name={column.id}
            value={row[column.id]}
            onChange={(event) => handleUpdateItem(event, row.index)}
            margin="dense"
            placeholder={t('obx.invoice.add')}
          />
        </>
      );
    }
    if (column.id === columnIdsEnum.total_price) {
      return (
        <Box className={classes.totalPrice}>
          {row.total ? parseFloat(row.total).toFixed(2) : NA}
          {/* {!!row.price && !!row.quantity ? `${+row.price * +row.quantity}` : NA} */}
        </Box>
      );
    } else {
      return (
        <>
          <TextField
            className={classes.lineField}
            name={column.id}
            value={row[column.id]}
            onChange={(event) => handleUpdateItem(event, row.index)}
            margin="dense"
            inputProps={{
              inputMode:
                column.id === columnIdsEnum.quantity
                  ? 'numeric'
                  : column.id === columnIdsEnum.price
                    ? allowNegativeUnitPrice
                      ? 'decimal'
                      : 'numeric'
                    : undefined,
            }}
            placeholder={t('obx.invoice.add')}
            error={!!errorMessages?.[`lineItems,${row.index},${column.id}`]}
            helperText={errorMessages?.[`lineItems,${row.index},${column.id}`]}
          />
        </>
      );
    }
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

  useEffect(() => {
    fetchScouts(queryParams);
    fetchSageItems();
  }, []);

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
    return loading || loadingInvoice ? (
      <TableSkeleton columns={columns} numberOfRows={3} />
    ) : (
      <>
        <NoRecordFound
          data={data}
          noOfColumns={columns.length}
          t={t}
          title={t('commonText.table.noRecordFound')}
          description={t('commonText.table.noRecordFound')}
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
          data={lineItems}
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

LineItemTable.propTypes = {
  lineItems: PropTypes.array,
  removeLineItem: PropTypes.func,
  handleUpdateItem: PropTypes.func,
  errorMessages: PropTypes.object,
  loadingInvoice: PropTypes.bool,
  allowNegativeUnitPrice: PropTypes.bool,
};

export default LineItemTable;
