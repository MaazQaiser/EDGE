import { Button, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { MoreVert } from 'assets/svg';
import { PlusIcon } from 'assets/svg';
// import { ReactComponent as TrashIcon } from 'assets/icons/TrashBorderIcon.svg';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as EditGroupIcon } from 'assets/svg/EditGroupIcon.svg?react';
import { ReactComponent as MinusCircle } from 'assets/svg/MinusCircle.svg?react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton/index.jsx';
import SearchComponent from 'src/app/components/common/search/index.jsx';
import SideDrawer from 'src/app/components/common/sideDrawer/index.jsx';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton.jsx';
// import LoaderComponent from 'src/app/components/common/loader';
// import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import useDateTime from 'src/hooks/useDateTime';
import { getHolidayGroups } from 'src/services/holidays.service.js';
import { dayjsFormatsEnum, paginationOptions, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast/index.jsx';

import HolidayGroup from './components/addHolidayGroup/index.jsx';
import DeleteHolidayModal from './components/deleteHolidayGroup/index.jsx';
import HolidayDetails from './components/holidaysDetails/index.jsx';
import { useStyles } from './HolidayGroups.styles.js';

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  name: '',
  sortBy: '',
  orderBy: '',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'groupName',
      label: `${t('obx.settings.preferences.holidayGroups.groupName')}`,
      className: hoverIconClass,
    },
    {
      id: 'numberOfHolidays',
      label: `${t('obx.settings.preferences.holidayGroups.numberOfHolidays')}`,
    },
    {
      id: 'createdBy',
      label: `${t('obx.settings.preferences.holidayGroups.createdBy')}`,
    },
    {
      id: 'createdOn',
      label: `${t('obx.settings.preferences.holidayGroups.createdOn')}`,
    },
    {
      id: 'actions',
      label: '',
      sortable: false,
      align: 'right',
    },
  ];
};

const columnIdsEnum = {
  groupName: 'groupName',
  createdBy: 'createdBy',
  createdOn: 'createdOn',
  actions: 'actions',
};

