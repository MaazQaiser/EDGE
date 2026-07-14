import { Box, Button, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import { MoreVert } from 'assets/svg';
import { EditIcon } from 'assets/svg';
import { TrashIcon } from 'assets/svg';
import { ReactComponent as PlusIcon } from 'assets/svg/Whiteplus.svg?react';
import CustomDropDown from 'commonComponents/customDropDown';
import PopoverButton from 'commonComponents/popoverButton';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import TableComponent from 'commonComponents/table';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteSiteLocation, getSiteLocations } from 'services/sites.services';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import LocationsUpdate from 'src/app/obx/pages/sites/detail/components/locations/update';
import {
  ACL_OBX_SITE_LOCATIONS_CREATE,
  ACL_OBX_SITE_LOCATIONS_DELETE,
  ACL_OBX_SITE_LOCATIONS_EDIT,
} from 'src/app/router/constant/OBXMODULE';
import { ReactComponent as DeleteIcon } from 'src/assets/svg/delete-modal.svg?react';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './locationsStyls';

const i18ColumnName = (t) => {
  return [
    {
      id: 'id',
      label: `${t('obx.locations.tables.listing.columns.id')}`,
      sortable: false,
    },
    {
      id: 'name',
      label: `${t('obx.locations.tables.listing.columns.name')}`,
      sortable: false,
    },
    {
      id: 'geoLocation',
      label: `${t('obx.locations.tables.listing.columns.coordinates')}`,
      sortable: false,
    },
    {
      id: 'actions',
      label: '',
    },
  ];
};

const locationsFilter = [
  { value: 'all', label: 'All' },
  { value: 'withGeoLocation', label: 'With Geo-Location' },
  { value: 'withOutGeoLocation', label: 'Without Geo-Location' },
];

const columnIdsEnum = {
  actions: 'actions',
  geoLocation: 'geoLocation',
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  locationType: {},
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const Locations = ({ id }) => {
  const { t } = useTranslation();

  const NA = t('commonText.nA');
  const classes = useStyles();
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [totalRows, setTotalRows] = useState(0);

  const [queryParams, setQueryParams] = useState(params);

  const [orderState, setOrderState] = useState(order);

  const [show, setShow] = useState(false);

  const [locationId, setLocationId] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const columns = i18ColumnName(t);

  const toggleEditModel = (id) => {
    setLocationId(id);
    setShow((a) => !a);
  };

  const fetchSiteLocations = async () => {
    try {
      setLoading(true);

      const params = {
        ...queryParams,
        locationType: queryParams?.locationType?.value || '',
      };

      const response = await getSiteLocations(id, params);

      if (response?.statusCode === 200) {
        setData(response?.data?.locations);
        setTotalRows(response?.data?.pagination?.totalCount);
      }

      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const onChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: event.target.value,
    }));
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
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

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };

  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState?.orderType);
  };

  const toggleDeleteModal = (id) => {
    setLocationId(id || null);
    setShowDeleteModal((a) => !a);
  };

  const deleteLocation = async () => {
    try {
      setLoading(true);
      const response = await deleteSiteLocation(locationId);

      if (response?.statusCode === 200) {
        fetchSiteLocations();

        const removeData = data.filter((a) => a.id != locationId);
        setData(removeData);
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const editLocation = (id) => {
    toggleEditModel(id);
  };
  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns?.map((column) => (
            <TableCell key={column?.id} sortDirection={sortDirection(column)}>
              {column?.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column?.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column?.id)}
                >
                  {column?.label}
                </TableSortLabel>
              ) : (
                `${column?.label}`
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
        {data?.map((row) => (
          <TableRow key={row?.id}>
            {columns?.map((column) => (
              <TableCell key={column?.id}>{renderTableCell(row, column)}</TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };
  const renderTableCell = (row, column) => {
    if (column?.id === columnIdsEnum?.actions) {
      if (
        userHasPermission(ACL_OBX_SITE_LOCATIONS_EDIT) ||
        userHasPermission(ACL_OBX_SITE_LOCATIONS_DELETE)
      ) {
        return (
          <>
            <PopoverButton
              className={classes.templateActions}
              label="icon"
              variant="icon"
              Icon={MoreVert}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <Box className={classes.templateActionsMenu}>
                <RenderIfHasPermission name={ACL_OBX_SITE_LOCATIONS_EDIT}>
                  <Box
                    onClick={() => {
                      editLocation(row?.id);
                    }}
                    className={classes.templateActionsRegular}
                  >
                    <EditIcon className={classes.templateActionsIconRegular} />
                    <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
                      {t('links.edit')}
                    </Typography>
                  </Box>
                </RenderIfHasPermission>
                <RenderIfHasPermission name={ACL_OBX_SITE_LOCATIONS_DELETE}>
                  <Box
                    onClick={() => {
                      toggleDeleteModal(row?.id);
                    }}
                    className={classes.templateActionsDelete}
                  >
                    <TrashIcon className={classes.templateActionsIconDelete} />
                    <Typography className={classes.templateActionsTextDelete} variant="subtitle2">
                      {t('links.delete')}
                    </Typography>
                  </Box>
                </RenderIfHasPermission>
              </Box>
            </PopoverButton>
          </>
        );
      }
    }

    if (column.id === columnIdsEnum.geoLocation) {
      return <>{row[column?.id]?.lat ? row[column?.id]?.lat + ',' + row[column?.id]?.lng : NA}</>;
    }

    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  useEffect(() => {
    if (id) fetchSiteLocations(queryParams);
  }, [queryParams, id]);

  return (
    <Box className={classes.locationWrapper}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.searchSection}>
          <SearchComponentWithQuery
            name="search"
            placeHolder={`${t('form.input.textField.search.placeHolder')}`}
            value={queryParams?.search}
            onSearch={inputChangedHandler}
          />

          <CustomDropDown
            label={t('obx.sites.filters.locations.all')}
            name="locationType"
            options={locationsFilter}
            selectedValues={queryParams?.locationType}
            handleChange={inputChangedHandler}
          />
        </Box>

        <RenderIfHasPermission name={ACL_OBX_SITE_LOCATIONS_CREATE}>
          <Button
            className={classes.generalButton}
            onClick={() => {
              toggleEditModel(null);
            }}
            variant="primary"
            startIcon={<PlusIcon />}
          >
            {t('obx.locations.createLocation')}
          </Button>
        </RenderIfHasPermission>
      </Box>
      <Box className={classes.tableWrapper}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={onChangeRowsPerPage}
          rowsPerPage={queryParams.perPage}
        />
      </Box>

      {show && (
        <LocationsUpdate
          handleClose={toggleEditModel}
          open={show}
          id={id}
          locationId={locationId}
          refreshData={fetchSiteLocations}
        />
      )}
      {showDeleteModal && (
        <SweetAlertModal
          type="warning" // 'success', 'error', 'warning', 'info', etc.
          title={t('commonText.modal.areYouSure.title')}
          text={t('commonText.modal.areYouSure.desc')}
          cancelButtonText={t('buttons.no')}
          confirmButtonText={t('buttons.yes')}
          show={showDeleteModal}
          handleConfirmButton={deleteLocation}
          handleCancelButton={toggleDeleteModal}
          icon={<DeleteIcon />}
        />
      )}
    </Box>
  );
};

Locations.propTypes = {
  id: PropTypes.number,
};

export default Locations;
