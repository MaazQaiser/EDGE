import {
  Box,
  Button,
  TableCell,
  TableRow,
  TableSortLabel,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { ReactComponent as DownloadCloud } from 'assets/images/downloadcloud.svg?react';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as GraphCollapseIconUpward } from 'assets/svg/collapse-upward-icon.svg?react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ProgressBarWithLabelComponent from 'src/app/components/common/progressBarWithLabel';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { OBX_USER_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import { useLabels } from 'src/hooks/updateObjectLabelsHook';
import useDateTime from 'src/hooks/useDateTime';
import { getUsers } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { dayjsFormatsEnum, paginationOptions, toastSettings } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import TopGraphComponent from '../components/graph';
import { useStyles } from './userListing';

const i18ColumnName = (t, hoverIconClass) => {
  return [
    // { id: 'id', label: 'ID', sortable: true },
    {
      id: 'name', //user name
      label: `${t('obx.users.table.listing.columns.name')}`,
      sortable: true,
      className: hoverIconClass,
    },
    {
      id: 'label', // role or permission assigned to the user
      label: `${t('obx.users.table.listing.columns.userType')}`,
      sortable: true,
    },
    {
      id: 'franchiseCount', //user name
      label: `${t('obx.users.table.listing.columns.franchiseCount')}`,
      sortable: true,
    },
    {
      id: 'overtime', // department of the user
      label: `${t('obx.users.table.listing.columns.overtime')}`,
      sortable: true,
    },
    {
      id: 'email', // email of the user
      label: `${t('obx.users.table.listing.columns.email')}`,
      sortable: true,
    },
    {
      id: 'phone', // account status of the user
      label: `${t('obx.users.table.listing.columns.number')}`,
      sortable: true,
    },
    {
      id: 'joinedDate',
      label: `${t('obx.users.table.listing.columns.joinedDate')}`,
      sortable: true,
    },
  ];
};

const franchiseUserTypeFilter = (t, enabledRoles = {}) => {
  //These roles should be matched and updated along with the user_data's tenanConfiguration's -> permissions -> edge.roles object values
  const allRoles = [
    { value: 'all', label: t('obx.users.filters.franchiseUserType.all') },
    { value: 'supervisor', label: t('obx.users.filters.franchiseUserType.supervisor') },
    { value: 'officer', label: t('obx.users.filters.franchiseUserType.officer') },
    { value: 'director', label: t('obx.users.filters.franchiseUserType.director') },
    { value: 'advancedOfficer', label: t('obx.users.filters.franchiseUserType.advancedOfficer') },
    { value: 'coordinator', label: t('obx.users.filters.franchiseUserType.coordinator') },
    { value: 'franchiseOwner', label: t('obx.users.filters.franchiseUserType.franchiseOwner') },
  ];

  if (!enabledRoles || Object.keys(enabledRoles).length === 0) {
    return allRoles;
  }

  return allRoles.filter((role) => enabledRoles[role.value] === true);
};

const userTypeFilter = (t) => [
  { value: 'all', label: t('obx.users.filters.userType.all') },
  { value: 'dataCleaner', label: t('obx.users.filters.userType.dataCleaner') },
  { value: 'dataEnricher', label: t('obx.users.filters.userType.dataEnricher') },
  { value: 'dataValidator', label: t('obx.users.filters.userType.dataValidator') },
  { value: 'leadsManager', label: t('obx.users.filters.userType.leadsManager') },
  { value: 'hoAgent', label: t('obx.users.filters.userType.hoAgent') },
  { value: 'marketsManager', label: t('obx.users.filters.userType.marketsManager') },
  { value: 'homeOfficerPayroll', label: t('obx.users.filters.userType.homeOfficerPayroll') },
  { value: 'salesPerson', label: t('obx.users.filters.userType.salesPerson') },
  {
    value: 'homeOfficerFulfillment',
    label: t('obx.users.filters.userType.homeOfficerFulfillment'),
  },
  { value: 'salesManager', label: t('obx.users.filters.userType.salesManager') },
  { value: 'homeOfficer', label: t('obx.users.filters.userType.homeOfficer') },
  { value: 'homeOfficerStar', label: t('obx.users.filters.userType.homeOfficerStar') },
  { value: 'homeOfficeMember', label: t('obx.users.filters.userType.homeOfficeMember') },
];

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  userType: {},
};
const order = {
  orderBy: 'id',
  orderType: 'asc',
};
const columnIdsEnum = {
  name: 'name',
  currentDutyProgress: 'currentDutyProgress',
  franchiseCount: 'franchiseCount',
  joinedDate: 'joinedDate',
  overtime: 'overtime',
  userType: 'userType',
};
const checkKeyNames = {
  all: 'all',
};
const ROLE_TYPES = {
  HOME_OFFICER: 'Home',
  FRANCHISE_OFFICER: 'Franchise',
};

