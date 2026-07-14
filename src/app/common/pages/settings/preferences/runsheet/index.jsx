import { Avatar, Box, Button, TableCell, TableRow, Typography } from '@mui/material';
import { MoreVert } from 'assets/svg';
import { ReactComponent as Dustbin } from 'assets/svg/DeleteIconBin.svg?react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';
import PopoverButton from 'src/app/components/common/popoverButton';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
// import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { DeleteAlterIcon } from 'src/assets/svg';
// import { ReactComponent as PlusIcon } from 'src/assets/svg/plus.svg';
import { useApiControllers } from 'src/helper/axios';
import { getErrorKey, removeKey } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import useFormHook from 'src/hooks/useFormHook';
import { deleteSupervisor, getSupervisorsList } from 'src/services/runsheet.services';
import { fetchSettingsPreferences, updateSettings } from 'src/services/settings.services';
import { dayjsFormatsEnum, defaultImage, toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import AddSupervisorModal from './components';
import VisitRows from './components/visitRows';
import { useStyles } from './runsheetStyle';

const _i18ColumnName = (t) => {
  return [
    {
      id: 'name',
      label: `${t('obx.settings.preferences.runsheetSettings.supervisorName')}`,
      sortable: false,
    },
    {
      id: 'addedOn',
      label: `${t('obx.settings.preferences.runsheetSettings.addedOn')}`,
      sortable: false,
    },

    {
      id: 'action',
      label: `${t('obx.settings.preferences.runsheetSettings.action')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  action: 'action',
  name: 'name',
  addedOn: 'addedOn',
  image: 'image',
};

const InvoiceSettings = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();
  const { getLabel } = useTenantLabel();

  // const columns = i18ColumnName(t);
  const NA = t('commonText.nA');
  // const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSupervisor, setLoadingSupervisor] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const { getNewApiController } = useApiControllers();
  const [officerModal, setOfficerModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState({});

  const { formData, setFormData, updateFormHandler, errorMessages, setErrorMessages } = useFormHook(
    {
      defaultFormData: {
        visitConfigurations: [],
      },
    },
  );

  const fetchRunsheetSupervisors = async () => {
    const apiController = getNewApiController();
    setLoadingSupervisor(true);
    try {
      const response = await getSupervisorsList();

      if (response && response?.statusCode === 200) {
        setData(response?.data?.runsheetSupervisors);
      }
      setLoadingSupervisor(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoadingSupervisor(false);
      }
    }
  };

  const mapPayloadForRunSheet = () => {
    let preferences = [];

    formData?.visitConfigurations?.map((a) => {
      preferences = [
        ...preferences,
        {
          id: a.id,
          timeValue: a.timeValue,
        },
      ];
    });

    return preferences;
  };

  const updateRunSheet = async () => {
    try {
      const validatePayload = {
        visitConfigurations: formData?.visitConfigurations,
      };

      const errors = await formValidatorJoi(validatePayload, t);

      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }

      setLoading(true);
      setErrorMessages({});
      const payLoad = {
        preferences: mapPayloadForRunSheet(),
      };

      const response = await updateSettings(payLoad);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
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

  const handleValueChange = (event, index, key) => {
    const { name, value } = event.target;

    const formDataRunSheet = formData?.[name];
    formDataRunSheet[index] = {
      ...formDataRunSheet[index],
      [key]: value,
    };

    const errorKey = getErrorKey(key, name, index);
    setErrorMessages((prev) => removeKey([errorKey], prev));
    updateFormHandler(name, formDataRunSheet);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetchSettingsPreferences();
      if (response.statusCode === 200) {
        const data = response?.data?.preferences;
        setFormData({
          visitConfigurations: data?.visitConfigurations,
        });

        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    fetchRunsheetSupervisors();
    fetchSettings();
  }, []);

  const _tableBody = (data, columns) => {
    return loadingSupervisor ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.length > 0 &&
          data.map((row, index) => (
            <TableRow key={row.id}>
              {columns.map((column) => {
                return <TableCell key={column.id}>{renderTableCell(row, column, index)}</TableCell>;
              })}
            </TableRow>
          ))}
      </>
    );
  };

  const showAlert = (r) => {
    setOfficerModal(true);
    setSelectedOfficer(r);
  };

  const handleAlertCancel = () => {
    setOfficerModal(false);
    setSelectedOfficer({});
  };

  const _handleCreateLineItem = () => {
    setOpenModal(true);
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.name) {
      return (
        <Box className={classes.supervisorName}>
          <Avatar className={classes.supervisorAvatar} src={row.image || defaultImage} />
          {capitalizeFirstLetter(row[column.id]) || NA}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.addedOn) {
      return (
        <>
          {row[column.id]
            ? formatDayjsDateTime({
                value: row[column.id],
                formatType: dayjsFormatsEnum.dateTime,
              })
            : NA}
        </>
      );
    }

    if (column.id === columnIdsEnum.action) {
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
            </Box>
          </PopoverButton>
        </>
      );
    }

    return <>{row[column.id] || NA}</>;
  };

  const handleDeleteOfficer = async () => {
    try {
      setOfficerModal(false);
      const response = await deleteSupervisor(selectedOfficer?.id);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        fetchRunsheetSupervisors();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setOfficerModal(false);
    } finally {
      setOfficerModal(false);

      setSelectedOfficer({});
    }
  };

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <>
        <Box className={classes.invoiceSettingsWrapper}>
          {/* <Box className={classes.invoiceSettings}>
            <Box className={classes.invoiceSettingsHeader}>
              <Typography variant="h4" className={classes.invoiceSettingsTitle}>
                {t('obx.settings.preferences.runsheetSettings.runsheetHeading')}
              </Typography>
              <Typography variant="body2" className={classes.invoiceSettingsText}>
                {t('obx.settings.preferences.runsheetSettings.runsheetDesc')}
              </Typography>
            </Box>
            <Box className={classes.invoiceSettingsBody}>
              <TableComponent
                data={data}
                columns={columns}
                tableBody={tableBody}
                pagination={false}
              />
            </Box>
            <Button
              disableRipple
              className={classes.notesCloseBtn}
              variant="onlyText"
              startIcon={<PlusIcon />}
              onClick={handleCreateLineItem}
            >
              {t('obx.settings.preferences.runsheetSettings.supervisor')}
            </Button>
          </Box> */}

          <Box className={classes.runsheetVisits}>
            <Box className={classes.invoiceSettings}>
              <Box className={classes.invoiceSettingsHeader}>
                <Typography variant="h4" className={classes.invoiceSettingsTitle}>
                  {t('obx.settings.preferences.runsheetSettings.visitHeading')}
                </Typography>
                <Typography variant="body2" className={classes.invoiceSettingsText}>
                  {t('obx.settings.preferences.runsheetSettings.visitDesc', {
                    patrol: getLabel('terms', 'patrol', t)?.toLowerCase(),
                  })}
                </Typography>
              </Box>
              <Box className={classes.invoiceSettingsBody}>
                <Box className={classes.serviceHeader}>
                  <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
                    {t('obx.settings.preferences.runsheetSettings.visitEvent')}
                  </Typography>

                  <Typography variant="subtitle3" className={classes.tableCalendarHeading}>
                    {t('obx.settings.preferences.runsheetSettings.visitTime')}
                  </Typography>
                </Box>
                {formData?.visitConfigurations?.map((a, index) => {
                  return (
                    <VisitRows
                      key={index}
                      index={index}
                      data={a}
                      onValueChange={handleValueChange}
                      errors={errorMessages}
                      name="visitConfigurations"
                      valKey="timeValue"
                    />
                  );
                })}
              </Box>
              <Box className={classes.runsheetBtn}>
                <Button variant="primary" disabled={loading} onClick={() => updateRunSheet()}>
                  {t('obx.settings.preferences.runsheetSettings.save')}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
        {openModal && (
          <AddSupervisorModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            fetchSupervisors={fetchRunsheetSupervisors}
          />
        )}

        <SweetAlertModal
          type="warning"
          title={t('obx.settings.preferences.runsheetSettings.deleteTitle')}
          text={t('obx.settings.preferences.runsheetSettings.deleteText', {
            supervisor: getLabel('terms', 'supervisor', t),
            runsheets: getLabel('terms', 'runsheets', t)?.toLowerCase(),
          })}
          confirmButtonText={t('obx.settings.preferences.runsheetSettings.deleteConfirm')}
          cancelButtonText={t('obx.settings.preferences.runsheetSettings.deleteCancel')}
          show={officerModal}
          handleConfirmButton={handleDeleteOfficer}
          handleCancelButton={handleAlertCancel}
          reverseButtons={true}
          icon={<DeleteAlterIcon />}
        />
      </>
    </>
  );
};

export default InvoiceSettings;
