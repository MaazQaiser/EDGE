import { Avatar, Button, TableCell, TableRow, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderDetailsSkeleton from 'src/app/components/common/skeletonLoader/headerDetailsSkeleton';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { Clossicon } from 'src/assets/svg';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './CallerHistory';
const stubbedData = [
  {
    callerName: 'John Doe',
    callerPhone: '555-0123',
    creationDateTime: '2024-10-29T10:00:00Z',
    dispatcher: 'Dispatcher A',
    site: 'Site 1',
    dispatchType: 'Emergency',
  },
  {
    callerName: 'Jane Smith',
    callerPhone: '555-0456',
    creationDateTime: '2024-10-29T10:30:00Z',
    dispatcher: 'Dispatcher B',
    site: 'Site 2',
    dispatchType: 'Routine',
  },
  {
    callerName: 'Alice Johnson',
    callerPhone: '555-0789',
    creationDateTime: '2024-10-29T11:00:00Z',
    dispatcher: 'Dispatcher A',
    site: 'Site 3',
    dispatchType: 'Non-Emergency',
  },
  {
    callerName: 'Bob Brown',
    callerPhone: '555-1011',
    creationDateTime: '2024-10-29T11:30:00Z',
    dispatcher: 'Dispatcher C',
    site: 'Site 4',
    dispatchType: 'Emergency',
  },
  {
    callerName: 'Charlie Black',
    callerPhone: '555-1213',
    creationDateTime: '2024-10-29T12:00:00Z',
    dispatcher: 'Dispatcher B',
    site: 'Site 5',
    dispatchType: 'Routine',
  },
];
const i18ColumnName = (t, getLabel) => {
  return [
    {
      id: 'callerName',
      label: `${t('obx.dispatch.callerName')}`,
      sortable: false,
    },
    {
      id: 'callerPhone',
      label: `${t('obx.dispatch.callerPhone')}`,
      sortable: false,
    },
    {
      id: 'creationDateTime',
      label: `${t('obx.dispatch.creationDateTime')}`,
      sortable: false,
    },
    {
      id: 'dispatcher',
      label: `${t('obx.dispatch.dispatcher', {
        dispatch: getLabel('terms', 'dispatch', t),
      })}`,
      sortable: false,
    },
    {
      id: 'site',
      label: `${t('obx.dispatch.site')}`,
      sortable: false,
    },
    {
      id: 'dispatchType',
      label: `${t('obx.dispatch.dispatchType', {
        dispatch: getLabel('terms', 'dispatch', t),
      })}`,
      sortable: false,
    },
  ];
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  status: [],
};

const columnIdsEnum = {
  dispatcher: 'dispatcher',
  callerName: 'callerName',
};

export const sitesPaginationEmptyState = {
  currentPage: 0,
  nextPage: 0,
  prevPage: 0,
  totalPages: 0,
  totalCount: 0,
};

function stateToQueryParams(obj) {
  const transformed = {};
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      transformed[key] = obj[key].map((item) => item.value);
    } else if (typeof obj[key] === 'object' && obj[key] !== null && 'value' in obj[key]) {
      transformed[key] = obj[key].value;
    } else {
      transformed[key] = obj[key];
    }
  }
  return transformed;
}
const CallerHistoryDrawer = ({ setShowDrawer }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const closeDrawer = () => {
    setShowDrawer(false);
  };
  const { getLabel } = useTenantLabel();
  const NA = t('commonText.nA');

  const [data, setData] = useState(stubbedData);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState({ ...params });
  const hoverIconClass = classes.ZonesTD;
  const columns = i18ColumnName(t, getLabel, hoverIconClass);
  const [loadingStats, setLoadingStats] = useState(false);
  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const payload = stateToQueryParams(queryParams);
      const response = await getDispatches(payload);
      if (response && response?.statusCode === 200) {
        setData(response?.data?.dispatches || []);
        const total = response?.data?.pagination?.totalCount || 0;
        setTotalRows(total);
      }
      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const fetchDispatchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await getDispatchStats();
      if (response && response?.statusCode === 200) {
        setStats(response?.data?.stats);
      }
      setLoadingStats(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoadingStats(false);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const isClickable = (columnId) => {
    return [columnIdsEnum.id, columnIdsEnum.siteName].includes(columnId);
  };

  useEffect(() => {
    fetchDispatches();
  }, [queryParams]);

  useEffect(() => {
    fetchDispatchStats();
  }, []);

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id}>{column.label}</TableCell>
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
          data.map((row, index) => (
            <TableRow key={row.id}>
              {columns.map((column) => {
                return (
                  <TableCell
                    key={column.id}
                    onClick={() => isClickable(column.id) && gotoDetailPage(column, row.id)}
                    sx={{ cursor: isClickable(column.id) ? 'pointer' : '' }}
                    className={column.className}
                  >
                    {renderTableCell(row, column, index)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
      </>
    );
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.callerName) {
      return (
        <>
          <Box className={classes.avatarColName}>
            <Box className={classes.inlineBox}>
              <Avatar
                className={classes.avatarCol}
                alt={row?.[column?.id]?.name}
                src={row[column?.id].imageUrl || NA}
              />
              {row?.[column?.id]?.name}
            </Box>
          </Box>
        </>
      );
    }
    if (column.id === columnIdsEnum.dispatcher) {
      return (
        <>
          <Box className={classes.avatarColName}>
            <Box className={classes.inlineBox}>
              <Avatar
                className={classes.avatarCol}
                alt={row?.[column?.id]?.name}
                src={row[column?.id].imageUrl || NA}
              />
              {row?.[column?.id]?.name}
            </Box>
          </Box>
        </>
      );
    }
    return <>{row[column.id] || NA}</>;
  };
  return (
    <Box className={classes.activityDrawer}>
      <Box className={classes.drawerHeader}>
        <Typography variant="h2">{t('obx.dispatch.callerHistory')}</Typography>
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
      {loadingStats ? (
        <HeaderDetailsSkeleton />
      ) : (
        <Box className={classes?.drawerInner}>
          <Box className={classes.tableWrapper}>
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
              rowsPerPageOptions={paginationOptions.perPageOptions}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

CallerHistoryDrawer.propTypes = {
  setShowDrawer: PropTypes.func,
};

export default CallerHistoryDrawer;
