import { Box, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchComponent from 'src/app/components/common/search';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import { DownloadCloudIcon } from 'src/assets/svg';

import { useStyles } from '../dealsStyles';

const i18ColumnName = (t) => {
  return [
    {
      id: 'owner',
      label: `${t('obx.settings.preferences.mappingPreferences.deals.table.columnsHeader.pipeline')}`,
      sortable: true,
    },
    {
      id: 'monthlyRevenue',
      label: `${t('obx.settings.preferences.mappingPreferences.deals.table.columnsHeader.noOfStages')}`,
      sortable: false,
    },
    {
      id: 'noOfCustomer',
      label: `${t('obx.settings.preferences.mappingPreferences.deals.table.columnsHeader.assignedStages')}`,
      sortable: false,
    },
    {
      id: 'status',
      label: `${t('obx.settings.preferences.mappingPreferences.deals.table.columnsHeader.unassignedStages')}`,
      sortable: false,
    },
  ];
};

const bodyData = [];

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const Deals = () => {
  const { t } = useTranslation();

  const classes = useStyles();
  const columns = i18ColumnName(t);
  const [orderState, setOrderState] = useState(order);
  const [loading, _setLoading] = useState(false);
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
  const tableHead = (columns) => {
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
    return loading === true ? (
      <TableSkeleton numberOfRows={10} columns={columns} />
    ) : (
      <>
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => {
              return <TableCell key={column.id}>{row[column.id]} </TableCell>;
            })}
          </TableRow>
        ))}
      </>
    );
  };
  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };

  return (
    <>
      <Box className={classes.header}>
        <Typography variant="h4" className={classes.title}>
          {t('obx.settings.preferences.mappingPreferences.deals.settingTitle')}
        </Typography>
        <Typography variant="body2" className={classes.tagline}>
          {t('obx.settings.preferences.mappingPreferences.deals.tagLine')}
        </Typography>
      </Box>
      <Box className={classes.searchSection}>
        <SearchComponent name="search" placeholder="Search Pipleline" />
        <Button variant="secondaryGrey" startIcon={<DownloadCloudIcon />} disabled>
          {t('obx.settings.preferences.visitorTypes.export')}
        </Button>
      </Box>

      <TableComponent
        // data={data}
        columns={columns}
        tableHead={() => tableHead(columns)}
        tableBody={() => tableBody(bodyData, columns)}
        pagination={true}
        // page={page}
        // perPage={perPage}
        // totalRecords={totalRows}
        // handleChangePage={handleChangePage}
        applySorting={applySorting}
      />
    </>
  );
};

export default Deals;
