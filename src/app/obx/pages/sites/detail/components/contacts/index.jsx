import { Box, Button, TableCell, TableRow } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import SideDrawer from 'commonComponents/sideDrawer';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getBillingContacts } from 'services/invoice.services';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table/index.jsx';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import ContactCreation from 'src/app/obx/pages/sites/detail/components/contacts/components/contactCreation';
import ViewContactDetails from 'src/app/obx/pages/sites/detail/components/contacts/components/viewContactDetails';
import { ReactComponent as DeleteContactIcon } from 'src/assets/svg/DeleteContactIcon.svg?react';
// import BillingDetails from 'src/app/obx/pages/sites/detail/components/billingDetails';
import { ReactComponent as EditBtnIcon } from 'src/assets/svg/EditBtnIcon.svg?react';
import { paginationOptions } from 'src/utils/constants/index.js';

// import ViewContactsDetails from '../viewContactsDetails/index.jsx';
import DeleteContactsModal from './components/deleteContacts/index.jsx';
import { useStyles } from './ContactsStyle.js';

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'companyName',
      label: `${t('obx.billing.companyName')}`,
      sortable: false,
      className: hoverIconClass,
    },
    {
      id: 'primaryEmail',
      label: `${t('obx.billing.primaryEmail')}`,
      sortable: false,
    },
    {
      id: 'phoneNumber',
      label: `${t('obx.billing.phoneNo')}`,
      sortable: false,
    },
    {
      id: 'action',
      label: ``,
      sortable: false,
    },
  ];
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
};

const columnIdsEnum = {
  companyName: 'companyName',
  action: 'action',
  id: 'invoiceNumber',
};

export default function Contacts({
  siteId,
  openAddBreakType,
  handleCloseAddBreakType,
  setOpenAddBreakTyp,
}) {
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(1);
  const [viewDetails, setViewDetails] = useState(false);

  const [queryParams, setQueryParams] = useState(params);
  const [contactId, setContactId] = useState(null);

  const hoverIconClass = classes.ZonesTD;

  const columns = i18ColumnName(t, hoverIconClass);

  const [showDeleteInvoiceModel, setShowDeleteInvoiceModel] = useState(false);

  const fetchBillingContacts = async () => {
    try {
      setLoading(true);
      const response = await getBillingContacts({
        siteId: siteId,
        ...queryParams,
      });
      if (response?.statusCode === 200) {
        setData(response?.data?.sageContacts);
        setTotalRows(response?.data.pagination?.totalCount || 0);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log({ e });
    }
  };

  useEffect(() => {
    fetchBillingContacts();
  }, [queryParams]);

  const handleDropDownClose = () => {
    setContactId(null);
    handleCloseAddBreakType();
    setViewDetails(false);
    setShowDeleteInvoiceModel(false);
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id}>{column.label}</TableCell>
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

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.action) {
      return (
        <Box className={classes.actionBtns}>
          <Button
            disableRipple
            className={classes.notesCloseBtn}
            variant="text"
            startIcon={<EditBtnIcon />}
            onClick={() => {
              setOpenAddBreakTyp(true);
              setContactId(row?.id);
            }}
          ></Button>

          <Button
            disableRipple
            className={classes.notesCloseBtn}
            variant="text"
            onClick={() => {
              setShowDeleteInvoiceModel(true);
              setContactId(row?.id);
            }}
            startIcon={<DeleteContactIcon />}
          ></Button>
        </Box>
      );
    }

    if (column.id === columnIdsEnum.companyName) {
      return (
        <>
          <Box
            className={classes.franchiseName}
            onClick={() => {
              setViewDetails(true);
              setContactId(row?.id);
            }}
          >
            <Box className={classes.franchiseNameText}>{row[column?.id] || NA}</Box>
            <Box className={classes.franchiseNameIcon}>
              <ChevronRight />
            </Box>
          </Box>
        </>
      );
    }

    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
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

  return (
    <Box className={classes.sitesListingContainer}>
      <Box className={classes.tableWrapper}>
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

      <DeleteContactsModal
        open={showDeleteInvoiceModel}
        onClose={handleDropDownClose}
        id={contactId}
        refreshData={() => {
          handleDropDownClose();
          setQueryParams(() => {
            return {
              ...params,
            };
          });
        }}
      />
      <SideDrawer isOpen={openAddBreakType} closeDrawer={handleDropDownClose} totalWidth={'640px'}>
        <ContactCreation
          siteId={siteId}
          handleCloseAddBreakType={handleCloseAddBreakType}
          handleClose={handleDropDownClose}
          contactId={contactId}
          refreshData={() => {
            fetchBillingContacts();
            handleDropDownClose();
          }}
        />
      </SideDrawer>

      <SideDrawer isOpen={viewDetails} closeDrawer={handleDropDownClose} totalWidth={'640px'}>
        <ViewContactDetails
          contactId={contactId}
          handleClose={handleDropDownClose}
          handleEditContact={() => {
            setViewDetails(false);
            setTimeout(() => {
              setOpenAddBreakTyp(true);
            });
          }}
        />
      </SideDrawer>
    </Box>
  );
}

Contacts.propTypes = {
  siteId: PropTypes.number,
  openAddBreakType: PropTypes.bool,
  handleCloseAddBreakType: PropTypes.func,
  setOpenAddBreakTyp: PropTypes.func,
};