const UsersListing = () => {
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const { getNewApiController } = useApiControllers();
  const [queryParams, setQueryParams] = useState(params);
  const [graphCollapse, setGraphCollapse] = useState(false);
  const [selectedTab, setSelectedTab] = useState(ROLE_TYPES.HOME_OFFICER);
  const { formatDayjsDateTime } = useDateTime();

  const hoverIconClass = classes.ZonesTD;
  const columns = i18ColumnName(t, hoverIconClass);
  const franchiseId = useSelector((state) => state.auth.franchiseId);
  const tenantPermissions = useSelector((state) => state?.auth?.tenantPermissions);

  // ✅ Get updated labels dynamically from Redux
  const homeUserRoles = useLabels(userTypeFilter(t), 'tenantConfigs.labels.terms', 'value');
  const franchiseUserRoles = useLabels(
    franchiseUserTypeFilter(t, tenantPermissions?.users?.rolesFilter),
    'tenantConfigs.labels.terms',
    'value',
  );

  useEffect(() => {
    fetchUsers(queryParams);
  }, [queryParams]);

  useEffect(() => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: paginationOptions.defaultPerPage,
        userType: { value: 'all', label: t('obx.users.filters.userType.all') },
      };
    });
  }, [selectedTab]);

  const fetchUsers = async (queryParams) => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      const params = {
        ...queryParams,
        userType:
          extractValuesByKeyFromInput(queryParams.userType, 'value') !== checkKeyNames.all
            ? extractValuesByKeyFromInput(queryParams.userType, 'value')
            : '',
      };

      if (selectedTab === 'Franchise') {
        params.roleable_type = selectedTab;
      }
      const response = await getUsers(params, { signal: apiController.signal });
      if (response && response?.statusCode === 200) {
        setData(response?.data?.users || []);
        const total = response?.data?.pagination?.totalCount;
        setTotalRows(total);
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

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.currentDutyProgress) {
      return (
        <>
          <ProgressBarWithLabelComponent label={true} value={row[column.id]} />
        </>
      );
    }
    if (column.id === columnIdsEnum.joinedDate) {
      return (
        <>
          {formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date }) || NA}
        </>
      );
    }
    if (column.id === columnIdsEnum.name) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{capitalize(row[column.id]) || NA}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.userType) {
      return (
        <>
          {capitalizeFirstLetter(
            row[column?.id] === 'Home Officer' ? 'Home Office Admin' : row[column?.id],
          ) || NA}
        </>
      );
    }

    if (column.id === columnIdsEnum.overtime) {
      const time = row.overtime ? `${row.overtime} Hour` : '';
      return <>{time || NA}</>;
    }

    if (column.id === columnIdsEnum.franchiseCount) {
      return <>{row.franchiseCount || 0}</>;
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
            <TableCell
              className={column.className}
              key={column.id}
              sortDirection={sortDirection(column)}
            >
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
    const { name, value } = event.target;
    updateFormHandler(name, value);
  };

  const gotoDetailPage = (column, rowId) => {
    if (column.id === columnIdsEnum.name) {
      history.push(`${OBX_USER_DETAIL}/${rowId}?tab=${selectedTab}`);
    }
  };
  const handleSelection = (event, newSelection) => {
    if (newSelection !== null) {
      setLoading(true);
      // setData([]);
      // setSelectAll(false);
      // setSelectedItems([]);
      setQueryParams((prev) => ({
        ...prev,
        page: 1,
      }));
      setSelectedTab(newSelection);
    }
  };

  return (
    <>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.vehicleListingContainer}>
        {franchiseId && tenantPermissions?.users?.showUsersGraph && (
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
        )}
        {graphCollapse && tenantPermissions?.users?.showUsersGraph && (
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
            <Box className={classes.userSection}>
              {!franchiseId && (
                <ToggleButtonGroup
                  value={selectedTab}
                  className={classes.statesButtons}
                  exclusive
                  onChange={handleSelection}
                  aria-label="toggle button tabs"
                >
                  <ToggleButton
                    value={ROLE_TYPES.HOME_OFFICER}
                    aria-label="tab 1"
                    className={classes.firstButton}
                  >
                    {t('obx.users.homeofficeusers')}
                  </ToggleButton>
                  <ToggleButton
                    value={ROLE_TYPES.FRANCHISE_OFFICER}
                    aria-label="tab 2"
                    className={classes.centerButton}
                  >
                    {t('obx.users.franchiseusers')}
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
            </Box>
            <SearchComponentWithQuery
              name="search"
              placeHolder={`${t('form.input.textField.search.placeHolder')}`}
              value={queryParams?.search}
              onSearch={inputChangedHandler}
            />
            <div className="dropdowncommonsction">
              {!franchiseId ? (
                <CustomDropDown
                  label={t('obx.users.userRoles')}
                  name="userType"
                  options={
                    selectedTab === ROLE_TYPES.HOME_OFFICER
                      ? transformArrayForOptions(homeUserRoles, 'label', 'value')
                      : transformArrayForOptions(franchiseUserRoles, 'label', 'value')
                  }
                  selectedValues={queryParams.userType}
                  handleChange={inputChangedHandler}
                  multiSelect={false}
                  checkmark={false}
                  searchable={false}
                  withTiles={false}
                />
              ) : (
                <CustomDropDown
                  label={'User Roles'}
                  name="userType"
                  options={transformArrayForOptions(franchiseUserRoles, 'label', 'value')}
                  selectedValues={queryParams.userType}
                  handleChange={inputChangedHandler}
                  multiSelect={false}
                  checkmark={false}
                  searchable={false}
                  withTiles={false}
                />
              )}
            </div>
          </Box>
          <Box className={classes.userSection}>
            <Button
              variant="secondaryGrey"
              disabled
              className={classes.exportBtn}
              startIcon={<DownloadCloud />}
            >
              <Box component="span" className={classes.filterBtn}>{`${t('links.export')}`}</Box>
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
    </>
  );
};

export default UsersListing;
