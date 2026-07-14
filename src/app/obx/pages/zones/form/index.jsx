import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, TextField, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import InputLabel from '@mui/material/InputLabel';
import { ReactComponent as DeleteIcon } from 'assets/svg/delete-modal.svg?react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getAllSites } from 'services/sites.services';
import { getSupervisors } from 'services/user.services';
import { createZone, getZoneDetails, removeSiteFromZone, updateZone } from 'services/zone.service';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import SitesCard from 'src/app/obx/pages/zones/form/components/sitesCard';
import { ACL_OBX_ZONES_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { OBX_ZONES, OBX_ZONES_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { mapLocationInfo, removeKey } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { localStorageKeys, toastSettings } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';
import { toaster } from 'src/utils/toast';
import formValidatorJoi from 'utils/formValidator/formValidator.requiredCheck';

import ReplaceZoneModal from './components';
import { useStyles } from './formZone';

const userFormData = {
  state: '',
  name: '',
  postalCode: '',
  city: '',
  country: '',
  sameAsFranchise: false,
  zoneArea: [],
  selectedSites: [],
  sites: [],
  supervisors: [],
};
const _keys = {
  zones: 'zoneArea',
  franchise: 'franchiseArea',
};
const ZoneUpdate = () => {
  const classes = useStyles();
  localStorage.setItem(localStorageKeys, 1);
  const [formData, setFormData] = useState(userFormData);

  const [errorMessages, setErrorMessages] = useState({});
  const [supervisors, setSupervisors] = useState([]);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [siteId, setSiteId] = useState(null);
  const { getLabel } = useTenantLabel();

  const [sites, setSites] = useState([]);

  const [disabled, setDisabled] = useState(false);
  const { id: zoneId } = useParams();
  const { t } = useTranslation();
  const putRemoveSiteFromZone = async () => {
    try {
      const response = await removeSiteFromZone(siteId);
      // console.log({ response });
      // if (response?.statusCode === 204) {
      const removeSiteFromArray = formData?.sites?.filter((d) => d.id != siteId);

      updateFormHandler('sites', removeSiteFromArray);
      toaster.success({
        text: response.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setConfirmationModal(false);
      setSiteId(null);
      setTimeout(async () => {
        setDisabled(true);
        await fetchSites();
        setDisabled(false);
      });
      // }
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getSuperVisors = async () => {
    try {
      const response = await getSupervisors();

      setSupervisors(transformArrayForOptions(response, 'name', 'id', 'email'));
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getZoneDetailData = async () => {
    try {
      setDisabled(true);
      const data = await getZoneDetails(zoneId);
      if (data?.statusCode === 200) {
        const formDetails = mapLocationInfo(data?.data?.zone);

        setFormData((data) => {
          return {
            ...data,
            ...formDetails,
            zonesOptions: transformArrayForOptions(formDetails?.zonesOptions, 'name', 'id'),
            supervisors: formDetails?.supervisors
              ? transformArrayForOptions(formDetails?.supervisors, 'name', 'id', 'email')
              : [],
          };
        });
      }
      setDisabled(false);
    } catch (e) {
      setDisabled(false);
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchSites = async () => {
    const query = {
      zones: ['null'],
    };
    try {
      let response = await getAllSites(query);

      if (response && response?.statusCode === 200) {
        setSites(transformArrayForOptions(response?.data?.sites, 'name', 'id'));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    fetchSites();

    getSuperVisors();
  }, []);

  useEffect(() => {
    if (zoneId) {
      getZoneDetailData();
    }
  }, [zoneId]);

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      if (value) {
        setErrorMessages((prev) => removeKey([name], prev));
      }
      updateFormHandler(name, value);
    },
    [updateFormHandler],
  );
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ? NOTE: supervisor is must for a zone, because of the functionality of move site.
    let finalPayload = {
      name: formData?.name,
      supervisors: formData?.supervisors
        ? extractValuesByKeyFromInput(formData.supervisors, 'id')
        : null, //supervisor in Joi is a number so send id validate.
      siteIds: formData?.selectedSites?.map((a) => a.id),
    };
    let joiPayload = JSON.parse(JSON.stringify(finalPayload));

    // if (!zoneId) {
    // ? NOTE: if the variable "supervisor" is not getting used add _ before it or this rule will suffice the need here.
    // eslint-disable-next-line no-unused-vars
    // const { supervisor, ...rest } = joiPayload;
    // joiPayload = rest;
    // }
    const errors = await formValidatorJoi(joiPayload, t);

    if ((errors && Object.keys(errors).length) || errorMessages?.zoneArea) {
      setErrorMessages((prev) => ({ ...prev, ...errors, ...errorMessages }));
      setDisabled(false);
      return;
    }

    try {
      setDisabled(true);

      const res = zoneId ? await updateZone(zoneId, finalPayload) : await createZone(finalPayload);

      if (res?.statusCode === 200) {
        toaster.success({
          text: res?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        gotoDetailPage();
      } else {
        setDisabled(false);
      }
    } catch (e) {
      setDisabled(false);
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      console.error(e.message);
    }
  };

  const gotoDetailPage = () => {
    if (zoneId) {
      history.push(`${OBX_ZONES_DETAIL}/${zoneId}`);
    } else {
      history.push(`${OBX_ZONES}`);
    }
  };

  const removeFromSelectedList = (index) => {
    const data = [...formData.selectedSites];

    const removedFromList = data?.filter((_a, i) => index !== i);

    updateFormHandler('selectedSites', removedFromList);
  };

  const backButtonComponent = (
    <Button variant="tertiaryGrey" onClick={gotoDetailPage} startIcon={<ArrowBackIcon />}>
      {t('links.back')}
    </Button>
  );

  return (
    <>
      {disabled && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className={classes.mainBoxForm}
      >
        <Box className={classes.buttonGroupUpper}>
          <Box className={classes.btnBox}>{backButtonComponent}</Box>
          <Box className={classes.buttonGroup}>
            <Button variant="secondaryGrey" onClick={gotoDetailPage}>
              {t('links.cancel')}
            </Button>
            <RenderIfHasPermission name={ACL_OBX_ZONES_UPDATE}>
              <Button variant="primary" type="submit" disabled={disabled}>
                {t('obx.buttons.save')}
              </Button>
            </RenderIfHasPermission>
          </Box>
        </Box>
        <Divider className={classes.zonesDivider} />
        <Box>
          <Box className={classes.formBox}>
            <Box className={classes.flexControl}>
              <Typography variant="subtitle2" className={classes.zoneCustomText}>
                {t('obx.obxZones.labels.basicInfo')}
              </Typography>
              <Typography variant="subtitle2" className={classes.zoneDetailText}>
                {t('obx.obxZones.labels.displayedOnProfile')}
              </Typography>
            </Box>
            <Box className={classes.flexControlSecond}>
              <Box className={classes.mainFlexControl}>
                <Box className={classes.flexControl}>
                  <InputLabel htmlFor="zone-name">
                    {t('form.input.textField.zone.label')}
                    <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    id="zone-name"
                    // defaultValue={formData?.name || ''}
                    value={formData?.name || ''}
                    error={!!errorMessages?.name}
                    onChange={handleInputChange}
                    name="name"
                    variant="outlined"
                    placeholder={t('form.input.textField.zone.placeHolder')}
                    helperText={!!errorMessages?.name ? errorMessages?.name : null}
                    fullWidth
                  />
                </Box>
                <Box className={classes.flexControl}>
                  <InputLabel id="supervisor">{getLabel('roles', 'supervisor', t)}</InputLabel>
                  <CustomDropDown
                    name="supervisors"
                    id="supervisor"
                    label={t('obx.form.input.dropDown.selectSupervisor.label', {
                      supervisor: getLabel('roles', 'supervisor', t),
                    })}
                    options={supervisors || []}
                    selectedValues={formData?.supervisors}
                    handleChange={handleInputChange}
                    searchable
                    bordered
                    className={classes.zoneSitesDropDown}
                    placeHolderClassName={classes.placeHolderText}
                    isError={errorMessages?.supervisor}
                    fullWidth
                    multiSelect={true}
                    withTiles
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          <Divider className={classes.zonesDivider} />
        </Box>
        {/* Second Row */}

        <Box className={classes.formBoxGrid}>
          <Box className={classes.flexControl}>
            <Typography variant="subtitle2" className={classes.zoneCustomText}>
              {t('obx.obxZones.labels.sites')}
            </Typography>
            <Typography variant="subtitle2" className={classes.zoneDetailText}>
              {t('obx.obxZones.labels.filterSites')}
            </Typography>
          </Box>
          <Box className={classes.flexControlSecond}>
            <Box className={classes.sitesSearch}>
              {formData?.sites?.length ? (
                <Box>
                  <Typography variant="subtitle2" className={classes.assignedSitesZonesLabel}>
                    {t('obx.obxZones.labels.assignedZones', { count: formData?.sites?.length })}
                  </Typography>
                  <Box className={classes.assignedSitesZones}>
                    {formData?.sites?.map((data, i) => {
                      return (
                        <SitesCard
                          key={i}
                          setShowActionModal={setShowActionModal}
                          setSiteId={setSiteId}
                          setConfirmationModal={setConfirmationModal}
                          data={data}
                        />
                      );
                    })}
                  </Box>
                </Box>
              ) : null}
              <Box>
                <Box>
                  <InputLabel>{t('sales.locations.sites')}</InputLabel>
                  <CustomDropDown
                    label={t('obx.form.input.dropDown.selectSite.label')}
                    placeHolder={t('obx.form.input.dropDown.selectSite.label')}
                    name="selectedSites"
                    selectedValues={formData?.selectedSites}
                    options={sites}
                    handleChange={handleInputChange}
                    bordered
                    className={classes.zoneSitesDropDown}
                    multiSelect
                    checkmark
                    searchable
                  />
                </Box>
                {formData?.selectedSites.length ? (
                  <Box className={classes.unAssignedSitesZones}>
                    <Typography variant="subtitle2" className={classes.assignedSitesZonesLabel}>
                      {t('obx.obxZones.labels.unAssignedZones', {
                        count: formData?.selectedSites.length,
                      })}
                    </Typography>
                    <Box className={classes.assignedSitesZones}>
                      {formData?.selectedSites?.map((data, i) => {
                        return (
                          <SitesCard
                            key={i}
                            index={i}
                            data={data}
                            hasCross={true}
                            onClickCross={removeFromSelectedList}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                ) : null}
              </Box>
            </Box>
          </Box>
        </Box>

        <SweetAlertModal
          type="warning" // 'success', 'error', 'warning', 'info', etc.
          title={t('obx.obxZones.popUps.removeSite')}
          text={t('obx.obxZones.popUps.removeSiteDes')}
          cancelButtonText={t('links.cancel')}
          confirmButtonText={t('obx.buttons.removeSites')}
          show={confirmationModal}
          handleConfirmButton={putRemoveSiteFromZone}
          handleCancelButton={() => setConfirmationModal(false)}
          icon={<DeleteIcon />}
        />

        {siteId && (
          <ReplaceZoneModal
            showActionModal={showActionModal}
            closeActionModal={() => {
              setShowActionModal(false);
              setSiteId(null);
            }}
            siteId={siteId}
            zonesOptions={formData?.zonesOptions}
            refreshData={getZoneDetailData}
          />
        )}
      </Box>
    </>
  );
};

export default ZoneUpdate;
