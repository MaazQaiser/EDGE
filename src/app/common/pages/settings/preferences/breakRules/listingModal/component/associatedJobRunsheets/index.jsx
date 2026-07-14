import { Button, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { MoreVert } from 'assets/svg';
import { PlusIcon } from 'assets/svg';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as Dustbin } from 'assets/svg/DeleteIconBin.svg?react';
import PropTypes from 'prop-types';
// import { ReactComponent as MinusCircle } from 'assets/svg/MinusCircle.svg';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton/index.jsx';
import SearchComponent from 'src/app/components/common/search/index.jsx';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton.jsx';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { getAssociatedRunsheetsAndDedicatedJobs } from 'src/services/breakRules.service.js';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast/index.jsx';

import AddJobsRunsheetsModal from '../addJobsRunsheetsModal/index.jsx';
import DeleteJobModal from '../deleteJobModal/index.jsx';
import { useStyles } from './AssociatedJobRunsheets.Style.js';

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

const i18ColumnName = (t, hoverIconClass, getLabel) => {
  return [
    {
      id: 'jobsRunsheets',
      label: `${t('obx.settings.preferences.breakRules.jobsRunsheets', {
        runsheets: getLabel('terms', 'runsheets', t)?.toLowerCase(),
      })}`,
      className: hoverIconClass,
    },
    {
      id: 'type',
      label: `${t('obx.settings.preferences.breakRules.type')}`,
    },
    {
      id: 'site',
      label: `${t('obx.settings.preferences.breakRules.site')}`,
    },
    {
      id: 'shiftCount',
      label: `${t('obx.settings.preferences.breakRules.shiftCount')}`,
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
  jobsRunsheets: 'jobsRunsheets',
  type: 'type',
  site: 'site',
  shiftCount: 'shiftCount',
  actions: 'actions',
};

const typeOptions = {
  dedicated: 'dedicated',
  patrol: 'patrol',
};

const AssociatedJobRunsheets = ({ selectedBreakRule }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const [isLoading, setLoading] = useState(true);
  const [removeJobOrRunsheet, setRemoveJobOrRunsheet] = useState(null);
  const [queryParams, setQueryParams] = useState(params);
  const [orderState, setOrderState] = useState(order);
  const classes = useStyles();
  const hoverIconClass = classes.templatesTD;
  const NA = t('commonText.nA');
  const [associatedPatrolAndJobs, setAssociatedPatrolAndJobs] = useState([]);

  const columns = i18ColumnName(t, hoverIconClass, getLabel);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setRemoveJobOrRunsheet(null);
  };
  const handleDelete = (row) => {
    setRemoveJobOrRunsheet(row);
    setOpenDeleteModal(true);
  };

  const [openJobRunsheetModal, setOpenJobRunsheetModal] = useState(false);
  const handleCloseJobRunsheetModal = () => setOpenJobRunsheetModal(false);
  const handleClose = () => {
    setOpenJobRunsheetModal(true);
  };
  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.jobsRunsheets) {
      return <>{row?.type === typeOptions.dedicated ? row?.name || NA : row?.runsheetName || NA}</>;
    }

    if (column.id === columnIdsEnum.type) {
      return <>{row?.type === typeOptions.dedicated ? 'Dedicated' : 'Patrol'}</>;
    }

    if (column.id === columnIdsEnum.site) {
      return <>{row?.type === typeOptions.dedicated ? row?.siteName : '-'}</>;
    }

    if (column.id === columnIdsEnum.shiftCount) {
      return <>{row?.type === typeOptions.dedicated ? row?.shiftCount || NA : '-'}</>;
    }

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
                className={classes.questionBankActionsDelete}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(row);
                }}
              >
                <Dustbin className={classes.questionBankActionsIconDelete} />
                <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
                  {t('obx.settings.preferences.breakRules.removeJob')}
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

    return <>{row[column.id] || NA}</>;
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
    return isLoading ? (
      <TableSkeleton numberOfRows={3} columns={columns} />
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

  const appendTypeInJobsAndRunsheets = (jobs, type) => {
    return jobs?.map((item) => ({ ...item, type })) || [];
  };

  const fetchAssociatedPatrolAndJobs = async () => {
    setLoading(true);
    try {
      const response = await getAssociatedRunsheetsAndDedicatedJobs(selectedBreakRule?.id);
      if (response && response?.statusCode === 200) {
        const dedicatedJobs = appendTypeInJobsAndRunsheets(
          response?.data?.dedicated,
          typeOptions.dedicated,
        );
        const patrolJobs = appendTypeInJobsAndRunsheets(response?.data?.patrol, typeOptions.patrol);

        setAssociatedPatrolAndJobs([...dedicatedJobs, ...patrolJobs]);
        setLoading(false);
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
    fetchAssociatedPatrolAndJobs();
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
    <Box className={classes.associateJobRunsheetModalWrapper}>
      <Box className={classes.templateHeader}>
        <Box className={classes.templateHeaderLeft}>
          <Box className={classes.headerTitlle}>
            <SearchComponent
              name={'name'}
              placeholder={t('obx.settings.preferences.breakRules.search')}
              onSearch={(e) => handleSearch(e)}
            />
          </Box>
        </Box>
        <Box className={classes.templateHeaderRight}>
          <Button variant="primary" startIcon={<PlusIcon />} onClick={handleClose}>
            {t('obx.settings.preferences.breakRules.addJobsRunsheets', {
              runsheets: getLabel('terms', 'runsheets', t)?.toLowerCase(),
            })}
          </Button>
        </Box>
      </Box>
      <Box className={classes.tableWrapper}>
        <TableComponent
          data={associatedPatrolAndJobs || []}
          tableHead={tableHead}
          columns={columns}
          tableBody={tableBody}
          pagination={false}
        />
      </Box>
      {openDeleteModal && (
        <DeleteJobModal
          openModal={openDeleteModal}
          selectedJobOrRunsheet={removeJobOrRunsheet}
          handleCloseModal={handleCloseDeleteModal}
          refetchAssociatedList={fetchAssociatedPatrolAndJobs}
        />
      )}
      {openJobRunsheetModal && (
        <AddJobsRunsheetsModal
          openModal={openJobRunsheetModal}
          handleCloseModal={handleCloseJobRunsheetModal}
          selectedBreakRule={selectedBreakRule}
          fetchAssociatedList={fetchAssociatedPatrolAndJobs}
        />
      )}
    </Box>
  );
};

export default AssociatedJobRunsheets;

AssociatedJobRunsheets.propTypes = {
  selectedBreakRule: PropTypes.object,
};
