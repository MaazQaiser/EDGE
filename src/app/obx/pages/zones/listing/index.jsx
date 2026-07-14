import AddIcon from '@mui/icons-material/Add';
import { Box, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import AvatarGroupImage from 'commonComponents/avatarGroupImage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { ACL_OBX_ZONES_CREATE } from 'src/app/router/constant/OBXMODULE';
// import TableImage from 'src/app/components/common/tableImage';
import { OBX_FRANCHISE_ZONE_CREATE, OBX_ZONES_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { getZones } from 'src/services/zone.service';
import { paginationOptions } from 'src/utils/constants';

import { useStyles } from './zoneListing';

const i18ColumnName = (t, hoverIconClass, getLabel) => {
  return [
    {
      id: 'name',
      label: `${t('obx.zones.table.listing.columns.name')}`,
      sortable: true,
      className: hoverIconClass,
    },
    {
      id: 'supervisors',
      label: `${t('obx.zones.table.listing.columns.supervisors', { supervisor: getLabel('roles', 'supervisor', t) })}`,
      hasImage: true,
    },
    {
      id: 'sites',
      label: `${t('obx.zones.table.listing.columns.sites')}`,
      sortable: false,
    },
    {
      id: 'officers',
      label: `${t('obx.zones.table.listing.columns.officers', { officer: getLabel('roles', 'officer', t) })}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  id: 'id',
  name: 'name',
  supervisors: 'supervisors',
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
};

const Zones = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState(params);
  const hoverIconClass = classes.ZonesTD;
  const { getLabel } = useTenantLabel();
  const columns = i18ColumnName(t, hoverIconClass, getLabel);
  const { getNewApiController } = useApiControllers();

  const fetchZones = async (queryParams) => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      const response = await getZones(queryParams, { signal: apiController.signal });
      if (response && response?.statusCode === 200) {
        setData(response?.data?.zones || []);
        setTotalRows(response?.data?.pagination?.totalCount);
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };
  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.supervisors) {
      return (
        <>
          {row?.supervisors.length ? (
            <Box className={classes.supervisorColumnWrapper}>
              <AvatarGroupImage data={row?.supervisors} />
            </Box>
          ) : (
            NA
          )}
        </>
      );
    }
    if (column.id === columnIdsEnum.name) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{row[column.id] || NA}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
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
                // may be use in future
                // <>
                //   {column?.id === 'sites' || column?.id === 'officers' ? (
                //     <>
                //       {column.label} <Chip label="Stub Data" size="small" color="primary" />
                //     </>
                //   ) : (
                //     column.label
                //   )}
                // </>
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
              const showHandCursor = column.id === columnIdsEnum.name ? 'pointer' : '';
              return (
                <TableCell
                  key={column.id}
                  onClick={() => gotoDetailPage(column, row.id)}
                  sx={{ cursor: showHandCursor }}
                  className={column.className}
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
    if (column.id === columnIdsEnum.name) {
      history.push(`${OBX_ZONES_DETAIL}/${rowId}`);
    }
  };

  useEffect(() => {
    fetchZones(queryParams);
  }, [queryParams]);

  return (
    <Box className={classes.zonesListingContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.searchSection}>
          <SearchComponentWithQuery
            name="search"
            value={queryParams?.search}
            onSearch={inputChangedHandler}
            placeHolder={t('obx.obxZones.searchFilter')}
          />
        </Box>
        <Box className={classes.vehicleSection}>
          {/*<Button variant="secondaryGrey" disabled startIcon={<DownloadCloud />}>*/}
          {/*  <Box component="span" className={classes.filterBtn}>{`${t(*/}
          {/*    'obx.settings.preferences.visitorTypes.export',*/}
          {/*  )}`}</Box>*/}
          {/*</Button>*/}
          <RenderIfHasPermission name={ACL_OBX_ZONES_CREATE}>
            <Link to={OBX_FRANCHISE_ZONE_CREATE} className={classes.addVehicle}>
              <AddIcon className={classes.addIcon} /> {`${t('obx.obxZones.labels.createZone')}`}
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

export default Zones;
