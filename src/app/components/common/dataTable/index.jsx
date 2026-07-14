import PropTypes from 'prop-types';
import DataTable from 'react-data-table-component';

import { paginationOptions } from '../../../../utils/constants';

export default function CommonDataTable({
  columns, // columns of the table
  data, // data of the table
  keyField = 'id', // key field of the table
  pointerOnHover = true, // whether to show pointer on hover or not
  highlightOnHover = true, // highlight row on hover
  persistTableHead = true, // persist table header on next pages
  fixedheader = true, // keep the header fixed for next page and load the data
  pagination = true, // apply pagination
  paginationServer = true, // apply pagination through server
  progressPending, // loading state
  perPage, // perPage rows
  totalRecords, // no of total records
  handlePageChange, // handle on change page function
  handlePerRowsChange, // handle on change row per page function
}) {
  const paginationComponentOptions = {
    noRowsPerPage: false,
    rowsPerPageText: '',
    paginationRowsPerPageOptions: false,
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        keyField={keyField}
        pointerOnHover={pointerOnHover}
        highlightOnHover={highlightOnHover}
        persistTableHead={persistTableHead} // Show the table head (columns) even when progressPending is true.
        fixedheader={fixedheader} // Show the table head (columns) even when progressPending is true.
        // selectableRows // Whether to show selectable checkboxes
        pagination={pagination} // Enable pagination with defaults
        paginationServer={paginationServer} // Changes the default pagination to work with server side pagination
        progressPending={progressPending} // Disables the table and displays a plain text Loading Indicator
        paginationDefaultPage={paginationOptions.defaultPerPage} // The default page to use when the table initially loads
        paginationPerPage={perPage} // The default rows per page to use when the table initially loads
        paginationRowsPerPageOptions={[]} // Row page dropdown selection options
        paginationTotalRows={totalRecords}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
        // customStyles={customStyles}
        paginationComponentOptions={paginationComponentOptions}
        paginationIconFirstPage={false}
        paginationIconLastPage={false}
        noRowsPerPage={false}
      />
    </>
  );
}

CommonDataTable.propTypes = {
  label: PropTypes.string,
  data: PropTypes.object,
  countryCodes: PropTypes.array,
  updateFormHandler: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  searchable: PropTypes.bool,
  columns: PropTypes.array,
  keyField: PropTypes.string,
  pointerOnHover: PropTypes.bool,
  highlightOnHover: PropTypes.bool,
  persistTableHead: PropTypes.bool,
  fixedheader: PropTypes.bool,
  pagination: PropTypes.bool,
  paginationServer: PropTypes.bool,
  progressPending: PropTypes.bool,
  perPage: PropTypes.number,
  totalRecords: PropTypes.number,
  handlePageChange: PropTypes.func,
  handlePerRowsChange: PropTypes.func,
};
