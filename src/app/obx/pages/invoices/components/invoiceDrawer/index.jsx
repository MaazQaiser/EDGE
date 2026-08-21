import {
  Box,
  Button,
  Checkbox,
  Chip,
  InputLabel,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import classNames from 'classnames';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import dayjs from 'dayjs';
import { t } from 'i18next';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { downloadEUInvoicePDF } from 'services/reports.services';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import LoaderComponent from 'src/app/components/common/loader';
import CustomInput from 'src/app/components/common/templates/customInput';
import { sitesPaginationEmptyState } from 'src/app/obx/pages/invoices';
import {
  ACL_OBX_INVOICES_CREATE,
  ACL_OBX_INVOICES_UPDATE,
} from 'src/app/router/constant/OBXMODULE';
import { ReactComponent as AlertRed } from 'src/assets/svg/alert-red.svg?react';
import { ReactComponent as PlusIcon } from 'src/assets/svg/plus.svg?react';
import { useApiControllers } from 'src/helper/axios';
import {
  calculateGrandAmount,
  isEUInstance,
  isObjectEmpty,
  removeKey,
} from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { useCurrency } from 'src/hooks/useCurrency';
import {
  createNewInvoice,
  getFranchiseSiteContracts,
  getFranchiseSites,
  getInvoice,
  getSageItemsWitParamsDropdown,
  updateInvoice,
} from 'src/services/invoice.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { COUNTRIES, toastSettings } from 'src/utils/constants';
import { PaymentTerms } from 'src/utils/constants/index';
import { formatIsoDateToMmDdYyyy } from 'src/utils/date';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { formatNumber, truncateToDecimalPlaces } from 'src/utils/regexField/regexFiledForm';
import { toaster } from 'src/utils/toast';

import { appendDefaultStartAndEndTimeWithDates } from '../../../schedules/helper';
import { useStyles } from './invoiceDrawer';
import LineItemTable from './listing';

const InvoiceDrawer = ({
  setShowDrawer,
  selectedInvoice,
  setSelectedInvoice,
  refetchData,
  disabled,
  isQuickbooks,
}) => {
  const classes = useStyles();
  const params = {
    site: {},
    invoiceDate: null,
    dueDate: null,
    periodStart: null,
    periodEnd: null,
    contract: {},
    paymentTerm: {},
    poNumber: '',
    periodDateRange: [],
    invoiceMemo: '',
    isRefund: false,
    originalInvoiceNumber: '',
    originalInvoiceCreateDate: null,
  };
  const initialLineItems = {
    id: null,
    sageItem: null,
    quantity: 0,
    description: '',
    price: 0,
    index: 0,
    total: '',
    _destroy: false,
  };
  const siteContractBill = {
    billTo: {},
    sites: [],
    contracts: [],
  };
  const initialEditInvoice = {
    contractDetails: {},
    billingDetails: {},
    invoiceNumber: '',
    poNumber: '',
  };
  const [queryParams, _setQueryParams] = useState(params);
  const [invoiceSitesContracts, setInvoiceSitesContracts] = useState(siteContractBill);
  const [lineItems, setLineItems] = useState([initialLineItems]);
  const [errorMessages, setErrorMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [invoiceLoading, setLoadingInvoice] = useState(true);
  const [lineItemsLoading, setLineItemsLoading] = useState(false);
  const [existingInvoice, setExistingInvoice] = useState(initialEditInvoice);
  const [deletedLineItems, setDeletedLineItems] = useState([]);
  const [isFirstLoadEdit, setIsFirstLoadEdit] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { getNewApiController } = useApiControllers();
  const NA = t('commonText.nA');
  const [detailsLoading, setDetailsLoading] = useState({
    site: false,
    contract: false,
    billTo: false,
  });
  const [sitesPagination, setSitesPagination] = useState(sitesPaginationEmptyState);
  const [currentSearchKey, setCurrentSearchKey] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  // `franchiseInfo` is null until a franchise is picked in the header, so this
  // has to tolerate the empty case — destructuring it directly took the whole
  // app down the moment the drawer opened. Every other consumer guards it the
  // same way.
  const { country: franchiseCountry } = useSelector((state) => state?.auth?.franchiseInfo) || {};
  const tenantInfo = useSelector((state) => state.auth?.tenantInfo);
  const invoiceInfo = useSelector((state) => state.auth?.invoiceInfo);
  const franchiseCountryShortCode = franchiseCountry?.shortCode?.toLowerCase() || 'us';
  const { currency: franchiseCurrency } = useCurrency();

  const inputChangedHandler = (selectedValues) => {
    setErrorMessages((prev) => removeKey([selectedValues?.target?.name], prev));
    _setQueryParams((prev) => ({
      ...prev,
      [selectedValues?.target?.name]: selectedValues?.target?.value,
    }));
    if (selectedValues?.target?.name == 'contract') {
      _setQueryParams((prev) => ({
        ...prev,
        paymentTerm: selectedValues?.target?.value?.paymentTerms
          ? {
              value: selectedValues?.target?.value?.paymentTerms,
              label: selectedValues?.target?.value?.paymentTerms,
            }
          : {},
      }));
    }
  };
  const closeDrawer = () => {
    setSelectedInvoice(null);
    setShowDrawer(false);
  };
  const handleIsRefundChange = (event) => {
    const checked = event.target.checked;
    _setQueryParams((prev) => ({
      ...prev,
      isRefund: checked,
    }));
    if (!checked) {
      _setQueryParams((prev) => ({
        ...prev,
        originalInvoiceNumber: '',
        originalInvoiceCreateDate: null,
      }));
      setErrorMessages((prev) => {
        const { originalInvoiceNumber: _on, originalInvoiceCreateDate: _od, ...rest } = prev;
        return rest;
      });
    }
  };
  const fetchFranchiseSites = async (refetch = false, searchKey = '') => {
    try {
      setDetailsLoading((prev) => ({
        ...prev,
        siteDropDown: true,
      }));

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
        billingInfo: true,
      };

      const response = await getFranchiseSites(queryParams);

      if (response?.statusCode === 200) {
        if (refetch && response?.data?.sites?.length) {
          setInvoiceSitesContracts((prev) => ({
            ...prev,
            sites: [
              ...prev.sites,
              ...transformArrayForOptions(response?.data?.sites, 'name', 'id'),
            ],
          }));
        } else {
          setInvoiceSitesContracts((prev) => ({
            ...prev,
            sites: transformArrayForOptions(response?.data?.sites, 'name', 'id'),
          }));
        }
        setSitesPagination(response?.pagination);
      }
      setDetailsLoading((prev) => ({
        ...prev,
        siteDropDown: false,
      }));
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const fetchFranchiseSiteContracts = async () => {
    try {
      setDetailsLoading((prev) => ({
        ...prev,
        contract: true,
        billTo: true,
      }));
      const response = await getFranchiseSiteContracts(queryParams?.site?.id);
      if (response?.statusCode === 200) {
        setInvoiceSitesContracts((prev) => ({
          ...prev,
          contracts: transformArrayForOptions(
            response?.data?.contracts,
            'name',
            'id',
            'paymentTerms',
          ),
          billTo: response?.data?.billTo,
        }));
      }
      setDetailsLoading((prev) => ({
        ...prev,
        contract: false,
        billTo: false,
      }));
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const handleAddItem = () => {
    setLineItems([...lineItems, { ...initialLineItems, index: lineItems.length }]);
  };
  const handleRemoveItem = (index) => {
    if (lineItems.length > 1) {
      if (!!lineItems[index].id) {
        const updatedDeletedLineItem = {
          ...lineItems?.[index],
          _destroy: true,
        };
        setDeletedLineItems((prev) => [...prev, updatedDeletedLineItem]);
      }
      const updatedItems = lineItems?.filter((item) => item.index !== index);
      const reindexedItems = updatedItems?.map((item, i) => ({ ...item, index: i }));
      setLineItems(reindexedItems);
    }
  };
  const handleUpdateItem = (event, index) => {
    const { name, value } = event.target;
    setErrorMessages((prev) => removeKey([`lineItems,${index},${name}`], prev));
    const updatedItems = lineItems?.map((item, i) => {
      if (i === index) {
        let processedValue = value;
        if (name === 'price') {
          processedValue = formatNumber(
            processedValue,
            2,
            15,
            lineItems[i]?.price,
            queryParams?.isRefund,
          );
        }
        if (name === 'quantity') {
          processedValue = formatNumber(processedValue, 2, 10, lineItems[i]?.quantity, true);
        }
        const updatedItem = { ...item, [name]: processedValue };
        updatedItem.total = +updatedItem.quantity * +updatedItem.price;
        return updatedItem;
      }
      return item;
    });
    setLineItems(updatedItems);
  };
  const formatTaxAndDiscountPrice = (value) => {
    return value.toFixed(2);
  };
  const getTotalAmount = () => {
    return lineItems.reduce((accumulator, item) => accumulator + +item.total, 0).toFixed(2);
  };
  let dueDateCount = PaymentTerms(t).find((term) => term.value === queryParams?.paymentTerm?.value);
  const handleCreateInvoice = async () => {
    setLoading(true);
    const DueDate = dayjs(queryParams?.invoiceDate).add(dueDateCount.dueDays, 'day');
    const payload = {
      contractId: queryParams?.contract?.id,
      siteId: queryParams?.site?.id,
      paymentTerm: queryParams?.paymentTerm?.value,
      invoiceDate: formatIsoDateToMmDdYyyy(dayjs(queryParams?.invoiceDate)),
      dueDate: formatIsoDateToMmDdYyyy(dayjs(DueDate)),
      periodEnd: formatIsoDateToMmDdYyyy(dayjs(queryParams?.periodEnd)),
      periodStart: formatIsoDateToMmDdYyyy(dayjs(queryParams?.periodStart)),
      lineItems: [...lineItems, ...(deletedLineItems.length ? deletedLineItems : [])],
      poNumber: queryParams?.poNumber,
      invoiceMemo: queryParams?.invoiceMemo,
      isRefund: !!queryParams?.isRefund,
      originalInvoiceNumber: queryParams?.isRefund
        ? queryParams?.originalInvoiceNumber || null
        : null,
      originalInvoiceCreateDate: queryParams?.isRefund
        ? queryParams?.originalInvoiceCreateDate
          ? formatIsoDateToMmDdYyyy(dayjs(queryParams?.originalInvoiceCreateDate))
          : null
        : null,
    };
    try {
      const response = await createNewInvoice(payload);
      if (response.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setSelectedInvoice(null);
        setShowDrawer(false);
        refetchData();
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
  const handleSubmit = async () => {
    const isRefund = !!queryParams?.isRefund;
    const formData = {
      lineItems,
      isRefund,
      originalInvoiceNumber: isRefund ? (queryParams?.originalInvoiceNumber ?? null) : null,
      originalInvoiceCreateDate: isRefund ? (queryParams?.originalInvoiceCreateDate ?? null) : null,
    };
    if (!selectedInvoice) {
      formData['contract'] = queryParams?.contract?.id || null;
      formData['site'] = queryParams?.site?.id || null;
      formData['invoiceDate'] = queryParams?.invoiceDate;
      formData['paymentTerm'] = queryParams?.paymentTerm?.value || null;
      formData['periodEnd'] = queryParams?.periodEnd;
      formData['periodStart'] = queryParams?.periodStart;
      formData['invoiceMemo'] = queryParams?.invoiceMemo;
    } else {
      formData['paymentTerm'] = queryParams?.paymentTerm?.value || null;
    }
    const errors = await joiValidate(formData, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }
    if (!selectedInvoice) {
      const newErrorMessages = datesValidation();
      if (newErrorMessages && Object.keys(newErrorMessages).length) {
        setErrorMessages(newErrorMessages);
        setLoading(false);
        return;
      }
    }
    if (!selectedInvoice) handleCreateInvoice();
    else {
      let dueDateCount = PaymentTerms(t).find(
        (term) => term.value === queryParams?.paymentTerm?.value,
      );
      const DueDate = dayjs(dayjs(queryParams?.invoiceDate), 'MM/DD/YYYY').add(
        dueDateCount?.dueDays,
        'day',
      );
      try {
        setLoading(true);
        const payload = {
          lineItems: [...lineItems, ...(deletedLineItems.length ? deletedLineItems : [])],
          paymentTerm: formData.paymentTerm,
          invoiceDate: formatIsoDateToMmDdYyyy(dayjs(queryParams?.invoiceDate)),
          dueDate: formatIsoDateToMmDdYyyy(DueDate),
          poNumber: queryParams?.poNumber,
          invoiceMemo: queryParams?.invoiceMemo,
          periodEnd: formatIsoDateToMmDdYyyy(dayjs(queryParams?.periodDateRange?.[1])),
          periodStart: formatIsoDateToMmDdYyyy(dayjs(queryParams?.periodDateRange?.[0])),
        };
        const response = await updateInvoice(selectedInvoice, payload);
        if (response.statusCode === 200) {
          toaster.success({
            text: response?.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }
        setLoading(false);
        setSelectedInvoice(null);
        setShowDrawer(false);
        refetchData();
      } catch (error) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } finally {
        setLoading(false);
      }
    }
  };
  const datesValidation = () => {
    const newErrorMessages = {};
    const today = dayjs();
    if (dayjs(queryParams?.periodEnd).isBefore(dayjs(queryParams?.periodStart))) {
      newErrorMessages['periodEnd'] = t('obx.invoice.periodEndError');
      newErrorMessages['periodStart'] = t('obx.invoice.periodStartError');
    }
    //Removed validation for now
    // if (dayjs(queryParams?.invoiceDate).startOf('day').isBefore(today.startOf('day'))) {
    //   newErrorMessages['invoiceDate'] = t('obx.invoice.invoiceDateError');
    // }
    if (dayjs(queryParams?.dueDate).startOf('day').isBefore(today.startOf('day'))) {
      newErrorMessages['dueDate'] = t('obx.invoice.dueDateError');
    }
    return newErrorMessages;
  };
  const fetchInvoice = async () => {
    try {
      const response = await getInvoice(selectedInvoice);
      if (response.statusCode === 200) {
        setInvoiceSitesContracts((prev) => ({
          ...prev,
          billTo: response?.data?.invoice?.billTo,
        }));
        setExistingInvoice((prev) => ({
          ...prev,
          ...response?.data?.invoice,
          oldLineItems: response?.data?.invoice?.lineItems,
          // contractDetails: response?.data?.invoice?.contractDetails,
          // billingDetails: response?.data?.invoice?.billingDetails,
          // invoiceNumber: response?.data?.invoice?.invoiceNumber,
          // poNumber: response?.data?.invoice?.poNumber,
        }));
        _setQueryParams((prev) => {
          const paymentTermValue = response?.data?.invoice?.billingDetails?.paymentTerm;
          const matchedPaymentTerm = PaymentTerms(t).find(
            (term) => term.value === paymentTermValue,
          );

          return {
            ...prev,
            isRefund: response?.data?.invoice?.isRefund,
            originalInvoiceNumber: response?.data?.invoice?.originalInvoiceNumber,
            originalInvoiceCreateDate: response?.data?.invoice?.originalInvoiceCreateDate,
            poNumber: response?.data?.invoice?.poNumber,
            invoiceDate: response?.data?.invoice?.billingDetails?.invoiceGenerated,
            invoiceMemo: response?.data?.invoice?.invoiceMemo,
            paymentTerm: paymentTermValue
              ? {
                  value: paymentTermValue,
                  label: matchedPaymentTerm?.label || paymentTermValue,
                }
              : {},
            periodDateRange: [
              response?.data?.invoice?.billingDetails?.invoiceDurationStart,
              response?.data?.invoice?.billingDetails?.invoiceDurationEnd,
            ],
          };
        });
        const updatedLineItems = response?.data?.invoice?.lineItems?.map((item, index) => {
          item['index'] = index;
          item['quantity'] =
            item['quantity'] == null
              ? item['quantity']
              : truncateToDecimalPlaces(item['quantity'], 2);
          item['price'] =
            item['price'] == null ? item['price'] : truncateToDecimalPlaces(item['price'], 2);
          item['_destroy'] = false;
          return item;
        });
        setLineItems(updatedLineItems);
        setDiscount(response?.data?.invoice?.discount || 0);
        setTaxAmount(response?.data?.invoice?.taxAmount || 0);
        setLoadingInvoice(false);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setShowDrawer(false);
    }
  };

  const fetchSageLineItems = async (dates) => {
    const apiController = getNewApiController();

    try {
      setLineItemsLoading(true);
      const startAndEndWithDayStartAndDayEnd = appendDefaultStartAndEndTimeWithDates(dates);

      const payload = {
        startTime: startAndEndWithDayStartAndDayEnd?.[0]
          ? startAndEndWithDayStartAndDayEnd[0]
          : null,
        endTime: startAndEndWithDayStartAndDayEnd?.[1] ? startAndEndWithDayStartAndDayEnd[1] : null,
      };
      const response = await getSageItemsWitParamsDropdown(selectedInvoice, payload, {
        signal: apiController.signal,
      });

      if (response && response?.statusCode === 200) {
        const updatedLineItems = response?.data?.lineItems?.map((item, index) => {
          item['index'] = index;
          item['_destroy'] = false;
          item['total'] = item?.total_price;
          item['sageItem'] = {
            label: item?.name,
            value: item?.sage_item_id,
          };
          return item;
        });

        const updatedDeletedLineItem = existingInvoice?.oldLineItems?.map((item) => {
          return {
            ...item,
            _destroy: true,
          };
        });

        setDeletedLineItems(updatedDeletedLineItem);
        setLineItems(updatedLineItems);

        setLineItemsLoading(false);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLineItemsLoading(false);
      }
    }
  };

  const downloadPdf = async () => {
    try {
      setDownloading(true);
      const response = await downloadEUInvoicePDF(selectedInvoice, {
        responseType: 'blob',
      });

      const url = URL.createObjectURL(response);

      downloadLocalPDf(url);
      setDownloading(false);
    } catch (error) {
      setDownloading(false);
      console.error('Error downloading PDF:', error);
    }
  };
  const downloadLocalPDf = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedInvoice}_${dayjs().unix()}.pdf`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (selectedInvoice) fetchInvoice();
    else fetchFranchiseSites();
  }, []);
  useEffect(() => {
    if (queryParams?.site?.id) fetchFranchiseSiteContracts();
  }, [queryParams?.site]);

  const renderBillingDetails = (key) => {
    const noSiteSelected = isObjectEmpty(queryParams?.site) && !selectedInvoice;
    const noBillingDetails = selectedInvoice && isObjectEmpty(existingInvoice?.billingDetails);
    const loadingDetails = detailsLoading?.billTo && !selectedInvoice;
    const billToAvailable = selectedInvoice && !isObjectEmpty(invoiceSitesContracts?.billTo);
    if (noSiteSelected && billToAvailable) {
      return NA;
    } else if (loadingDetails || noBillingDetails) {
      return <Skeleton className={classes.textSkeleton} />;
    } else {
      return key;
    }
  };

  const invoiceBillingDetails = (key) => {
    return t(`obx.invoice.billingFrom.${franchiseCountryShortCode}.${key}`);
  };

  return (
    <>
      {loading && <LoaderComponent />}
      <Box className={classes.drawerWrapper}>
        <Box className={classes.headerArea}>
          <img src={tenantInfo?.images?.logo1} className={classes.signalLogo} />
          <Box className={classes.headerWrapper}>
            <Box className={classes.headerCol}>
              <Box className={classes.titleTop}>
                <Typography variant="subtitle1"> {t('obx.invoice.billFrom')}</Typography>
                {(franchiseCountryShortCode === 'us' || franchiseCountryShortCode === 'ca') && (
                  <Typography variant="subtitle1">
                    {invoiceInfo?.companyName ?? invoiceBillingDetails('title')}
                  </Typography>
                )}
              </Box>
              <Box>
                <>
                  {(franchiseCountryShortCode === 'us' || franchiseCountryShortCode === 'ca') && (
                    <>
                      <Typography variant="body2">
                        {invoiceInfo?.postalAddress || invoiceBillingDetails('address1')}
                      </Typography>
                      <Typography variant="body2">
                        {invoiceInfo?.address || invoiceBillingDetails('address2')}
                      </Typography>
                    </>
                  )}
                  <Typography variant="body2" className={classes.textFlex}>
                    <Box>{t('obx.invoice.email')}</Box>
                    {invoiceInfo?.email || NA}
                  </Typography>
                </>
              </Box>
            </Box>
            <Box className={classes.headerCol}>
              <Box className={classes.titleTop}>
                <Typography variant="subtitle1"> {t('obx.invoice.billTo')}</Typography>
                <Typography variant="subtitle1">
                  {renderBillingDetails(invoiceSitesContracts?.billTo?.name)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">
                  {detailsLoading?.billTo ? (
                    <Skeleton className={classes.textSkeleton} />
                  ) : (
                    invoiceSitesContracts?.billTo?.address
                  )}
                </Typography>
                <Typography variant="body2" className={classes.textFlex}>
                  <Box>{t('obx.invoice.contactPerson')}</Box>
                  {renderBillingDetails(invoiceSitesContracts?.billTo?.contactPerson)}
                </Typography>
                <Typography variant="body2" className={classes.textFlex}>
                  <Box> {t('obx.invoice.phone')}</Box>
                  {renderBillingDetails(invoiceSitesContracts?.billTo?.phone)}
                </Typography>
                <Typography variant="body2" className={classes.textFlex}>
                  <Box>{t('obx.invoice.email')} </Box>
                  {renderBillingDetails(invoiceSitesContracts?.billTo?.email)}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.headerCol}>
              <Typography variant="subtitle1"> {t('obx.invoice.invoiceNumber')}</Typography>
              <Typography variant="body2">
                {!selectedInvoice ? (
                  NA
                ) : !existingInvoice?.invoiceNumber ? (
                  <Skeleton className={classes.textSkeleton} />
                ) : (
                  existingInvoice?.invoiceNumber
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box className={classes.contentArea}>
          {!selectedInvoice ? (
            <>
              <Box
                className={classes.fieldColms}
                style={
                  disabled
                    ? {
                        pointerEvents: 'none',
                      }
                    : null
                }
              >
                <Box className={classes.colmDataDropdown}>
                  <InputLabel htmlFor="sites">{t('obx.invoice.site')}</InputLabel>
                  {!detailsLoading?.site ? (
                    <CustomDropDown
                      label={'Sites'}
                      name="site"
                      placeHolder={`${t('obx.invoice.select')} ${t('obx.invoice.site')}`}
                      options={invoiceSitesContracts?.sites || []}
                      selectedValues={queryParams.site || []}
                      handleChange={inputChangedHandler}
                      searchable={true}
                      withTiles={false}
                      bordered
                      className={classes.dutyInformationDropdownOfficer}
                      isError={!!errorMessages?.site}
                      fetchMoreOptions={fetchFranchiseSites}
                      pagination={sitesPagination}
                      isLoading={detailsLoading?.siteDropDown}
                    />
                  ) : (
                    <Skeleton className={classes.skeletonDropdown} />
                  )}
                  {!!errorMessages?.site && (
                    <Box className={classes.invalidFeedback}>{errorMessages?.site}</Box>
                  )}
                </Box>
                <Box className={classes.colmDataDropdown}>
                  <InputLabel htmlFor="contract">{t('obx.invoice.contract')}</InputLabel>
                  {!detailsLoading?.contract ? (
                    <CustomDropDown
                      label={'contract'}
                      name="contract"
                      placeHolder={`${t('obx.invoice.select')} ${t('obx.invoice.contract')}`}
                      options={invoiceSitesContracts?.contracts || []}
                      selectedValues={queryParams.contract}
                      handleChange={inputChangedHandler}
                      searchable={false}
                      withTiles={false}
                      bordered
                      className={classes.dutyInformationDropdownOfficer}
                      isError={!!errorMessages?.contract}
                    />
                  ) : (
                    <Skeleton className={classes.skeletonDropdown} />
                  )}
                  {!!errorMessages?.contract && !errorMessages?.site && (
                    <Box className={classes.invalidFeedback}>{errorMessages?.contract}</Box>
                  )}
                  {!isObjectEmpty(invoiceSitesContracts?.sites) &&
                    !isObjectEmpty(invoiceSitesContracts?.billTo) &&
                    isObjectEmpty(invoiceSitesContracts?.contracts) && (
                      <Box className={classes.invalidFeedback}>{t('obx.invoice.noContracts')}</Box>
                    )}
                </Box>
                <Box className={classes.colmDataDropdown}>
                  <InputLabel htmlFor="contract">{t('obx.invoice.poNumber')}</InputLabel>
                  <TextField
                    name={'poNumber'}
                    id={'poNumber'}
                    fullWidth
                    placeholder={t('obx.invoice.poNumberPlaceholder')}
                    type="text"
                    value={queryParams.poNumber}
                    onChange={(e) => inputChangedHandler(e)}
                  />
                </Box>
              </Box>
              <Box
                className={classes.fieldColms}
                style={
                  disabled
                    ? {
                        pointerEvents: 'none',
                      }
                    : null
                }
              >
                <Box className={classes.colmData}>
                  <InputLabel htmlFor="invoiceDate">{t('obx.invoice.invoiceDate')}</InputLabel>
                  <ResponsiveDatePickers
                    format="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    error={!!errorMessages?.invoiceDate}
                    value={queryParams?.invoiceDate}
                    helperText={!!errorMessages?.invoiceDate && errorMessages?.invoiceDate}
                    onChange={(e) =>
                      inputChangedHandler({
                        target: { name: 'invoiceDate', value: e?.toISOString() },
                      })
                    }
                  />
                </Box>
                <Box className={classes.colmData}>
                  <InputLabel htmlFor="PaymentTerms">
                    {t('obx.sites.createSite.PaymentTerms')}
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.sites.createSite.PaymentTerms')}
                    name="paymentTerm"
                    id="paymentTerm"
                    placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.PaymentTerms')}`}
                    placeHolderClassName={classes.placeHolderColor}
                    className={classes.dropdownWrap}
                    options={transformArrayForOptions(PaymentTerms(t), 'label', 'value')}
                    selectedValues={queryParams.paymentTerm}
                    handleChange={inputChangedHandler}
                    bordered
                  />
                  {!!errorMessages?.paymentTerm && (
                    <Box className={classes.invalidFeedback}>{errorMessages?.paymentTerm}</Box>
                  )}
                </Box>
                {/* <Box className={classes.colmData}>
                  <InputLabel htmlFor="dueDate">{t('obx.invoice.dueDate')}</InputLabel>
                  <ResponsiveDatePickers
                    format="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    error={!!errorMessages?.dueDate}
                    helperText={!!errorMessages?.dueDate && errorMessages?.dueDate}
                    onChange={(e) =>
                      inputChangedHandler({ target: { name: 'dueDate', value: e?.toISOString() } })
                    }
                  />
                </Box> */}
                <Box className={classes.colmData}>
                  <InputLabel htmlFor="periodStart">{t('obx.invoice.periodStart')}</InputLabel>
                  <ResponsiveDatePickers
                    format="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    error={!!errorMessages?.periodStart}
                    value={queryParams?.periodStart}
                    helperText={!!errorMessages?.periodStart && errorMessages?.periodStart}
                    onChange={(e) =>
                      inputChangedHandler({
                        target: { name: 'periodStart', value: e?.toISOString() },
                      })
                    }
                  />
                </Box>
                <Box className={classes.colmData}>
                  <InputLabel htmlFor="periodEnd">{t('obx.invoice.periodEnd')}</InputLabel>
                  <ResponsiveDatePickers
                    format="MM/DD/YYYY"
                    placeholder="MM/DD/YYYY"
                    value={queryParams?.periodEnd}
                    error={!!errorMessages?.periodEnd}
                    helperText={!!errorMessages?.periodEnd && errorMessages?.periodEnd}
                    onChange={(e) =>
                      inputChangedHandler({
                        target: { name: 'periodEnd', value: e?.toISOString() },
                      })
                    }
                  />
                </Box>
              </Box>
              {process.env.REACT_APP_COUNTRY === COUNTRIES.EU && (
                <Box className={classes.fieldColms}>
                  <Box className={classes.colmData} display="flex" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <Checkbox checked={queryParams?.isRefund} onChange={handleIsRefundChange} />
                      <Typography variant="body2">{t('obx.invoice.correctionInvoice')}</Typography>
                    </Box>
                  </Box>
                  {queryParams?.isRefund && (
                    <>
                      <Box className={classes.colmData}>
                        <InputLabel htmlFor="originalInvoiceNumber">
                          {t('obx.invoice.originalInvoiceNumber')}
                        </InputLabel>
                        <TextField
                          name="originalInvoiceNumber"
                          id="originalInvoiceNumber"
                          fullWidth
                          placeholder={t('obx.invoice.originalInvoiceNumber')}
                          type="text"
                          value={queryParams.originalInvoiceNumber}
                          onChange={(e) =>
                            inputChangedHandler({
                              target: { name: 'originalInvoiceNumber', value: e.target.value },
                            })
                          }
                          error={!!errorMessages?.originalInvoiceNumber}
                        />
                        {!!errorMessages?.originalInvoiceNumber && (
                          <Box className={classes.invalidFeedback}>
                            {errorMessages?.originalInvoiceNumber}
                          </Box>
                        )}
                      </Box>
                      <Box className={classes.colmData}>
                        <InputLabel htmlFor="originalInvoiceCreateDate">
                          {t('obx.invoice.originalInvoiceCreateDate')}
                        </InputLabel>
                        <ResponsiveDatePickers
                          format="MM/DD/YYYY"
                          placeholder="MM/DD/YYYY"
                          value={queryParams?.originalInvoiceCreateDate}
                          error={!!errorMessages?.originalInvoiceCreateDate}
                          helperText={
                            !!errorMessages?.originalInvoiceCreateDate &&
                            errorMessages?.originalInvoiceCreateDate
                          }
                          onChange={(e) =>
                            inputChangedHandler({
                              target: {
                                name: 'originalInvoiceCreateDate',
                                value: e?.toISOString(),
                              },
                            })
                          }
                        />
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </>
          ) : (
            <>
              <Box className={classNames(classes.textFieldColms, classes.padBottom)}>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle1"> {t('obx.invoice.contractDetails')}</Typography>
                </Box>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle2"> {t('obx.invoice.siteName')}</Typography>
                  <Typography variant="body2">
                    {isObjectEmpty(existingInvoice?.contractDetails) ? (
                      <Skeleton className={classes.textSkeleton} />
                    ) : (
                      existingInvoice?.contractDetails?.siteName
                    )}
                  </Typography>
                </Box>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle2"> {t('obx.invoice.contract')}</Typography>
                  {isObjectEmpty(existingInvoice?.contractDetails) ? (
                    <Skeleton className={classes.textSkeleton} />
                  ) : (
                    <>
                      {existingInvoice?.contractDetails?.contract?.map((contractName, index) => (
                        <Chip
                          key={index}
                          sx={{
                            color: 'grey',
                            backgroundColor: 'lightgrey',
                          }}
                          label={contractName}
                          size="small"
                        />
                      ))}
                    </>
                  )}
                </Box>
              </Box>
              <Box
                className={classes.textFieldColms}
                style={
                  disabled
                    ? {
                        pointerEvents: 'none',
                      }
                    : null
                }
              >
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle1"> {t('obx.invoice.billingDetails')}</Typography>
                </Box>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle2"> {t('obx.invoice.invoiceDate')}</Typography>
                  {/* <Typography variant="body2">
                    {isObjectEmpty(existingInvoice?.billingDetails) ? (
                      <Skeleton className={classes.textSkeleton} />
                    ) : (
                      formatDayjsDateTime({
                        value: existingInvoice?.billingDetails?.invoiceGenerated,
                        formatType: dayjsFormatsEnum.date,
                        bypassFranchiseTimezone: true,
                      })
                    )}
                  </Typography> */}
                  <Box className={classes.colmData}>
                    <Box className={classes.colmDataInner}>
                      {invoiceLoading ? (
                        <Skeleton className={classes.textSkeleton} />
                      ) : (
                        <ResponsiveDatePickers
                          format="MM/DD/YYYY"
                          placeholder="MM/DD/YYYY"
                          error={!!errorMessages?.invoiceDate}
                          value={queryParams?.invoiceDate}
                          helperText={!!errorMessages?.invoiceDate && errorMessages?.invoiceDate}
                          onChange={(e) =>
                            inputChangedHandler({
                              target: { name: 'invoiceDate', value: e?.toISOString() },
                            })
                          }
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle2"> {t('obx.invoice.invoiceDuration')}</Typography>
                  <Box className={classes.colmDataInner}>
                    {isObjectEmpty(existingInvoice?.billingDetails) ? (
                      <Skeleton className={classes.textSkeleton} />
                    ) : (
                      <DateRangePicker
                        selectedDates={queryParams?.periodDateRange}
                        setDates={(dates) => {
                          inputChangedHandler({
                            target: { name: 'periodDateRange', value: dates },
                          });
                          setIsFirstLoadEdit(false);
                          if (!isFirstLoadEdit) {
                            fetchSageLineItems(dates);
                          }
                        }}
                      />
                    )}
                  </Box>
                </Box>
                <Box className={classes.colmDatas}>
                  <Typography variant="subtitle2"> {t('obx.invoice.poNumber')}</Typography>
                  <Box className={classes.colmDataInner}>
                    {invoiceLoading && !existingInvoice?.poNumber ? (
                      <Skeleton className={classes.textSkeleton} />
                    ) : (
                      <TextField
                        className={classes.lineField}
                        name={'poNumber'}
                        id={'poNumber'}
                        fullWidth
                        placeholder={t('obx.invoice.poNumberPlaceholder')}
                        type="text"
                        value={queryParams?.poNumber}
                        onChange={(e) => inputChangedHandler(e)}
                      />
                    )}
                  </Box>
                </Box>
                <Box className={classes.colmDatasForm}>
                  <Typography variant="subtitle2">
                    {t('obx.sites.createSite.PaymentTerms')}
                  </Typography>
                  <Box className={classes.paymentDropdown}>
                    <CustomDropDown
                      label={t('obx.sites.createSite.PaymentTerms')}
                      name="paymentTerm"
                      id="paymentTerm"
                      placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.PaymentTerms')}`}
                      placeHolderClassName={classes.placeHolderColor}
                      options={transformArrayForOptions(PaymentTerms(t), 'label', 'value')}
                      selectedValues={queryParams.paymentTerm}
                      handleChange={inputChangedHandler}
                      bordered
                    />
                    {!!errorMessages?.paymentTerm && (
                      <Box className={classes.invalidFeedback}>{errorMessages?.paymentTerm}</Box>
                    )}
                  </Box>
                </Box>
                {queryParams?.isRefund && (
                  <>
                    <Box className={classes.colmDatas}>
                      <Typography variant="subtitle2">
                        {t('obx.invoice.originalInvoiceNumber')}
                      </Typography>
                      <Box className={classes.colmDataInner}>
                        {invoiceLoading ? (
                          <Skeleton className={classes.textSkeleton} />
                        ) : (
                          <TextField
                            name="originalInvoiceNumber"
                            id="originalInvoiceNumber"
                            className={classes.lineField}
                            fullWidth
                            placeholder={t('obx.invoice.originalInvoiceNumber')}
                            type="text"
                            value={queryParams.originalInvoiceNumber}
                            onChange={(e) => inputChangedHandler(e)}
                            error={!!errorMessages?.originalInvoiceNumber}
                            helperText={
                              !!errorMessages?.originalInvoiceNumber &&
                              errorMessages?.originalInvoiceNumber
                            }
                          />
                        )}
                      </Box>
                    </Box>
                    <Box className={classes.colmDatas}>
                      <Typography variant="subtitle2">
                        {t('obx.invoice.originalInvoiceCreateDate')}
                      </Typography>
                      <Box className={classes.colmData}>
                        <Box className={classes.colmDataInner}>
                          {invoiceLoading ? (
                            <Skeleton className={classes.textSkeleton} />
                          ) : (
                            <ResponsiveDatePickers
                              format="MM/DD/YYYY"
                              placeholder="MM/DD/YYYY"
                              error={!!errorMessages?.originalInvoiceCreateDate}
                              value={queryParams?.originalInvoiceCreateDate}
                              helperText={
                                !!errorMessages?.originalInvoiceCreateDate &&
                                errorMessages?.originalInvoiceCreateDate
                              }
                              onChange={(e) =>
                                inputChangedHandler({
                                  target: {
                                    name: 'originalInvoiceCreateDate',
                                    value: e?.toISOString(),
                                  },
                                })
                              }
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </>
          )}
          <Box
            className={classes.tableWrapper}
            style={
              disabled
                ? {
                    pointerEvents: 'none',
                  }
                : null
            }
          >
            <LineItemTable
              lineItems={lineItems}
              removeLineItem={handleRemoveItem}
              handleUpdateItem={handleUpdateItem}
              errorMessages={errorMessages}
              loadingInvoice={lineItemsLoading}
              allowNegativeUnitPrice={queryParams?.isRefund}
            />
            <Button
              disableRipple
              className={classes.notesCloseBtn}
              variant="onlyText"
              startIcon={<PlusIcon />}
              onClick={handleAddItem}
              disabled={selectedInvoice && !existingInvoice?.invoiceNumber}
            >
              {t('obx.invoice.lineItem')}
            </Button>
          </Box>
          <Box className={classes.footerColms}>
            <Box
              className={classes.descriptionBox}
              style={
                disabled
                  ? {
                      pointerEvents: 'none',
                    }
                  : null
              }
            >
              <CustomInput
                className={classes.inlineTD}
                label={t('obx.invoice.invoiceMemo')}
                name="invoiceMemo"
                value={queryParams?.invoiceMemo}
                onChange={inputChangedHandler}
                multiline
                placeholder={t('obx.invoice.invoiceMemoPlaceHolder')}
                rows={4}
                inputProps={{
                  maxLength: 4000,
                }}
                error={!!errorMessages?.invoiceMemo}
              />
              {!!errorMessages?.invoiceMemo && (
                <Box className={classes.invalidFeedback}>{errorMessages?.invoiceMemo}</Box>
              )}
            </Box>
            <Box>
              <Box className={classes.inlineTD}>
                <Typography variant="subtitle2">{t('obx.invoice.lineItems')}</Typography>
                <Typography variant="subtitle1">{`${franchiseCurrency}${getTotalAmount()}`}</Typography>
              </Box>
              {isQuickbooks && (
                <Box className={classes.inlineTD}>
                  <Typography variant="subtitle2">{t('obx.invoice.discount')}</Typography>
                  <Typography variant="subtitle1">{`${franchiseCurrency}${formatTaxAndDiscountPrice(discount)}`}</Typography>
                </Box>
              )}
              <Box className={classes.inlineTD}>
                <Typography variant="subtitle2">{t('obx.invoice.taxes')}</Typography>
                <Typography variant="subtitle1">{`${franchiseCurrency}${formatTaxAndDiscountPrice(taxAmount)}`}</Typography>
              </Box>
              <Box className={classes.inlineTDTotal}>
                <Typography variant="subtitle2">{t('obx.invoice.grandTotal')}</Typography>
                <Typography variant="subtitle1">{`${franchiseCurrency}${calculateGrandAmount(getTotalAmount(), discount, taxAmount)}`}</Typography>
              </Box>
              {getTotalAmount() < 0 && !queryParams?.isRefund ? (
                <Box className={classes.inlineTDError}>
                  <Chip
                    icon={<AlertRed />}
                    color="error"
                    size="small"
                    label={t('obx.invoice.invoiceTotalQuantity')}
                  />
                </Box>
              ) : null}
            </Box>
          </Box>
        </Box>

        <Box className={classes.footerArea}>
          {selectedInvoice && isEUInstance() ? (
            <Button
              onClick={() => {
                downloadPdf();
              }}
              variant="secondaryBlue"
              disabled={downloading || invoiceLoading}
            >
              {t('buttons.downloadPDF')}
            </Button>
          ) : null}
          <Button
            variant="secondaryGrey"
            onClick={() => {
              closeDrawer();
            }}
          >
            {t('obx.invoice.cancel')}
          </Button>
          <RenderIfHasPermission name={ACL_OBX_INVOICES_CREATE}>
            {!selectedInvoice ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={loading || (getTotalAmount() < 0 && !queryParams?.isRefund)}
              >
                {t('obx.invoice.createInvoice')}
              </Button>
            ) : null}
          </RenderIfHasPermission>
          {!disabled && (
            <RenderIfHasPermission name={ACL_OBX_INVOICES_UPDATE}>
              {selectedInvoice ? (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading || (getTotalAmount() < 0 && !queryParams?.isRefund)}
                >
                  {t('obx.invoice.save')}
                </Button>
              ) : null}
            </RenderIfHasPermission>
          )}
        </Box>
      </Box>
    </>
  );
};
InvoiceDrawer.propTypes = {
  setShowDrawer: PropTypes.func,
  data: PropTypes.object,
  selectedInvoice: PropTypes.number,
  setSelectedInvoice: PropTypes.func,
  refetchData: PropTypes.func,
  disabled: PropTypes.bool,
  isQuickbooks: PropTypes.bool,
};
InvoiceDrawer.defaultProps = {
  setShowDrawer: () => {},
  data: {},
  selectedInvoice: 0,
  setSelectedInvoice: () => {},
  refetchData: () => {},
  disabled: false,
  isQuickbooks: false,
};
export default InvoiceDrawer;
