import { Box, Button, TableCell, TableRow, TableSortLabel } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { ReactComponent as PayRunDownloadIcon } from 'src/assets/svg/PayRunDownloadIcon.svg?react';
import { startAndEndDateFilterWithUTCTime } from 'src/helper/utilityFunctions';
import { getPayrolls } from 'src/services/payroll.services';
import { getAllSites } from 'src/services/sites.services';
import { getUsersWithDesiredType } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import {
  extractValuesByKeyFromInput,
  removeAllFromSelected,
} from 'src/utils/dropdownValueExtractor';
import { toaster } from 'src/utils/toast';

import { useStyles } from './payrunDetails';

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
const stubbedData = [
  {
    id: 1,
    adpBadgeNumber: '00111',
    employeeName: 'Mike Ross',
    site: 'Lincoln Premium Poultry',
    shiftDate: '12/12/2024',
    shiftTime: '10:30a - 07:30p',
    punchinOut: '10:30a - 07:30p (8h)',
    approvedHours: '8',
    invoiceableHours: '8',
  },
  {
    id: 2,
    adpBadgeNumber: '00111',
    employeeName: 'Mike Ross',
    site: 'Lincoln Premium Poultry',
    shiftDate: '12/12/2024',
    shiftTime: '10:30a - 07:30p',
    punchinOut: '10:30a - 07:30p (8h)',
    approvedHours: '8',
    invoiceableHours: '8',
  },
  {
    id: 3,
    adpBadgeNumber: '00111',
    employeeName: 'Mike Ross',
    site: 'Lincoln Premium Poultry',
    shiftDate: '12/12/2024',
    shiftTime: '10:30a - 07:30p',
    punchinOut: '10:30a - 07:30p (8h)',
    approvedHours: '8',
    invoiceableHours: '8',
  },
  {
    id: 4,
    adpBadgeNumber: '00111',
    employeeName: 'Mike Ross',
    site: 'Lincoln Premium Poultry',
    shiftDate: '12/12/2024',
    shiftTime: '10:30a - 07:30p',
    punchinOut: '10:30a - 07:30p (8h)',
    approvedHours: '8',
    invoiceableHours: '8',
  },
  {
    id: 5,
    adpBadgeNumber: '00111',
    employeeName: 'Mike Ross',
    site: 'Lincoln Premium Poultry',
    shiftDate: '12/12/2024',
    shiftTime: '10:30a - 07:30p',
    punchinOut: '10:30a - 07:30p (8h)',
    approvedHours: '8',
    invoiceableHours: '8',
  },
  {
    id: 6,
    adpBadgeNumber: '00111',
    employeeName: 'Mike Ross',
    site: 'Lincoln Premium Poultry',
    shiftDate: '12/12/2024',
    shiftTime: '10:30a - 07:30p',
    punchinOut: '10:30a - 07:30p (8h)',
    approvedHours: '8',
    invoiceableHours: '8',
  },
  {
    id: 7,
    adpBadgeNumber: '00111',
    employeeName: 'Mike Ross',
    site: 'Lincoln Premium Poultry',
    shiftDate: '12/12/2024',
    shiftTime: '10:30a - 07:30p',
    punchinOut: '10:30a - 07:30p (8h)',
    approvedHours: '8',
    invoiceableHours: '8',
  },
  {
    id: 8,
    adpBadgeNumber: '00111',
    employeeName: 'Mike Ross',
    site: 'Lincoln Premium Poultry',
    shiftDate: '12/12/2024',
    shiftTime: '10:30a - 07:30p',
    punchinOut: '10:30a - 07:30p (8h)',
    approvedHours: '8',
    invoiceableHours: '8',
  },
  {
    id: 9,
    adpBadgeNumber: '00111',
    employeeName: 'Mike Ross',
    site: 'Lincoln Premium Poultry',
    shiftDate: '12/12/2024',
    shiftTime: '10:30a - 07:30p',
    punchinOut: '10:30a - 07:30p (8h)',
    approvedHours: '8',
    invoiceableHours: '8',
  },
  {
    id: 10,
    adpBadgeNumber: '00111',
    employeeName: 'Mike Ross',
    site: 'Lincoln Premium Poultry',
    shiftDate: '12/12/2024',
    shiftTime: '10:30a - 07:30p',
    punchinOut: '10:30a - 07:30p (8h)',
    approvedHours: '8',
    invoiceableHours: '8',
  },
];

