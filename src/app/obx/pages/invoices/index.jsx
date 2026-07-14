import {
  Box,
  Button,
  Checkbox,
  Chip,
  TableCell,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as TickWhiteIcon } from 'assets/svg/TickWhiteIcon.svg?react';
import { ReactComponent as PlusIcon } from 'assets/svg/Whiteplus.svg?react';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import PopoverButton from 'src/app/components/common/popoverButton';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery/index.jsx';
import SideDrawer from 'src/app/components/common/sideDrawer/index.jsx';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table/index.jsx';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import DeleteInvoice from 'src/app/obx/pages/invoices/components/deleteInvoice';
import {
  ACL_OBX_INVOICES_CREATE,
  ACL_OBX_INVOICES_DELETE,
  ACL_OBX_INVOICES_UPDATE,
} from 'src/app/router/constant/OBXMODULE';
import { DownloadCloud } from 'src/assets/svg';
import { ReactComponent as ApproveInvoiceIcon } from 'src/assets/svg/approve-invoices.svg?react';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg?react';
import { ReactComponent as CheckBoxCheckedDisabledIcon } from 'src/assets/svg/checkbox-checked-disabled.svg?react';
import { ReactComponent as CheckboxDisabledIcon } from 'src/assets/svg/checkbox-disabled.svg?react';
import { ReactComponent as DustinBinIcon } from 'src/assets/svg/DustinBinIcon.svg?react';
import { ReactComponent as InProgressIcon } from 'src/assets/svg/in-progress-invoices.svg?react';
import { ReactComponent as FailedIcon } from 'src/assets/svg/invoices-failed.svg?react';
import { ReactComponent as PayNowIcon } from 'src/assets/svg/pay-now.svg?react';
import { ReactComponent as PayNowIconDisabled } from 'src/assets/svg/pay-now-disabled.svg?react';
import { ReactComponent as ReportCompletedIcon } from 'src/assets/svg/ReportCompletedIcon.svg?react';
// import { ReactComponent as PushedSageIcon } from 'src/assets/svg/pushed-sage-invoices.svg';
import { ReactComponent as SyncIcon } from 'src/assets/svg/sync-refresh.svg?react';
import { useApiControllers } from 'src/helper/axios';
import { calculateGrandAmount } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { useCurrency } from 'src/hooks/useCurrency.jsx';
import useDateTime from 'src/hooks/useDateTime.jsx';
import {
  deleteInvoice,
  getInvoicePDF,
  getInvoices,
  getSites,
  markInvoiceAsPaid,
  pushedToSage,
  refreshInvoice,
} from 'src/services/invoice.services.js';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import userHasPermission from 'src/utils/auth/userHasPermission';
import {
  dayjsFormatsEnum,
  INVOICING_METHODS_ENUM,
  paginationOptions,
  toastSettings,
} from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor/index.js';
import { toaster } from 'src/utils/toast/index.jsx';

import ApproveInvoice from './components/approveInvoice/index.jsx';
import ApproveSelectedInvoice from './components/approveSelectedInvoice/index.jsx';
import ExportInvoiceModel from './components/exportInvoiceModel/index.jsx';
import InvoiceDrawer from './components/invoiceDrawer/index.jsx';
import ExportInvoiceReconciliationModel from './components/invoiceReconciliationModel/index.jsx';
import PayInvoice from './components/payInvoice/index.jsx';
import PreviewInvoiceDrawer from './components/previewInvoiceDrawer/index.jsx';
import { useStyles } from './invoiceStyles.js';

const PDFViewDrawer = lazy(() => import('../reports/components/pdfViewDrawer/index.jsx'));

