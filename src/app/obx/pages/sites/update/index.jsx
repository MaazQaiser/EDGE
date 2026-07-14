import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, InputLabel, Switch, TextField, Tooltip, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import { useJsApiLoader } from '@react-google-maps/api';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import booleanWithin from '@turf/boolean-within';
import { point as createTurfPoint, polygon as createPolygon } from '@turf/helpers';
import { ReactComponent as EmailIcon } from 'assets/images/email.svg?react';
import { ReactComponent as CautionIcon } from 'assets/svg/caution-thin.svg?react';
// import { ReactComponent as PhoneIcon } from 'assets/svg/phoneIcon.svg';
import classNames from 'classnames';
import AutoCompleteCommon from 'commonComponents/autoCompleteCommon';
import ProfileImageUpload from 'commonComponents/profileImageUpload';
import {
  actionItemTypeKeys,
  currentEnvironmentEnum,
  franchiseIdUrlQueryParam,
  geoFencingPolygonTypeKeys,
  GOOGLE_MAPS_API_VERSION,
  GOOGLE_MAPS_LIBRARIES,
  rolesEnumWithName,
  timeZoneKeyUrlQueryParam,
  toastSettings,
} from 'globalUtils/constants';
import {
  findParentAndSiblingsPolygon,
  isEUInstance,
  mapLocationInfo,
  scrollToInValidField,
} from 'helper/utilityFunctions';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { getSiteDetails, updateSite } from 'services/sites.services';
import GoogleMapSearchAddressComponent from 'src/app/components/common/googleMap/searchAddress';
import LoaderComponent from 'src/app/components/common/loader';
import PhoneNumberWithCountry from 'src/app/components/common/phoneNumberWithCountry';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { useCustomAddressHook } from 'src/app/components/hooks/customAddressHook';
import { getFranchiseIdWithRoleAndSource } from 'src/app/obx/pages/schedules/helper';
import { ACL_OBX_SITE_RATE_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { useCurrency } from 'src/hooks/useCurrency';
import { getGeoLocation } from 'src/services/franchise.services';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { disabledCountryStateCity } from 'src/utils/constants';
import { formatNumber } from 'src/utils/regexField/regexFiledForm';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import EmergencyContactsComponent from '../../../../components/common/emergencyContacts/index.jsx';
import MapComponent from '../../../../components/common/geoFencing/index';
import * as routes from '../../../../router/constant/ROUTE';
import { HO_SITES_DETAIL_ROUTE } from '../../../../router/constant/ROUTE';
import history from '../../../../router/utils/history';
import { useStyles } from './update';

const userFormData = {
  siteArea: [
    [
      { lat: 31.5048493, lng: 74.3238862 },
      { lat: 31.504851, lng: 74.3338862 },
      { lat: 31.514851, lng: 74.3538862 },
    ],
  ],
  name: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  country: 'US',
  address: '',
  address2: '',
  localWorked: '',
  state: 'Utah',
  city: 'San Fransisco',
  zipCode: '',
  postalCode: '',
  countryCode: '',
  primaryEmail: '',
  officerRate: '',
  sitePayRate: { value: '' },
  customerId: '',
  contacts: [
    {
      name: '',
      contact: '',
      email: '',
      isEmergencyContact: false,
      role: '',
    },
  ],
  image: [],
  dailySiteSummaryReceivers: [],
  incidentReportReceivers: [],
  isBreakPayable: false,
  geofencingEnabled: false,
  allowOfflineSyncing: false,
  customerPortalInvitedEmails: [],
};

const typesWithMultiComplete = [
  'dailySiteSummaryReceivers',
  'incidentReportReceivers',
  'customerPortalInvitedEmails',
];

const hasInputValue = (value) => value !== '' && value !== null && value !== undefined;

const Update = () => {
  const { t } = useTranslation();
  const { id: siteId } = useParams();
  const classes = useStyles();
  const contactRef = useRef(null);
  const location = useLocation();
  const [errorMessages, setErrorMessages] = useState({});
  const [profileImage, setImage] = useState([]);
  const [formData, setFormData] = useState(userFormData);
  const [franchiseData, setFranchiseData] = useState({});
  const [siblings, setSiblings] = useState([]);
  const [parent, setParent] = useState({});
  const [disabled, setDisabled] = useState(true);
  const [additionalData, setAdditionalData] = useState(userFormData);
  const { getLabel } = useTenantLabel();

  // Get country configuration from Redux to check country shortCode
  const countryConfiguration = useSelector((state) => state?.auth?.countryConfiguration);
  const countryShortCode = countryConfiguration?.country?.shortCode;
  const isCountryAustralia = countryShortCode === 'AU';
  const isGermanFranchise = countryShortCode === 'DE';
  const isProductionEnvironment =
    process.env.REACT_APP_NODE_ENV === currentEnvironmentEnum.production;
  const tenantPermissions = useSelector((state) => state?.auth?.tenantPermissions);

  const { currency: franchiseCurrency } = useCurrency();
  const [_activeMarker, setActiveMarker] = useState(null);
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({});

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const searchParams = new URLSearchParams(location.search);

  const franchiseIdWithRoleAndSource = getFranchiseIdWithRoleAndSource();

  const franchiseTimeZoneFromUrl = searchParams.get(timeZoneKeyUrlQueryParam);

  const userRole = useSelector((state) => state?.auth?.userRole?.slug || {});
  const { CityHookComponent, StateHookComponent, CountrySelectHookComponent } =
    useCustomAddressHook({
      formData,
      setFormData,
      errorMessages,
      setErrorMessages,
      hookDisabled: disabledCountryStateCity(userRole),
    });
  const inputChangedHandler = async (event) => {
    const { name, value } = event.target;
    let isError = false;
    if (name === 'officerRate' && !hasInputValue(value)) {
      setErrorMessages((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors.officerRate;
        return updatedErrors;
      });
    }
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
      if (typesWithMultiComplete.includes(name)) {
        const filteredErrorMessages = Object.fromEntries(
          Object.entries(errorMessages).filter(([key]) => !key.includes(name)),
        );
        setErrorMessages(filteredErrorMessages);
        const error = await formValidatorJoi(
          {
            [name]: [...value],
          },
          t,
        );
        if (error && Object.keys(error).length) {
          isError = true;
          setErrorMessages(error);
        }
      }
    }
    if (!isError) {
      updateFormHandler(name, value);
    }
  };

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => {
        const processedValue =
          name === 'officerRate' ? formatNumber(value, 2, 20, prevState.officerRate) : value;
        return {
          ...prevState,
          [name]: processedValue,
        };
      });
    },
    [setFormData],
  );

  const preventNegativeValues = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

  const getGeoLocationInfo = async () => {
    try {
      return await getGeoLocation({ entity: 'site', endpoint: 'update', id: siteId });
    } catch (e) {
      console.log({ e });
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const getSiteInfo = async () => {
    try {
      let data = await getSiteDetails(siteId);

      const siteData = { ...data?.data?.site, officerRate: data?.data?.site?.officerRate || 0 };

      setAdditionalData(siteData);
      // ? NOTE: if the variable "zoneArea, supervisor" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      let { zoneArea, supervisor, ...pluckedData } = siteData ?? {};
      return pluckedData;
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      console.log({ siblings });
      setTimeout(() => {
        history.goBack();
      }, 1000);
    }
  };

  const closeRings = (polygon) => {
    return polygon.map((ring) => {
      const first = ring[0];
      const last = ring[ring.length - 1];
      // If first and last coords are not equal, add the first to the end
      if (first[0] !== last[0] || first[1] !== last[1]) {
        return [...ring, [...first]];
      }
      return ring;
    });
  };

  const isSitePolygonWithinFranchisePolygon = (sitePolygon, franchisePolygon) => {
    const coordinates1 = closeRings(
      sitePolygon.map((ring) => ring.map((vertex) => [vertex.lng, vertex.lat])),
    );
    const coordinates2 = closeRings(
      franchisePolygon.map((ring) => ring.map((vertex) => [vertex.lng, vertex.lat])),
    );
    const site = createPolygon(coordinates1);
    const franchise = createPolygon(coordinates2);
    return coordinates1.length ? booleanWithin(site, franchise) : false;
  };

  const isSitePinInsideSitePolygon = (sitePin, sitePolygon) => {
    const point = createTurfPoint([sitePin.lng, sitePin.lat]);
    const coordinates = closeRings(
      sitePolygon.map((ring) => ring.map((vertex) => [vertex.lng, vertex.lat])),
    );
    const polygon = createPolygon(coordinates);
    return booleanPointInPolygon(point, polygon);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // if (formData?.image?.length + profileImage?.length === 0) {
    //   setErrorMessages((prev) => ({
    //     ...prev,
    //     image: t('errors.emptyImage', {
    //       label: 'Image',
    //     }),
    //   }));
    //   scrollToInValidField();
    //   return;
    // }
    let data = JSON.parse(JSON.stringify(formData));

    // ? NOTE: if the variable "image" is not getting used add _ before it or this rule will suffice the need here.
    // eslint-disable-next-line no-unused-vars
    const { image, ...rest } = data;
    data = rest;
    let dataTovalidate = {
      contacts: formData?.contacts,
      firstName: formData?.firstName,
      lastName: formData?.lastName,
      primaryEmail: formData?.primaryEmail,
      email: formData?.email,
      phoneNumber: formData?.phoneNumber,
      siteArea: formData?.siteArea,
      // officerRate: formData?.officerRate,
      localWorked: formData?.localWorked,
      dailySiteSummaryReceivers: formData?.dailySiteSummaryReceivers || [],
      incidentReportReceivers: formData?.incidentReportReceivers || [],
      isBreakPayable: formData.isBreakPayable || false,
      customerPortalInvitedEmails: formData?.customerPortalInvitedEmails || [],
    };

    if (formData?.sitePayRate?.value)
      dataTovalidate.sitePayRate = parseFloat(formData?.sitePayRate?.value);

    // Only include customerId for German franchises (DE)
    if (isGermanFranchise && formData?.customerId) {
      dataTovalidate.customerId = Number(formData?.customerId);
    }

    dataTovalidate.contacts = dataTovalidate?.contacts?.map((item) => {
      if (!item?.email) {
        delete item?.email;
        return item;
      } else {
        return item;
      }
    });

    delete dataTovalidate.contacts.email;

    if (!dataTovalidate.email) {
      delete dataTovalidate.email;
    }
    if (!userHasPermission(ACL_OBX_SITE_RATE_UPDATE) && 'officerRate' in dataTovalidate) {
      delete dataTovalidate.officerRate;
    }

    let siteAreaError = errorMessages?.siteArea;

    // Validate: Is site polygon inside franchise polygon?
    if (
      !siteAreaError &&
      !isSitePolygonWithinFranchisePolygon(
        formData?.siteArea,
        franchiseData?.franchises?.[0]?.franchiseArea,
      )
    ) {
      siteAreaError = t('errors.fallBackForOutsideBoundry', {
        label: t('sideNavBar.linkText.siteArea'),
      });
    }

    // Validate: Is site pin inside site polygon?
    if (!siteAreaError && !isSitePinInsideSitePolygon(formData?.siteLocation, formData?.siteArea)) {
      siteAreaError = t('errors.markerNotInsideSiteLocation', {
        label: t('sideNavBar.linkText.site'),
      });
    }
    const errors = await formValidatorJoi(dataTovalidate, t);
    if ((errors && Object.keys(errors).length) || siteAreaError) {
      setErrorMessages((prev) => ({ ...prev, ...errors, ...{ siteArea: siteAreaError } }));
      scrollToInValidField();
      return;
    }
    setDisabled(true);
    let finalData = new FormData();
    finalData.append('images', JSON.stringify(formData?.image));
    for (let x = 0; profileImage?.length > x; x++) {
      finalData.append('newImages[]', profileImage[x]);
    }
    if (!userHasPermission(ACL_OBX_SITE_RATE_UPDATE)) {
      delete data?.officerRate;
    }
    for (const [key, value] of Object.entries(data)) {
      let item = value;
      if (key === 'geofencingEnabled') {
        continue;
      }
      if (typeof item === 'object' && item !== null) {
        item = JSON.stringify(item);
      }
      if (!item) {
        item = '';
      }
      finalData.append(key, item);
    }
    finalData.append('lat', formData?.siteLocation?.lat);
    finalData.append('lng', formData?.siteLocation?.lng);

    // Explicitly set geofencingEnabled as boolean
    if (formData?.geofencingEnabled) finalData.append('geofencingEnabled', 'true');
    else finalData.append('geofencingEnabled', 'false');

    // Appending allowOfflineSyncing as boolean
    finalData.append('allowOfflineSyncing', formData?.allowOfflineSyncing ? 'true' : 'false');

    try {
      const response = await updateSite(siteId, finalData);
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setDisabled(false);
        handleBack();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisabled(false);
    }
  };
  useEffect(() => {
    if (siteId) {
      Promise.all([getSiteInfo(), getGeoLocationInfo()])
        .then((data) => {
          const { siblings, franchiseArea } = findParentAndSiblingsPolygon(
            siteId,
            data[1],
            actionItemTypeKeys.site,
          );
          setFranchiseData(franchiseArea);
          setParent(franchiseArea?.franchises?.[0]);
          setSiblings(siblings);
          let formDetails = mapLocationInfo(data?.[0]);
          formDetails.mapCenter = data?.[0]?.siteLocation;
          formDetails.customerId = data?.[0]?.customerId || '';
          setFormData(formDetails);
          setDisabled(false);
          setAddress?.(formDetails?.address);
        })
        .catch((e) => {
          console.log(siblings);

          toaster.error({
            text: t('errors.somethingWentWrong'),
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          console.error(e);
          setDisabled(false);
        });
    }
  }, []);

  const showMap = !!additionalData?.zone || parent;
  useEffect(() => {
    const isQueryParamPresent = (param) => {
      return new URLSearchParams(location.search).has(param);
    };

    if (isQueryParamPresent('scrollToContacts') && !disabled) {
      contactRef.current.scrollIntoView({ behavior: 'smooth', inline: 'nearest' });
    }
  }, [location.search, parent, showMap]);

  const handleBack = () => {
    /**
     * if user is HO and Url contains franchiseId and timezone
     * then direct the back and cancel to HO site detail
     * */
    if (
      franchiseIdWithRoleAndSource?.role === rolesEnumWithName.home_officer.slug &&
      franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam]
    ) {
      const sitePath = HO_SITES_DETAIL_ROUTE.replace(':id', siteId);
      const queryParams = new URLSearchParams({
        [franchiseIdUrlQueryParam]: franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam],
        [timeZoneKeyUrlQueryParam]: franchiseTimeZoneFromUrl,
      }).toString();
      history.push(`${sitePath}?${queryParams}`);
    } else {
      history.push(`${routes.OBX_SITES_DETAIL}/${siteId}`);
    }
  };

  const updateMapValue = (_name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      address: value?.name,
      siteLocation: value?.position,
    }));
    setAddress(value?.name);
  };
  const updateCenter = (coordinates) => {
    setFormData((prevState) => ({
      ...prevState,
      mapCenter: coordinates,
    }));
  };

  return (
    <Box className={classes.updateSites}>
      {disabled && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      {
        <Box
          component="form"
          onSubmit={handleFormSubmit}
          className={classes.mainBoxForm}
          noValidate
          autoComplete="off"
        >
          <Box className={classes.btnBox}>
            <Button variant="tertiaryGrey" onClick={handleBack} startIcon={<ArrowBackIcon />}>
              {t('obx.buttons.back')}
            </Button>

            <Box className={classes.buttonGroup}>
              <Button variant="secondaryGrey" onClick={handleBack}>
                {t('obx.buttons.cancel')}
              </Button>
              <Button disabled={disabled || !!!showMap} variant="primary" type="submit">
                {t('obx.buttons.save')}
              </Button>
            </Box>
          </Box>
          <>
            {!showMap && (
              <Stack sx={{ width: '100%', marginTop: '6px' }} spacing={2}>
                <Alert severity="error">
                  {t('obx.sites.siteInformation.zoneRequire').slice(0, -1)}
                </Alert>
              </Stack>
            )}
            <Box className={classes.sitesFieldsWrapper}>
              <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
                {t('form.input.textField.site.sites')} {t('form.input.textField.owner.info')}
              </Typography>
              <Box className={classes.formBox}>
                <Box className={classes.flexControl}>
                  <InputLabel>
                    {`${t('form.input.textField.site.sites')} ${t('form.input.textField.site.name')}`}
                    <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    error={!!errorMessages?.name}
                    id="outlined-search"
                    onChange={inputChangedHandler}
                    name="name"
                    placeholder={t('form.input.textField.site.placeHolderSites')}
                    variant="outlined"
                    disabled={true}
                    value={formData?.name}
                    fullWidth
                    type="text"
                    helperText={!!errorMessages?.name ? errorMessages?.name : null}
                  />
                </Box>

                <Box className={classes.flexControl}>
                  <InputLabel className={classes.inputLabel}>
                    {t('obx.form.input.textField.primaryEmail.label')}
                    <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    error={!!errorMessages?.primaryEmail}
                    id="outlined-start-adornment"
                    className={classes.customInputMessage}
                    disabled={false}
                    type="email"
                    name="primaryEmail"
                    onChange={inputChangedHandler}
                    value={formData?.primaryEmail}
                    placeholder={t('obx.form.input.textField.primaryEmail.placeHolder')}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText={!!errorMessages?.primaryEmail ? errorMessages?.primaryEmail : null}
                  />
                </Box>
              </Box>
              <Box className={classes.formBox}>
                <Box className={classes.flexControl}>
                  <InputLabel>
                    {`${t('form.input.textField.site.clients')} ${t(
                      'form.input.textField.firstName.label',
                    )}`}
                    <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    id="outlined-search"
                    error={!!errorMessages?.firstName}
                    variant="outlined"
                    name="firstName"
                    onChange={inputChangedHandler}
                    placeholder={t('form.input.textField.site.placeHolderClients')}
                    value={`${formData?.firstName || ''}`}
                    fullWidth
                    type="search"
                    helperText={!!errorMessages?.firstName ? errorMessages?.firstName : null}
                  />
                </Box>
                <Box className={classes.flexControl}>
                  <InputLabel>
                    {`${t('form.input.textField.site.clients')} ${t(
                      'obx.sites.siteInformation.lastName',
                    )}`}
                    <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    id="outlined-search"
                    error={!!errorMessages?.lastName}
                    variant="outlined"
                    name="lastName"
                    onChange={inputChangedHandler}
                    placeholder={t('obx.sites.siteInformation.lastName')}
                    value={`${formData?.lastName || ''}`}
                    fullWidth
                    type="search"
                    helperText={!!errorMessages?.lastName ? errorMessages?.lastName : null}
                  />
                </Box>
              </Box>
              <Box className={classes.formBox}>
                <Box className={classes.flexControl}>
                  <InputLabel className={classes.inputLabel}>
                    {`${t('form.input.textField.site.secondaryEmail')}`}
                    <Tooltip
                      placement="right"
                      arrow
                      title={t('obx.sites.tooltips.secondaryContactEmailTooltip')}
                    >
                      <CautionIcon />
                    </Tooltip>
                  </InputLabel>
                  <TextField
                    error={!!errorMessages?.email}
                    id="outlined-start-adornment"
                    className={classes.customInputMessage}
                    type="email"
                    name="email"
                    onChange={inputChangedHandler}
                    value={formData?.email}
                    placeholder={t('form.input.textField.email.placeHolder')}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                    helperText={!!errorMessages?.email ? errorMessages?.email : null}
                  />
                </Box>

                <Box className={classes.flexControl}>
                  <InputLabel>
                    {`${t('form.input.textField.site.clients')} ${t(
                      'form.input.textField.phoneNumber.label',
                    )}
              `}
                    <RequiredAsterik />
                    <Tooltip
                      placement="right"
                      arrow
                      title={t('obx.sites.tooltips.clientPhoneNoTooltip')}
                    >
                      <CautionIcon />
                    </Tooltip>
                  </InputLabel>
                  <PhoneNumberWithCountry
                    value={formData.phoneNumber || ''}
                    onChange={(value) =>
                      inputChangedHandler({ target: { name: 'phoneNumber', value } })
                    }
                    name={'phoneNumber'}
                    isError={!!errorMessages?.phoneNumber}
                    international={true}
                    error={!!errorMessages?.phoneNumber ? errorMessages?.phoneNumber : null}
                    className={classes.countryPhnNumber}
                  />
                </Box>
              </Box>
              <Box className={classes.formBox}>
                <Box className={classes.flexControl}>
                  <InputLabel className={classes.inputLabel}>
                    {t('form.input.textField.site.localWorked')}
                  </InputLabel>
                  <TextField
                    error={!!errorMessages?.localWorked}
                    id="outlined-start-adornment"
                    className={classes.customInputMessage}
                    disabled={false}
                    type="text"
                    name="localWorked"
                    onChange={inputChangedHandler}
                    value={formData?.localWorked || ''}
                    placeholder={t('form.input.textField.site.localWorked')}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">{/* <EmailIcon /> */}</InputAdornment>
                      ),
                    }}
                    helperText={!!errorMessages?.localWorked ? errorMessages?.localWorked : null}
                  />
                </Box>

                <RenderIfHasPermission name={ACL_OBX_SITE_RATE_UPDATE}>
                  <Box className={classes.flexControl}>
                    <InputLabel className={classes.inputLabel}>
                      {t('form.input.textField.site.siteRate')}
                      {franchiseCurrency}
                      <Tooltip
                        placement="right"
                        arrow
                        title={t('obx.sites.tooltips.siteRateTooltip', {
                          officers: getLabel('terms', 'officers', t)?.toLowerCase(),
                        })}
                      >
                        <CautionIcon />
                      </Tooltip>
                    </InputLabel>
                    <TextField
                      error={!!errorMessages?.officerRate}
                      id="outlined-start-adornment"
                      className={classes.customInputMessage}
                      disabled={false}
                      type="number"
                      name="officerRate"
                      onKeyDown={preventNegativeValues}
                      onChange={inputChangedHandler}
                      value={formData?.officerRate ?? ''}
                      placeholder="0"
                      variant="outlined"
                      fullWidth
                      helperText={!!errorMessages?.officerRate ? errorMessages?.officerRate : null}
                    />
                  </Box>
                </RenderIfHasPermission>
              </Box>
              <Box className={classes.formBox}>
                {siteId && isGermanFranchise && (
                  <Box className={classes.flexControl}>
                    <InputLabel className={classes.inputLabel}>
                      {t('obx.sites.siteInformation.customerId')}
                    </InputLabel>
                    <TextField
                      error={!!errorMessages?.customerId}
                      id="outlined-customer-id"
                      onChange={inputChangedHandler}
                      name="customerId"
                      placeholder={t('form.input.textField.site.customerIdPlaceholder')}
                      variant="outlined"
                      value={formData?.customerId || ''}
                      fullWidth
                      type="number"
                      onKeyDown={preventNegativeValues}
                      helperText={!!errorMessages?.customerId ? errorMessages?.customerId : null}
                    />
                  </Box>
                )}
              </Box>

              {/* <Box className={classes.formBox}>
                <Box className={classes.sitesContactCheckbox}>
                  <Checkbox
                    id="mark-emergency-contact"
                    onChange={(e) => {
                      updateFormHandler('isBreakPayable', e.target.checked);
                    }}
                    name="isBreakPayable"
                    icon={<CheckBoxRegularIcon />}
                    checked={formData.isBreakPayable}
                    checkedIcon={<CheckBoxCheckedIcon />}
                    className={classes.checkBoxCustom}
                  />
                  <InputLabel htmlFor="mark-emergency-contact">
                    {t('obx.form.input.textField.billableHours.label')}
                  </InputLabel>
                </Box>
              </Box> */}

              {/** Profile Image */}
              {formData?.image && Array.isArray(formData?.image) && (
                <ProfileImageUpload
                  formData={formData}
                  formImageKey="image"
                  multiple={true}
                  updateFormHandler={updateFormHandler}
                  errorMessages={errorMessages}
                  setErrorMessages={setErrorMessages}
                  image={profileImage}
                  setImage={setImage}
                />
              )}
            </Box>
          </>
          <Box className={classes.sitesFieldsWrapper}>
            <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
              {t('form.input.textField.country.header')}
            </Typography>
            <Box className={classes.formBox}>
              <Box className={classes.flexControl}>
                <InputLabel>
                  {`${t('form.input.textField.country.label')}`} <RequiredAsterik />
                </InputLabel>
                <CountrySelectHookComponent />
              </Box>
              <Box className={classes.flexControl}>
                <InputLabel>
                  {`${t('form.input.textField.address.label')}`}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  error={!!errorMessages?.address}
                  id="outlined-search"
                  onChange={inputChangedHandler}
                  disabled={true}
                  name="address"
                  placeholder={t('form.input.textField.address.placeHolder')}
                  variant="outlined"
                  value={formData?.address || ''}
                  fullWidth
                  type="text"
                  helperText={!!errorMessages?.address ? errorMessages?.address : null}
                />
              </Box>
            </Box>
            <Box className={classes.formBox}>
              <Box className={classes.flexControl}>
                <InputLabel>{`${t('form.input.textField.address2.label')}`}</InputLabel>
                <TextField
                  error={!!errorMessages?.address2}
                  id="outlined-search"
                  onChange={inputChangedHandler}
                  name="address2"
                  disabled={true}
                  value={formData?.address2 || ''}
                  placeholder={t('form.input.textField.address2.placeHolder')}
                  variant="outlined"
                  fullWidth
                  type="text"
                  helperText={!!errorMessages?.address2 ? errorMessages?.address2 : null}
                />
              </Box>
              <Box className={classes.flexControl}>
                <InputLabel>
                  {`${t('form.input.textField.state.label')}`} <RequiredAsterik />
                </InputLabel>
                <StateHookComponent />
              </Box>
            </Box>
            <Box className={classNames(classes.formBox, classes.formBoxLast)}>
              <Box className={classes.flexControl}>
                <InputLabel>
                  {`${t(`obx.form.input.textField.${isCountryAustralia ? 'suburb' : 'city'}.label`)}`}{' '}
                  <RequiredAsterik />
                </InputLabel>
                <CityHookComponent />
              </Box>

              <Box className={classes.flexControl}>
                <InputLabel>{`${t('form.input.textField.postalCode.label')}`}</InputLabel>
                <TextField
                  // error={!!errorMessages?.zipCode}
                  id="outlined-search"
                  disabled={true}
                  onChange={inputChangedHandler}
                  name="zipCode"
                  placeholder={t('form.input.textField.postalCode.placeHolder')}
                  variant="outlined"
                  value={formData?.zipCode}
                  fullWidth
                  type="text"
                  // helperText={!!errorMessages?.zipCode ? errorMessages?.zipCode : null}
                />
              </Box>
            </Box>
          </Box>
          <Box className={classes.sitesFieldsWrapper}>
            <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
              {t('form.input.textField.reportsDistribution.header')}
            </Typography>
            <Box className={classes.formBox}>
              <Box className={classes.flexControl}>
                <InputLabel>{`${t('form.input.textField.dailySiteSummaryReceivers.label')}`}</InputLabel>
                <AutoCompleteCommon
                  handleChange={inputChangedHandler}
                  name="dailySiteSummaryReceivers"
                  value={formData?.dailySiteSummaryReceivers}
                  placeholder={t('form.input.textField.dailySiteSummaryReceivers.placeHolder')}
                  errorMessages={errorMessages}
                  errorMessage={t('errors.string.email', {
                    '#label': 'Email',
                  })}
                />
              </Box>
            </Box>
            <Box className={classes.formBox}>
              <Box className={classes.flexControl}>
                <InputLabel>{`${t('form.input.textField.incidentReportReceivers.label')}`}</InputLabel>
                <AutoCompleteCommon
                  handleChange={inputChangedHandler}
                  name="incidentReportReceivers"
                  value={formData?.incidentReportReceivers}
                  placeholder={t('form.input.textField.incidentReportReceivers.placeHolder')}
                  errorMessages={errorMessages}
                  errorMessage={t('errors.string.email', {
                    '#label': 'Email',
                  })}
                />
              </Box>
            </Box>
          </Box>

          {tenantPermissions?.sites?.edit?.inviteCbxUsers ? (
            <Box className={classes.cbxInviteUsersWrapper}>
              <Typography variant="h4" className={classes.inviteUsersTitle}>
                {t('obx.sites.siteInformation.inviteCbxUsers')}
              </Typography>

              <InputLabel>{t('obx.sites.details.tabs.labels.Email')}</InputLabel>
              <Box className={classes.inviteUsersInputContainer}>
                <Box style={{ flex: 1 }}>
                  <AutoCompleteCommon
                    handleChange={inputChangedHandler}
                    name="customerPortalInvitedEmails"
                    value={formData?.customerPortalInvitedEmails || []}
                    placeholder="Type to add more"
                    errorMessages={errorMessages}
                    errorMessage={t('errors.string.email', {
                      '#label': 'Email',
                    })}
                  />
                </Box>
              </Box>
            </Box>
          ) : null}

          {/* isGeofencingEnabled is the franchise level geofencing enabled status */}
          {/* geofencingEnabled is the site level geofencing enabled status */}
          {(!isProductionEnvironment || isEUInstance() || formData?.isGeofencingEnabled) && (
            <Box className={classes.sitesFieldsWrapper}>
              <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
                {t('obx.form.input.textField.integrations.header')}
              </Typography>
              <Box className={classes.grayBackgroundWrapper}>
                {(!isProductionEnvironment || isEUInstance()) && (
                  <Box className={classes.integrationsCheck}>
                    <Box>
                      <Typography variant="subtitle1">
                        {t('obx.form.input.textField.offlineSyncing.title')}
                      </Typography>
                      <Typography variant="body3">
                        {t('obx.form.input.textField.offlineSyncing.description')}
                      </Typography>
                    </Box>
                    <Box className={classes.switchWrapper}>
                      <Switch
                        name="allowOfflineSyncing"
                        inputProps={{ 'aria-label': 'offline syncing' }}
                        checked={formData.allowOfflineSyncing}
                        onChange={(e) =>
                          inputChangedHandler({
                            target: { name: 'allowOfflineSyncing', value: e.target.checked },
                          })
                        }
                      />
                    </Box>
                  </Box>
                )}
                {formData?.isGeofencingEnabled && (
                  <Box className={classes.integrationsCheck}>
                    <Box>
                      <Typography variant="subtitle1">
                        {t('obx.form.input.textField.geofencing.title')}
                      </Typography>
                      <Typography variant="body3">
                        {t('obx.form.input.textField.geofencing.description')}
                      </Typography>
                    </Box>
                    <Box className={classes.switchWrapper}>
                      <Switch
                        name="geofencingEnabled"
                        inputProps={{ 'aria-label': 'visitor management' }}
                        checked={formData.geofencingEnabled}
                        onChange={(e) =>
                          inputChangedHandler({
                            target: { name: 'geofencingEnabled', value: e.target.checked },
                          })
                        }
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Box className={classes.sitesFieldsWrapper}>
            <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
              {t('obx.form.input.textField.additionalContacts.header')}
            </Typography>
            <Box className={classes.sitesDynamicContent} ref={contactRef}>
              <EmergencyContactsComponent
                errorMessages={errorMessages}
                formDataKey="contacts"
                formData={formData}
                updateFormHandler={updateFormHandler}
                setErrorMessages={setErrorMessages}
                role={true}
              />
            </Box>

            {/* <Box ref={contactRef}>
              <DynamicFormComponent
                errorMessages={errorMessages}
                formDataKey="emergencyContacts"
                formData={formData}
                updateFormHandler={updateFormHandler}
                setErrorMessages={setErrorMessages}
                onlyPhone={false}
              />
            </Box> */}
          </Box>

          <>
            {parent?.coordinates && parent?.coordinates?.length > 0 && showMap && (
              <>
                <GoogleMapSearchAddressComponent
                  isLoaded={isLoaded}
                  updateMapValue={updateMapValue}
                  // errorMessages={errorMessages}
                  formKey="googleAddress"
                  setAddress={setAddress}
                  address={address}
                  setActiveMarker={setActiveMarker}
                  setSelectedLocation={setSelectedLocation}
                  setCenter={updateCenter}
                  disabled={false}
                />
                <MapComponent
                  siblings={[]}
                  errorMessages={errorMessages}
                  setErrorMessages={setErrorMessages}
                  parentBoundry={parent}
                  updateFormHandler={updateFormHandler}
                  setActiveMarker={setActiveMarker}
                  selectedLocation={selectedLocation}
                  updateMapValue={updateMapValue}
                  isSitePinDraggable={true}
                  createOrUpdate={true}
                  mapCenter={formData?.mapCenter}
                  franchiseData={franchiseData || []}
                  formDataKey={geoFencingPolygonTypeKeys.sites}
                  actionItem={formData || {}}
                  actionItemType={actionItemTypeKeys?.site}
                  isEditingSite={true}
                />
              </>
            )}
          </>
          <Box className={classes.buttonGroupLast}>
            <Button variant="secondaryGrey" onClick={handleBack}>
              {t('obx.buttons.cancel')}
            </Button>
            <Button disabled={disabled || !!!showMap} variant="primary" type="submit">
              {t('obx.buttons.save')}
            </Button>
          </Box>
        </Box>
      }
    </Box>
  );
};

export default Update;
