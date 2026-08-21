import {
  Box,
  Button,
  Checkbox,
  Chip,
  Tab,
  TableCell,
  TableRow,
  TableSortLabel,
  Tabs,
  Tooltip,
} from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import { ReactComponent as TickWhiteIcon } from 'assets/svg/TickWhiteIcon.svg?react';
import { ReactComponent as PlusIcon } from 'assets/svg/Whiteplus.svg?react';
import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
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
import { ReactComponent as ReportCompletedIcon } from 'src/assets/svg/ReportCompletedIcon.svg?react';
import { ReactComponent as SyncIcon } from 'src/assets/svg/sync-refresh.svg?react';
import { useApiControllers } from 'src/helper/axios';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime.jsx';
import {
  deleteInvoice,
  exportInvoices,
  getInvoicePDF,
  getInvoices,
  getSites,
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
import InvoiceDrawer from './components/invoiceDrawer/index.jsx';
import PaymentsDrawer from './components/paymentsDrawer/index.jsx';
import PeriodOverview, { AGING_SPLIT, defaultPeriod } from './components/periodOverview/index.jsx';
import PreviewInvoiceDrawer from './components/previewInvoiceDrawer/index.jsx';
import RowActions from './components/rowActions/index.jsx';
import { useStyles } from './invoiceStyles.js';
import Outstanding from './outstanding/index.jsx';
import {
  AGING_BUCKET,
  DISCREPANCY,
  DISCREPANCY_META,
  formatSignedAmount,
  PAYMENT_STATE,
  PAYMENT_STATE_META,
} from './reconciliation.constants.js';

const PDFViewDrawer = lazy(() => import('../reports/components/pdfViewDrawer/index.jsx'));

/**
 * The listing's columns.
 *
 * `show` is the answer to "seventeen columns, and the two this feature exists for
 * are 300px past the right edge". The set that renders is what an accounts
 * receivable reader needs to decide something — who owes, how much, and how late —
 * ordered so that all of it fits without scrolling on a laptop. The document
 * subtotals stay defined but unrendered: they belong to the invoice itself and the
 * drawer shows them per invoice, which is where anyone reading a tax figure is
 * looking anyway.
 *
 * Widths are declared here rather than in CSS so reordering a column cannot leave a
 * stale `nth-child` rule behind.
 */
const invoiceColumns = (t, hoverIconClass, hidePushToSage = false) => [
  {
    id: 'checkbox',
    label: '',
    show: true,
    width: 52,
    notShow: !userHasPermission(ACL_OBX_INVOICES_UPDATE) || hidePushToSage,
  },
  {
    id: 'invoiceNumber',
    label: `${t('obx.invoice.invoiceNumber')}`,
    sortable: true,
    className: hoverIconClass,
    show: true,
    width: 164,
  },
  {
    id: 'clientName',
    label: `${t('obx.invoice.outstanding.customer')}`,
    sortable: true,
    show: true,
    truncate: true,
    width: 184,
  },
  {
    id: 'siteName',
    label: `${t('obx.invoice.siteName')}`,
    sortable: true,
    show: true,
    truncate: true,
    width: 196,
  },
  {
    id: 'dueDate',
    label: `${t('obx.invoice.dueDate')}`,
    sortable: true,
    width: 118,
  },
  // How late the money is, which is the question the reader actually has. It was
  // riding along on every row as `daysOverdue` and rendered nowhere, while five
  // columns of tax subtotals held permanent seats.
  {
    id: 'due',
    label: `${t('obx.invoice.dueColumn')}`,
    sortable: false,
    show: true,
    width: 114,
  },
  {
    id: 'balanceDue',
    label: `${t('obx.invoice.balanceDue')}`,
    sortable: true,
    show: true,
    numeric: true,
    width: 124,
  },
  {
    id: 'paymentState',
    label: `${t('obx.invoice.paymentStates.column')}`,
    sortable: false,
    show: true,
    width: 178,
  },
  // Renamed from "Status". Two adjacent columns both called something-status, with
  // neither label saying which was which, is most of why the pair was misread.
  {
    id: 'status',
    label: `${t('obx.invoice.syncStatus')}`,
    sortable: false,
    show: true,
    width: 118,
  },
  {
    id: 'grandTotal',
    label: `${t('obx.invoice.totalColumn')}`,
    sortable: true,
    show: true,
    numeric: true,
    width: 108,
  },
  {
    id: 'invoiceGenerated',
    label: `${t('obx.invoice.invoiceDate')}`,
    sortable: true,
    width: 124,
  },
  { id: 'customerId', label: `${t('obx.invoice.customerId')}`, sortable: true, width: 140 },
  { id: 'invoiceType', label: `${t('obx.invoice.type')}`, sortable: false, width: 116 },
  { id: 'contracts', label: `${t('obx.invoice.contract')}`, sortable: true, width: 280 },
  {
    id: 'invoiceDuration',
    label: `${t('obx.invoice.invoiceDuration')}`,
    sortable: false,
    width: 216,
  },
  {
    id: 'lineItemsTotal',
    label: `${t('obx.invoice.lineItemTotal')}`,
    sortable: true,
    numeric: true,
    width: 148,
  },
  {
    id: 'taxAmount',
    label: `${t('obx.invoice.taxAmount')}`,
    sortable: true,
    numeric: true,
    width: 128,
  },
  {
    id: 'deliveredAt',
    label: `${t('obx.invoice.deliveredAt')}`,
    sortable: true,
    width: 176,
  },
  {
    id: 'action',
    label: '',
    sortable: false,
    show: true,
    width: 124,
    notShow: !(
      userHasPermission(ACL_OBX_INVOICES_UPDATE) || userHasPermission(ACL_OBX_INVOICES_DELETE)
    ),
  },
];

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  siteName: [],
  invoiceNumber: '',
  // The listing is scoped to a period by default, and the summary above it states
  // which one. The month in progress is the window people actually ask about.
  selectedDates: defaultPeriod(),
  type: {},
  status: {},
  paymentStatus: {},
  sortBy: '',
  orderBy: '',
};

