import Pagination from '@mui/material/TablePagination';
import { makeStyles } from '@mui/styles';
import { ReactComponent as ChevronDown } from 'assets/svg/commonDropdown/chevronDown.svg?react';
import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react';
import { useTranslation } from 'react-i18next';

import { paginationOptions } from '../../../../utils/constants';

/**
 * PaginationComponnet is a reusable component for rendering tables with sorting and pagination.
 *
 * @param {Number} totalRecords - The total number of records in the listing.
 * @param {Number} page - The current page being displayed.
 * @param {Number} perPage - The number of records to display per page.
 * @param {Boolean} pagination - Set to true if you want to apply pagination to your table.
 * @param {Function} handleChangePage - A function to react to page change.
 * @param {String} classNamePagination - To add a class to the pagination.
 * @return Component
 */

const useStyles = makeStyles((theme) => ({
  paginationTable: {
    minHeight: '56px',
    '&.MuiTablePagination-root': {
      overflow: 'hidden',
    },
    '& .MuiToolbar-root': {
      '&.MuiTablePagination-toolbar': {
        minHeight: '56px',
        padding: 0,
      },

      '& .MuiTablePagination-selectLabel': {
        color: theme.palette.textSecondary1,
      },

      '& .MuiInputBase-root': {
        '& .MuiSelect-select': {
          color: theme.palette.textSecondary1,
          '&:focus': {
            background: 'transparent',
          },
        },
        '& .MuiSelect-icon': {
          width: '18px',
          height: '18px',
          top: '6px',
          '& path': {
            stroke: theme.palette.textSecondary1,
          },
        },
      },

      '& .MuiTablePagination-displayedRows': {
        color: theme.palette.textSecondary1,
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '20px',
      },

      '& .MuiTablePagination-actions': {
        marginLeft: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',

        '& .MuiButtonBase-root': {
          color: theme.palette.textSecondary1,
          backgroundColor: 'white',
          border: `1px solid ${theme.palette.borderStrong1}`,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          padding: '0',

          '&:hover': {
            color: theme.palette.textPrimary,
            backgroundColor: theme.palette.surfaceGreySubtle,
            border: `1px solid ${theme.palette.borderStrong1}`,
          },

          '&:active': {
            color: theme.palette.textPrimary,
            backgroundColor: theme.palette.surfaceWhite,
            border: `1px solid ${theme.palette.borderStrong1}`,
            boxShadow: `0px 0px 0px 4px #F2F4F7, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
          },

          '&:disabled': {
            color: theme.palette.textDisabled,
            backgroundColor: theme.palette.surfaceWhite,
            border: `1px solid ${theme.palette.borderSubtle2}`,
            '& span': {
              '& svg': {
                '& g': {
                  '& path': {
                    stroke: theme.palette.textDisabled,
                  },
                },
              },
            },
          },
          '@media (hover:none)': {
            backgroundColor: theme.palette.surfaceWhite,
            border: `1px solid ${theme.palette.borderStrong1}`,
          },

          '& .MuiSvgIcon-root': {
            fontSize: '24px',
          },
        },
      },
    },
  },

  selectDropdown: {
    '&.MuiPaper-root': {
      color: theme.palette.textSecondary1,
      backgroundColor: theme.palette.surfaceWhite,
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      boxShadow:
        '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1)',
    },
  },
}));

function PaginationComponent({
  totalRecords,
  page,
  perPage,
  handleChangePage,
  perPageOptions = [],
  onChangeRowsPerPage = () => {},
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <>
      <Pagination
        rowsPerPageOptions={perPageOptions}
        component="div"
        count={totalRecords}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={perPage}
        className={classes.paginationTable}
        onRowsPerPageChange={onChangeRowsPerPage}
        SelectProps={{
          MenuProps: { classes: { paper: classes.selectDropdown } },
          IconComponent: ChevronDown,
        }}
        labelRowsPerPage={t('commonText.table.rowsPerPage')}
      />
    </>
  );
}

// Define propTypes for your component
PaginationComponent.propTypes = {
  totalRecords: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  perPage: PropTypes.number.isRequired,
  pagination: PropTypes.bool.isRequired,
  perPageOptions: PropTypes.array,
  handleChangePage: PropTypes.func.isRequired,
  onChangeRowsPerPage: PropTypes.func,
};

// Set default values for optional props
PaginationComponent.defaultProps = {
  page: 0,
  perPage: paginationOptions.perPageRows,
};

export default PaginationComponent;
