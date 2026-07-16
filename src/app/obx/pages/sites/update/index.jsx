import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Autocomplete,
  Button,
  InputLabel,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useJsApiLoader } from '@react-google-maps/api';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import booleanWithin from '@turf/boolean-within';
import { point as createTurfPoint, polygon as createPolygon } from '@turf/helpers';
import { ReactComponent as CautionIcon } from 'assets/svg/caution-thin.svg?react';
// import { ReactComponent as PhoneIcon } from 'assets/svg/phoneIcon.svg';
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
  removeKeysFromObject,
  scrollToInValidField,
} from 'helper/utilityFunctions';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { getSiteDetails, updateSite } from 'services/sites.services';
import GoogleMapSearchAddressComponent from 'src/app/components/common/googleMap/searchAddress';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { getFranchiseIdWithRoleAndSource } from 'src/app/obx/pages/schedules/helper';
import { ACL_OBX_SITE_RATE_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { useCurrency } from 'src/hooks/useCurrency';
import { getExternalClients, getExternalContacts } from 'src/services/externalDirectory.services';
import { getGeoLocation } from 'src/services/franchise.services';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { formatNumber } from 'src/utils/regexField/regexFiledForm';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import ExternalContactsComponent from '../../../../components/common/externalContacts/index.jsx';
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

  // The site name defaults to the picked address. Once the user types their own
  // name we stop mirroring the address; clearing the name lets it resume.
  const [isSiteNameCustom, setIsSiteNameCustom] = useState(false);

  // External application directory (clients + contacts). These records are owned
  // by another app; this form only links to them.
  const [clientOptions, setClientOptions] = useState([]);
  const [contactOptions, setContactOptions] = useState([]);

  // A client is only considered linked once explicitly selected from SET — it is
  // never pre-selected, even when editing a site that already has client data.
  const isClientLinked = !!formData?.clientId;
  const selectedClientOption =
    clientOptions.find((c) => String(c.id) === String(formData?.clientId)) || null;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const searchParams = new URLSearchParams(location.search);

  const franchiseIdWithRoleAndSource = getFranchiseIdWithRoleAndSource();

  const franchiseTimeZoneFromUrl = searchParams.get(timeZoneKeyUrlQueryParam);

  // Read-only location details rendered as a card above the address field. These
  // are derived from the site record on load and refreshed whenever the user
  // picks a new address (search) or drags the map pin.
  const [locationDetails, setLocationDetails] = useState({
    country: '',
    state: '',
    city: '',
    postalCode: '',
    address2: '',
  });

  // Snapshot of the address/location as loaded from the site record. Used by the
  // "reset" affordance to undo an address picked via search or the map pin.
  const [initialLocation, setInitialLocation] = useState(null);
  const inputChangedHandler = async (event) => {
    const { name, value } = event.target;
    let isError = false;
    // Typing a site name opts out of address mirroring; clearing it opts back in
    // so the next address selection can refill the field.
    if (name === 'name') {
      setIsSiteNameCustom(hasInputValue(value));
    }
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

  // Linking a client pulls its identity fields (read-only here) into the form.
  const handleClientSelect = (client) => {
    setFormData((prev) => ({
      ...prev,
      clientId: client?.id || '',
      firstName: client?.firstName || '',
      lastName: client?.lastName || '',
      company: client?.companyName || '',
      primaryEmail: client?.primaryEmail || '',
      phoneNumber: client?.phone || '',
      customerId: client?.customerId || '',
      // Secondary email + local worked (ADP tax code) are also sourced from SET.
      email: client?.secondaryEmail || '',
      localWorked: client?.localWorked || '',
    }));
    setErrorMessages((prev) =>
      removeKeysFromObject(prev, [
        'firstName',
        'lastName',
        'primaryEmail',
        'phoneNumber',
        'clientId',
        'email',
        'localWorked',
      ]),
    );
  };

  // Load the external client directory once.
  useEffect(() => {
    let active = true;
    getExternalClients()
      .then((res) => {
        if (active) setClientOptions(res?.data?.clients || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Load contacts scoped to the linked client (plus shared contacts).
  useEffect(() => {
    let active = true;
    getExternalContacts(formData?.clientId || null)
      .then((res) => {
        if (active) setContactOptions(res?.data?.contacts || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [formData?.clientId]);

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
    // A linked client is required — client identity is sourced externally.
    if (!formData?.clientId && !formData?.firstName) {
      setErrorMessages((prev) => ({
        ...prev,
        clientId: 'Please link a client from the connected application.',
      }));
      scrollToInValidField();
      return;
    }
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

    // Additional contacts are optional. Normalise to the active (non-removed)
    // set, drop empty emails without mutating form state, and only keep the key
    // when at least one contact remains — otherwise the validator's `min(1)`
    // rule blocks saving a site that legitimately has no extra contacts, and a
    // missing/undefined `contacts` array would throw here on submit.
    const activeContacts = (formData?.contacts ?? [])
      .filter((contact) => !contact?._destroy)
      .map((contact) => {
        if (!contact?.email) {
          // eslint-disable-next-line no-unused-vars
          const { email, ...rest } = contact;
          return rest;
        }
        return contact;
      });

    if (activeContacts.length) {
      dataTovalidate.contacts = activeContacts;
    } else {
      delete dataTovalidate.contacts;
    }

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
          // Default the site name to the address when the record has none yet,
          // otherwise keep the saved name and treat it as user-provided.
          const hasLoadedName = !!String(formDetails?.name || '').trim();
          if (!hasLoadedName && formDetails?.address) {
            formDetails.name = formDetails.address;
          }
          setIsSiteNameCustom(hasLoadedName);
          setFormData(formDetails);
          const loadedLocationDetails = {
            country: data?.[0]?.country?.name || '',
            state: data?.[0]?.state?.name || '',
            city: data?.[0]?.city?.name || '',
            postalCode: data?.[0]?.zipCode || data?.[0]?.postalCode || '',
            address2: data?.[0]?.address2 || '',
          };
          setLocationDetails(loadedLocationDetails);
          setInitialLocation({
            address: formDetails?.address || '',
            siteLocation: data?.[0]?.siteLocation,
            mapCenter: data?.[0]?.siteLocation,
            zipCode: formDetails?.zipCode || loadedLocationDetails.postalCode,
            locationDetails: loadedLocationDetails,
          });
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

  // Pull country / state / city / postal code out of a Google geocode result so
  // the read-only location card can reflect the newly picked address.
  const parseAddressComponents = (components = []) => {
    const pick = (type) => components.find((item) => item?.types?.includes(type));
    return {
      country: pick('country')?.long_name || '',
      state: pick('administrative_area_level_1')?.long_name || '',
      city:
        pick('locality')?.long_name ||
        pick('sublocality')?.long_name ||
        pick('postal_town')?.long_name ||
        pick('administrative_area_level_2')?.long_name ||
        '',
      postalCode: pick('postal_code')?.long_name || '',
    };
  };

  const updateMapValue = (_name, value) => {
    // Mirror the picked address into the site name until the user overrides it.
    const shouldMirrorName = !isSiteNameCustom && !!value?.name;
    setFormData((prevState) => ({
      ...prevState,
      address: value?.name,
      siteLocation: value?.position,
      ...(shouldMirrorName ? { name: value.name } : {}),
    }));
    if (shouldMirrorName) {
      setErrorMessages((prev) => removeKeysFromObject(prev, ['name']));
    }
    setAddress(value?.name);

    if (value?.addressComponents?.length) {
      const parsed = parseAddressComponents(value.addressComponents);
      setLocationDetails((prevState) => ({
        ...prevState,
        country: parsed.country || prevState.country,
        state: parsed.state || prevState.state,
        city: parsed.city || prevState.city,
        postalCode: parsed.postalCode || prevState.postalCode,
      }));
      if (parsed.postalCode) {
        setFormData((prevState) => ({ ...prevState, zipCode: parsed.postalCode }));
      }
    }
  };
  const updateCenter = (coordinates) => {
    setFormData((prevState) => ({
      ...prevState,
      mapCenter: coordinates,
    }));
  };

  // The address is "dirty" once it differs from what the site loaded with,
  // whether it was changed via the search field or by dragging the map pin.
  const isAddressDirty =
    !!initialLocation && (formData?.address || '') !== (initialLocation?.address || '');

  // Restore the original address, map pin and derived location details.
  const handleResetAddress = () => {
    if (!initialLocation) return;
    setAddress(initialLocation.address);
    setFormData((prevState) => ({
      ...prevState,
      address: initialLocation.address,
      siteLocation: initialLocation.siteLocation,
      mapCenter: initialLocation.mapCenter,
      zipCode: initialLocation.zipCode,
      ...(!isSiteNameCustom && initialLocation.address ? { name: initialLocation.address } : {}),
    }));
    setLocationDetails(initialLocation.locationDetails);
    setSelectedLocation({});
    setActiveMarker(null);
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
          {!showMap && (
            <Stack sx={{ width: '100%', marginTop: '6px' }} spacing={2}>
              <Alert severity="error">
                {t('obx.sites.siteInformation.zoneRequire').slice(0, -1)}
              </Alert>
            </Stack>
          )}
          {/* Client — linked from the connected application. Identity fields are
              read-only here; only site-specific fields are editable. */}
          <Box className={classes.sitesFieldsWrapper}>
            <Box className={classes.sectionHead}>
              <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
                {t('form.input.textField.site.clients')}
              </Typography>
            </Box>

            <Box className={classes.formBox}>
              <Box className={classes.flexControl}>
                <InputLabel>
                  {t('form.input.textField.site.clients')}
                  <RequiredAsterik />
                </InputLabel>
                <Autocomplete
                  className={classes.clientPicker}
                  options={clientOptions}
                  value={selectedClientOption}
                  getOptionLabel={(o) =>
                    `${o?.firstName || ''} ${o?.lastName || ''}`.trim() ||
                    `${formData?.firstName || ''} ${formData?.lastName || ''}`.trim()
                  }
                  isOptionEqualToValue={(o, v) => String(o?.id) === String(v?.id)}
                  onChange={(_e, option) => handleClientSelect(option)}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box className={classes.optionRow}>
                        <span className={classes.optionName}>
                          {`${option.firstName || ''} ${option.lastName || ''}`.trim()}
                        </span>
                        <span className={classes.optionMeta}>{option.primaryEmail}</span>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!errorMessages?.clientId}
                      placeholder={t('form.input.textField.site.placeHolderClients')}
                      helperText={errorMessages?.clientId || null}
                    />
                  )}
                />
              </Box>
            </Box>

            {isClientLinked && (
              <Box className={classes.infoCard}>
                <Box className={classes.infoDetailGrid}>
                  <Box className={classes.readOnlyItem}>
                    <span className={classes.readOnlyLabel}>
                      {t('obx.form.input.textField.firstName.label')}
                    </span>
                    <span className={classes.readOnlyValue}>{formData?.firstName || '—'}</span>
                  </Box>
                  <Box className={classes.readOnlyItem}>
                    <span className={classes.readOnlyLabel}>
                      {t('obx.form.input.textField.lastName.label')}
                    </span>
                    <span className={classes.readOnlyValue}>{formData?.lastName || '—'}</span>
                  </Box>
                  <Box className={classes.readOnlyItem}>
                    <span className={classes.readOnlyLabel}>
                      {t('obx.sites.table.listing.columns.company')}
                    </span>
                    <span className={classes.readOnlyValue}>{formData?.company || '—'}</span>
                  </Box>
                  <Box className={classes.readOnlyItem}>
                    <span className={classes.readOnlyLabel}>
                      {t('obx.form.input.textField.primaryEmail.label')}
                    </span>
                    <span className={classes.readOnlyValue}>{formData?.primaryEmail || '—'}</span>
                  </Box>
                  <Box className={classes.readOnlyItem}>
                    <span className={classes.readOnlyLabel}>
                      {t('obx.form.input.textField.phoneNumber.label')}
                    </span>
                    <span className={classes.readOnlyValue}>{formData?.phoneNumber || '—'}</span>
                  </Box>
                  <Box className={classes.readOnlyItem}>
                    <span className={classes.readOnlyLabel}>
                      {t('obx.sites.siteInformation.customerId')}
                    </span>
                    <span className={classes.readOnlyValue}>{formData?.customerId || '—'}</span>
                  </Box>
                  <Box className={classes.readOnlyItem}>
                    <span className={classes.readOnlyLabel}>
                      {t('obx.sites.siteInformation.secondaryEmail')}
                    </span>
                    <span className={classes.readOnlyValue}>{formData?.email || '—'}</span>
                  </Box>
                  <Box className={classes.readOnlyItem}>
                    <span className={classes.readOnlyLabel}>
                      {t('form.input.textField.site.localWorked')}
                    </span>
                    <span className={classes.readOnlyValue}>{formData?.localWorked || '—'}</span>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Site details — owned by this application (incl. location). */}
          <Box className={classes.sitesFieldsWrapper}>
            <Box className={classes.sectionHead}>
              <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
                {t('obx.sites.createSite.siteDetails')}
              </Typography>
            </Box>

            <Box className={classes.formBox}>
              <Box className={classes.flexControl}>
                <InputLabel>
                  {`${t('form.input.textField.site.sites')} ${t('form.input.textField.site.name')}`}
                </InputLabel>
                <TextField
                  error={!!errorMessages?.name}
                  id="outlined-search"
                  onChange={inputChangedHandler}
                  name="name"
                  placeholder={t('form.input.textField.site.placeHolderSites')}
                  variant="outlined"
                  value={formData?.name}
                  fullWidth
                  type="text"
                  helperText={!!errorMessages?.name ? errorMessages?.name : null}
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

            {/* Location header. */}
            <Typography variant="subtitle2" className={classes.subSectionTitle}>
              {t('form.input.textField.country.header')}
            </Typography>

            {/* Location details as a flat field grid. Address leads (most
                important), then zip code, then the finer fields. A reset restores
                the original address once it's changed via search or the map pin. */}
            <Box className={classes.infoCard}>
              <Box className={classes.infoDetailGrid}>
                <Box className={classes.readOnlyItem}>
                  <span className={classes.addressLabelRow}>
                    <span className={classes.readOnlyLabel}>{t('sales.locations.address')}</span>
                    {isAddressDirty && (
                      <Button
                        variant="onlyText"
                        className={classes.resetAddressBtn}
                        onClick={handleResetAddress}
                      >
                        Reset
                      </Button>
                    )}
                  </span>
                  <span className={classes.readOnlyValue}>{formData?.address || '—'}</span>
                </Box>
                <Box className={classes.readOnlyItem}>
                  <span className={classes.readOnlyLabel}>
                    {t('form.input.textField.postalCode.label')}
                  </span>
                  <span className={classes.readOnlyValue}>
                    {locationDetails?.postalCode || '—'}
                  </span>
                </Box>
                <Box className={classes.readOnlyItem}>
                  <span className={classes.readOnlyLabel}>
                    {t(`obx.form.input.textField.${isCountryAustralia ? 'suburb' : 'city'}.label`)}
                  </span>
                  <span className={classes.readOnlyValue}>{locationDetails?.city || '—'}</span>
                </Box>
                <Box className={classes.readOnlyItem}>
                  <span className={classes.readOnlyLabel}>
                    {t('obx.sites.siteInformation.region')}
                  </span>
                  <span className={classes.readOnlyValue}>{locationDetails?.state || '—'}</span>
                </Box>
                <Box className={classes.readOnlyItem}>
                  <span className={classes.readOnlyLabel}>
                    {t('obx.form.input.textField.country.label')}
                  </span>
                  <span className={classes.readOnlyValue}>{locationDetails?.country || '—'}</span>
                </Box>
                <Box className={classes.readOnlyItem}>
                  <span className={classes.readOnlyLabel}>
                    {t('form.input.textField.address2.label')}
                  </span>
                  <span className={classes.readOnlyValue}>{locationDetails?.address2 || '—'}</span>
                </Box>
              </Box>
            </Box>

            {/* Address input sits below the country/region card: searching a place
                refreshes the details above and drops the map pin. Renders its own
                "Address" label. */}
            <Box className={classes.addressSearch}>
              <GoogleMapSearchAddressComponent
                isLoaded={isLoaded}
                updateMapValue={updateMapValue}
                formKey="googleAddress"
                setAddress={setAddress}
                address={address}
                setActiveMarker={setActiveMarker}
                setSelectedLocation={setSelectedLocation}
                setCenter={updateCenter}
                disabled={false}
              />
            </Box>

            {/* Map picker sits below the address field so the pin/boundary is
                fine-tuned in the same place as the written address. */}
            {parent?.coordinates && parent?.coordinates?.length > 0 && showMap && (
              <Box className={classes.mapSection}>
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
              </Box>
            )}
          </Box>
          <Box className={classes.sitesFieldsWrapper}>
            <Box className={classes.sectionHead}>
              <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
                {t('form.input.textField.reportsDistribution.header')}
              </Typography>
            </Box>
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
              <Box className={classes.sectionHead}>
                <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
                  {t('obx.form.input.textField.integrations.header')}
                </Typography>
              </Box>
              <Box className={classes.grayBackgroundWrapper}>
                {(!isProductionEnvironment || isEUInstance()) && (
                  <Box className={classes.integrationsCheck}>
                    <Box className={classes.integrationRowText}>
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
                    <Box className={classes.integrationRowText}>
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
            <Box className={classes.sectionHead}>
              <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
                {t('obx.form.input.textField.additionalContacts.header')}
              </Typography>
            </Box>
            <Box className={classes.sitesDynamicContent} ref={contactRef}>
              <ExternalContactsComponent
                errorMessages={errorMessages}
                formDataKey="contacts"
                formData={formData}
                updateFormHandler={updateFormHandler}
                setErrorMessages={setErrorMessages}
                options={contactOptions}
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