const i18ColumnName = (t, hoverIconClass, franchiseCurrency, hidePushToSage = false) => {
  return [
    {
      id: 'checkbox',
      label: ``,
      notShow: !userHasPermission(ACL_OBX_INVOICES_UPDATE) || hidePushToSage,
    },
    {
      id: 'invoiceNumber',
      label: `${t('obx.invoice.invoiceNumber')}`,
      sortable: true,
      className: hoverIconClass,
    },
    {
      id: 'customerId',
      label: `${t('obx.invoice.customerId')}`,
      sortable: true,
    },
    {
      id: 'siteName',
      label: `${t('obx.invoice.siteName')}`,
      sortable: true,
    },
    {
      id: 'invoiceType',
      label: `${t('obx.invoice.type')}`,
      sortable: false,
    },
    {
      id: 'contracts',
      label: `${t('obx.invoice.contract')}`,
      sortable: true,
    },
    {
      id: 'invoiceGenerated',
      label: `${t('obx.invoice.invoiceDate')}`,
      sortable: true,
    },
    {
      id: 'dueDate',
      label: `${t('obx.invoice.dueDate')}`,
      sortable: true,
    },
    {
      id: 'status',
      label: `${t('obx.invoice.status')}`,
      sortable: false,
    },
    {
      id: 'invoiceDuration',
      label: `${t('obx.invoice.invoiceDuration')}`,
      sortable: false,
    },
    {
      id: 'lineItemsTotal',
      label: `${t('obx.invoice.lineItemTotal')} (${franchiseCurrency})`,
      sortable: true,
    },
    {
      id: 'taxAmount',
      label: `${t('obx.invoice.taxAmount')} (${franchiseCurrency})`,
      sortable: true,
    },
    {
      id: 'grandTotal',
      label: `${t('obx.invoice.invoiceGrandTotal')} (${franchiseCurrency})`,
      sortable: true,
    },
    {
      id: 'deliveredAt',
      label: `${t('obx.invoice.deliveredAt')}`,
      sortable: true,
    },
    {
      id: 'action',
      label: ``,
      sortable: false,
      notShow: !(
        userHasPermission(ACL_OBX_INVOICES_UPDATE) || userHasPermission(ACL_OBX_INVOICES_DELETE)
      ),
    },
  ];
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  siteName: [],
  invoiceNumber: '',
  selectedDates: [],
  type: {},
  status: {},
  sortBy: '',
  orderBy: '',
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const invoiceStatuses = (t) => [
  {
    value: '',
    label: t('obx.invoice.statuses.all'),
  },
  {
    value: 0,
    label: t('obx.invoice.statuses.pending'),
  },
  {
    value: 1,
    label: t('obx.invoice.statuses.inProgress'),
  },
  {
    value: 2,
    label: t('obx.invoice.statuses.syncApproved'),
  },
  {
    value: 3,
    label: t('obx.invoice.statuses.syncFailed'),
  },
];

const statusesEnum = {
  syncApprove: 0,
  inProgress: 1,
  sentToSage: 2,
  failed: 3,
};

const invoiceStatusLabelEnum = (t) => ({
  0: { label: t('status.pending'), color: 'primary' },
  1: { label: t('status.inProgress'), color: 'info' },
  2: { label: t('status.syncApproved'), color: 'success' },
  3: { label: t('status.syncFailed'), color: 'error' },
});

const invoiceTypeFilter = (t) => [
  {
    value: '',
    label: t('obx.invoice.types.all'),
  },
  {
    value: 0,
    label: t('obx.invoice.types.adHoc'),
  },
  {
    value: 1,
    label: t('obx.invoice.types.scheduled'),
  },
];

const columnIdsEnum = {
  checkbox: 'checkbox',
  invoiceNumber: 'invoiceNumber',
  customerId: 'customerId',
  siteName: 'siteName',
  invoiceGenerated: 'invoiceGenerated',
  dueDate: 'dueDate',
  status: 'status',
  invoiceDuration: 'invoiceDuration',
  invoiceType: 'invoiceType',
  action: 'action',
  id: 'invoiceNumber',
  contracts: 'contracts',
  lineItemsTotal: 'lineItemsTotal',
  taxAmount: 'taxAmount',
  grandTotal: 'grandTotal',
  deliveredAt: 'deliveredAt',
};

const invoiceEnumTypes = {
  SCHEDULED: 'scheduled',
  ADHOC: 'ad_hoc',
};

const dateFormat = 'MM/DD/YYYY';

export const sitesPaginationEmptyState = {
  currentPage: 0,
  nextPage: 1,
  prevPage: 0,
  totalPages: 0,
  totalCount: 0,
};

export default function index() {
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const { getNewApiController } = useApiControllers();
  const [queryParams, setQueryParams] = useState(params);
  const [sitesPagination, setSitesPagination] = useState(sitesPaginationEmptyState);
  const [sites, setSites] = useState([]);
  const hoverIconClass = classes.ZonesTD;
  const { currency: franchiseCurrency } = useCurrency();
  const countryShortCode = useSelector(
    (state) => state?.auth?.countryConfiguration?.country?.shortCode,
  );
  const tenantPermissions = useSelector((state) => state.auth.tenantPermissions);
  const isQuickbooks = tenantPermissions?.invoicingMethod === INVOICING_METHODS_ENUM?.QUICKBOOKS;
  const isGermanFranchise = countryShortCode === 'DE';
  const tableWrapperClass = `${classes.tableWrapper} ${
    isGermanFranchise ? classes.tableWrapperGermany : classes.tableWrapperUS
  }`;
  const columns = i18ColumnName(t, hoverIconClass, franchiseCurrency, isGermanFranchise).filter(
    (a) => !a.notShow,
  );
  const [showDrawer, setShowDrawer] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPreviewDrawer, setPreviewShowDrawer] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showApproveInvoice, setShowApproveInvoice] = useState(-1);
  const [showApproveSelectedInvoice, setShowApproveSelectedInvoice] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sitesLoader, setSitesLoader] = useState(true);
  const [pdfViewDrawer, setPdfViewDrawer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [showDeleteInvoiceModel, setShowDeleteInvoiceModel] = useState(false);
  const [showPayInvoice, setShowPayInvoice] = useState(false);
  const [paidInvoiceIds, setPaidInvoiceIds] = useState([]);
  const [currentSearchKey, setCurrentSearchKey] = useState('');

  const [openExportModal, setOpenExportModal] = useState(false);
  const [openInvoiceReconciliationModal, setOpenInvoiceReconciliationModal] = useState(false);
  const [isSyncInProgress, setIsSyncInProgress] = useState(false);
  const { formatDayjsDateTime } = useDateTime();
  const [orderState, setOrderState] = useState(order);

  const sortableColumnIdsApiMap = {
    contracts: 'contractName',
    invoiceGenerated: 'createDate',
  };

  const handleOpenExportModal = () => {
    setOpenExportModal(true);
  };

  const handleCloseExportModal = () => {
    setOpenExportModal(false);
  };

  const handleOpenInvoiceReconciliationModal = () => {
    setOpenInvoiceReconciliationModal(true);
  };

  const handleCloseInvoiceReconciliationModal = () => {
    setOpenInvoiceReconciliationModal(false);
  };

  const handleClosePdfDrawer = () => {
    setPdfViewDrawer(false);
    setSelectedInvoice(null);
  };

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedItems(
        data
          .filter(
            (item) =>
              item.status !== statusesEnum.inProgress && item.status !== statusesEnum.sentToSage,
          )
          .map((item) => item.id),
      );
      return;
    }

    setSelectedItems([]);
  };

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      sortBy,
      orderBy,
    }));
  };

  const handleSort = (columnId) => {
    const isAsc = orderState.orderBy === columnId && orderState.orderType === 'asc';
    const nextOrderType = isAsc ? 'desc' : 'asc';
    const apiSortBy = sortableColumnIdsApiMap[columnId] || columnId;

    setOrderState({
      orderBy: columnId,
      orderType: nextOrderType,
    });
    applySorting(apiSortBy, nextOrderType);
  };

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, id]);
      return; // Return early
    }
    setSelectedItems(selectedItems.filter((item) => item !== id));
  };

  const handleMultipleInvoiceApprove = async () => {
    const payload = data
      .filter((invoice) => {
        if (
          invoice.status !== statusesEnum.inProgress &&
          invoice.status !== statusesEnum.sentToSage
        )
          return selectedItems.includes(invoice.id);
      })
      .map((invoice) => invoice.id);

    await update({
      invoice_ids: payload,
    });
    setShowApproveSelectedInvoice(false);
    setSelectedItems([]);
    setSelectAll(false);
  };

  const fetchInvoices = async (queryParams) => {
    setLoading(true);
    try {
      let params = {
        ...queryParams,
        perPage: queryParams.perPage,
        page: queryParams.page,
        periodStart: queryParams?.selectedDates?.[0]
          ? queryParams?.selectedDates?.[0]?.format(dateFormat)
          : '',
        periodEnd: queryParams?.selectedDates?.[1]
          ? queryParams?.selectedDates?.[1]?.format(dateFormat)
          : '',
        siteName: queryParams?.siteName.map((a) => a.label),
        type: extractValuesByKeyFromInput(queryParams.type, 'value'),
        status: extractValuesByKeyFromInput(queryParams.status, 'value'),
      };

      delete params.selectedDates;
      const response = await getInvoices(params);

      if (response && response?.statusCode === 200) {
        const invoices = response?.data?.invoices || [];
        setData(invoices);
        setPaidInvoiceIds(invoices.filter((inv) => inv?.paid).map((inv) => inv?.id));
        const total = response?.data?.pagination?.totalCount;
        setTotalRows(total);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchSites = async (refetch = false, searchKey = '') => {
    const apiController = getNewApiController();
    setSitesLoader(true);

    try {
      // If the search key has changed, reset pagination to its initial state
      if (searchKey !== currentSearchKey) {
        setCurrentSearchKey(searchKey);
        setSitesPagination(sitesPaginationEmptyState); // Reset pagination state
      }

      // Determine the correct page number after resetting
      const nextPage = searchKey !== currentSearchKey ? 1 : sitesPagination?.nextPage || 1;

      const queryParams = {
        page: nextPage,
        name: searchKey,
      };

      const response = await getSites(queryParams, {
        signal: apiController.signal,
      });

      if (refetch && response?.data?.sites?.length) {
        setSites((prevSites) => [...prevSites, ...response.data.sites]);
      } else {
        setSites(response?.data?.sites || []);
      }

      setSitesPagination(response?.pagination);
      setSitesLoader(false);
    } catch (error) {
      setSitesLoader(false);
    }
  };
  const invokeSyncWithPayroll = async (id) => {
    try {
      setIsSyncInProgress(true);
      const response = await refreshInvoice(id);
      //Explicitly wait 4 seconds so ROR can sync with Node
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      setIsSyncInProgress(false);
    } catch (error) {
      setIsSyncInProgress(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleRowUpdate = async (index) => {
    if (data[index] === statusesEnum.sentToSage || data[index] === statusesEnum.inProgress) return;
    const payload = {
      invoice_ids: [data[index].id],
    };
    await update(payload);
  };

  const handleInvoiceApprove = async () => {
    await handleRowUpdate(showApproveInvoice);
    setShowApproveInvoice(-1);
  };

  const update = async (payload) => {
    setIsUpdating(true);
    try {
      const response = await pushedToSage(payload);
      if (response?.statusCode === 200) {
        fetchInvoices(queryParams);
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setIsUpdating(false);
  };

  const handlePayNow = async (payload) => {
    const invoiceId = selectedInvoice?.id;
    setShowPayInvoice(false);
    setLoading(true);
    const apiController = getNewApiController();
    try {
      const response = await markInvoiceAsPaid(invoiceId, payload, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    fetchInvoices(queryParams);
  };

  const deleteInvoiceRequest = async () => {
    setIsUpdating(true);
    try {
      const response = await deleteInvoice(selectedInvoice);
      if (response?.statusCode === 200) {
        setShowDeleteInvoiceModel(false);

        fetchInvoices(queryParams);
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      setIsUpdating(false);
    } catch (error) {
      setShowDeleteInvoiceModel(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setIsUpdating(false);
  };

  const handleShowPdf = (invoiceId) => {
    fetchPDF(invoiceId);
    setPdfViewDrawer(true);
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} sortDirection={sortDirection(column)}>
              {column.id === 'checkbox' ? (
                <Checkbox
                  icon={<CheckBoxRegularIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              ) : column.sortable ? (
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
        {data?.length > 0 &&
          data.map((row, index) => (
            <TableRow key={row.id}>
              {columns.map((column) => {
                const showHandCursor = column.id === columnIdsEnum.name ? 'pointer' : '';
                return (
                  <TableCell
                    key={column.id}
                    onClick={() => {
                      if (column?.id === columnIdsEnum.invoiceNumber) openInvoicePdf(column, row);
                    }}
                    sx={{ cursor: showHandCursor }}
                    className={column.className}
                  >
                    {renderTableCell(row, column, index)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
      </>
    );
  };

  const renderTableCell = (row, column, index) => {
    if (column.id === columnIdsEnum.contracts) {
      const associatedSites = row[column.id];
      if (associatedSites?.length > 2) {
        return (
          <>
            <Box className={classes.associatedSites}>
              <Box className={classes.associatedSitesItem}>{associatedSites[0]}</Box>
              <Box className={classes.associatedSitesItem}>{associatedSites[1]}</Box>
              <Tooltip title={associatedSites?.slice(2)?.join(', ')} arrow>
                <Box className={classes.associatedSitesNo}>+{associatedSites?.length - 2}</Box>
              </Tooltip>
            </Box>
            {/* {associatedSites.slice(0, 2).join(' ')} +{associatedSites.slice(2).length} */}
          </>
        );
      } else if (associatedSites?.length) {
        return (
          <Box className={classes.associatedSites}>
            {associatedSites?.map((a) => {
              return (
                <Box key={a} component="span" className={classes.associatedSitesItem}>
                  {a}
                </Box>
              );
            })}
          </Box>
        );
      }
    }

    if (column.id === columnIdsEnum.action) {
      return (
        <Box className={classes.actionBtns}>
          <RenderIfHasPermission name={ACL_OBX_INVOICES_UPDATE}>
            <>
              {row.status === statusesEnum.sentToSage && (
                <Tooltip
                  title={
                    !row.delivered
                      ? t(
                          isQuickbooks
                            ? 'obx.invoice.viewQuickbooksInvoiceDisabled'
                            : 'obx.invoice.viewSageInvoiceDisabled',
                        )
                      : t(
                          isQuickbooks
                            ? 'obx.invoice.viewQuickbooksInvoice'
                            : 'obx.invoice.viewSageInvoice',
                        )
                  }
                  arrow
                  placement="top"
                >
                  <span className={classes.invoiceButtonClass}>
                    <Button
                      disableRipple
                      className={
                        !row.delivered ? classes.buttonDisable : `${classes.notesCloseBtn}`
                      }
                      variant="text"
                      onClick={() => {
                        handleShowPdf(row?.id);
                        setSelectedInvoice(row);
                      }}
                      startIcon={<ReportCompletedIcon />}
                      sx={{ cursor: !row.delivered ? 'not-allowed' : 'pointer' }}
                      disabled={!row.delivered}
                    ></Button>
                  </span>
                </Tooltip>
              )}
              {row.status === statusesEnum.syncApprove && !isGermanFranchise && (
                <Tooltip
                  title={
                    !row.pushToSage
                      ? 'Billing/Contact information incomplete'
                      : `${t(isQuickbooks ? 'obx.invoice.pushToQuickbooks' : 'obx.invoice.approveStatus')}`
                  }
                  arrow
                  placement="top"
                >
                  <span>
                    <Button
                      disableRipple
                      className={`${!row.pushToSage ? classes.buttonDisable : classes.notesCloseBtn}`}
                      variant="text"
                      onClick={() => setShowApproveInvoice(index)}
                      startIcon={<ApproveInvoiceIcon />}
                      sx={{ cursor: !row.pushToSage ? 'not-allowed' : 'pointer' }}
                      disabled={!row.pushToSage} // Disable button if row.pushToSage is false
                    ></Button>
                  </span>
                </Tooltip>
              )}
              {isQuickbooks && (
                <Tooltip
                  title={
                    paidInvoiceIds.includes(row.id)
                      ? `${t('obx.invoice.paid')}`
                      : `${t('obx.invoice.payNow')}`
                  }
                  arrow
                  placement="top"
                >
                  <span>
                    <PopoverButton
                      variant="icon"
                      Icon={
                        row.status !== statusesEnum.sentToSage || paidInvoiceIds.includes(row.id)
                          ? PayNowIconDisabled
                          : PayNowIcon
                      }
                      className={classes.qbPopover}
                      disabled={
                        row.status !== statusesEnum.sentToSage || paidInvoiceIds.includes(row.id)
                      }
                    >
                      <Box
                        className={classes.qbPopoverOption}
                        onClick={() => {
                          setSelectedInvoice(row);
                          setShowPayInvoice(true);
                        }}
                      >
                        {t('obx.invoice.cashCheck')}
                      </Box>
                    </PopoverButton>
                  </span>
                </Tooltip>
              )}
              {row.status === statusesEnum.inProgress && (
                <Tooltip title={`${t('obx.invoice.inProgressStatus')}`} arrow placement="top">
                  <Button
                    disableRipple
                    className={classes.notesCloseBtn}
                    variant="text"
                    startIcon={<InProgressIcon />}
                    sx={{ cursor: 'default' }}
                  ></Button>
                </Tooltip>
              )}

              {row.status === statusesEnum.failed && (
                <Tooltip title={`${t('obx.invoice.failedStatus')}`} arrow placement="top">
                  <Button
                    disableRipple
                    className={classes.notesCloseBtn}
                    variant="text"
                    startIcon={<FailedIcon />}
                    onClick={() => setShowApproveInvoice(index)}
                  ></Button>
                </Tooltip>
              )}

              {!isQuickbooks &&
                (row.status === statusesEnum.syncApprove || row.status === statusesEnum.failed) &&
                invoiceEnumTypes.SCHEDULED === row.invoiceType && (
                  <Tooltip title={`${t('obx.invoice.resyncPayrollStatus')}`} arrow placement="top">
                    <Button
                      disableRipple
                      className={classes.notesCloseBtn}
                      variant="text"
                      startIcon={<SyncIcon />}
                      onClick={() => invokeSyncWithPayroll(row.id)}
                      disabled={isSyncInProgress}
                    />
                  </Tooltip>
                )}
            </>
          </RenderIfHasPermission>
          {!isQuickbooks &&
            (row.status === statusesEnum.failed || row.status === statusesEnum.syncApprove) && (
              <RenderIfHasPermission name={ACL_OBX_INVOICES_DELETE}>
                <Button
                  disableRipple
                  className={classes.notesCloseBtn}
                  variant="text"
                  startIcon={<DustinBinIcon />}
                  onClick={() => {
                    setSelectedInvoice(row?.id);
                    setShowDeleteInvoiceModel(true);
                  }}
                />
              </RenderIfHasPermission>
            )}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.checkbox) {
      return (
        <>
          <Checkbox
            checked={selectedItems.includes(row.id)}
            onChange={(event) => handleCheckboxChange(event, row.id)}
            icon={
              row.status === statusesEnum.sentToSage || row.status === statusesEnum.inProgress ? (
                <CheckboxDisabledIcon />
              ) : (
                <CheckBoxRegularIcon />
              )
            }
            checkedIcon={
              row.status === statusesEnum.sentToSage || row.status === statusesEnum.inProgress ? (
                <CheckBoxCheckedDisabledIcon />
              ) : (
                <CheckBoxCheckedIcon />
              )
            }
            disableRipple
            className={classes.checkBoxCustom}
            disabled={
              row.status === statusesEnum.sentToSage || row.status === statusesEnum.inProgress
            }
          />
        </>
      );
    }

    if (column.id === columnIdsEnum.invoiceNumber) {
      return (
        <>
          <Box className={classes.franchiseName}>
            <Box className={classes.franchiseNameText}>{row[column?.id] || NA}</Box>
            <Box className={classes.franchiseNameIcon}>
              <ChevronRight />
            </Box>
          </Box>
        </>
      );
    }

    if (
      column.id === columnIdsEnum.invoiceGenerated ||
      column.id === columnIdsEnum.dueDate ||
      column.id === columnIdsEnum.deliveredAt
    ) {
      return (
        <>
          {row[column.id]
            ? formatDayjsDateTime({
                value: row[column.id],
                formatType: dayjsFormatsEnum.date,
                bypassFranchiseTimezone: true,
              })
            : NA}
        </>
      );
    }

    if (column.id === columnIdsEnum.invoiceDuration) {
      const [startDate, endDate] = row[column?.id].split(' - ');

      return (
        <>
          {row[column?.id] ? (
            <>
              <Box component="span">
                {formatDayjsDateTime({
                  value: startDate,
                  formatType: dayjsFormatsEnum.date,
                  bypassFranchiseTimezone: true,
                })}
              </Box>{' '}
              {' - '}
              <Box component="span">
                {formatDayjsDateTime({
                  value: endDate,
                  formatType: dayjsFormatsEnum.date,
                  bypassFranchiseTimezone: true,
                })}
              </Box>
            </>
          ) : (
            NA
          )}
        </>
      );
    }

    if (column.id === columnIdsEnum.status) {
      return (
        <Chip
          label={invoiceStatusLabelEnum(t)?.[row[column.id]].label}
          color={invoiceStatusLabelEnum(t)?.[row[column?.id]].color}
        />
      );
    }

    if (column.id === columnIdsEnum.invoiceType) {
      return (
        <>
          {row[column?.id] === invoiceEnumTypes.ADHOC
            ? t('obx.invoice.types.adHoc')
            : t('obx.invoice.types.scheduled')}
        </>
      );
    }

    if (column.id === columnIdsEnum.grandTotal) {
      return <>{calculateGrandAmount(row?.lineItemsTotal, row?.discount, row?.taxAmount)}</>;
    }

    if (column.id === columnIdsEnum.lineItemsTotal || column.id === columnIdsEnum.taxAmount) {
      return <>{row[column?.id] ? row[column?.id].toFixed(2) : row[column?.id]}</>;
    }

    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  //open Invoice details modal
  const openInvoicePdf = (column, row) => {
    if (row?.status === statusesEnum.inProgress) return;
    setSelectedInvoice(row);
    if (column.id === columnIdsEnum.id) {
      setShowDrawer(true);
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

  const fetchPDF = async (invoiceId) => {
    try {
      // setLoading(true);
      const response = await getInvoicePDF(invoiceId, {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([response], {
        type: 'application/pdf',
      });
      const objectUrl = URL.createObjectURL(blob);

      setPdfUrl(objectUrl);
    } catch (error) {
      setPdfViewDrawer(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchData = () => {
    fetchInvoices(queryParams);
    // fetchSites();
  };

  useEffect(() => {
    fetchData();
  }, [queryParams]);

  const downloadPdf = async () => {
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute(
        'download',
        `Invoice_${selectedInvoice?.invoiceNumber || selectedInvoice?.invoiceId}.pdf`,
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <Box className={classes.sitesListingContainer}>
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.leftSide}>
          <SearchComponentWithQuery
            name="invoiceNumber"
            onSearch={inputChangedHandler}
            placeHolder={`${t('obx.invoice.search')}`}
          />
          <CustomDropDown
            label={`${t('obx.invoice.siteDropdownLabel')}`}
            name="siteName"
            checkmark
            options={transformArrayForOptions(sites, 'name', 'id') || []}
            selectedValues={queryParams.siteName}
            handleChange={inputChangedHandler}
            multiSelect={true}
            searchable={true}
            withTiles={true}
            clearAll
            fetchMoreOptions={fetchSites}
            pagination={sitesPagination}
            isLoading={sitesLoader}
          />
          <CustomDropDown
            label={`${t('obx.invoice.statusesDropdownLabel')}`}
            name="status"
            options={transformArrayForOptions(invoiceStatuses(t), 'label', 'value')}
            selectedValues={queryParams.status}
            handleChange={inputChangedHandler}
          />
          <CustomDropDown
            label={`${t('obx.invoice.typesDropdownLabel')}`}
            name="type"
            options={transformArrayForOptions(invoiceTypeFilter(t), 'label', 'value')}
            selectedValues={queryParams.type}
            handleChange={inputChangedHandler}
          />
        </Box>
        <Box className={classes.rightBar}>
          {selectedItems.length && !isGermanFranchise ? (
            <RenderIfHasPermission name={ACL_OBX_INVOICES_UPDATE}>
              <Button
                onClick={() => setShowApproveSelectedInvoice(true)}
                variant="primary"
                startIcon={<TickWhiteIcon />}
              >
                {`${t(isQuickbooks ? 'obx.invoice.approvePushToQuickbooks' : 'obx.invoice.approvePushToSage')}`}
              </Button>
            </RenderIfHasPermission>
          ) : (
            <Box className={classes.rightBar}>
              <Box className={classes.invoicesDateRange}>
                <DateRangePicker
                  placeHolder={'MM/DD/YYYY - MM/DD/YYYY'}
                  selectedDates={queryParams?.selectedDates}
                  setDates={(dates) => {
                    updateFormHandler('selectedDates', dates);
                  }}
                />
              </Box>
              <Button
                variant="secondaryGrey"
                className={classes.exportButton}
                startIcon={<DownloadCloud />}
                onClick={handleOpenExportModal}
              >
                {`${t('obx.invoice.export')}`}
              </Button>
              <Button
                variant="secondaryGrey"
                className={classes.exportButton}
                startIcon={<DownloadCloud />}
                onClick={handleOpenInvoiceReconciliationModal}
              >
                {`${t('obx.invoice.invoiceReconciliation')}`}
              </Button>

              <RenderIfHasPermission name={ACL_OBX_INVOICES_CREATE}>
                <Button
                  variant="primary"
                  startIcon={<PlusIcon />}
                  onClick={() => {
                    setShowDrawer(true);
                  }}
                >
                  {`${t('obx.invoice.createInvoice')}`}
                </Button>
              </RenderIfHasPermission>
            </Box>
          )}
        </Box>
      </Box>
      <Box className={tableWrapperClass}>
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
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>
      {/* Invoice Drawer */}
      <SideDrawer isOpen={showDrawer} totalWidth={'1200px'} className={classes.sideDrawerHeight}>
        <InvoiceDrawer
          showDrawer={showDrawer}
          setShowDrawer={setShowDrawer}
          selectedInvoice={selectedInvoice?.id}
          setSelectedInvoice={setSelectedInvoice}
          refetchData={fetchData}
          disabled={selectedInvoice?.status === statusesEnum.sentToSage}
          isQuickbooks={isQuickbooks}
        />
      </SideDrawer>
      {pdfViewDrawer && (
        <SideDrawer isOpen={pdfViewDrawer} key={`${loading}-${pdfUrl}`} totalWidth="1024px">
          <Suspense fallback={null}>
            <PDFViewDrawer
              url={pdfUrl}
              setUrl={setPdfUrl}
              closeDrawer={handleClosePdfDrawer}
              invoice={selectedInvoice}
            />
          </Suspense>
          <Box>
            <Box className={classes.reportsDrawerActions}>
              <Button
                onClick={() => {
                  downloadPdf();
                }}
                variant="secondaryBlue"
                disableRipple
                disabled={!pdfUrl}
              >
                {t('buttons.downloadPDF')}
              </Button>
            </Box>
          </Box>
        </SideDrawer>
      )}
      <SideDrawer isOpen={false} totalWidth={'1200px'} className={classes.sideDrawerHeight}>
        <PreviewInvoiceDrawer showDrawer={showPreviewDrawer} setShowDrawer={setPreviewShowDrawer} />
      </SideDrawer>

      <ApproveInvoice
        open={showApproveInvoice > -1}
        onClose={() => setShowApproveInvoice(-1)}
        onSave={handleInvoiceApprove}
        loading={isUpdating}
        isQuickbooks={isQuickbooks}
      />
      <ApproveSelectedInvoice
        open={showApproveSelectedInvoice}
        loading={isUpdating}
        onClose={() => setShowApproveSelectedInvoice(false)}
        onSave={handleMultipleInvoiceApprove}
      />

      <DeleteInvoice
        open={showDeleteInvoiceModel}
        loading={isUpdating}
        onClose={() => setShowDeleteInvoiceModel(false)}
        onSubmit={deleteInvoiceRequest}
      />
      <ExportInvoiceModel open={openExportModal} onClose={handleCloseExportModal} />
      <ExportInvoiceReconciliationModel
        open={openInvoiceReconciliationModal}
        onClose={handleCloseInvoiceReconciliationModal}
      />
      <PayInvoice
        open={showPayInvoice}
        invoice={selectedInvoice}
        onClose={() => setShowPayInvoice(false)}
        onPayNow={handlePayNow}
      />
    </Box>
  );
}
