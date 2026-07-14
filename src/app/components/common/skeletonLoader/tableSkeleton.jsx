import { Box, Skeleton, TableCell, TableRow } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
const useStyles = makeStyles(() => ({
  tableCellTextSkeleton: {
    '&.MuiSkeleton-root': {
      height: 8,
      width: '100%',
    },
  },
  avatarSkeleton: {
    '&.MuiSkeleton-root': {
      height: 32,
      minWidth: 32,
    },
  },
  imageCellSkeleton: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  onlyImageCellSkeleton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

/**
 * @description Pie Chart skeleton loader for all piechart used components
 * @param {String} className => Pass the class to overwrite the styles from parent component
 * @param {number} numberOfRows => You can pass the number, to show the number of rows of the table for skeleton body
 * @returns
 */

function TableSkeleton({ className, columns, numberOfRows }) {
  const classes = useStyles();
  const renderTableCellSkeleton = (column) => {
    if (column?.hasImage) {
      return (
        <Box className={classes.imageCellSkeleton}>
          <Skeleton animation="wave" variant="circular" className={classes.avatarSkeleton} />
          <Skeleton animation="wave" variant="rounded" className={classes.tableCellTextSkeleton} />
        </Box>
      );
    }
    if (column?.hasOnlyImage) {
      return (
        <Box className={classes.onlyImageCellSkeleton}>
          <Skeleton animation="wave" variant="circular" className={classes.avatarSkeleton} />
        </Box>
      );
    }

    return (
      <Box>
        <Skeleton animation="wave" variant="rounded" className={classes.tableCellTextSkeleton} />
      </Box>
    );
  };

  const tableRowSkeletonHTML = (id) => (
    <TableRow className={className} key={id}>
      {columns?.map((column) => (
        <TableCell className={column.className} key={column?.id}>
          {renderTableCellSkeleton(column)}
        </TableCell>
      ))}
    </TableRow>
  );

  const skeletonNumberOfRows = () => {
    const tableRows = [];
    for (let a = 0; a < numberOfRows; a++) {
      tableRows.push(tableRowSkeletonHTML(a));
    }
    return tableRows;
  };

  return <>{skeletonNumberOfRows()}</>;
}

TableSkeleton.defaultProps = {
  numberOfRows: 5,
};

TableSkeleton.propTypes = {
  className: PropTypes.object,
  numberOfRows: PropTypes.number,
  columns: PropTypes.array,
};

export default TableSkeleton;
