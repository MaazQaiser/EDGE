import { Box, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getInvoiceData } from 'services/duty.services';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import { useApiControllers } from 'src/helper/axios';
import { paginationOptions } from 'src/utils/constants';
import capitalize from 'src/utils/string/capitalize';

// import InvoicePdf from './invoicePdf';
import { useStyles } from './invoiceStyle';

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'id',
      label: `${t('obx.loads.tables.listing.columns.id')}`,
      sortable: true,
      className: hoverIconClass,
    },
    {
      id: 'amount',
      label: `${t('obx.loads.tables.listing.columns.amount')}`,
      sortable: false,
    },
    {
      id: 'invoiceDate',
      label: `${t('obx.loads.tables.listing.columns.invoiceDate')}`,
      sortable: false,
    },
    {
      id: 'dueDate',
      label: `${t('obx.loads.tables.listing.columns.dueDate')}`,
      sortable: false,
    },
    {
      id: 'duration',
      label: `${t('obx.loads.tables.listing.columns.duration')}`,
      sortable: false,
    },
  ];
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  selectedDates: [null, null],
};
const columnIdsEnum = {
  id: 'id',
  name: 'name',
  companyName: 'companyClient',
  amount: 'Amount',
  invoiceDate: 'invoiceDate',
  dueDate: 'dueDate',
  duration: 'duration',
};

const Invoice = ({ id }) => {
  const { t } = useTranslation();
  const { getNewApiController } = useApiControllers();

  const NA = t('commonText.nA');

  const classes = useStyles();
  const hoverIconClass = classes.SitesTD;

  const columns = i18ColumnName(t, hoverIconClass);
  // const [showDrawer, setShowDrawer] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalRows, setTotalRows] = useState(0);

  // const [_vehicleTypeOptions, setVehicleTypeOptions] = useState([]);

  const [orderState, setOrderState] = useState(order);

  const [queryParams, setQueryParams] = useState(params);

  const fetchSiteLoads = async ({ ...queryParams }) => {
    const apiController = getNewApiController();

    try {
      setLoading(true);
      let params = {
        sortBy: queryParams.sortBy,
        orderBy: queryParams.orderBy,
        perPage: queryParams.perPage,
        page: queryParams.page,
        windowStart: queryParams?.selectedDates?.[0]
          ? queryParams?.selectedDates?.[0]?.set('hour', 5).set('minute', 0)?.toISOString()
          : '',
        windowEnd: queryParams?.selectedDates?.[1]
          ? queryParams?.selectedDates?.[1]?.set('hour', 28).set('minute', 59)?.toISOString()
          : '',
        siteId: [id],
      };

      const response = await getInvoiceData(params);

      if (response && response?.statusCode === 200) {
        setData(response?.data || []);
        setLoading(false);

        const total = response?.pagination?.totalCount;
        setTotalRows(total);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const renderTableCell = (row, column) => {
    // if (column.id === columnIdsEnum.id) {
    //   return (
    //     <Box className={classes.franchiseName}>
    //       <Box className={classes.franchiseNameText}>{capitalize(row[column.id]) || NA}</Box>
    //       <Box className={classes.franchiseNameIcon}>
    //         <ChevronRight />
    //       </Box>
    //     </Box>
    //   );
    // }
    if (column.id === columnIdsEnum.invoiceDate || column.id === columnIdsEnum.dueDate) {
      return <>{row[column.id] ? dayjs(row[column.id])?.format('MM-DD-YYYY') : NA}</>;
    }
    if (column.id == columnIdsEnum.duration) {
      return (
        <>
          {row?.startDate
            ? `${dayjs(row?.startDate)?.format('MM-DD-YYYY')} -
              ${dayjs(row?.endDate)?.format('MM-DD-YYYY')}`
            : NA}
        </>
      );
    }
    if (column.id == columnIdsEnum.id) {
      return (
        <a
          target="_blank"
          href={row?.invoiceUrl}
          rel="noreferrer"
          className={classes.franchiseNameText}
        >
          <Box className={classes.franchiseName}>
            <Typography variant="subtitle2" className={classes.franchiseNameText}>
              {capitalize(row[column.id]) || NA}
            </Typography>
            <Box className={classes.franchiseNameIcon}>
              <ChevronRight />
            </Box>
          </Box>
        </a>
      );
    }
    if (column.id === columnIdsEnum.name) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{capitalize(row[column.id]) || NA}</Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.companyName) {
      return <> {row?.companyName ? capitalizeFirstLetter(row?.companyName) : NA}</>;
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

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };
  // const openInvoicePdf = () => {
  //   setShowDrawer(true);
  // };
  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });

    applySorting(columnId, orderState?.orderType);
  };
  //open Invoice details modal

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns?.map((column) => (
            <TableCell key={column?.id} sortDirection={sortDirection(column)}>
              {column?.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column?.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column?.id)}
                >
                  {column?.label}
                </TableSortLabel>
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
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  // onClick={() => openInvoicePdf(column, row)}
                  className={column.className}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };

  useEffect(() => {
    fetchSiteLoads(queryParams);
  }, [id, queryParams]);

  return (
    <Box className={classes.visitors}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.visitorsHeader}>
        <Box className={classes.visitorsHeaderSearch}></Box>
        <Box className={classes.visitorsHeaderRight}>
          <Box className={classes.visitorsDateRange}>
            <DateRangePicker
              selectedDates={queryParams?.selectedDates}
              setDates={(dates) => {
                updateFormHandler('selectedDates', dates);
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
        applySorting={applySorting}
        rowsPerPageOptions={paginationOptions.perPageOptions}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      {/* Invoice Drawer */}
      {/* <SideDrawer isOpen={showDrawer}>
        <InvoicePdf showDrawer={showDrawer} setShowDrawer={setShowDrawer} />
      </SideDrawer> */}
    </Box>
  );
};

Invoice.propTypes = {
  id: PropTypes.number,
};
export default Invoice;
