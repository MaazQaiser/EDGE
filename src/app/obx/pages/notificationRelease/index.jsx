import { Avatar, Box, Button, TableCell, TableRow, Typography } from '@mui/material';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';
import SearchComponent from 'src/app/components/common/search';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { getDateRangeWrtFranchiseTimezone } from 'src/app/obx/pages/schedules/helper';
import { EditTermIcon, MoreVert, TrashIcon } from 'src/assets/svg';
import { ReactComponent as DeleteModalIcon } from 'src/assets/svg/delete-modal.svg?react';
import { ReactComponent as SendIcon } from 'src/assets/svg/sentBlue.svg?react';
import { ReactComponent as SentNotificationIcon } from 'src/assets/svg/sentNotificationIcon.svg?react';
import { ReactComponent as PlusIconSvg } from 'src/assets/svg/WhitePlusIcon.svg?react';
import { useApiControllers } from 'src/helper/axios';
import useDateTime from 'src/hooks/useDateTime';
import {
  deleteNotificationById,
  getReleaseNotifications,
  triggerNotificationNow,
} from 'src/services/releaseNotifications.service';
import { dayjsFormatsEnum, paginationOptions, toastSettings } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';
import { toaster } from 'src/utils/toast';

import NotificationStatusChip from './components/NotificationStatusChip';
import CreateNotificationDrawer from './CreateNotificationDrawer';
import NotificationDetailModal from './NotificationDetailModal';
import { useStyles } from './styles';

const NA = 'N/A';

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'title',
      label: `${t('obx.notificationRelease.table.columns.name')}`,
      sortable: false,
      className: hoverIconClass,
    },
    {
      id: 'status',
      label: `${t('obx.notificationRelease.table.columns.status')}`,
      sortable: false,
    },
    {
      id: 'createdBy',
      label: `${t('obx.notificationRelease.table.columns.createdBy')}`,
      sortable: false,
    },
    {
      id: 'createdAt',
      label: `${t('obx.notificationRelease.table.columns.createdAt')}`,
      sortable: false,
    },
    {
      id: 'action',
      label: '',
      sortable: false,
      className: 'actionCol',
    },
  ];
};

const perPage = paginationOptions.perPageRows;

const toastOptions = {
  position: 'top-right',
  autoClose: toastSettings.AUTO_CLOSE,
};

const defaultParams = {
  page: 1,
  perPage: perPage,
  search: '',
  windowStart: '',
  windowEnd: '',
};

const columnIdsEnum = {
  title: 'title',
  status: 'status',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  action: 'action',
};
const statusEnum = {
  sent: 'success',
  draft: 'warning',
  scheduled: 'primary',
};

