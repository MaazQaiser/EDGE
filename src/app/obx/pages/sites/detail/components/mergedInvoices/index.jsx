import {
  Box,
  Button,
  Skeleton,
  TableCell,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { ReactComponent as DeleteIcon } from 'assets/svg/delete-modal.svg?react';
import { ReactComponent as NoRecord } from 'assets/svg/noMergeFound.svg?react';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { ReactComponent as DustinBinIcon } from 'src/assets/svg/DustinBinIcon.svg?react';
import { deleteMergeInvoice, getContractSets } from 'src/services/invoice.services';
import { frequencyBillingEnum, paginationOptions, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import MergeInvoiceModel from './components/mergeInvoicesModal';
import { useStyles } from './MergedInvoices';

const i18ColumnName = (t) => {
  return [
    {
      id: 'srNo',
      label: `${t('obx.billing.srNo')}`,
    },
    {
      id: 'contractNames',
      label: `${t('obx.billing.contractNames')}`,
    },
    {
      id: 'billingFrequency',
      label: `${t('obx.billing.billingFrequency')}`,
    },
    {
      id: 'cycleReferenceDate',
      label: `${t('obx.billing.cycleReferenceDate')}`,
    },
    {
      id: 'dateTimeOfAction',
      label: `${t('obx.billing.dateTimeOfAction')}`,
    },
    {
      id: 'deleteInvoice',
      label: ``,
    },
  ];
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
};
const order = {
  orderBy: 'id',
  orderType: 'asc',
};
const columnIdsEnum = {
  srNo: 'srNo',
  billingFrequency: 'billingFrequency',
  dateTimeOfAction: 'dateTimeOfAction',
  contractNames: 'contractNames',
  deleteInvoice: 'deleteInvoice',
};

const MergedInvoices = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const NA = t('commonText.nA');
  const [mergeInvoiceModel, setMergeInvoiceModel] = useState(false);
  // const [totalRows, _setTotalRows] = useState(0);
  const [_queryParams, setQueryParams] = useState(params);
  const [isLoadingcontractSets, setLoadingcontractSets] = useState(true);
  const [contractSets, setcontractSets] = useState([]);
  const [_deleteMergeInvoiceLoading, setDeleteMergeInvoiceLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [deleteMergeInvoiceId, setDeleteMergeInvoiceId] = useState(null);

  const columns = i18ColumnName(t);

  const { id } = useParams();

  const deleteMergeInvoiceHandler = async (mergeInvoiceId) => {
    if (!id) return;
    try {
      setDeleteMergeInvoiceLoading(true);
      await deleteMergeInvoice(mergeInvoiceId);
      setDeleteMergeInvoiceLoading(false);
      fetchContractSets();
      setDeleteMergeInvoiceId(null);
      setConfirmationModal(false);
    } catch (error) {
      if (error?.message) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setDeleteMergeInvoiceLoading(false);
      }
      setDeleteMergeInvoiceId(null);
      setConfirmationModal(false);
    }
  };

  const fetchContractSets = async () => {
    if (!id) return;
    try {
      setLoadingcontractSets(true);
      const response = await getContractSets(id);
      if (response && response?.statusCode === 200) {
        setcontractSets(response?.data?.contractSets);
      }
      setLoadingcontractSets(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchContractSets();
  }, []);

  const invoiceModelClose = () => {
    setMergeInvoiceModel(false);
  };
  const invoiceModelOpen = () => {
    setMergeInvoiceModel(true);
  };

  const _handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const _handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const renderTableCell = (row, column, index = null) => {
    if (column.id === columnIdsEnum.srNo && index !== null) {
      return <>{index + 1}</>;
    }

    if (column.id === columnIdsEnum.billingFrequency) {
      let statusClass =
        classes[frequencyBillingEnum?.[row?.billingFrequency]?.statusClass || 'commonStageColor'];
      return (
        <Box component="span" className={classNames(classes.commonStageColor, statusClass)}>
          {row[column.id]
            ?.toLowerCase()
            ?.split('_')
            ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            ?.join(' ') || NA}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.dateTimeOfAction) {
      return <>{row?.createdAt}</>;
    }

    if (column.id === columnIdsEnum.contractNames) {
      return (
        <Box>
          {row?.[column.id].map((name, contractNameIndex) => (
            <p className={classes.contractNames} key={contractNameIndex}>
              {name}
            </p>
          ))}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.deleteInvoice) {
      return (
        <Box>
          <Button
            disableRipple
            variant="text"
            startIcon={<DustinBinIcon />}
            onClick={() => {
              setConfirmationModal(true);
              setDeleteMergeInvoiceId(row.id);
            }}
            // onClick={() => deleteMergeInvoiceHandler(row.id)}
          />
        </Box>
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
            <TableCell
              className={column.className}
              key={column.id}
              sortDirection={sortDirection(column)}
            >
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
    return isLoadingcontractSets ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.map((row, index) => (
          <TableRow key={row.id}>
            {columns.map((column) => {
              const showHandCursor = column.id === columnIdsEnum.name ? 'pointer' : '';
              return (
                <TableCell
                  key={column.id}
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

  return (
    <Box className={classes.siteWrapper}>
      {isLoadingcontractSets ? (
        <Box className={classes.languageModalSkeletonWrapper}>
          <Skeleton variant="rectangular" height={50} className={classes.languageModalSkeleton} />
          <Skeleton variant="rectangular" height={50} className={classes.languageModalSkeleton} />
          <Skeleton variant="rectangular" height={50} className={classes.languageModalSkeleton} />
          <Skeleton variant="rectangular" height={50} className={classes.languageModalSkeleton} />
        </Box>
      ) : !contractSets.length ? (
        <Box className={classes.createInstructionWrapper}>
          <NoRecord />
          <Box className={classes.siteWrapperText}>
            <Typography variant="h2"> {t('obx.billing.noMergedInvoices')}</Typography>
            <Typography variant="body2" className={classes.greytextColor}>
              {t('obx.billing.noMergedInvoicesText')}
            </Typography>
          </Box>

          <Button onClick={invoiceModelOpen} variant="primary">
            {t('obx.billing.mergeInvoices')}
          </Button>
        </Box>
      ) : (
        <>
          <Box className={classes.topBarArea}>
            <Box className={classes.topText}>
              <Typography variant="h4">{`${t('obx.billing.mergeInvoices')}`}</Typography>
              <Typography variant="body3">{`${t('obx.billing.mergedInvoicesText')}`}</Typography>
            </Box>
            <Box>
              <Button onClick={invoiceModelOpen} variant="primary" type="button">
                {t('obx.billing.mergeInvoices')}
              </Button>
            </Box>
          </Box>
          <Box className={classes.tableWrapper}>
            <TableComponent
              data={contractSets || []}
              columns={columns}
              tableHead={tableHead}
              tableBody={tableBody}
              pagination={false}
              // page={queryParams.page - 1}
              // rowsPerPage={queryParams.perPage}
              // totalRecords={totalRows}
              // handleChangePage={handleChangePage}
              // applySorting={applySorting}
              // rowsPerPageOptions={paginationOptions.perPageOptions}
              // onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Box>
        </>
      )}
      {mergeInvoiceModel && (
        <MergeInvoiceModel
          open={mergeInvoiceModel}
          handleClose={invoiceModelClose}
          refetchData={fetchContractSets}
        />
      )}

      <SweetAlertModal
        type="warning"
        title={t('obx.billing.invoiceDeleteTitle')}
        text={t('obx.billing.invoiceDeleteDesc')}
        cancelButtonText={t('links.cancel')}
        confirmButtonText={t('obx.billing.mergeInviceDeleteButtonConfirm')}
        show={!!confirmationModal}
        handleConfirmButton={() => deleteMergeInvoiceHandler(deleteMergeInvoiceId)}
        handleCancelButton={() => setConfirmationModal(null)}
        icon={<DeleteIcon />}
      />
    </Box>
  );
};

export default MergedInvoices;