const today = dayjs();
const lastMonth = dayjs().subtract(1, 'month');

const params = {
  search: '',
  sortBy: '',
  orderBy: '',
  selectedDates: [lastMonth, today],
  officerId: [],
  siteId: [],
  isApproved: { value: undefined, label: 'All Statuses' },
  // more filters
};

const columnIdsEnum = {
  checkbox: 'checkbox',
  action: 'action',
  invoiceableHours: 'invoiceableHours',
  approvedHours: 'approvedHours',
  employeeName: 'employeeName',
  employeeType: 'employeeType',
  site: 'site',
  punchinOut: 'punchinOut',
  shiftDate: 'shiftDate',
  shiftTime: 'shiftTime',
  hourlyRate: 'hourlyRate',
  adpBadgeNumber: 'adpBadgeNumber',
};

const LockedPayruns = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const classDealName = classes.locationTD;
  const columns = i18ColumnName(t, classDealName);

  const [loading, setLoading] = useState(false);

  const [queryParams, setQueryParams] = useState(params);

  const NA = t('commonText.nA');

  const handleOpenModal = () => {
    setShowUnlockModal(true);
  };

  const handleOpenProfileViewModal = () => {
    setShowPreviewVisitorDrawer(true);
    // setSelectedRow(row);
  };

  useEffect(() => {
    fetchPayrolls(queryParams);
  }, [queryParams]);

  // useEffect(() => {
  //   fetchAllSites();
  //   fetchAllOfficers();
  // }, []);

  const fetchPayrolls = async (queryParams) => {
    setLoading(true);
    try {
      const utcSelectedDates = startAndEndDateFilterWithUTCTime(queryParams?.selectedDates || []);
      const params = {
        officerId: removeAllFromSelected(
          extractValuesByKeyFromInput(queryParams.officerId, 'value'),
          'all',
        ),
        siteId: removeAllFromSelected(
          extractValuesByKeyFromInput(queryParams.siteId, 'value'),
          'all',
        ),
        isApproved: queryParams?.isApproved?.value ?? '',
        windowStart: utcSelectedDates?.[0] ? utcSelectedDates?.[0] : '',
        windowEnd: utcSelectedDates?.[1] ? utcSelectedDates?.[1] : '',
      };
      const response = await getPayrolls(params);
      if (response && response?.statusCode === 200) {
        setData(response?.data?.payroll || []);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const _fetchAllSites = async () => {
    try {
      const response = await getAllSites();
      if (response?.statusCode === 200) {
        let transformedSites = transformArrayForOptions(response?.data?.sites, 'name', 'id') || [];
        setAllSites([{ value: 'all', label: 'All Sites' }, ...transformedSites]);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const _fetchAllOfficers = async () => {
    try {
      const response = await getUsersWithDesiredType();
      if (response?.data?.statusCode === 200) {
        const transformedUsers = transformArrayForOptions(response?.data?.users, 'name', 'id');
        setAllOfficers([
          {
            value: 'all',
            label: 'All Officers',
            image: 'someDefaultImageString',
          },
          ...transformedUsers,
        ]);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.action) {
      return (
        <>
          {
            <Button
              disableRipple
              className={classes.notesCloseBtn}
              variant="onlyText"
              onClick={handleOpenModal}
              startIcon={<PayRunDownloadIcon />}
            ></Button>
          }
        </>
      );
    }

    return <>{row?.[column.id] || NA}</>;
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
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
        <NoRecordFound data={data} noOfColumns={i18ColumnName.length} t={t} />
        {data?.map((row) => (
          <TableRow key={row?.id}>
            {columns?.map((column) => (
              <TableCell
                key={column?.id}
                className={column.className}
                onClick={
                  column.id === 'payrunStartPeriod' ? () => handleOpenProfileViewModal() : undefined
                }
              >
                {renderTableCell(row, column)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };

  // const handleDelete = () => {};
  return (
    <>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.salesUserListingContainer}>
        <Box className={classes.tableWrapper}>
          <TableComponent
            data={stubbedData}
            columns={columns}
            tableHead={tableHead}
            tableBody={tableBody}
            pagination={false}
            applySorting={applySorting}
          />
        </Box>
      </Box>
    </>
  );
};
export default LockedPayruns;
