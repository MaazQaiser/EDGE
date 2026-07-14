import { Button, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { MoreVert } from 'assets/svg';
import { PlusIcon } from 'assets/svg';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as Dustbin } from 'assets/svg/DeleteIconBin.svg?react';
import { ReactComponent as EditGroupIcon } from 'assets/svg/EditGroupIcon.svg?react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton/index.jsx';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery';
import SideDrawer from 'src/app/components/common/sideDrawer';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton.jsx';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { formatArray } from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as BreakIcon } from 'src/assets/svg/settings-dark.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { getBreakRules } from 'src/services/breakRules.service';
import { dayjsFormatsEnum, paginationOptions, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import AddBreakType from './addBreakType';
import { useStyles } from './breakRules.styles.js';
import BreakType from './breakType';
import DeleteBreakeRuleModal from './deleteBreakRule';
import ListingModal from './listingModal';

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
      id: 'name',
      label: `${t('obx.settings.preferences.breakRules.ruleName')}`,
      className: hoverIconClass,
    },
    {
      id: 'breakTypes',
      label: `${t('obx.settings.preferences.breakRules.breakTypes')}`,
    },

    {
      id: 'associatedShifts',
      label: `${t('obx.settings.preferences.breakRules.associatedShifts')}`,
    },
    {
      id: 'dateCreated',
      label: `${t('obx.settings.preferences.breakRules.dateCreated')}`,
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
  ruleName: 'ruleName',
  breakTypes: 'breakTypes',
  associatedShifts: 'associatedShifts',
  dateCreated: 'dateCreated',
  actions: 'actions',
};

const BreakRules = () => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState(params);
  const [orderState, setOrderState] = useState(order);
  const classes = useStyles();
  const hoverIconClass = classes.templatesTD;
  const NA = t('commonText.nA');
  const [isLoadingBreakRules, setIsLoadingBreakRules] = useState(false);
  const columns = i18ColumnName(t, hoverIconClass);
  const { formatDayjsDateTime } = useDateTime();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [breakRules, setBreakRules] = useState([]);
  const [selectedBreakRule, setSelectedBreakRule] = useState(null);
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedBreakRule(null);
  };

  const handleDelete = (breakRule) => {
    setSelectedBreakRule(breakRule);
    setOpenDeleteModal(true);
  };

  const [openListingModal, setOpenListingModal] = useState(false);
  const handleCloseListingModal = () => {
    setOpenListingModal(false);
    setSelectedBreakRule(null);
  };
  const handleClose = (breakRule) => {
    setOpenListingModal(true);
    setSelectedBreakRule(breakRule);
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
                onClick={() => handlePreview(row)}
              >
                <EditGroupIcon className={classes.questionBankActionsIconRegular} />
                <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
                  {t('obx.settings.preferences.breakRules.editType')}
                </Typography>
              </Box>
              <Box className={classes.questionBankActionsDelete} onClick={() => handleDelete(row)}>
                <Dustbin className={classes.questionBankActionsIconDelete} />
                <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
                  {t('obx.settings.preferences.breakRules.deleteType')}
                </Typography>
              </Box>
            </Box>
          </PopoverButton>
        </>
      );
    }

    if (column.id === columnIdsEnum.ruleName) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{row[column.id] || NA}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.breakTypes) {
      return <>{formatArray(row?.breakTypeNames) || NA}</>;
    }

    if (column.id === columnIdsEnum.dateCreated) {
      return (
        <>{formatDayjsDateTime({ value: row?.createdAt, formatType: dayjsFormatsEnum.date })} </>
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
    return isLoadingBreakRules ? (
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
                  onClick={() => column.id === 'name' && handleClose(row)}
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

  const handlePreview = (breakRule) => {
    setOpenAddBreakType(true);
    setSelectedBreakRule(breakRule);
  };

  const [openAddBreakType, setOpenAddBreakType] = useState(false);
  const [openBreakType, setOpenBreakType] = useState(false);

  const handleCloseAddBreakType = () => {
    setOpenAddBreakType(false);
    setSelectedBreakRule(null);
  };

  const handleCloseBreakType = () => {
    setOpenBreakType(false);
  };

  const fetchBreakRules = async () => {
    setIsLoadingBreakRules(true);
    try {
      const response = await getBreakRules(queryParams);
      if (response && response?.statusCode === 200) {
        setBreakRules(response?.data?.breakRules);
        setTotalRows(response?.data?.pagination?.totalCount);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoadingBreakRules(false);
    }
  };

  useEffect(() => {
    fetchBreakRules();
  }, [queryParams]);

  const onSearch = (event) => {
    const { name, value } = event.target;
    setQueryParams((prev) => ({
      ...prev,
      [name]: value,
      page: paginationOptions.defaultPerPage,
    }));
  };

  return (
    <>
      <Box className={classes.sitesListingCommonContainer}>
        <Box className={classes.mainBoxWrapperAvailbiltity}>
          <Box className={classes.tableWrapper}>
            <Box className={classes.headerTitlle}>
              <Typography variant="h4" className={classes.zoneCustomText} gutterBottom>
                {t('obx.breakRules.headings.main')}
              </Typography>
              <Typography variant="body2" className={classes.zoneDetailText}>
                {t('obx.breakRules.headings.desc', {
                  runsheets: getLabel('terms', 'runsheets', t).toLowerCase(),
                })}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.buttonsBarWrapper}>
            <Box className={classes.searchBar}>
              <SearchComponentWithQuery
                placeHolder={t('obx.breakRules.searchPlaceholder')}
                onSearch={onSearch}
                name="name"
              />
            </Box>
            <Box className={classes.buttonsBar}>
              <Button
                disableRipple
                variant="secondaryGrey"
                startIcon={<BreakIcon />}
                onClick={() => setOpenBreakType(true)}
              >
                {t('obx.settings.preferences.breakRules.breakTypes')}
              </Button>

              <Button
                disableRipple
                variant="primary"
                startIcon={<PlusIcon />}
                onClick={() => setOpenAddBreakType(true)}
              >
                {t('obx.settings.preferences.breakRules.addBreakRule')}
              </Button>
              {openAddBreakType && (
                <SideDrawer
                  isOpen={openAddBreakType}
                  closeDrawer={handleCloseAddBreakType}
                  totalWidth={'600px'}
                >
                  <AddBreakType
                    handleClose={handleCloseAddBreakType}
                    selectedBreakRule={selectedBreakRule}
                    refreshBreakRules={fetchBreakRules}
                    handleCloseAddBreakType={handleCloseAddBreakType}
                  />
                </SideDrawer>
              )}
              {openBreakType && (
                <SideDrawer
                  isOpen={openBreakType}
                  closeDrawer={handleCloseBreakType}
                  totalWidth={'480px'}
                >
                  <BreakType handleCloseDrawer={handleCloseBreakType} />
                </SideDrawer>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <TableComponent
        data={breakRules || []}
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
      {openDeleteModal && (
        <DeleteBreakeRuleModal
          openModal={openDeleteModal}
          handleCloseModal={handleCloseDeleteModal}
          selectedBreakRule={selectedBreakRule}
          refreshBreakRules={fetchBreakRules}
        />
      )}
      {openListingModal && (
        <ListingModal
          openModal={openListingModal}
          handleCloseModal={handleCloseListingModal}
          handlePreview={handlePreview}
          selectedBreakRule={selectedBreakRule}
          refreshBreakRules={fetchBreakRules}
        />
      )}
    </>
  );
};

export default BreakRules;