const TABS = {
  invoices: 0,
  outstanding: 1,
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const invoiceStatuses = (t) => [
  { value: '', label: t('obx.invoice.statuses.all') },
  { value: 0, label: t('obx.invoice.statuses.pending') },
  { value: 1, label: t('obx.invoice.statuses.inProgress') },
  { value: 2, label: t('obx.invoice.statuses.syncApproved') },
  { value: 3, label: t('obx.invoice.statuses.syncFailed') },
];

const statusesEnum = {
  syncApprove: 0,
  inProgress: 1,
  sentToSage: 2,
  failed: 3,
};

// The column is headed "Sync Status", so the values do not repeat the word: every cell
// saying "Sync Approved" under a header saying "Sync Status" spends 45px per row
// restating the column name, and then truncates to "Sync Appro…" for the trouble.
const invoiceStatusLabelEnum = (t) => ({
  0: { label: t('obx.invoice.syncStatuses.pending'), color: 'primary' },
  1: { label: t('obx.invoice.syncStatuses.inProgress'), color: 'info' },
  2: { label: t('obx.invoice.syncStatuses.approved'), color: 'success' },
  3: { label: t('obx.invoice.syncStatuses.failed'), color: 'error' },
});

const invoiceTypeFilter = (t) => [
  { value: '', label: t('obx.invoice.types.all') },
  { value: 0, label: t('obx.invoice.types.adHoc') },
  { value: 1, label: t('obx.invoice.types.scheduled') },
];

// Payment state, in the order money moves through it. "Unpaid" is deliberately
// first after All: it is the one this filter exists for.
const paymentStateFilter = (t) => [
  { value: '', label: t('obx.invoice.paymentStates.all') },
  { value: PAYMENT_STATE.unpaid, label: t('obx.invoice.paymentStates.unpaid') },
  { value: PAYMENT_STATE.partial, label: t('obx.invoice.paymentStates.partial') },
  { value: PAYMENT_STATE.paid, label: t('obx.invoice.paymentStates.paid') },
  { value: PAYMENT_STATE.overpaid, label: t('obx.invoice.paymentStates.overpaid') },
  { value: PAYMENT_STATE.credit, label: t('obx.invoice.paymentStates.credit') },
];

const columnIdsEnum = {
  checkbox: 'checkbox',
  invoiceNumber: 'invoiceNumber',
  clientName: 'clientName',
  customerId: 'customerId',
  siteName: 'siteName',
  invoiceGenerated: 'invoiceGenerated',
  dueDate: 'dueDate',
  due: 'due',
  status: 'status',
  invoiceDuration: 'invoiceDuration',
  invoiceType: 'invoiceType',
  action: 'action',
  contracts: 'contracts',
  lineItemsTotal: 'lineItemsTotal',
  taxAmount: 'taxAmount',
  grandTotal: 'grandTotal',
  deliveredAt: 'deliveredAt',
  paymentState: 'paymentState',
  balanceDue: 'balanceDue',
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
  // Column headers no longer repeat the currency on every money column — the summary
  // card above the table states it once, in the figures themselves.
  const countryShortCode = useSelector(
    (state) => state?.auth?.countryConfiguration?.country?.shortCode,
  );
  const tenantPermissions = useSelector((state) => state.auth.tenantPermissions);
  const isQuickbooks = tenantPermissions?.invoicingMethod === INVOICING_METHODS_ENUM?.QUICKBOOKS;
  const isGermanFranchise = countryShortCode === 'DE';
  const tableWrapperClass = `${classes.tableWrapper} ${
    isGermanFranchise ? classes.tableWrapperGermany : classes.tableWrapperUS
  }`;

  const columns = useMemo(
    () =>
      invoiceColumns(t, hoverIconClass, isGermanFranchise).filter(
        (column) => column.show && !column.notShow,
      ),
    [t, hoverIconClass, isGermanFranchise],
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
  const [paymentsInvoiceId, setPaymentsInvoiceId] = useState(null);
  const [currentSearchKey, setCurrentSearchKey] = useState('');
  const [activeTab, setActiveTab] = useState(TABS.invoices);
  // Bumped whenever a payment is recorded or reversed, so the summary and the
  // Outstanding tab re-derive rather than showing a stale roll-up.
  const [ledgerVersion, setLedgerVersion] = useState(0);
  // The search input is uncontrolled, so "Clear all" remounts it.
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // The one filter that lives inside the summary rather than in the controls row:
  // which half of the open balance the table is showing, waiting or chasing.
  const [agingSplit, setAgingSplit] = useState(null);
  const [isSyncInProgress, setIsSyncInProgress] = useState(false);
  const { formatDayjsDateTime } = useDateTime();
  const [orderState, setOrderState] = useState(order);

  const sortableColumnIdsApiMap = {
    contracts: 'contractName',
    invoiceGenerated: 'createDate',
  };

  /**
   * The scope: everything that decides *which* invoices are in play. The summary
   * above the table is fetched with exactly this, which is what makes "the numbers
   * describe the rows on screen" true by construction rather than by discipline.
   */
  const scopeQuery = useMemo(
    () => ({
      periodStart: queryParams?.selectedDates?.[0]
        ? queryParams.selectedDates[0].format(dateFormat)
        : '',
      periodEnd: queryParams?.selectedDates?.[1]
        ? queryParams.selectedDates[1].format(dateFormat)
        : '',
      invoiceNumber: queryParams.invoiceNumber || '',
      siteName: (queryParams?.siteName || []).map((site) => site.label),
      type: extractValuesByKeyFromInput(queryParams.type, 'value'),
      status: extractValuesByKeyFromInput(queryParams.status, 'value'),
      paymentStatus: extractValuesByKeyFromInput(queryParams.paymentStatus, 'value'),
    }),
    [queryParams],
  );

  /**
   * The split: which half of the open balance the table is showing. It is the one
   * filter the summary does *not* follow — see `ignoreAgingSplit` in the mock — so
   * the figure the reader clicked stays on screen next to the rows it produced.
   */
  const splitQuery = useMemo(() => {
    if (!agingSplit) return {};
    return agingSplit === AGING_SPLIT.notYetDue
      ? { agingBucket: [AGING_BUCKET.current] }
      : {
          agingBucket: [
            AGING_BUCKET.d1_30,
            AGING_BUCKET.d31_60,
            AGING_BUCKET.d61_90,
            AGING_BUCKET.d90_plus,
          ],
        };
  }, [agingSplit]);

  // Whether "Clear all" has anything to clear.
  const appliedScopeCount = [
    (queryParams?.siteName || []).length > 0,
    !!extractValuesByKeyFromInput(queryParams.status, 'value'),
    !!extractValuesByKeyFromInput(queryParams.type, 'value'),
    !!extractValuesByKeyFromInput(queryParams.paymentStatus, 'value'),
    !!queryParams.invoiceNumber,
  ].filter(Boolean).length;

  const handlePeriodChange = (dates) => {
    // Step out of the split with the period. A band that has matches in August may
    // have none in July, which would leave an applied filter with nothing on screen
    // to switch it off.
    setAgingSplit(null);
    updateFormHandler('selectedDates', dates);
  };

  const handleClearAll = () => {
    setAgingSplit(null);
    setSearchResetKey((key) => key + 1);
    setQueryParams((previous) => ({
      ...previous,
      page: paginationOptions.defaultPerPage,
      invoiceNumber: '',
      siteName: [],
      type: {},
      status: {},
      paymentStatus: {},
    }));
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

  const clearSelection = () => {
    setSelectedItems([]);
    setSelectAll(false);
  };

  const sortDirection = (column) =>
    orderState.orderBy === column.id ? orderState.orderType : false;

  const orderDirection = (column) =>
    orderState.orderBy === column.id ? orderState.orderType : 'asc';

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

    setOrderState({ orderBy: columnId, orderType: nextOrderType });
    applySorting(apiSortBy, nextOrderType);
  };

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, id]);
      return;
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

    await update({ invoice_ids: payload });
    setShowApproveSelectedInvoice(false);
    clearSelection();
  };

  const fetchInvoices = async (currentQuery) => {
    setLoading(true);
    try {
      const requestParams = {
        ...scopeQuery,
        ...splitQuery,
        perPage: currentQuery.perPage,
        page: currentQuery.page,
        sortBy: currentQuery.sortBy,
        orderBy: currentQuery.orderBy,
      };

      const response = await getInvoices(requestParams);

      if (response && response?.statusCode === 200) {
        setData(response?.data?.invoices || []);
        setTotalRows(response?.data?.pagination?.totalCount);
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
      if (searchKey !== currentSearchKey) {
        setCurrentSearchKey(searchKey);
        setSitesPagination(sitesPaginationEmptyState);
      }

      const nextPage = searchKey !== currentSearchKey ? 1 : sitesPagination?.nextPage || 1;

      const response = await getSites(
        { page: nextPage, name: searchKey },
        {
          signal: apiController.signal,
        },
      );

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
    await update({ invoice_ids: [data[index].id] });
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
        setLedgerVersion((version) => version + 1);
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

  const openPayments = (row) => {
    setPaymentsInvoiceId(row?.id);
  };

  const handlePaymentsSaved = () => {
    setLedgerVersion((version) => version + 1);
    fetchInvoices(queryParams);
  };

  const deleteInvoiceRequest = async () => {
    setIsUpdating(true);
    try {
      const response = await deleteInvoice(selectedInvoice);
      if (response?.statusCode === 200) {
        setShowDeleteInvoiceModel(false);
        fetchInvoices(queryParams);
        setLedgerVersion((version) => version + 1);
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

  /**
   * Export means "what I am looking at". It used to open a modal asking for two
   * dates from scratch and then ignore the period, the search and every filter — so
   * a reader who had narrowed the table to five invoices was asked to retype dates
   * and handed an unfiltered dump.
   */
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await exportInvoices(
        { ...scopeQuery, ...splitQuery },
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(new Blob([response], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoices_${scopeQuery.periodStart || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setIsExporting(false);
  };

  const tableHead = () => (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.id}
          sortDirection={sortDirection(column)}
          style={{ minWidth: column.width, maxWidth: column.width }}
          align={column.numeric ? 'right' : 'left'}
        >
          {column.id === 'checkbox' ? (
            <Checkbox
              icon={<CheckBoxRegularIcon />}
              checkedIcon={<CheckBoxCheckedIcon />}
              className={classes.checkBoxCustom}
              checked={selectAll}
              onChange={handleSelectAllChange}
              inputProps={{ 'aria-label': t('obx.invoice.selectAll') }}
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
  );

  const tableBody = (rows, activeColumns) =>
    loading ? (
      <TableSkeleton columns={activeColumns} />
    ) : (
      <>
        <NoRecordFound data={rows} noOfColumns={activeColumns.length} t={t} />
        {rows?.length > 0 &&
          rows.map((row, index) => (
            <TableRow key={row.id}>
              {activeColumns.map((column) => (
                <TableCell
                  key={column.id}
                  onClick={() => {
                    if (column?.id === columnIdsEnum.invoiceNumber) openInvoiceDrawer(row);
                  }}
                  style={{ minWidth: column.width, maxWidth: column.width }}
                  align={column.numeric ? 'right' : 'left'}
                  className={`${column.className || ''} ${
                    column.numeric ? classes.numericCell : ''
                  } ${column.truncate ? classes.truncateCell : ''}`}
                  title={column.truncate ? row[column.id] || '' : undefined}
                >
                  {renderTableCell(row, column, index)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );

  /** Row actions, as descriptors — `RowActions` decides which stay inline. */
  const rowActionsFor = (row, index) => {
    const canUpdate = userHasPermission(ACL_OBX_INVOICES_UPDATE);
    const canDelete = userHasPermission(ACL_OBX_INVOICES_DELETE);
    const issued = row.status === statusesEnum.sentToSage;
    const actions = [];

    if (canUpdate && issued) {
      actions.push({
        key: 'view',
        primary: true,
        label: t(
          row.delivered
            ? isQuickbooks
              ? 'obx.invoice.viewQuickbooksInvoice'
              : 'obx.invoice.viewSageInvoice'
            : isQuickbooks
              ? 'obx.invoice.viewQuickbooksInvoiceDisabled'
              : 'obx.invoice.viewSageInvoiceDisabled',
        ),
        icon: <ReportCompletedIcon />,
        disabled: !row.delivered,
        onClick: () => {
          handleShowPdf(row?.id);
          setSelectedInvoice(row);
        },
      });
    }

    if (canUpdate) {
      // Recording what a customer sent is bookkeeping every franchise does, whether
      // or not their accounting integration can hear about it. Disabled before the
      // invoice has been issued — money cannot arrive against an invoice the
      // customer has never seen.
      actions.push({
        key: 'payments',
        primary: true,
        label: t(
          issued ? 'obx.invoice.payments.viewPayments' : 'obx.invoice.payments.notIssuedYet',
        ),
        icon: <PayNowIcon />,
        disabled: !issued,
        onClick: () => openPayments(row),
      });
    }

    if (canUpdate && row.status === statusesEnum.syncApprove && !isGermanFranchise) {
      actions.push({
        key: 'approve',
        label: row.pushToSage
          ? t(isQuickbooks ? 'obx.invoice.pushToQuickbooks' : 'obx.invoice.approveStatus')
          : t('obx.invoice.billingInfoIncomplete'),
        icon: <ApproveInvoiceIcon />,
        disabled: !row.pushToSage,
        onClick: () => setShowApproveInvoice(index),
      });
    }

    if (canUpdate && row.status === statusesEnum.failed) {
      actions.push({
        key: 'retry',
        label: t('obx.invoice.failedStatus'),
        icon: <FailedIcon />,
        onClick: () => setShowApproveInvoice(index),
      });
    }

    if (canUpdate && row.status === statusesEnum.inProgress) {
      actions.push({
        key: 'inProgress',
        label: t('obx.invoice.inProgressStatus'),
        icon: <InProgressIcon />,
        disabled: true,
        onClick: () => {},
      });
    }

    if (
      canUpdate &&
      !isQuickbooks &&
      (row.status === statusesEnum.syncApprove || row.status === statusesEnum.failed) &&
      invoiceEnumTypes.SCHEDULED === row.invoiceType
    ) {
      actions.push({
        key: 'resync',
        label: t('obx.invoice.resyncPayrollStatus'),
        icon: <SyncIcon />,
        disabled: isSyncInProgress,
        onClick: () => invokeSyncWithPayroll(row.id),
      });
    }

    if (
      canDelete &&
      !isQuickbooks &&
      (row.status === statusesEnum.failed || row.status === statusesEnum.syncApprove)
    ) {
      actions.push({
        key: 'delete',
        label: t('buttons.delete'),
        icon: <DustinBinIcon />,
        destructive: true,
        onClick: () => {
          setSelectedInvoice(row?.id);
          setShowDeleteInvoiceModel(true);
        },
      });
    }

    return actions;
  };

  /**
   * "in 29 days" / "12 days late". The column is headed `Due`, so the value does not
   * repeat the word — and a relative figure is what the reader is actually after; the
   * calendar date is in the column beside it.
   */
  const renderDue = (row) => {
    if (row?.balanceDue == null || Number(row.balanceDue) <= 0.005) {
      return (
        <Box component="span" className={classes.dueSettled}>
          —
        </Box>
      );
    }
    const days = Number(row?.daysOverdue || 0);
    if (days > 0) {
      return (
        <Box component="span" className={classes.dueLate}>
          {t('obx.invoice.dueRelative.daysLate', { count: days })}
        </Box>
      );
    }
    if (days === 0) {
      return (
        <Box component="span" className={classes.dueToday}>
          {t('obx.invoice.dueRelative.today')}
        </Box>
      );
    }
    return (
      <Box component="span" className={classes.dueUpcoming}>
        {t('obx.invoice.dueRelative.inDays', { count: Math.abs(days) })}
      </Box>
    );
  };

  const renderTableCell = (row, column, index) => {
    if (column.id === columnIdsEnum.contracts) {
      const associatedSites = row[column.id];
      if (associatedSites?.length > 2) {
        return (
          <Box className={classes.associatedSites}>
            <Box className={classes.associatedSitesItem}>{associatedSites[0]}</Box>
            <Box className={classes.associatedSitesItem}>{associatedSites[1]}</Box>
            <Tooltip title={associatedSites?.slice(2)?.join(', ')} arrow>
              <Box className={classes.associatedSitesNo}>+{associatedSites?.length - 2}</Box>
            </Tooltip>
          </Box>
        );
      }
      if (associatedSites?.length) {
        return (
          <Box className={classes.associatedSites}>
            {associatedSites?.map((contract) => (
              <Box key={contract} component="span" className={classes.associatedSitesItem}>
                {contract}
              </Box>
            ))}
          </Box>
        );
      }
    }

    if (column.id === columnIdsEnum.action) {
      return <RowActions actions={rowActionsFor(row, index)} />;
    }

    if (column.id === columnIdsEnum.checkbox) {
      const locked =
        row.status === statusesEnum.sentToSage || row.status === statusesEnum.inProgress;
      return (
        <Checkbox
          checked={selectedItems.includes(row.id)}
          onChange={(event) => handleCheckboxChange(event, row.id)}
          icon={locked ? <CheckboxDisabledIcon /> : <CheckBoxRegularIcon />}
          checkedIcon={locked ? <CheckBoxCheckedDisabledIcon /> : <CheckBoxCheckedIcon />}
          disableRipple
          className={classes.checkBoxCustom}
          disabled={locked}
          inputProps={{
            'aria-label': t('obx.invoice.selectInvoice', { number: row.invoiceNumber }),
          }}
        />
      );
    }

    if (column.id === columnIdsEnum.invoiceNumber) {
      return (
        <Box className={classes.franchiseName}>
          <Box className={classes.franchiseNameText}>{row[column?.id] || NA}</Box>
          <Box className={classes.franchiseNameIcon}>
            <ChevronRight />
          </Box>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.due) return renderDue(row);

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
      const [startDate, endDate] = String(row[column?.id] || '').split(' - ');
      return row[column?.id] ? (
        <>
          <Box component="span">
            {formatDayjsDateTime({
              value: startDate,
              formatType: dayjsFormatsEnum.date,
              bypassFranchiseTimezone: true,
            })}
          </Box>
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

    if (column.id === columnIdsEnum.paymentState) {
      const stateMeta = PAYMENT_STATE_META(t)[row?.paymentState];
      // `paidLate` is the only flag this cell can add anything with. Every other
      // one restates something already on the row: "short paid" *is* the Part paid
      // chip beside it, "overpaid" *is* the Overpaid chip, "unpaid, overdue" is the
      // Unpaid chip plus the Due column, and "never issued" is the Sync Status
      // column. Rendering them bought a second chip, a wrapped cell and a 61px row
      // per invoice for no new information.
      const lateMeta = (row?.flags || []).includes(DISCREPANCY.paidLate)
        ? DISCREPANCY_META(t)[DISCREPANCY.paidLate]
        : null;
      return (
        <Box className={classes.paymentStateCell}>
          {stateMeta && <Chip size="small" label={stateMeta.label} color={stateMeta.color} />}
          {lateMeta && (
            <Tooltip title={lateMeta.description} arrow placement="top">
              <Chip size="small" variant="outlined" color={lateMeta.color} label={lateMeta.label} />
            </Tooltip>
          )}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.balanceDue) {
      const balance = Number(row?.balanceDue || 0);
      const overdue =
        balance > 0.005 && row?.agingBucket && row.agingBucket !== AGING_BUCKET.current;
      // Red is for money that is actually late. Painting every open balance alert-red
      // made an ordinary month read as an emergency, and once everything is red
      // nothing is.
      const tone = overdue
        ? classes.amountOverdue
        : balance > 0.005
          ? classes.amountOpen
          : classes.amountSettled;
      return (
        <Box component="span" className={tone}>
          {formatSignedAmount(balance)}
        </Box>
      );
    }

    if (
      column.id === columnIdsEnum.grandTotal ||
      column.id === columnIdsEnum.lineItemsTotal ||
      column.id === columnIdsEnum.taxAmount
    ) {
      return <>{formatSignedAmount(row[column.id])}</>;
    }

    if (row[column.id] === 0) return <>{row[column.id]}</>;

    return <>{row[column.id] || NA}</>;
  };

  const openInvoiceDrawer = (row) => {
    if (row?.status === statusesEnum.inProgress) return;
    setSelectedInvoice(row);
    setShowDrawer(true);
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => ({
      ...prevState,
      page: paginationOptions.defaultPerPage,
      [name]: value,
    }));
  };

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    updateFormHandler(name, value);
  };

  const fetchPDF = async (invoiceId) => {
    try {
      const response = await getInvoicePDF(invoiceId, { responseType: 'arraybuffer' });
      const blob = new Blob([response], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
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
  };

  useEffect(() => {
    fetchData();
  }, [queryParams, agingSplit]);

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

  const bulkApproveButton =
    selectedItems.length > 0 && !isGermanFranchise ? (
      <RenderIfHasPermission name={ACL_OBX_INVOICES_UPDATE}>
        <Button
          onClick={() => setShowApproveSelectedInvoice(true)}
          variant="primary"
          startIcon={<TickWhiteIcon />}
        >
          {`${t(isQuickbooks ? 'obx.invoice.approvePushToQuickbooks' : 'obx.invoice.approvePushToSage')}`}
        </Button>
      </RenderIfHasPermission>
    ) : null;

  return (
    <Box className={classes.sitesListingContainer}>
      {/* Two questions, two tabs: "what have we billed" and "what are we owed".
          They share the same records but almost none of the same reading — the
          first is a document list, the second is a money position. Page-level
          actions sit on this row, so selecting rows no longer hides them. */}
      <Box className={classes.tabsBar}>
        <Tabs value={activeTab} onChange={(_event, next) => setActiveTab(next)}>
          <Tab label={t('obx.invoice.tabs.invoices')} disableRipple />
          <Tab label={t('obx.invoice.tabs.outstanding')} disableRipple />
        </Tabs>
        {activeTab === TABS.invoices && (
          <Box className={classes.tabsActions}>
            <Button
              variant="secondaryGrey"
              className={classes.exportButton}
              startIcon={<DownloadCloud />}
              onClick={handleExport}
              disabled={isExporting || loading}
            >
              {`${t('obx.invoice.export')}`}
            </Button>
            <RenderIfHasPermission name={ACL_OBX_INVOICES_CREATE}>
              <Button
                variant="primary"
                startIcon={<PlusIcon />}
                onClick={() => setShowDrawer(true)}
              >
                {`${t('obx.invoice.createInvoice')}`}
              </Button>
            </RenderIfHasPermission>
          </Box>
        )}
      </Box>

      {activeTab === TABS.outstanding && (
        <Outstanding
          refreshKey={ledgerVersion}
          onOpenInvoice={(invoice) => {
            setSelectedInvoice(invoice);
            setShowDrawer(true);
          }}
          onOpenPayments={(invoice) => openPayments(invoice)}
        />
      )}

      {activeTab === TABS.invoices && (
        <PeriodOverview
          period={queryParams.selectedDates}
          onPeriodChange={handlePeriodChange}
          summaryQuery={scopeQuery}
          agingSplit={agingSplit}
          onAgingSplitChange={setAgingSplit}
          refreshKey={ledgerVersion}
          filters={queryParams}
          onFilterChange={inputChangedHandler}
          onClearAll={handleClearAll}
          searchResetKey={searchResetKey}
          sites={sites}
          sitesPagination={sitesPagination}
          sitesLoader={sitesLoader}
          fetchSites={fetchSites}
          paymentOptions={transformArrayForOptions(paymentStateFilter(t), 'label', 'value')}
          statusOptions={transformArrayForOptions(invoiceStatuses(t), 'label', 'value')}
          typeOptions={transformArrayForOptions(invoiceTypeFilter(t), 'label', 'value')}
          appliedScopeCount={appliedScopeCount}
          selectedCount={selectedItems.length}
          onBulkApprove={bulkApproveButton}
          onClearSelection={clearSelection}
        />
      )}

      <Box
        className={tableWrapperClass}
        sx={{ display: activeTab === TABS.invoices ? undefined : 'none' }}
      >
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
          scrollRegionLabel={t('obx.invoice.tableRegion')}
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
                onClick={() => downloadPdf()}
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
      {!!paymentsInvoiceId && (
        <SideDrawer
          isOpen={!!paymentsInvoiceId}
          totalWidth="640px"
          closeDrawer={() => setPaymentsInvoiceId(null)}
        >
          <PaymentsDrawer
            invoiceId={paymentsInvoiceId}
            onClose={() => setPaymentsInvoiceId(null)}
            onSaved={handlePaymentsSaved}
            readOnly={!userHasPermission(ACL_OBX_INVOICES_UPDATE)}
          />
        </SideDrawer>
      )}
    </Box>
  );
}
