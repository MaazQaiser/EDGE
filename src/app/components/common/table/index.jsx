import { Box, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { ReactComponent as ChevronDown } from 'assets/svg/commonDropdown/chevronDown.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types'; // Import PropTypes
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { paginationOptions } from '../../../../utils/constants';
import { useStyles } from './table.styles';

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

/**
 * TableComponent is a reusable component for rendering tables with sorting and pagination.
 *
 * @param {Array} data - An array of objects containing data to be displayed in the table.
 * @param {Array} columns - An array of column configuration objects for the table.
 * @param tableHead
 * @param {Function} tableBody - A function responsible for rendering the table body.
 * @param {Number} totalRecords - The total number of records in the listing.
 * @param {Number} page - The current page being displayed.
 * @param {Number} perPage - The number of records to display per page.
 * @param {Boolean} pagination - Set to true if you want to apply pagination to your table.
 * @param {Function} handleChangePage - A function to react to page change.
 * @param {Function} applySorting - A function to apply sorting to the table.
 * @param {String} align - To center a specific column.
 * @param {String} classNamePagination - To add a class to the pagination.
 * @param {String} classNametable - To add a class to the table.
 * @param {Boolean} hasTBody - should be true if you are provided tableBody from outside .
 * @param selectionText
 * @return Component
 */

function TableComponent({
  data,
  columns,
  tableHead,
  tableBody,
  totalRecords,
  page,
  // perPage,
  pagination,
  handleChangePage,
  applySorting,
  classNamePagination,
  classNameTable,
  align,
  selectionText,
  rowsPerPageOptions,
  onChangeRowsPerPage,
  rowsPerPage,
  hasTBody,
  tableBodyClass,
}) {
  const [orderState, setOrderState] = useState(order);
  const classes = useStyles();

  /**
   * Handle column sorting.
   *
   * @param {String} columnId - The ID of the column being sorted.
   */
  const handleSort = (columnId) => {
    const isAsc = orderState.orderBy === columnId && orderState.orderType === 'asc';
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

  return (
    <>
      <TableContainer className={classNames(classes.dataTable, classNameTable)} component={Box}>
        <Table stickyHeader>
          <TableHead>
            {tableHead ? (
              <>{tableHead()}</>
            ) : (
              <>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={align} sortDirection={sortDirection(column)}>
                      {column.sortable ? (
                        <TableSortLabel
                          active={orderState.orderBy === column.id}
                          direction={orderDirection(column)}
                          onClick={() => handleSort(column.id)}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </>
            )}
          </TableHead>
          {hasTBody ? (
            tableBody(data, columns)
          ) : (
            <TableBody className={tableBodyClass}>{tableBody(data, columns)}</TableBody>
          )}
        </Table>
      </TableContainer>
      {pagination && (
        <TablePaginationComp
          {...{
            selectionText,
            rowsPerPageOptions,
            totalRecords,
            page,
            handleChangePage,
            rowsPerPage,
            classNamePagination,
            onChangeRowsPerPage,
          }}
        />
      )}
    </>
  );
}

// Define propTypes for your component
TableComponent.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  tableBody: PropTypes.func.isRequired,
  tableHead: PropTypes.func,
  totalRecords: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  perPage: PropTypes.number,
  pagination: PropTypes.bool.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  applySorting: PropTypes.func.isRequired,
  align: PropTypes.string,
  classNamePagination: PropTypes.string,
  classNameTable: PropTypes.string,
  selectionText: PropTypes.string,
  rowsPerPage: PropTypes.number,
  rowsPerPageOptions: PropTypes.array,
  onChangeRowsPerPage: PropTypes.func,
  hasTBody: PropTypes.bool,
  tableBodyClass: PropTypes.string,
};

// Set default values for optional props
TableComponent.defaultProps = {
  pagination: true,
  align: 'inherit',
  applySorting: () => {},
  classNameTable: '',
  hasTBody: false,
  tableBodyClass: '',
};

export default TableComponent;

export const TablePaginationComp = ({
  selectionText = '',
  rowsPerPageOptions = [],
  rowsPerPage = paginationOptions.perPageRows,
  onChangeRowsPerPage = () => {},
  totalRecords,
  page = 0,
  handleChangePage,
  classNamePagination = '',
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={selectionText ? classes.paginationTableWrapper : ''}>
      <Box className={classes.paginationSelected}>
        <Typography variant="body2" className={classes.selectedText}>
          {selectionText}
        </Typography>
        {/* {selectAll && (
      <Button
        onClick={() => setSelectAllLocationsInDB(!selectAllLocationsInDB)}
        variant="onlyText"
        className={classes.paginationSelectedBtn}
      >
        {!selectAllLocationsInDB
          ? `${t('sales.locations.selectAll')} ${totalRecords} ${t('sales.locations.locations')}`
          : t('sales.locations.clearSelection')}
      </Button>
    )} */}
      </Box>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        SelectProps={{
          MenuProps: { classes: { paper: classes.selectDropdown } },
          IconComponent: ChevronDown,
        }}
        count={totalRecords}
        page={page < 0 ? 0 : page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        className={`${classes.paginationTable} ${classNamePagination}`}
        onRowsPerPageChange={onChangeRowsPerPage}
        labelRowsPerPage={t('commonText.table.rowsPerPage')}
      />
    </Box>
  );
};

// Define propTypes for your component
TablePaginationComp.propTypes = {
  totalRecords: PropTypes.number.isRequired,
  page: PropTypes.number,
  handleChangePage: PropTypes.func.isRequired,
  classNamePagination: PropTypes.string,
  selectionText: PropTypes.string,
  rowsPerPage: PropTypes.number,
  rowsPerPageOptions: PropTypes.array,
  onChangeRowsPerPage: PropTypes.func,
};
