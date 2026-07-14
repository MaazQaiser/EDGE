import { Box, Button, Chip, TableCell, TableRow, TableSortLabel, Typography } from '@mui/material';
import { ReactComponent as BlueAlertIcon } from 'assets/svg/BlueAlertIcon.svg?react';
import { ReactComponent as Dustbin } from 'assets/svg/Dustbin.svg?react';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg?react';
import SearchComponentWithQuery from 'commonComponents/searchWithQuery';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import TableImage from 'commonComponents/tableImage';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import {
  ACL_OBX_SITE_VISITOR_CREATE,
  ACL_OBX_SITE_VISITOR_LOAD_CREATE,
} from 'src/app/router/constant/OBXMODULE';
import { MoreVert } from 'src/assets/svg';
import { DeleteAlterIcon } from 'src/assets/svg';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import { deleteOfficer } from 'src/services/user.services';
import { getVisitorsLoadsOfficers, saveAssignOfficer } from 'src/services/visitorsLoads.service';
import {
  dayjsFormatsEnum,
  defaultImage,
  paginationOptions,
  toastSettings,
} from 'src/utils/constants';
import capitalize from 'src/utils/string/capitalize';
import { toaster } from 'src/utils/toast';

import AddOfficerModal from './components/addOfficer';
import { useStyles } from './officerStyles';

