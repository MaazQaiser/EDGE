import { Box, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as ExportUploadIcon } from 'assets/images/downloadcloud.svg?react';
import ProgressBarWithLabelComponent from 'commonComponents/progressBarWithLabel';
import SearchComponent from 'commonComponents/searchWithQuery';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getEmployees } from 'services/employee.services';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton.jsx';
import { useCurrency } from 'src/hooks/useCurrency.jsx';
import useDateTime from 'src/hooks/useDateTime.jsx';
import { numberToAmountFormat } from 'src/utils/currencyFormater/index.js';
import capitalize from 'src/utils/string/capitalize.jsx';
import { capitalizeFirstLetter } from 'src/utils/string/common.jsx';

import { dayjsFormatsEnum, paginationOptions } from '../../../../../../utils/constants/index.js';
import TableComponent from '../../../../../components/common/table';
import NoRecordFound from '../../../../../components/common/table/noRecordFound';

const i18ColumnName = (t, hoverIconClass) => {
  return [
    // { id: 'id', label: 'ID', sortable: true },
    {
      id: 'name',
      label: `${t('ho.employees.tables.listing.columns.name')}`,
      sortable: true,
      className: hoverIconClass,
    },
    {
      id: 'role', // role or permission assigned to the user
      label: `${t('ho.employees.tables.listing.columns.userType')}`,
      sortable: false,
    },
    {
      id: 'overtime', // department of the user
      label: `${t('ho.employees.tables.listing.columns.overtime')}`,
      sortable: false,
    },
    {
      id: 'email', // email of the user
      label: `${t('ho.employees.tables.listing.columns.email')}`,
      sortable: false,
    },
    {
      id: 'phone', // account status of the user
      label: `${t('ho.employees.tables.listing.columns.number')}`,
      sortable: false,
    },
    {
      id: 'joinedDate',
      label: `${t('ho.employees.tables.listing.columns.joinedDate')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  ratePerHour: 'ratePerHour',
  lastPayment: 'lastPayment',
  currentDutyProgress: 'currentDutyProgress',
  joinedOn: 'joinedOn',
  name: 'name',
  role: 'role',
  joinedDate: 'joinedDate',
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const useStyles = makeStyles((theme) => ({
  searchSectionMain: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    justifyContent: 'space-between',
  },

  searchSection: {
    gap: '12px',
    display: 'flex',
  },

  dropdownCommonSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  mainWrapper: {
    padding: '24px 32px 0 32px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 0 24px',
    },
  },

  franchiseSitesListing: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },
}));
export default function Employees({ franchiseId: id }) {
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();
  const { getCurrencyOfFranchise } = useCurrency();

  const NA = t('commonText.nA');

  const classes = useStyles();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  const [queryParams, setQueryParams] = useState(params);

  const hoverIconClass = classes.ZonesTD;
  const columns = i18ColumnName(t, hoverIconClass);

  const fetchEmployees = async (params) => {
    try {
      setLoading(true);
      const response = await getEmployees(id, params);
      if (response?.statusCode === 200) {
        setData(response?.data?.employees);
        setTotalRows(response?.data?.pagination?.totalCount);
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

  const handleChangePage = (_, newPage) => {
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
    if (column.id === columnIdsEnum.currentDutyProgress) {
      return (
        <>
          <ProgressBarWithLabelComponent label={true} value={row[column.id]} />
        </>
      );
    }
    if (column.id === columnIdsEnum.ratePerHour || column.id === columnIdsEnum.lastPayment) {
      return (
        <>
          {`${getCurrencyOfFranchise(id)?.currencySymbol}${numberToAmountFormat(row[column.id])}`}
        </>
      );
    }
    if (column.id === columnIdsEnum.joinedDate) {
      return (
        <>
          {formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date }) || NA}
        </>
      );
    }

    if (column.id === columnIdsEnum.name) {
      return <>{capitalize(row[column.id]) || NA}</>;
    }

    if (column.id === columnIdsEnum.role) {
      return <>{capitalizeFirstLetter(row[column.id]) || NA}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  const [orderState, setOrderState] = useState(order);

  /**
   * Handle column sorting.
   *
   * @param {String} columnId - The ID of the column being sorted.
   */
  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState.orderType);
  };

  /**
   * Determine the sort direction for a column.
   *
   * @param {Object} column - The column configuration object.
   * @return {Boolean|String} - The sort direction or false if not sorted.
   */
  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  /**
   * Determine the order direction for a column.
   *
   * @param {Object} column - The column configuration object.
   * @return {String} - The order direction ('asc' or 'desc').
   */
  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };

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

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton numberOfRows={10} columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.length > 0 &&
          data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.id}>{renderTableCell(row, column)}</TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  // This function handles the search logic
  const handleSearch = (query) => {
    setQueryParams((prev) => ({
      ...prev,
      search: query?.target?.value,
    }));
  };

  useEffect(() => {
    fetchEmployees(queryParams);
  }, [queryParams, id]);

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };

  return (
    <Box className={classes.mainWrapper}>
      <Box className={classes.searchSectionMain}>
        {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
        <Box className={classes.searchSection}>
          <SearchComponent onSearch={handleSearch} />
        </Box>
        <Box>
          <Button variant="secondaryGrey" disabled startIcon={<ExportUploadIcon />}>
            Export
          </Button>
        </Box>
      </Box>
      <Box className={classes.franchiseSitesListing}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          rowsPerPage={queryParams.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>
    </Box>
  );
}

Employees.propTypes = {
  franchiseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
