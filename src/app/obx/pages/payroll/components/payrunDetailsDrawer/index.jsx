import {
  Box,
  Button,
  Chip,
  Skeleton,
  TableCell,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactComponent as CrossBlackIcon } from 'assets/svg/CrossBlackIcon.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { ReactComponent as EmployIcon } from 'src/assets/svg/EmployIcon.svg?react';
import useDateTime from 'src/hooks/useDateTime';
import { getPayrun } from 'src/services/payroll.services';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import NotesModal from '../notesModal';
import { useStyles } from './payrunDetailsDrawer';

const i18ColumnName = (t) => {
  return [
    {
      id: 'adpBadgeNumber',
      label: `${t('obx.payroll.badgeNo')}`,
      sortable: false,
    },
    {
      id: 'employeeName',
      label: `${t('obx.payroll.employeeName')}`,
      sortable: false,
    },
    {
      id: 'isAdhocPayroll',
      label: `${t('obx.payroll.type')}`,
      sortable: false,
    },
    {
      id: 'location',
      label: `${t('obx.payroll.location')}`,
      sortable: false,
    },
    {
      id: 'site',
      label: `${t('obx.payroll.sites')}`,
      sortable: false,
    },
    {
      id: 'shiftDate',
      label: `${t('obx.payroll.shiftDate')}`,
      sortable: false,
    },
    {
      id: 'shiftTime',
      label: `${t('obx.payroll.shiftTime')}`,
      sortable: false,
    },
    {
      id: 'punchinOut',
      label: `${t('obx.payroll.punchinOut')}`,
      sortable: false,
    },
    {
      id: 'approvedHours',
      label: `${t('obx.payroll.approvedHours')}`,
      sortable: false,
    },
    {
      id: 'invoiceableHours',
      label: `${t('obx.payroll.invoiceAbleHours')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  invoiceableHours: 'invoiceableHours',
  approvedHours: 'approvedHours',
  employeeName: 'employeeName',
  employeeType: 'employeeType',
  site: 'site',
  isAdhocPayroll: 'isAdhocPayroll',
  punchinOut: 'punchinOut',
  shiftDate: 'shiftDate',
  shiftTime: 'shiftTime',
  hourlyRate: 'hourlyRate',
  adpBadgeNumber: 'adpBadgeNumber',
  location: 'location',
};

const initialData = {
  payroll: [],
};

const PayrunDetailsDrawer = ({
  handleClosePreviewVisitorDrawer,
  anchor,
  selectedRow,
  setSelectedRow,
}) => {
  const { t } = useTranslation();
  const NA = t('commonText.nA');

  const classes = useStyles();
  const [queryParams] = useState(null);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const classDealName = classes.locationTD;
  const columns = i18ColumnName(t, classDealName);
  const [notes, setNotes] = useState(null);
  const { formatDayjsDateTime } = useDateTime();

  const fetchPayrun = async () => {
    try {
      setLoading(true);
      const response = await getPayrun(selectedRow);
      if (response && response?.statusCode === 200) {
        setData((prev) => ({ ...prev, ...response?.data }));
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
    if (selectedRow) fetchPayrun();
  }, [queryParams]);

  const handleClose = () => {
    handleClosePreviewVisitorDrawer(anchor);
    setSelectedRow(null);
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.employeeName) {
      return (
        <>
          {
            <Box className={classes.employeeNameClass}>
              {row.officer.name.length > 22 ? (
                <Tooltip
                  title={<Box sx={{ textTransform: 'capitalize' }}>{row.officer.name || NA}</Box>}
                  placement="right"
                  arrow
                >
                  {row?.officer?.name.substring(0, 20) + '...'}
                </Tooltip>
              ) : (
                row.officer.name || NA
              )}
              {row?.notes?.length ? (
                <Button
                  onClick={() => setNotes(row.notes)}
                  variant="onlyText"
                  disableRipple
                  startIcon={<EmployIcon />}
                ></Button>
              ) : (
                ''
              )}
            </Box>
          }
        </>
      );
    }

    if (column.id === columnIdsEnum.adpBadgeNumber) {
      return (
        <>
          {
            <Box className={classes.employeeNameClass}>
              {row?.[column.id].length > 22 ? (
                <Tooltip
                  title={<Box sx={{ textTransform: 'capitalize' }}>{row?.[column.id] || NA}</Box>}
                  placement="right"
                  arrow
                >
                  {row?.[column.id].substring(0, 20) + '...'}
                </Tooltip>
              ) : (
                row?.[column.id] || NA
              )}
            </Box>
          }
        </>
      );
    }

    if (column.id === columnIdsEnum.approvedHours) {
      return (
        <>{`${formatDayjsDateTime({ value: row?.approvedStartsAt, formatType: dayjsFormatsEnum.time })} 
        - ${formatDayjsDateTime({ value: row?.approvedEndsAt, formatType: dayjsFormatsEnum.time })} (${row?.payableHours || 0}h)`}</>
      );
    }
    if (column.id === columnIdsEnum.invoiceableHours) {
      return <>{`${row.invoiceableHours || 0}h`}</>;
    }
    if (column.id === columnIdsEnum.site) {
      return <>{row?.[column.id]?.name || NA}</>;
    }
    if (column.id === columnIdsEnum.location) {
      return (
        <>
          {
            <Box className={classes.employeeNameClass}>
              {row?.[column.id]?.name.length > 35 ? (
                <Tooltip
                  title={
                    <Box sx={{ textTransform: 'capitalize' }}>{row?.[column.id]?.name || NA}</Box>
                  }
                  placement="right"
                  arrow
                >
                  {row?.[column.id]?.name.substring(0, 35) + '...'}
                </Tooltip>
              ) : (
                row?.[column.id]?.name || NA
              )}
            </Box>
          }
        </>
      );
    }
    if (column.id === columnIdsEnum.employeeType) {
      return <>{row?.officer.type || NA}</>;
    }
    if (column.id === columnIdsEnum.shiftDate) {
      return (
        <>{formatDayjsDateTime({ value: row?.startsAt, formatType: dayjsFormatsEnum.date })}</>
      );
    }
    if (column.id === columnIdsEnum.shiftTime) {
      return (
        <>{`${formatDayjsDateTime({ value: row?.startsAt, formatType: dayjsFormatsEnum.time })} 
        - ${formatDayjsDateTime({ value: row?.endsAt, formatType: dayjsFormatsEnum.time })}`}</>
      );
    }
    if (column.id === columnIdsEnum.punchinOut) {
      return (
        <>{`${formatDayjsDateTime({ value: row?.checkin, formatType: dayjsFormatsEnum.time })} - 
        ${formatDayjsDateTime({ value: row?.checkout, formatType: dayjsFormatsEnum.time })} 
        (${row?.punchedHours || 0}h)`}</>
      );
    }
    if (column.id === columnIdsEnum.isAdhocPayroll) {
      return (
        <>
          {row?.isAdhocPayroll ? (
            <Chip className={classes.adhocPayrollChip} label={t('obx.payroll.adhoc')} />
          ) : (
            <Chip color="primary" label={t('obx.payroll.logged')} />
          )}
        </>
      );
    }

    return <>{row?.[column.id] || NA}</>;
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns?.map((column) => (
            <TableCell key={column?.id}>
              {column?.sortable ? (
                <TableSortLabel>{column?.label}</TableSortLabel>
              ) : (
                `${column?.label}`
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const tableBody = (data, i18ColumnName) => {
    return loading ? (
      <TableSkeleton columns={i18ColumnName} />
    ) : (
      <>
        {data?.length ? (
          data?.map((row) => (
            <TableRow key={row?.id}>
              {columns?.map((column) => (
                <TableCell
                  key={column?.id}
                  className={column.className}
                  onClick={
                    column.id === 'payrunStartPeriod'
                      ? () => handleOpenProfileViewModal()
                      : undefined
                  }
                >
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <NoRecordFound data={data} noOfColumns={i18ColumnName.length} t={t} />
        )}
      </>
    );
  };

  return (
    <>
      <Box className={classes.previewHeader}>
        <Box className={classes.headerLeft}>
          <Typography variant="h4">{t('obx.lockedPayruns.payrunDetails')}</Typography>
          {loading ? (
            <Skeleton />
          ) : (
            <Typography variant="subtitle3">
              {formatDayjsDateTime({ value: data?.startDate, formatType: dayjsFormatsEnum.date })}
              {' - '}
              {formatDayjsDateTime({ value: data?.endDate, formatType: dayjsFormatsEnum.date })}
            </Typography>
          )}
        </Box>
        <Box className={classes.headerRight}>
          <a href="#" onClick={handleClose}>
            <CrossBlackIcon />
          </a>
        </Box>
      </Box>

      {/* <Box>{data && <PayrunDetails data={data?.payload} loading={loading} />}</Box> */}
      <Box className={classes.salesUserListingContainer}>
        <Box className={classes.tableWrapper}>
          <TableComponent
            data={data?.payroll}
            columns={columns}
            tableHead={tableHead}
            tableBody={tableBody}
            pagination={false}
          />
        </Box>
        <NotesModal open={!!notes} notes={notes} onClose={() => setNotes(null)} />
      </Box>
    </>
  );
};

PayrunDetailsDrawer.propTypes = {
  handleClosePreviewVisitorDrawer: PropTypes.func,
  anchor: PropTypes.string,
  selectedRow: PropTypes.string,
  setSelectedRow: PropTypes.func,
};

PayrunDetailsDrawer.defaultProps = {
  handleClosePreviewVisitorDrawer: () => {},
  anchor: '',
  selectedRow: '',
  setSelectedRow: () => {},
};

export default PayrunDetailsDrawer;
