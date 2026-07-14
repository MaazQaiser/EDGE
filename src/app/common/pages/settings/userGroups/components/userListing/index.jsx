import { Box, Button, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import PopoverButton from 'src/app/components/common/popoverButton';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import TableImage from 'src/app/components/common/tableImage';
import { DeleteIcon } from 'src/assets/svg';
import { MoreVert } from 'src/assets/svg';
import { ReactComponent as TrashIcon } from 'src/assets/svg/trash.svg?react';
import { ReactComponent as PlusIcon } from 'src/assets/svg/Whiteplus.svg?react';
import useDateTime from 'src/hooks/useDateTime';
import { createUserGroupPost, getUsersOfGroups } from 'src/services/settings.services';
import {
  defaultImage,
  paginationOptions,
  rolesEnumWithName,
  toastSettings,
} from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import AddUserModal from '../addUserModal';
import { useStyles } from './userListingStyle';
const perPage = paginationOptions.perPageRows;
const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const UserListing = ({ groupData = {}, userData, refetch }) => {
  const classes = useStyles();
  const { formatDayjsDateTime } = useDateTime();
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const emptyQuery = {
    industryType: [],
    createdDate: null,
    lastActivityDate: null,
    cities: [],
    states: [],
    parentCompanyIds: [],
  };
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState(emptyQuery);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const authUser = useSelector((data) => data?.auth?.userRole?.slug);
  const [handleSearch, setHandleSearch] = useState('');
  const [orderState, setOrderState] = useState(order);
  const NA = t('commonText.nA');
  const [pagination, setPagination] = useState({ currentPage: 0, totalCount: 0, rowsPerPage: 10 });
  const i18Columns = [
    {
      id: 'name',
      label: t('obx.settings.userGroups.name'),
      sortable: false,
      className: classes.companyNameTD,
    },
    { id: 'role', label: t('obx.settings.userGroups.role'), sortable: false },
    { id: 'franchise', label: t('obx.settings.rolesPermissions.franchises'), sortable: false },
    { id: 'addedOn', label: t('obx.settings.userGroups.addedOn'), sortable: false },
    { id: 'action', label: t('obx.settings.userGroups.action'), sortable: false },
  ];

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
    await getUserGroups(params);
  };

  const handleSearchInput = (e) => {
    console.log(e.target.value);
    setHandleSearch(e.target.value);
  };
  const getUserGroups = async (input) => {
    try {
      setLoading(true);
      setAddUserModalOpen(false);
      const response = await getUsersOfGroups(input);
      setData(response?.data?.users);
      setTotalRows(response?.pagination?.totalCount);
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
  const handleChangePage = async (_, newPage) => {
    setPage(newPage);
    const params = {
      page: newPage + 1,
      rowsPerPage: pagination.rowsPerPage,
      query: query,
    };
    await getUserGroups(params);
  };

  const renderTableCell = (row, column) => {
    /**
     * show 'NA' if there is no value
     */

    if (column.id === 'role') {
      return <Box component="span">{[row[column.id]]}</Box>;
    }
    if (column.id === 'ownerName') {
      return (
        // <Box>
        //   <Box component="span" className="name-words">
        //     {getNameInitials(row[column.id]) || NA}
        //   </Box>
        //   {row[column.id]}
        // </Box>
        <Box className={classes.assignToClass}>
          <TableImage className={classes.assignAvatar} imageUrl={row.image || defaultImage} />
          <Box component="span" className={classes.assignToText}>
            {row[column.id]}
          </Box>
        </Box>
      );
    }

    if (column.id === 'name') {
      return (
        <Box className={classes.companyName}>
          <Box className={classes.companyNameText}>
            {capitalizeFirstLetter(row[column.id]) || NA}
          </Box>
        </Box>
      );
    }
    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    if (column.id === 'parentCompany' || column.id === 'industry') {
      return <>{capitalizeFirstLetter(row[column.id]) || NA}</>;
    }

    if (column.id === 'action') {
      return (
        <PopoverButton className={classes.questionBankActions} variant="icon" Icon={MoreVert}>
          <Box
            className={classes.questionBankActionsMenu}
            // onClick={() => hanldeAction(row, 'closeDispatch')}
          >
            <Box
              className={classes.questionBankActionsDelete}
              onClick={() => setShowDeleteModal(row)}
            >
              <DeleteIcon className={classes.questionBankActionsIconDelete} />
              <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
                Remove User
              </Typography>
            </Box>
          </Box>
        </PopoverButton>
      );
    }

    if (column.id === 'addedOn' || column.id === 'lastActivityDate')
      return (
        <>{formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date })}</>
      );
    if (column.id === 'action') {
      return <Box className={classes.actionWrapper}></Box>;
    }

    return <>{row[column.id] || NA}</>;
  };

  const _gotoCompanyDetail = (column, rowId) => {
    if (column.id === 'name') {
      history.push(`${SALES_COMPANY}/${rowId}`);
    }
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
    getUserGroups(params);
  };
  console.log({ showDeleteModal });
  const handleDeleteUser = async (_userId) => {
    try {
      setLoading(true);
      const payload = {
        group: {
          user_groups_attributes: [
            {
              id: showDeleteModal?.userGroupId,
              _destroy: true,
            },
          ],
        },
      };

      const response = await createUserGroupPost(payload, groupData?.id);
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
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setShowDeleteModal(false);
      refetch();
    }
  };
  const finalColumns =
    authUser === rolesEnumWithName.home_officer.slug
      ? i18Columns
      : i18Columns.filter((col) => col.id !== 'franchise');
  const tableHead = () => {
    return (
      <>
        <TableRow>
          {finalColumns.map((column) => (
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
        <NoRecordFound data={data} noOfColumns={i18Columns.length} t={t} />
        {data.length > 0 &&
          data.map((row) => (
            <TableRow key={row.id}>
              {i18Columns.map((column) => {
                if (column.id === 'name') {
                  return (
                    <TableCell
                      // onClick={() => gotoCompanyDetail(column, row.id)}
                      key={column.id}
                      className={column.className}
                    >
                      {renderTableCell(row, column)}
                    </TableCell>
                  );
                }
                return (
                  <TableCell className={column.className} key={column.id}>
                    {renderTableCell(row, column)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
      </>
    );
  };

  useEffect(() => {
    setData(userData ? userData : []);
  }, []);

  const filteredData = handleSearch
    ? data.filter((item) => {
        item?.name?.toLowerCase().includes(handleSearch.trim().toLowerCase());
      })
    : data;
  return (
    <Box className={classes.mainWrapper}>
      <Box className={classes.buttonsBarWrapper}>
        <Box className={classes.searchBar}>
          <SearchComponentWithQuery
            onSearch={handleSearchInput}
            placeHolder={`${t('obx.settings.userGroups.searchbyUser')}`}
          />
        </Box>
        <Button
          disableRipple
          variant="primary"
          startIcon={<PlusIcon />}
          onClick={() => setAddUserModalOpen(true)}
        >
          {t('obx.settings.userGroups.addUser')}
        </Button>
        <AddUserModal
          openModal={addUserModalOpen}
          handleCloseModal={() => setAddUserModalOpen(false)}
          refetch={refetch}
          data={groupData}
        />
      </Box>
      <Box className={`${classes.tableWrapper} userListingTable`}>
        <TableComponent
          data={filteredData}
          columns={finalColumns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={page}
          perPage={pagination?.rowsPerPage || perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={onChangeRowsPerPage}
          rowsPerPage={pagination.rowsPerPage}
        />
      </Box>
      <SweetAlertModal
        type="warning"
        title={t('obx.settings.userGroups.removeUser')}
        text={t('obx.settings.userGroups.removeUserText')}
        confirmButtonText={t('obx.settings.userGroups.removeUser')}
        cancelButtonText={t('obx.settings.userGroups.cancel')}
        show={!!showDeleteModal}
        handleConfirmButton={handleDeleteUser}
        handleCancelButton={() => setShowDeleteModal(false)}
        reverseButtons={true}
        icon={<TrashIcon />}
      />
    </Box>
  );
};

UserListing.propTypes = {
  groupData: PropTypes.object,
  userData: PropTypes.array,
  refetch: PropTypes.func,
};

export default UserListing;
