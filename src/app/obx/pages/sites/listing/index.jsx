import { Box, Button, TableCell, TableRow, TableSortLabel, Tooltip } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as GraphCollapseIconUpward } from 'assets/svg/collapse-upward-icon.svg?react';
import AvatarGroupImage from 'commonComponents/avatarGroupImage';
import CustomDropDown from 'commonComponents/customDropDown';
import SearchComponent from 'commonComponents/searchWithQuery';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import TableImage from 'commonComponents/tableImage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getSites } from 'services/sites.services';
import { getZonesListing } from 'services/zone.service';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import ChipComponent from 'src/app/homeOffice/pages/franchise/detail/components/chip';
import TopGraphComponent from 'src/app/obx/pages/sites/listing/component/graph';
import { OBX_SITES_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { DownloadCloud } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';
import { toaster } from 'src/utils/toast';

import { useStyles } from './listing';

const perPage = paginationOptions.perPageRows;

const i18ColumnName = (t, hoverIconClass, getLabel) => {
  return [
    {
      id: 'name',
      label: `${t('obx.sites.table.listing.columns.site')}`,
      sortable: true,
      className: hoverIconClass,
    },
    {
      id: 'customerId',
      label: `${t('obx.sites.table.listing.columns.customerId')}`,
      sortable: true,
    },
    {
      id: 'company',
      label: `${t('obx.sites.table.listing.columns.company')}`,
      sortable: true,
    },
    {
      id: 'zone',
      label: `${t('obx.sites.table.listing.columns.zone')}`,
      sortable: true,
    },
    {
      id: 'supervisors',
      label: `${t('obx.sites.table.listing.columns.supervisors', { supervisor: getLabel('roles', 'supervisor', t) })}`,
      sortable: false,
      hasImage: true,
    },
    // {
    //   id: 'noOfOfficers',
    //   label: `${t('obx.sites.table.listing.columns.officers')}`,
    //   sortable: true,
    //   hasPermission: [rolesEnum.franchiseOwner, rolesEnum.supervisor],
    // },
    {
      id: 'status',
      label: `${t('obx.sites.table.listing.columns.status')}`,
      sortable: true,
    },
    // {
    //   id: 'monthlyRevenue',
    //   label: `${t('obx.sites.table.listing.columns.monthlyRevenue')}`,
    //   sortable: false,
    //   hasPermission: [rolesEnum.franchiseOwner],
    // },
    {
      id: 'client',
      label: `${t('obx.sites.table.listing.columns.clientsName')}`,
      sortable: false,
      hasImage: true,
    },
    {
      id: 'phoneNumber',
      label: `${t('obx.sites.table.listing.columns.clientsPhone')}`,
      sortable: true,
    },
  ];
};

const zonesFilter = (t) => [{ value: 'all', label: t('obx.schedules.filters.zones.label') }];

const sitesFilter = (t) => [
  { value: 'all', label: `${t('obx.sites.filters.sitesType.all')}` },
  { value: 'functional', label: `${t('obx.sites.filters.sitesType.functional')}` },
  { value: 'requiresAttention', label: `${t('obx.sites.filters.sitesType.requiresAttention')}` },
  { value: 'nonFunctional', label: `${t('obx.sites.filters.sitesType.nonFunctional')}` },
];

const _serviceType = (t) => [
  { value: 'all', label: `${t('obx.sites.filters.serviceType.all')}` },
  { value: 'dedicated', label: `${t('obx.sites.filters.serviceType.dedicated')}` },
  { value: 'patrol', label: `${t('obx.sites.filters.serviceType.patrol')}` },
  { value: 'hybrid', label: `${t('obx.sites.filters.serviceType.hybrid')}` },
];

const columnIdsEnum = {
  monthlyRevenue: 'monthlyRevenue',
  customerId: 'customerId',
  supervisors: 'supervisors',
  client: 'client',
  name: 'name',
  status: 'status',
  company: 'company',
};

const params = {
  page: 1,
  perPage: perPage,
  search: '',
  zones: [],
  status: {},
  // siteType: {},
  sortBy: '',
  orderBy: '',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

export default function SitesListing() {
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const classes = useStyles();
  const [queryParams, setQueryParams] = useState(params);
  const _userRole = useSelector((state) => state.auth?.userRole?.slug);
  const [graphCollapse, setGraphCollapse] = useState(false);
  // const [selectedDate, setSelectedDate] = useState([]);
  const { getNewApiController } = useApiControllers();

  const [orderState, setOrderState] = useState(order);

  const hoverIconClass = classes.SitesTD;
  const { getLabel } = useTenantLabel();
  const columns = i18ColumnName(t, hoverIconClass, getLabel);

  const siteTypeFilters = transformArrayForOptions(sitesFilter(t), 'label', 'value');
  // const serviceTypeFilters = transformArrayForOptions(serviceType(t), 'label', 'value');

  const NA = t('commonText.nA');

  const fetchSites = async (params) => {
    const apiController = getNewApiController();
    try {
      setLoading(true);

      const updatedParams = {
        ...params,
        zones: params?.zones.map((a) => a?.value),
        status: params?.status?.value || '',
        // siteType:
        //   extractValuesByKeyFromInput(params.siteType, 'value') !== 'all'
        //     ? extractValuesByKeyFromInput(params.siteType, 'value')
        //     : '',
      };

      const response = await getSites(updatedParams, { signal: apiController.signal });

      if (response?.statusCode === 200) {
        setData(response?.data?.sites);
        setTotalRows(response?.data?.pagination?.totalCount);
      }

      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
      }
    }
  };

  const fetchZones = async () => {
    try {
      const response = await getZonesListing();

      if (response?.statusCode === 200) {
        let data = zonesFilter(t);

        data = [...data, ...transformArrayForOptions(response?.data?.zones, 'name', 'id')];

        setZones(data);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
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

  const handleSiteClick = (column, id) => {
    if (column.id === columnIdsEnum.name) {
      history.push(`${OBX_SITES_DETAIL}/${id}`);
    }
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
              <TableCell
                onClick={() => {
                  handleSiteClick(column, row.id);
                }}
                key={column?.id}
                className={column.className}
              >
                {renderTableCell(row, column)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };

  const renderTableCell = (row, column) => {
    if (column?.id === columnIdsEnum?.supervisors) {
      return (
        <>
          {row?.supervisors?.length ? (
            <div className="tableavatar">
              <AvatarGroupImage data={row?.supervisors} />
            </div>
          ) : (
            NA
          )}
        </>
      );
    }
    if (column.id === columnIdsEnum.name) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>
            {row[column?.id]?.length > 35 ? (
              <>
                <Tooltip title={row[column?.id]} arrow>
                  {truncateString(capitalizeFirstLetter(row[column?.id]), 35) || NA}
                </Tooltip>
              </>
            ) : (
              <>{capitalizeFirstLetter(row[column?.id]) || NA}</>
            )}
          </Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum?.company) {
      return <>{capitalizeFirstLetter(row[column.id])}</>;
    }

    if (column.id === columnIdsEnum?.customerId) {
      return <>{row[column.id] || NA}</>;
    }

    if (column?.id === columnIdsEnum?.client) {
      return (
        <>
          {row?.client?.name ? (
            <Box className="tableavatar">
              <TableImage
                imageUrl={row?.client?.imageUrl}
                alt={`${t('commonText.image.alt', {
                  name: `${row?.client?.name}`,
                })}`}
              />
              {capitalize(row?.client?.name)}
            </Box>
          ) : (
            NA
          )}
        </>
      );
    }

    // if (column?.id === columnIdsEnum?.monthlyRevenue) {
    //   return <>{numberToCurrencyFormat(row[column.id]) || NA}</>;
    // }

    if (column?.id === columnIdsEnum.status) {
      return <ChipComponent status={row[column.id]} isSite={true} />;
    }

    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  useEffect(() => {
    fetchSites(queryParams);
  }, [queryParams]);

  useEffect(() => {
    fetchZones();
  }, []);

  return (
    <Box className={classes.sitesListingContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={!graphCollapse ? classes.mainWrapper : classes.graphHide}>
        <TopGraphComponent />
        {!graphCollapse && (
          <Button
            variant="secondaryGrey"
            onClick={() => setGraphCollapse(true)}
            className={classes.graphCollapseBtn}
          >
            <Box>
              <GraphCollapseIconUpward />
            </Box>
          </Button>
        )}
      </Box>
      {graphCollapse && (
        <Button
          variant="secondaryGrey"
          onClick={() => setGraphCollapse(false)}
          className={classes.graphExpandBtn}
        >
          <Box>
            <GraphCollapseIconUpward />
          </Box>
        </Button>
      )}
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.searchSection}>
          <SearchComponent
            name="search"
            value={queryParams?.search}
            onSearch={inputChangedHandler}
            placeHolder={t('obx.sites.searchFilter')}
          />
          <Box>
            <CustomDropDown
              label={t('obx.schedules.filters.zones.all')}
              name="zones"
              options={zones}
              selectedValues={queryParams?.zones}
              handleChange={inputChangedHandler}
              multiSelect={true}
              checkmark={true}
              clearAll
            />
          </Box>
          {/* <Box className={classes.sitesRangePicker}>
            <DateRangePicker selectedDates={selectedDate} setDates={setSelectedDate} />
          </Box> */}
          <Box>
            <CustomDropDown
              label={t('obx.schedules.filters.sites.all')}
              name="status"
              options={siteTypeFilters}
              selectedValues={queryParams?.status}
              handleChange={inputChangedHandler}
              searchPlaceholder="Example Check."
            />
          </Box>
          {/*<Box>*/}
          {/*  <CustomDropDown*/}
          {/*    label={`${t('obx.sites.filters.serviceType.all')}`}*/}
          {/*    name="siteType"*/}
          {/*    options={serviceTypeFilters}*/}
          {/*    selectedValues={queryParams?.siteType}*/}
          {/*    handleChange={inputChangedHandler}*/}
          {/*  />*/}
          {/*</Box>*/}
        </Box>
        <Box className={classes.rightButtons}>
          <Button variant="secondaryGrey" startIcon={<DownloadCloud />} disabled>
            {`${t('links.export')}`}
          </Button>
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
}
