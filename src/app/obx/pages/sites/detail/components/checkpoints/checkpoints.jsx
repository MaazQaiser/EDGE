import { Box, Drawer, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { MoreVert } from 'assets/svg';
import { EditIcon } from 'assets/svg';
// import { TrashIcon } from 'assets/svg';
import { ReactComponent as DeleteIcon } from 'assets/svg/delete-modal.svg?react';
import { ReactComponent as PlusIcon } from 'assets/svg/Whiteplus.svg?react';
import PopoverButton from 'commonComponents/popoverButton';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import TableComponent from 'commonComponents/table';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteSiteCheckpoint, getSiteCheckpoints } from 'services/sites.services';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import {
  ACL_OBX_SITE_CHECKPOINTS_CREATE,
  ACL_OBX_SITE_CHECKPOINTS_UPDATE,
} from 'src/app/router/constant/OBXMODULE';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
// import CheckPointsUpdate from 'src/app/obx/pages/sites/detail/components/checkpoints/update';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import { KEY } from 'src/utils/constants/events/keyPressEvents';

import CheckPointsDrawer from './checkPointsDrawer';
import { useStyles } from './checkpointsStyles';

const i18ColumnName = (t) => {
  return [
    {
      id: 'checkpointType',
      label: `${t('obx.checkpoints.tables.listing.columns.type')}`,
      sortable: true,
    },
    {
      id: 'device',
      label: `${t('obx.checkpoints.tables.listing.columns.deviceName')}`,
      sortable: false,
    },
    {
      id: 'location',
      label: `${t('obx.checkpoints.tables.listing.columns.location')}`,
      sortable: false,
    },
    {
      id: 'actions',
      label: '',
    },
  ];
};

const columnIdsEnum = {
  actions: 'actions',
  device: 'device',
  location: 'location',
};
const locationDrawerTypes = {
  RIGHT: 'right',
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

const Checkpoints = ({ id }) => {
  const { t } = useTranslation();

  const NA = t('commonText.nA');
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totalRows, setTotalRows] = useState(0);

  const [queryParams, setQueryParams] = useState(params);

  const [orderState, setOrderState] = useState(order);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [checkPointId, setCheckPointId] = useState(null);

  const [currentSelectedId, setCurrentSelectedId] = useState(null);

  const columns = i18ColumnName(t);

  const [convertState, setConvertState] = useState({
    right: false,
  });
  const toggleDrawerConvert = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setConvertState({ ...convertState, [anchor]: open });
  };
  const assignCloseDrawer = (anchor) => {
    setConvertState({ ...convertState, [anchor]: false });
    setCheckPointId(null);
  };

  const fetchCheckpoints = async (params) => {
    try {
      setLoading(true);
      const response = await getSiteCheckpoints(id, params);

      if (response?.statusCode === 200) {
        setData(response?.data?.checkpoints);
        setTotalRows(response?.data?.pagination?.totalCount);
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
    setShowDeleteModal((a) => !a);
    setCurrentSelectedId(id || null);
  };

  const deleteCheckpoint = async () => {
    try {
      setLoading(true);
      const data = await deleteSiteCheckpoint(currentSelectedId);

      if (data?.statusCode === 200) {
        toaster.success({
          text: data?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        fetchCheckpoints();
        // setData((prev) => {
        //   return prev.filter((o) => o?.id !== currentSelectedId);
        // });
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      // setLoading(false);
    }
  };

  const editCheckpoint = (id) => {
    setCheckPointId(id);
    setConvertState({ ...convertState, [locationDrawerTypes.RIGHT]: true });
  };

  const handleClose = () => {
    setCheckPointId(null);
    setConvertState({ ...convertState, [locationDrawerTypes.RIGHT]: false });
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
      return (
        <RenderIfHasPermission name={ACL_OBX_SITE_CHECKPOINTS_UPDATE}>
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
                <Box
                  onClick={() => {
                    editCheckpoint(row?.id);
                  }}
                  className={classes.templateActionsRegular}
                >
                  <EditIcon className={classes.templateActionsIconRegular} />
                  <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
                    {t('links.edit')}
                  </Typography>
                </Box>
                {/* <Box
                onClick={() => {
                  toggleDeleteModal(row?.id);
                }}
                className={classes.templateActionsDelete}
              >
                <TrashIcon className={classes.templateActionsIconDelete} />
                <Typography className={classes.templateActionsTextDelete} variant="subtitle2">
                  {t('links.delete')}
                </Typography>
              </Box> */}
              </Box>
            </PopoverButton>
          </>
        </RenderIfHasPermission>
      );
    }

    if (column.id === columnIdsEnum.device) {
      return <>{row[column?.id]?.name || NA}</>;
    }

    if (column.id === columnIdsEnum.location) {
      return <>{row[column?.id]?.name || NA}</>;
    }

    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  useEffect(() => {
    if (id) fetchCheckpoints(queryParams);
  }, [id, queryParams]);

  return (
    <Box className={classes.checkPointWrapper}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <div className={classes.searchSectionDashboard}>
        <div className={classes.searchSection}>
          <SearchComponentWithQuery
            name="search"
            placeHolder={`${t('form.input.textField.search.placeHolder')}`}
            value={queryParams?.search}
            onSearch={inputChangedHandler}
          />
        </div>
        {/* <Button
          className={classes.generalButton}
          onClick={() => {
            toggleModel(null);
          }}
          variant="primary"
          startIcon={<PlusIcon />}
        >
          {t('obx.checkpoints.createCheckpoint')}
        </Button> */}
        <RenderIfHasPermission name={ACL_OBX_SITE_CHECKPOINTS_CREATE}>
          <Button
            onClick={toggleDrawerConvert('right', true)}
            className={classes.generalButton}
            variant="primary"
            startIcon={<PlusIcon />}
          >
            {t('obx.checkpoints.createCheckpoint')}
          </Button>
        </RenderIfHasPermission>
        <Drawer
          anchor={locationDrawerTypes.RIGHT}
          open={convertState[locationDrawerTypes.RIGHT]}
          onClose={handleClose}
          className={classes.checkpointHeight}
        >
          <CheckPointsDrawer
            width={600}
            anchor={locationDrawerTypes.RIGHT}
            assignCloseDrawer={assignCloseDrawer}
            id={id}
            checkPointId={checkPointId}
            refreshData={fetchCheckpoints}
          />
        </Drawer>
      </div>
      <Box className={classes.tableWrapper}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          rowsPerPage={queryParams?.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>

      {/* {show && (
        <CheckPointsUpdate
          handleClose={toggleModel}
          open={show}
          id={id}
          checkPointId={checkPointId}
          refreshData={fetchCheckpoints}
        />
      )} */}
      {showDeleteModal && (
        <SweetAlertModal
          type="warning" // 'success', 'error', 'warning', 'info', etc.
          title={t('commonText.modal.areYouSure.title')}
          text={t('commonText.modal.areYouSure.desc')}
          cancelButtonText={t('buttons.no')}
          confirmButtonText={t('buttons.yes')}
          show={showDeleteModal}
          handleConfirmButton={deleteCheckpoint}
          handleCancelButton={toggleDeleteModal}
          icon={<DeleteIcon />}
        />
      )}
    </Box>
  );
};
Checkpoints.propTypes = {
  id: PropTypes.number,
};

export default Checkpoints;
