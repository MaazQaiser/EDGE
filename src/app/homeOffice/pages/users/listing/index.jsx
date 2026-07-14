import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Button, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { ReactComponent as DownloadCloud } from 'assets/images/downloadcloud.svg?react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader';
import PopoverButton from 'src/app/components/common/popoverButton';
import ProgressBarWithLabelComponent from 'src/app/components/common/progressBarWithLabel';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { AddIcon } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { getHomeOfficeUsers } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions } from 'src/utils/constants';

import TopGraphComponent from '../components/graph';
import classes from './index.module.scss';

const i18ColumnName = (t) => {
  return [
    // { id: 'id', label: 'ID', sortable: true },
    {
      id: 'name', //user name
      label: `${t('obx.users.table.listing.columns.name')}`,
      sortable: true,
    },
    {
      id: 'permission', // role or permission assigned to the user
      label: `${t('obx.users.table.listing.columns.permission')}`,
      sortable: false,
    },
    {
      id: 'designation', // designation of the user
      label: `${t('obx.users.table.listing.columns.designation')}`,
      sortable: false,
    },
    {
      id: 'department', // department of the user
      label: `${t('obx.users.table.listing.columns.department')}`,
      sortable: false,
    },
    {
      id: 'phone', // phoneNumber of the user displayed as contact
      label: `${t('obx.users.table.listing.columns.contact')}`,
      sortable: false,
    },
    {
      id: 'email', // email of the user
      label: `${t('obx.users.table.listing.columns.email')}`,
      sortable: false,
    },
    {
      id: 'status', // account status of the user
      label: `${t('obx.users.table.listing.columns.status')}`,
      sortable: false,
    },
    {
      id: 'dob', // date of birth of the user
      label: `${t('obx.users.table.listing.columns.dateOfBirth')}`,
      sortable: false,
    },
    {
      id: 'joinedDate',
      label: `${t('obx.users.table.listing.columns.joinedDate')}`,
      sortable: false,
    },
    {
      id: 'actions',
      label: `${t('ho.templates.listing.columns.actions')}`,
      sortable: false,
    },
  ];
};

const userTypeFilter = (t) => [
  { value: 'all', label: t('obx.users.usersAttendance.dropDownOptionsLabels.allUsers') },
  { value: 'activeUsers', label: 'Active Users' },
  { value: 'suspendedUsers', label: 'Suspended Users' },
  { value: 'invitationSent', label: 'Invitation Send' },
  { value: 'pendingVerification', label: 'Pending Verification' },
];

const userSortByFilter = [
  { value: 'all', label: 'All Users' },
  { value: 'byDesignation', label: 'By Designation' },
  { value: 'byDepartment', label: 'By Department' },
  { value: 'byJoiningDate', label: 'By Joining Date' },
];

const params = {
  page: 1,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  userType: {},
  userSortBy: {},
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  name: 'name',
  currentDutyProgress: 'currentDutyProgress',
  joinedDate: 'joinedDate',
  actions: 'actions',
};

const UsersListing = () => {
  const { t } = useTranslation();

  const NA = t('commonText.nA');
  const { getNewApiController } = useApiControllers();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  const [queryParams, setQueryParams] = useState(params);

  const columns = i18ColumnName(t);

  useEffect(() => {
    fetchUsers(queryParams);
  }, [queryParams]);

  const fetchUsers = async (queryParams) => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      const params = {
        page: queryParams.page,
        perPage: queryParams.perPage,
        search: queryParams.search,
      };
      const response = await getHomeOfficeUsers(params, { signal: apiController.signal });
      if (response && response?.statusCode === 200) {
        setData(response?.data?.users || []);
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

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
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
      return <>{row[column.id] || NA}</>;
    }
    if (column.id === columnIdsEnum.actions) {
      return (
        <>
          <PopoverButton label="icon" variant="icon" style={{}} Icon={MoreVertIcon}>
            <Box style={{}}>
              <Button className={classes.filterBtnSection} disabled>
                <Box component="span" className={classes.filterBtn}>
                  {t('links.suspendAccount')}
                </Box>
              </Button>
            </Box>
            <Box style={{}}>
              <Button className={classes.filterBtnSection} disabled>
                <Box component="span" className={classes.filterBtn}>
                  {t('links.editUserRole')}
                </Box>
              </Button>
            </Box>
            <Box style={{}}>
              <Button className={classes.filterBtnSection} disabled>
                <Box component="span" className={classes.filterBtn}>
                  {t('links.deleteUser')}
                </Box>
              </Button>
            </Box>
          </PopoverButton>
        </>
      );
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
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const tableBody = (data, columns) => {
    return (
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

  const gotoDetailPage = (column, _rowId) => {
    if (column.id === columnIdsEnum.name) {
      // history.push(``); // goto user detail page ? not yet designed
    }
  };
  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.vehicleListingContainer}>
        <TopGraphComponent />

        <Box className={classes.searchSectionDashboard}>
          <Box className={classes.searchSection}>
            <SearchComponentWithQuery
              name="search"
              placeHolder={`${t('form.input.textField.search.placeHolder')}`}
              value={queryParams?.search}
              onSearch={inputChangedHandler}
            />
            <div className="dropdowncommonsction">
              <CustomDropDown
                label={t('obx.users.usersAttendance.dropDownOptionsLabels.allUsers')}
                name="userType"
                options={transformArrayForOptions(userTypeFilter(t), 'label', 'value')}
                selectedValues={queryParams.userType}
                handleChange={inputChangedHandler}
                clearAll
                disabled={true}
              />
            </div>
            <div className="dropdowncommonsction">
              <CustomDropDown
                label={'Sort'}
                name="userSortBy"
                options={transformArrayForOptions(userSortByFilter, 'label', 'value')}
                selectedValues={queryParams.userSortBy}
                handleChange={inputChangedHandler}
                clearAll
                disabled={true}
              />
            </div>
          </Box>
          <Box className={classes.userSection}>
            <Button variant="secondaryGrey" startIcon={<DownloadCloud />} disabled>
              {`${t('links.export')}`}
            </Button>
            <Button variant="primary" startIcon={<AddIcon />} disabled>
              {`${t('links.inviteUser')}`}
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
            perPage={queryParams.perPage}
            totalRecords={totalRows}
            handleChangePage={handleChangePage}
            applySorting={applySorting}
          />
        </Box>
      </Box>
    </>
  );
};

export default UsersListing;