const HolidayGroups = () => {
  const { t } = useTranslation();

  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [holidayGroups, setHolidayGroups] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [showHolidayGroupDetails, setShowHolidayGroupDetails] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState(params);
  const [orderState, setOrderState] = useState(order);
  const classes = useStyles();
  const hoverIconClass = classes.templatesTD;
  const NA = t('commonText.nA');
  const [openHolidayGroupModal, setOpenHolidayGroupModal] = useState(false);
  const { formatDayjsDateTime } = useDateTime();
  const columns = i18ColumnName(t, hoverIconClass);

  const goToHolidayGroup = (holiday) => {
    setSelectedHoliday(holiday);
    setOpenHolidayGroupModal(true);
  };
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);
  const goToAddNewHolidayGroup = () => setOpenHolidayGroupModal(true);
  const handleCloseDrawer = () => {
    setShowHolidayGroupDetails(false);
    setSelectedHoliday(null);
  };

  const handleDelete = (event, holiday) => {
    event.stopPropagation();
    if (!holiday.id) return;
    setSelectedHoliday(holiday);
    setOpenDeleteModal(true);
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.actions) {
      return (
        <>
          <PopoverButton
            className={classes.questionBankActions}
            variant="icon"
            Icon={MoreVert}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
            <Box className={classes.questionBankActionsMenu}>
              <Box
                className={classes.questionBankActionsRegular}
                onClick={() => row?.id && goToHolidayGroup(row)}
              >
                <EditGroupIcon className={classes.questionBankActionsIconRegular} />
                <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
                  {t('obx.settings.preferences.holidayGroups.editGroup')}
                </Typography>
              </Box>
              <Box
                className={classes.questionBankActionsDelete}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(event, row);
                }}
              >
                <MinusCircle className={classes.questionBankActionsIconDelete} />
                <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
                  {t('obx.settings.preferences.holidayGroups.deleteGroup')}
                </Typography>
              </Box>
            </Box>
          </PopoverButton>
        </>
      );
    }

    if (column.id === columnIdsEnum.groupName) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{row[column.id] || NA}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.createdOn) {
      return (
        <>{formatDayjsDateTime({ value: row?.createdOn, formatType: dayjsFormatsEnum.date })}</>
      );
    }
    return <>{row[column.id] || NA}</>;
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

  /**
   * Handle column sorting.
   *
   * @param {String} columnId - The ID of the column being sorted.
   */
  const handleSort = (columnId) => {
    const isAsc = orderState.orderBy === columnId && orderState.orderType === 'asc';
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

  const handleGroupModalClose = () => {
    setOpenHolidayGroupModal(false);
    setSelectedHoliday(null);
    setShowHolidayGroupDetails(false);
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} align={column.align} sortDirection={sortDirection(column)}>
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
    return loadingHolidays ? (
      <TableSkeleton numberOfRows={10} columns={columns} />
    ) : (
      <>
        {data?.length ? (
          data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  className={column.className}
                  onClick={() => column.id === 'groupName' && handlePreview(row)}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <NoRecordFound data={data} noOfColumns={columns?.length} t={t} />
        )}
      </>
    );
  };

  const handlePreview = (holidayGroup) => {
    setShowHolidayGroupDetails(true);
    setSelectedHoliday(holidayGroup);
  };

  const fetchHolidayGroups = async () => {
    setLoadingHolidays(true);
    try {
      const response = await getHolidayGroups(queryParams);
      if (response && response?.statusCode === 200) {
        setHolidayGroups(response?.data?.holidayGroups);
        setTotalRows(response?.pagination?.totalCount);
        setLoadingHolidays(false);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    fetchHolidayGroups();
  }, [queryParams]);

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      [name]: value,
    }));
  };

  return (
    <>
      <Box className={classes.headerTitlle}>
        <Typography variant="h4" className={classes.zoneCustomText} gutterBottom>
          {t('obx.settings.preferences.holidayGroups.title')}
        </Typography>
        <Typography variant="body2" className={classes.zoneDetailText}>
          {t('obx.settings.preferences.holidayGroups.subTitle')}
        </Typography>
      </Box>
      <Box className={classes.templateHeader}>
        <Box className={classes.templateHeaderLeft}>
          <Box className={classes.headerTitlle}>
            <SearchComponent
              name={'name'}
              placeholder={t('obx.settings.preferences.holidayGroups.searchGroup')}
              onSearch={(e) => handleSearch(e)}
            />
          </Box>
        </Box>
        <Box className={classes.templateHeaderRight}>
          <Button variant="primary" startIcon={<PlusIcon />} onClick={goToAddNewHolidayGroup}>
            {t('obx.settings.preferences.holidayGroups.addNewGroup')}
          </Button>
        </Box>
      </Box>
      <TableComponent
        data={holidayGroups || []}
        tableHead={tableHead}
        columns={columns}
        tableBody={tableBody}
        pagination={true}
        page={queryParams.page - 1}
        totalRecords={totalRows}
        handleChangePage={handleChangePage}
        applySorting={applySorting}
        rowsPerPage={queryParams.perPage}
        rowsPerPageOptions={paginationOptions.perPageOptions}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />

      <SideDrawer
        isOpen={showHolidayGroupDetails}
        closeDrawer={handleCloseDrawer}
        totalWidth={'480px'}
      >
        <HolidayDetails
          setShowDrawer={handleCloseDrawer}
          selectedHoliday={selectedHoliday}
          handleDelete={handleDelete}
          goToHolidayGroup={goToHolidayGroup}
        />
      </SideDrawer>

      {openDeleteModal && (
        <DeleteHolidayModal
          openModal={openDeleteModal}
          handleCloseModal={handleCloseDeleteModal}
          holiday={selectedHoliday}
          refetchHolidays={fetchHolidayGroups}
          handleCloseDrawer={handleCloseDrawer}
        />
      )}

      {openHolidayGroupModal && (
        <HolidayGroup
          open={openHolidayGroupModal}
          onClose={handleGroupModalClose}
          fetchHolidayGroups={fetchHolidayGroups}
          selectedHoliday={selectedHoliday}
          setSelectedHoliday={setSelectedHoliday}
        />
      )}
    </>
  );
};

export default HolidayGroups;
