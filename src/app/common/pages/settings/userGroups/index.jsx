import {
  Box,
  Button,
  TableCell,
  TableRow,
  TableSortLabel,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
// import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import SideDrawer from 'src/app/components/common/sideDrawer';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import * as routes from 'src/app/router/constant/ROUTE';
import { ReactComponent as PlusIcon } from 'src/assets/svg/Whiteplus.svg?react';
import useDateTime from 'src/hooks/useDateTime';
import { createUserGroupPost, getUserGroups } from 'src/services/settings.services';
import {
  dayjsFormatsEnum,
  organizationLevelsObject,
  paginationOptions,
  rolesEnumWithName,
  toastSettings,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import ActivityUserGroup from './components/activityUserGroup';
import EditUserGroupModal from './components/editUserGroupModal';
import { useStyles } from './userGroupsStyle';
const perPage = paginationOptions.perPageRows;
const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const UserGroups = () => {
  const classes = useStyles();
  const { formatDayjsDateTime } = useDateTime();
  const emptyQuery = {
    industryType: [],
    createdDate: null,
    lastActivityDate: null,
    cities: [],
    states: [],
    parentCompanyIds: [],
  };
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [totalRows, _setTotalRows] = useState(0);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState(emptyQuery);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [allowEdit, setAllowEdit] = useState(false);
  const authUser = useSelector((data) => data?.auth?.userRole?.slug);
  const [selectedTab, setSelectedTab] = useState(() => {
    return authUser === rolesEnumWithName.franchise_owner.slug
      ? organizationLevelsObject.franchise
      : organizationLevelsObject.HO;
  });
  const closeModal = () => {
    setEditModal(false);
  };

  const [orderState, setOrderState] = useState(order);
  const history = useHistory();
  const addNewGroup = () => {
    history.push(routes.OBX_NEW_USER_GROUP);
  };

  const handleSelection = (event, newSelection) => {
    if (newSelection !== null) {
      setSelectedTab(newSelection);
    }
  };
  const NA = t('commonText.nA');
  const [pagination, setPagination] = useState({ currentPage: 0, totalCount: 0, rowsPerPage: 10 });
  const i18Columns = [
    {
      id: 'name',
      label: t('obx.settings.userGroups.groupName'),
      sortable: false,
    },
    { id: 'userCount', label: t('obx.settings.userGroups.users'), sortable: false },
    { id: 'createdAt', label: t('obx.settings.userGroups.createdOn'), sortable: false },
    { id: 'createdBy', label: t('obx.settings.userGroups.createdBy'), sortable: false },
  ];
  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setEditModal(false);

      const payload = {
        group: {
          privileges: data,
        },
      };

      const response = await createUserGroupPost(payload, selectedGroup?.id);
      const { data: apiData } = response || {};

      if (apiData?.statusCode === 200) {
        toaster.success({
          text: apiData?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
      setEditModal(false);
      getUserPermissions();
      setEditModal(false);
    }
  };
  const onChangeRowsPerPage = async (event) => {
    /**
     * update pagination object
     */
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      rowsPerPage: event.target.value,
    }));
    setPage(pagination.currentPage);

    /**
     * API call to get next page items for location
     */
    const params = {
      page: 1,
      rowsPerPage: event.target.value,
      query: query,
    };
    await fetchCompanies(params);
  };

  const handleChangePage = async (_, newPage) => {
    setPage(newPage);
    const params = {
      page: newPage + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: query,
    };
    await fetchCompanies(params);
  };

  const renderTableCell = (row, column) => {
    /**
     * show 'NA' if there is no value
     */
    if (!row[column.id]) {
      return <Box component="span">{NA}</Box>;
    }

    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    if (column.id === 'createDate' || column.id === 'lastActivityDate')
      return (
        <>{formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date })}</>
      );

    return <>{row[column.id] || NA}</>;
  };

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const disableEditFunc = () => setAllowEdit(false);

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };

  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState.orderType);
  };

  const applySorting = (sortBy, orderBy) => {
    setQuery((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
    const params = {
      page: 1,
      rowsPerPage: pagination.rowsPerPage,
      query: { ...query, sortBy: sortBy, orderBy: orderBy },
    };
    getUserPermissions(params);
  };

  const getUserPermissions = async () => {
    try {
      setLoading(true);

      const data = await getUserGroups({ page: page + 1, query });

      if (data?.statusCode === 200) {
        setData(data?.data);
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };
  const tableHead = () => {
    return (
      <>
        <TableRow>
          {i18Columns.map((column) => (
            <TableCell key={column.id} sortDirection={sortDirection(column)}>
              {column.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column.id)}
                  hideSortIcon={false}
                  sx={{
                    '& .MuiTableSortLabel-icon': {
                      opacity: 0.5, // Default opacity
                      transition: 'opacity 0.3s ease', // Smooth transition
                    },
                    '&.MuiTableSortLabel-active .MuiTableSortLabel-icon': {
                      opacity: 1, // Active state opacity
                    },
                  }}
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

  const tableBody = (data, i18Columns) => {
    return loading ? (
      <TableSkeleton columns={i18Columns} />
    ) : (
      <>
        <NoRecordFound
          data={data}
          noOfColumns={i18Columns.length}
          t={t}
          text={t('sales.companies.noCompanies')}
          description={t('sales.companies.companiesDataSync')}
        />
        {data.length > 0 &&
          data.map((row) => (
            <TableRow
              key={row.id}
              onClick={() => {
                setSelectedGroup(row);
                setEditModal(true);
              }}
            >
              {i18Columns.map((column) =>
                column.id === 'name' ? (
                  <TableCell key={column.id} className={column.className}>
                    {renderTableCell(row, column)}
                  </TableCell>
                ) : (
                  <TableCell className={column.className} key={column.id}>
                    {renderTableCell(row, column)}
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
      </>
    );
  };

  useEffect(() => {
    getUserPermissions();
  }, []);
  return (
    <Box className={classes.mainWrapper}>
      <Box
        className={`${
          authUser === rolesEnumWithName.home_officer.slug
            ? classes.topWrapperHO
            : classes.topWrapper
        }`}
      >
        {authUser === rolesEnumWithName.home_officer.slug && (
          <Box className={classes.buttonsBarWrapper}>
            <ToggleButtonGroup
              value={selectedTab}
              className={classes.statesButtons}
              exclusive
              onChange={handleSelection}
              aria-label="toggle button tabs"
            >
              <ToggleButton
                value={organizationLevelsObject.HO}
                aria-label="tab 1"
                className={classes.firstButton}
                disableRipple
              >
                {t('obx.settings.userGroups.homeOfficeUsers')}
              </ToggleButton>
              <ToggleButton
                value={organizationLevelsObject.franchise}
                aria-label="tab 2"
                className={classes.lastButton}
                disableRipple
              >
                {t('obx.settings.userGroups.franchiseUsers')}
              </ToggleButton>
            </ToggleButtonGroup>
            <Box className={classes.searchBar}>
              <SearchComponentWithQuery placeHolder={`${t('obx.settings.userGroups.search')}`} />
            </Box>
          </Box>
        )}
        <Box className={classes.buttonsBarWrapper}>
          <Button disableRipple variant="secondaryGrey" onClick={() => setShowDrawer(true)}>
            {t('obx.settings.userGroups.viewActivity')}
          </Button>

          <Button disableRipple variant="primary" startIcon={<PlusIcon />} onClick={addNewGroup}>
            {t('obx.settings.userGroups.addNewGroup')}
          </Button>
        </Box>
      </Box>
      <Box className={classes.tableWrapper}>
        <TableComponent
          data={data}
          columns={i18Columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={pagination?.currentPage - 1}
          perPage={pagination?.rowsPerPage || perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={onChangeRowsPerPage}
          rowsPerPage={pagination.rowsPerPage}
        />
      </Box>
      <SideDrawer isOpen={showDrawer} totalWidth={'1144px'}>
        <ActivityUserGroup showDrawer={showDrawer} setShowDrawer={setShowDrawer} />
      </SideDrawer>

      <EditUserGroupModal
        openModal={editModal}
        handleCloseModal={closeModal}
        handleSubmit={handleSubmit}
        data={selectedGroup}
        disabled={!allowEdit}
        setDisabled={disableEditFunc}
        setAllowEdit={() => {
          setAllowEdit(!allowEdit);
        }}
      />
    </Box>
  );
};

export default UserGroups;