const i18ColumnName = (t, hoverIconClass, getLabel) => {
  return [
    {
      id: 'name',
      label: `${t('obx.visitors.officerName', { officer: getLabel('terms', 'officer', t) })}`,
      sortable: false,
      className: hoverIconClass,
      hasImage: false,
    },
    {
      id: 'authorizedOn',
      label: `${t('obx.visitors.authorizedOn')}`,
      sortable: false,
    },
    {
      id: 'authorizedBy',
      label: `${t('obx.visitors.authorizedBy')}`,
      sortable: false,
      className: hoverIconClass,
      hasImage: true,
    },
    {
      id: 'action',
      label: `${t('obx.visitors.tables.listing.columns.action')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  officerName: 'name',
  authorizedBy: 'authorizedBy',
  authorizedOn: 'authorizedOn',
  action: 'action',
};

const CategoryType = {
  visitors: 'visitors',
  loads: 'loads',
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  category: '',
  siteId: '',
};

const Officers = ({ siteId, officersType }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const { getNewApiController } = useApiControllers();

  const classes = useStyles();

  const NA = t('commonText.nA');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [modalButtonDisabled, setModalButtonDisabled] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState({});
  const [queryParams, setQueryParams] = useState(params);
  const [officerModal, setOfficerModal] = useState(false);
  const hoverIconClass = classes.SitesTD;
  const columns = i18ColumnName(t, hoverIconClass, getLabel);

  const { formatDayjsDateTime } = useDateTime();

  const inputChangedHandler = (event) => {
    const { value } = event.target;
    fetchOfficersVisitorLoads({ value, ...queryParams });
  };

  const fetchOfficersVisitorLoads = async ({ value, ...queryParams }) => {
    const apiController = getNewApiController();

    try {
      setLoading(true);
      let params = {
        ...queryParams,
        siteId: siteId,
        category: officersType,
      };

      if (value) {
        params.name = value;
      }

      const response = await getVisitorsLoadsOfficers(params, {
        signal: apiController.signal,
      });
      if (response?.statusCode === 200) {
        setData(response.data.officers);
        setLoading(false);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const assignOfficer = async (siteId, payload) => {
    const apiController = getNewApiController();
    try {
      setModalButtonDisabled(true);

      const response = await saveAssignOfficer(siteId, payload, {
        signal: apiController.signal,
      });

      if (response?.statusCode === 200) {
        setShowAddOfficerModal(false);
        fetchOfficersVisitorLoads(queryParams);
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } finally {
      setModalButtonDisabled(false);
    }
  };

  const showAlert = (r) => {
    setOfficerModal(true);
    setSelectedOfficer(r);
  };

  const handleAlertCancel = () => {
    setOfficerModal(false);
    setSelectedOfficer({});
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.officerName) {
      return (
        <Box className={classes.franchiseName}>
          <TableImage imageUrl={row?.images?.[0] || defaultImage} alt="" />
          <Box className={classes.franchiseNameText}>{capitalize(row[column.id]) || NA}</Box>
        </Box>
      );
    }
    if (column.id === columnIdsEnum.authorizedBy) {
      return (
        <Box className={classes.franchiseName}>
          <TableImage imageUrl={row?.images?.[0] || defaultImage} alt="" />
          <Box className={classes.franchiseNameText}>{capitalize(row[column.id]) || NA}</Box>
        </Box>
      );
    }
    if (column.id === columnIdsEnum.action) {
      return (
        <PopoverButton
          className={classes.visitorsActions}
          variant="icon"
          Icon={MoreVert}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Box
            onClick={() => {
              showAlert(row);
            }}
            className={classes.visitorsActionsDelete}
          >
            <Dustbin />
            <Typography className={classes.visitorsActionsTextDelete} variant="subtitle2">
              {t('obx.visitors.removeAccess')}
            </Typography>
          </Box>
        </PopoverButton>
      );
    }

    if (column.id === columnIdsEnum.authorizedOn) {
      return (
        <>
          {row[column.id]
            ? formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.dateTime })
            : NA}
        </>
      );
    }

    return <>{row[column.id] || NA}</>;
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns?.map((column) => (
            <TableCell key={column?.id} s>
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

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.length > 0 &&
          data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.id} className={column.className}>
                  {renderTableCell(row, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
      </>
    );
  };

  useEffect(() => {
    fetchOfficersVisitorLoads(queryParams);
  }, [siteId, officersType, queryParams]);

  const handleDeleteOfficer = async () => {
    try {
      setLoading(true);
      setOfficerModal(false);
      const response = await deleteOfficer(selectedOfficer?.id);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        if (queryParams?.page == 1) {
          fetchOfficersVisitorLoads(queryParams);
          return;
        }
        setQueryParams((prev) => ({
          ...prev,
          page: 1,
        }));
      }
    } catch (error) {
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setOfficerModal(false);
    } finally {
      setOfficerModal(false);
      setLoading(false);
      setSelectedOfficer({});
    }
  };
  return (
    <Box className={classes.visitors}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.visitorsHeader}>
        <Box className={classes.visitorsHeaderSearch}>
          <SearchComponentWithQuery
            name="search"
            placeHolder={t('obx.visitorsLoadsOfficer.searchOfficer')}
            onSearch={inputChangedHandler}
          />
        </Box>
        <Box className={classes.visitorsHeaderRight}>
          <Chip
            icon={<BlueAlertIcon />}
            color="primary"
            sx={{ textTransform: 'unset' }}
            size="small"
            label={
              officersType === CategoryType.visitors
                ? t('obx.visitorsLoadsOfficer.visitorsOfficerAlert', {
                    officers: getLabel('terms', 'officers', t),
                  })
                : t('obx.visitorsLoadsOfficer.loadsOfficerAlert', {
                    officers: getLabel('terms', 'officers', t),
                  })
            }
          />
          <RenderIfHasPermission
            name={
              officersType === CategoryType.visitors
                ? ACL_OBX_SITE_VISITOR_CREATE
                : ACL_OBX_SITE_VISITOR_LOAD_CREATE
            }
          >
            <Button
              className={classes.addBannedVisitorBtn}
              variant="primary"
              startIcon={<PlusIcon />}
              onClick={() => setShowAddOfficerModal(true)}
            >
              {t('obx.visitors.addOfficer', { officer: getLabel('terms', 'officer', t) })}
            </Button>
          </RenderIfHasPermission>
        </Box>
      </Box>
      <Box className={classes.visitorsTable}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={false}
        />
      </Box>

      {showAddOfficerModal && (
        <>
          <AddOfficerModal
            open={showAddOfficerModal}
            onClose={() => setShowAddOfficerModal(false)}
            siteId={siteId}
            category={officersType}
            assignOfficer={assignOfficer}
            modalButtonDisabled={modalButtonDisabled}
          />
        </>
      )}

      <SweetAlertModal
        type="warning"
        title={t('obx.visitorsLoadsOfficer.deleteTitle')}
        text={t('obx.visitorsLoadsOfficer.deleteText')}
        confirmButtonText={t('obx.visitorsLoadsOfficer.deleteConfirm')}
        cancelButtonText={t('obx.visitorsLoadsOfficer.cancel')}
        show={officerModal}
        handleConfirmButton={handleDeleteOfficer}
        handleCancelButton={handleAlertCancel}
        reverseButtons={true}
        icon={<DeleteAlterIcon />}
      />
    </Box>
  );
};

Officers.propTypes = {
  siteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  officersType: PropTypes.string,
};

export default Officers;