const NotificationRelease = () => {
  const classes = useStyles();
  const [selectedDates, setSelectedDates] = useState([]);
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editNotification, setEditNotification] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [sendNowNotification, setSendNowNotification] = useState(null);
  const [deleteNotification, setDeleteNotification] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState(defaultParams);
  const { getNewApiController } = useApiControllers();
  const { formatDayjsDateTime } = useDateTime();

  const hoverIconClass = classes.SitesTD;
  const columns = i18ColumnName(t, hoverIconClass);

  const handleDateRangeChange = (dates) => {
    setSelectedDates(dates);
    const { startDate: windowStart, endDate: windowEnd } = getDateRangeWrtFranchiseTimezone(dates);
    console.log('windowStart', new Date(windowStart).toISOString());
    setQueryParams((prev) => ({
      ...prev,
      windowStart: new Date(windowStart).toISOString(),
      windowEnd: new Date(windowEnd).toISOString(),
      page: paginationOptions.defaultPerPage,
    }));
  };

  const fetchNotifications = async (params) => {
    const apiController = getNewApiController();
    setLoading(true);
    try {
      const response = await getReleaseNotifications(params, { signal: apiController.signal });
      if (response?.statusCode === 200) {
        setData(response?.data?.systemNotifications || []);
        setTotalRows(response?.data?.pagination?.totalCount || 0);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        setData([]);
        setTotalRows(0);
      }
    } finally {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNotifications(queryParams);
  }, [queryParams]);

  const handleChangePage = (_, newPage) => {
    setQueryParams((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    const newPerPage = parseInt(event.target.value, 10);
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: newPerPage,
    }));
  };

  const handleSearch = (event) => {
    const { value } = event.target;
    setQueryParams((prev) => ({
      ...prev,
      search: value,
      page: paginationOptions.defaultPerPage,
    }));
  };

  const handleTriggerNotificationNow = async (notificationId) => {
    if (!notificationId) {
      setSendNowNotification(null);
      return;
    }
    try {
      const response = await triggerNotificationNow(notificationId);
      if (response?.statusCode === 200) {
        setData((prev) =>
          prev.map((item) => (item.id === notificationId ? { ...item, status: 'sent' } : item)),
        );
        toaster.success({ text: response?.message || 'Notification sent', ...toastOptions });
      }
    } catch (error) {
      toaster.error({ text: error?.message || 'Failed to send notification', ...toastOptions });
    } finally {
      setSendNowNotification(null);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!notificationId) {
      setDeleteNotification(null);
      return;
    }
    try {
      const response = await deleteNotificationById(notificationId);
      if (response?.statusCode === 200) {
        setData((prev) => prev.filter((item) => item.id !== notificationId));
        setTotalRows((prev) => Math.max(0, prev - 1));
        toaster.success({ text: response?.message || 'Notification deleted', ...toastOptions });
      }
    } catch (error) {
      toaster.error({ text: error?.message || 'Failed to delete notification', ...toastOptions });
    } finally {
      setDeleteNotification(null);
    }
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns?.map((column) => (
            <TableCell key={column?.id}>{column?.label}</TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const tableBody = (rows, tableColumns) => {
    return loading ? (
      <TableSkeleton columns={tableColumns} numberOfRows={10} />
    ) : (
      <>
        <NoRecordFound data={rows} noOfColumns={tableColumns.length} t={t} />
        {rows?.map((row) => (
          <TableRow key={row?.id}>
            {tableColumns?.map((column) => {
              const isClickable = column.id === columnIdsEnum.title;
              return (
                <TableCell
                  key={column?.id}
                  className={column.className}
                  onClick={isClickable ? () => setSelectedNotification(row) : undefined}
                  sx={isClickable ? { cursor: 'pointer' } : undefined}
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

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.title) {
      return (
        <Box className={classes.titleMessageCell}>
          <Typography variant="subtitle2" className={classes.titleText}>
            {capitalizeFirstLetter(row.title)}
          </Typography>
          {row.message && (
            <Typography variant="info" className={classes.messageText}>
              {truncateString(row.message, 120)}
            </Typography>
          )}
        </Box>
      );
    }

    if (column?.id === columnIdsEnum.status) {
      const status = row[column.id];
      return (
        <NotificationStatusChip
          status={status}
          statusColorMap={statusEnum}
          statusChipClassName={classes.statusChip}
          tooltipPlacement="top"
          tooltipArrow
          scheduledAt={row?.scheduledAt}
          sentAt={row?.sentAt}
          triggeredAt={row?.triggeredAt}
          createdAt={row?.createdAt}
        />
      );
    }

    if (column.id === columnIdsEnum.createdAt) {
      return (
        <>
          {row[column.id]
            ? formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date })
            : NA}
        </>
      );
    }
    if (column.id === columnIdsEnum.createdBy) {
      const name = capitalizeFirstLetter(row.createdBy?.name) || NA;
      return (
        <Box className={classes.createdByCell}>
          <Avatar className={classes.createdByAvatar} src={row.createdBy?.image}></Avatar>
          {name}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.action) {
      return (
        row.status !== 'sent' && (
          <PopoverButton className={classes.actionMenu} variant="icon" Icon={MoreVert}>
            <Box
              className={`${classes.actionMenuItem} ${classes.sendIcon}`}
              onClick={() => setSendNowNotification(row)}
            >
              <SendIcon className={classes.actionMenuIcon} />
              <Typography variant="subtitle2">Send now</Typography>
            </Box>
            <Box
              className={classes.actionMenuItem}
              onClick={() => {
                setEditNotification(row);
                setDrawerOpen(true);
              }}
            >
              <EditTermIcon className={classes.actionMenuIcon} />
              <Typography variant="subtitle2">Edit</Typography>
            </Box>
            <Box
              className={classes.actionMenuItemDelete}
              onClick={() => setDeleteNotification(row)}
            >
              <TrashIcon className={classes.actionMenuIconDelete} />
              <Typography variant="subtitle2">Delete</Typography>
            </Box>
          </PopoverButton>
        )
      );
    }

    return <>{row[column.id] || NA}</>;
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.headerRow}>
        <Box>
          <SearchComponent
            name="search"
            onSearch={handleSearch}
            placeholder={t('obx.notificationRelease.searchFilter')}
          />
        </Box>
        <Box className={classes.headerLeft}>
          <DateRangePicker
            placeHolder={'MM/DD/YYYY - MM/DD/YYYY'}
            selectedDates={selectedDates}
            setDates={handleDateRangeChange}
          />

          <Button
            variant="primary"
            startIcon={<PlusIconSvg />}
            color="primary"
            onClick={() => {
              setEditNotification(null);
              setDrawerOpen(true);
            }}
          >
            {t('obx.notificationRelease.createDrawer.create')}
          </Button>
        </Box>
      </Box>

      <Box className={classes.tableWrapper}>
        <TableComponent
          data={data}
          classNameTable={classes.stickyFirstCol}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          totalRecords={totalRows}
          page={queryParams.page - 1}
          loading={loading}
          handleChangePage={handleChangePage}
          rowsPerPage={queryParams.perPage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          applySorting={() => {}}
        />
      </Box>
      <SweetAlertModal
        type="question"
        customClass={{
          confirmButton: classes.sweetAlertConfirmBlueButton,
        }}
        title="Send Notification Now?"
        text="Are you sure you want to send this Notification now?"
        cancelButtonText={t('links.cancel')}
        confirmButtonText="Send"
        show={!!sendNowNotification}
        handleConfirmButton={() => handleTriggerNotificationNow(sendNowNotification?.id)}
        handleCancelButton={() => setSendNowNotification(null)}
        icon={<SentNotificationIcon />}
      />
      <SweetAlertModal
        type="warning"
        customClass={{
          confirmButton: classes.deleteSweetAlertConfirmButton,
        }}
        title="Delete Notification?"
        text="Are you sure you want to delete this Notification?"
        cancelButtonText={t('links.cancel')}
        confirmButtonText="Delete"
        show={!!deleteNotification}
        handleConfirmButton={() => handleDeleteNotification(deleteNotification?.id)}
        handleCancelButton={() => setDeleteNotification(null)}
        icon={<DeleteModalIcon />}
      />
      <CreateNotificationDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditNotification(null);
        }}
        notification={editNotification}
        onSuccess={() => fetchNotifications(queryParams)}
      />
      <NotificationDetailModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notificationId={selectedNotification?.id}
      />
    </Box>
  );
};

export default NotificationRelease;
