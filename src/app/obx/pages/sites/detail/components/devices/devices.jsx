import { Box, TableCell, TableRow, TableSortLabel } from '@mui/material';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import TableComponent from 'commonComponents/table';
import TableImage from 'commonComponents/tableImage';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import useDateTime from 'src/hooks/useDateTime';
import { getSiteDevices } from 'src/services/sites.services';
import { dayjsFormatsEnum, paginationOptions, toastSettings } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { useStyles } from './devicesStyles';

const i18ColumnName = (t) => {
  return [
    {
      id: 'id',
      label: `${t('obx.devices.tables.listing.columns.id')}`,
      sortable: true,
    },
    {
      id: 'name',
      label: `${t('obx.devices.tables.listing.columns.name')}`,
      sortable: true,
    },
    {
      id: 'type',
      label: `${t('obx.devices.tables.listing.columns.type')}`,
      sortable: false,
      hasImage: true,
    },
    {
      id: 'installationDate',
      label: `${t('obx.devices.tables.listing.columns.installationDate')}`,
      sortable: false,
    },
    {
      id: 'lastScanned',
      label: `${t('obx.devices.tables.listing.columns.lastScannedOn')}`,
      sortable: false,
    },
    {
      id: 'lastScannedBy',
      label: `${t('obx.devices.tables.listing.columns.lastScannedBy')}`,
      sortable: false,
    },
    {
      id: 'siteLocation',
      label: `${t('obx.devices.tables.listing.columns.site')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  installationDate: 'installationDate',
  serviceDate: 'serviceDate',
  lastScanned: 'lastScanned',
  lastScannedBy: 'lastScannedBy',
  datesArr: ['installationDate', 'serviceDate', 'lastScanned'],
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

const Devices = ({ id }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const { formatDayjsDateTime } = useDateTime();
  const [queryParams, setQueryParams] = useState(params);

  const [orderState, setOrderState] = useState(order);

  const NA = t('commonText.nA');

  const columns = i18ColumnName(t);

  const fetchDevices = async (params) => {
    try {
      setLoading(true);
      const response = await getSiteDevices(id, params);

      if (response?.statusCode === 200) {
        setData(response?.data?.devices);
        setTotalRows(response?.data?.pagination?.totalCount);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
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

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
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
  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };

  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState?.orderType);
  };
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
        {data?.map((row) => (
          <TableRow key={row?.id}>
            {columns?.map((column) => (
              <TableCell key={column?.id}>{renderTableCell(row, column)}</TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };

  const renderTableCell = (row, column) => {
    if (column?.id === columnIdsEnum?.id) {
      return <>{row[column?.id] || NA}</>;
    }

    if (column?.id === columnIdsEnum?.name) {
      return <>{row[column?.id] || NA}</>;
    }

    if (column?.id === columnIdsEnum?.type) {
      return (
        <>
          {row?.type?.name ? (
            <div className="tableavatar">
              <TableImage
                imageUrl={row?.type?.imageUrl}
                alt={`${t('commonText.image.alt', {
                  name: `${row?.type?.name}`,
                })}`}
              />
              {row?.type?.name}
            </div>
          ) : (
            'NA'
          )}
        </>
      );
    }

    if (columnIdsEnum.datesArr.includes(column.id)) {
      return (
        <>
          {formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date }) || NA}
        </>
      );
    }

    if (columnIdsEnum.lastScannedBy === column.id) {
      return <>{capitalizeFirstLetter(row[column.id]) || NA}</>;
    }

    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  useEffect(() => {
    if (id) fetchDevices(queryParams);
  }, [id, queryParams]);

  return (
    <Box className={classes.devicesWrapper}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <div className={classes.searchSectionDashboard}>
        <div className={classes.searchSection}>
          <SearchComponentWithQuery
            name="search"
            placeHolder={`${t('form.input.textField.search.placeHolder')}`}
            value={queryParams?.search}
            onSearch={inputChangedHandler}
          />
        </div>
      </div>
      <Box className={classes.tableWrapper}>
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
      </Box>
    </Box>
  );
};

Devices.propTypes = {
  id: PropTypes.number,
};

export default Devices;
