import AddIcon from '@mui/icons-material/Add';
import { Avatar, Box, TableCell, TableRow, TableSortLabel } from '@mui/material';
import Button from '@mui/material/Button';
import { ReactComponent as DownloadCloud } from 'assets/images/downloadcloud.svg?react';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import MultipleImageListing from 'commonComponents/multipleImages';
import SearchComponent from 'commonComponents/searchWithQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { ACL_OBX_VEHICLES_CREATE } from 'src/app/router/constant/OBXMODULE';
// import TableImage from 'src/app/components/common/tableImage';
import { OBX_VEHICLE_DETAIL, OBX_VEHICLE_FORM } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import { getVehicles } from 'src/services/vehicles.services';
import { dayjsFormatsEnum, defaultVehicleImage, paginationOptions } from 'src/utils/constants';

import { useStyles } from './vehicleListing';
const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'registrationNumber',
      label: `${t('obx.vehicles.table.listing.columns.registeredNumber')}`,
      sortable: false,
      className: hoverIconClass,
      align: 'left',
    },
    {
      id: 'images',
      hasOnlyImage: true,
      label: `${t('obx.vehicles.table.listing.columns.image')}`,
      align: 'center',
    },
    {
      id: 'makeModelYear',
      label: `${t('obx.vehicles.table.listing.columns.makeModelYear')}`,
      sortable: false,
      align: 'left',
    },
    {
      id: 'lastMaintenance',
      label: `${t('obx.vehicles.table.listing.columns.lastMaintenance')}`,
      sortable: false,
      align: 'left',
    },
  ];
};

const params = {
  page: 1,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  id: 'id',
  registrationNumber: 'registrationNumber',
  lastMaintenance: 'lastMaintenance',
};

const Vehicles = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const { getNewApiController } = useApiControllers();
  const [queryParams, setQueryParams] = useState(params);
  const hoverIconClass = classes.VehiclesTD;
  const columns = i18ColumnName(t, hoverIconClass);
  const { formatDayjsDateTime } = useDateTime();

  useEffect(() => {
    fetchVehicles(queryParams);
  }, [queryParams]);

  const fetchVehicles = async (queryParams) => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      const response = await getVehicles(queryParams, { signal: apiController.signal });
      if (response && response?.statusCode === 200) {
        setData(response?.data?.vehicles);
        const total = response?.data?.pagination?.totalCount;
        setTotalRows(total);
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
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

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.registrationNumber) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{row[column.id] || NA}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }
    if (column.id === 'images') {
      return (
        <Box className={classes.vehiclesCars}>
          {row.images.length > 0 ? (
            <MultipleImageListing images={row?.images} />
          ) : (
            <Avatar
              className={classes.vehicleAvatarDefault}
              src={defaultVehicleImage}
              sx={{
                width: '30px',
                height: '30px',
              }}
            />
          )}
        </Box>
      );
    }
    if (column.id == columnIdsEnum.lastMaintenance) {
      return (
        <>
          <>
            {row[column.id]
              ? formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date })
              : NA}
          </>
        </>
      );
    }

    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
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

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
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
            <TableCell key={column.id} sortDirection={sortDirection(column)} align={column.align}>
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
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => {
              const showHandCursor =
                column.id === columnIdsEnum.registrationNumber ? 'pointer' : '';
              return (
                <TableCell
                  key={column.id}
                  onClick={() => gotoDetailPage(column, row.id)}
                  sx={{ cursor: showHandCursor }}
                  className={column.className}
                  align={column.align}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </>
    );
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

  const gotoDetailPage = (column, rowId) => {
    if (column.id === columnIdsEnum.registrationNumber) {
      history.push(`${OBX_VEHICLE_DETAIL}/${rowId}`);
    }
  };

  return (
    <Box className={classes.vehicleListingContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}

      <Box className={classes.searchSectionDashboard}>
        <SearchComponent
          name="search"
          value={queryParams?.search}
          onSearch={inputChangedHandler}
          placeHolder={t('obx.vehicles.table.placeHolder.search')}
        />

        <Box className={classes.vehicleSection}>
          <Button
            variant="secondaryGrey"
            startIcon={<DownloadCloud />}
            className={classes.filterBtnSection}
            disabled
          >
            {`${t('links.export')}`}
          </Button>

          <RenderIfHasPermission name={ACL_OBX_VEHICLES_CREATE}>
            <Link to={`${OBX_VEHICLE_FORM}`} className={classes.addVehicle}>
              <AddIcon className={classes.addIcon} /> {`${t('buttons.addVehicle')}`}
            </Link>
          </RenderIfHasPermission>
        </Box>
      </Box>

      <Box className={classes.tableWrapper}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          rowsPerPage={queryParams.perPage}
          perPage={queryParams.perPage}
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

export default Vehicles;
