import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { ReactComponent as EmailIcon } from 'assets/images/email.svg?react';
import { ReactComponent as ArrowLeftIcon } from 'assets/svg/arrow-left.svg?react';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import EmergencyContactsComponent from 'src/app/components/common/emergencyContacts/index.jsx';
import LoaderComponent from 'src/app/components/common/loader';
import PhoneNumberWithCountry from 'src/app/components/common/phoneNumberWithCountry';
import ProfileImageUpload from 'src/app/components/common/profileImageUpload';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { useCustomAddressHook } from 'src/app/components/hooks/customAddressHook';
import { HO_FRANCHISE_DETAIL } from 'src/app/router/constant/ROUTE';
import {
  findParentAndSiblingsPolygon,
  isObjectEmpty,
  mapLocationInfo,
  scrollToInValidField,
} from 'src/helper/utilityFunctions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import {
  getFranchise,
  getGeoLocation,
  updateFranchise,
} from '../../../../../services/franchise.services';
import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import MapComponent from '../../../../components/common/geoFencing';
import { useStyles } from './update';

const keys = {
  zones: 'zoneArea',
  franchise: 'franchiseArea',
};

export const actionItemTypeKeys = {
  zone: 'zone',
  franchise: 'franchise',
};

const userFormData = {
  franchiseArea: [
    // [
    //   { lat: 31.5048493, lng: 74.3238862 },
    //   { lat: 31.504851, lng: 74.3338862 },
    //   { lat: 31.514851, lng: 74.3538862 },
    // ],
  ],
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  country: '',
  address: '',
  address2: '',
  state: '',
  city: '',
  zipCode: '',
  countryCode: '',
  franchiseLocation: {},
  workCellNumber: '',
  contacts: [
    {
      name: '',
      contact: '',
      email: '',
      isEmergencyContact: false,
    },
  ],

  image: '',
};

const FranchiseDetail = () => {
  const contactRef = useRef(null);
  const [formData, setFormData] = useState(userFormData);
  const classes = useStyles();
  const [errorMessages, setErrorMessages] = useState({});
  const [disableFields, setDisableFields] = useState({});
  const [profileImage, setImage] = useState(null);
  const { t } = useTranslation();
  const [children, setChildren] = useState([]);
  const [franchiseData, setFranchiseData] = useState([]);
  const [siblings, setSiblings] = useState([]);
  const history = useHistory();
  const [disabled, setDisabled] = useState(true);
  const { id: franchiseId } = useParams();
  const { CityHookComponent, StateHookComponent, CountrySelectHookComponent } =
    useCustomAddressHook({
      formData,
      setFormData,
      errorMessages,
      setErrorMessages,
      hookDisabled: {
        city: true,
        state: true,
        country: true,
      },
    });
  const getData = async () => {
    try {
      let data = await getFranchise(franchiseId);
      if (data?.firstName || data?.lastName || data?.email) {
        setDisableFields((prev) => ({
          ...prev,
          firstName: !!data?.firstName,
          lastName: !!data?.lastName,
          email: !!data?.email,
          address: !!data?.address,
          address2: !!data?.address2,
        }));
      }
      setFormData(mapLocationInfo(data));
      setDisabled(false);
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      console.log({ siblings });
      setTimeout(() => {
        gotoDetailPage();
      }, 2000);
      setFormData({});
    }
  };

  const getGeoLocationInfo = async () => {
    try {
      const apiData = await getGeoLocation({
        entity: 'franchise',
        endpoint: 'update',
        id: franchiseId,
      });
      const { siblings, franchiseArea } = findParentAndSiblingsPolygon(
        franchiseId,
        apiData,
        actionItemTypeKeys.franchise,
      );
      setFranchiseData(franchiseArea);
      setChildren(franchiseArea?.sites);
      setSiblings(siblings);
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  useEffect(() => {
    if (franchiseId) {
      getData();
      getGeoLocationInfo();
    }
  }, [franchiseId]);

  const gotoDetailPage = () => {
    history.push(`${HO_FRANCHISE_DETAIL}/${franchiseId}`);
  };

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }

    updateFormHandler(name, value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // ? NOTE: if the variable "image, address, address2, city, state, country, zipCode, addressId" is not getting used add _ before it or this rule will suffice the need here.
    // eslint-disable-next-line no-unused-vars
    let { image, address, address2, city, state, country, zipCode, addressId, ...payload } =
      formData;
    delete payload?.lastName;
    delete payload.firstName;

    const errors = await formValidatorJoi(payload, t);
    if ((errors && Object.keys(errors).length) || errorMessages?.franchiseArea) {
      setErrorMessages({ ...errors, ...errorMessages });
      scrollToInValidField();
      return;
    }

    setDisabled(true);
    let form = new FormData();
    let formInput = { ...payload, firstName: formData?.firstName, lastName: formData?.lastName };
    /**
     * picture updated by user
     */

    if (profileImage) {
      form.append('image', profileImage);
    }
    for (const [key, value] of Object.entries(formInput)) {
      let item = value;
      if (typeof item === 'object' && item !== null) {
        item = JSON.stringify(item);
      }
      if (!item) {
        item = '';
      }
      form.append(key, item);
    }

    try {
      const response = await updateFranchise(form, franchiseId);
      setDisabled(false);
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        gotoDetailPage();
      }
    } catch (error) {
      console.log(siblings);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisabled(false);
    }
  };

  const backButtonComponent = (
    <Button variant="tertiaryGrey" startIcon={<ArrowLeftIcon />} onClick={gotoDetailPage}>
      {t('links.back')}
    </Button>
  );

  const cancelButtonComponent = (
    <>
      <Button
        disabled={disabled}
        variant="secondaryGrey"
        className={classes.cancelBtn}
        onClick={gotoDetailPage}
      >
        {t('links.cancel')}
      </Button>
    </>
  );

  const saveButtonComponent = (
    <>
      <Button className={classes.saveBtn} variant="primary" disabled={disabled} type="submit">
        {t('links.save')}
      </Button>
    </>
  );

  return (
    <Box className={classes.franchisesUpdateForm}>
      <Box
        component="form"
        onSubmit={handleFormSubmit}
        className={classes.mainBoxForm}
        noValidate
        autoComplete="off"
      >
        {disabled && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
        <Box className={classes.btnBox}>
          <>{backButtonComponent}</>
          <Box className={classes.buttonGroup}>
            {cancelButtonComponent}
            {saveButtonComponent}
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle1" className={classes.franchisesFormTitle}>
            {t('form.input.textField.owner.label')} {t('form.input.textField.owner.info')}
          </Typography>
          <Box className={classes.formBox}>
            <Box className={classes.flexControl}>
              <InputLabel disabled htmlFor="outlined-search">
                {`${t('form.input.textField.owner.label')} ${t(
                  'form.input.textField.firstName.label',
                )}`}
              </InputLabel>
              <TextField
                error={!!errorMessages?.firstName}
                id="outlined-search"
                onChange={inputChangedHandler}
                name="firstName"
                placeholder={t('form.input.textField.firstName.placeHolder')}
                variant="outlined"
                fullWidth
                type="text"
                disabled={disableFields?.firstName}
                value={formData?.firstName || ''}
                className={classes.customInput}
                helperText={!!errorMessages?.firstName ? errorMessages?.firstName : null}
              />
            </Box>
            <Box className={classes.flexControl}>
              <InputLabel disabled htmlFor="outlined-search">
                {`${t('form.input.textField.owner.label')} ${t(
                  'form.input.textField.lastName.label',
                )}`}{' '}
              </InputLabel>
              <TextField
                id="outlined-search"
                error={!!errorMessages?.lastName}
                variant="outlined"
                name="lastName"
                onChange={inputChangedHandler}
                placeholder={t('form.input.textField.lastName.placeHolder')}
                fullWidth
                disabled={disableFields?.lastName}
                value={formData?.lastName || ''}
                type="search"
                className={classes.customInput}
                helperText={!!errorMessages?.lastName ? errorMessages?.lastName : null}
              />
            </Box>
          </Box>
          <Box className={classes.formBox}>
            <Box className={classes.flexControl}>
              <InputLabel htmlFor="outlined-start-adornment">
                {t('form.input.textField.phoneNumber.label')}
                <RequiredAsterik />
              </InputLabel>
              <PhoneNumberWithCountry
                isError={!!errorMessages?.phoneNumber}
                fullWidth
                id="outlined-start-adornment"
                placeholder={t('form.input.textField.phoneNumber.placeHolder')}
                name="phoneNumber"
                className={classes.countryPhnNumber}
                value={formData?.phoneNumber || ''}
                onChange={(value = null) =>
                  inputChangedHandler({ target: { name: 'phoneNumber', value } })
                }
                variant="outlined"
                error={!!errorMessages?.phoneNumber ? errorMessages?.phoneNumber : null}
                international
              />
            </Box>
            <Box className={classes.flexControl}>
              <InputLabel disabled htmlFor="outlined-start-adornment">
                {`${t('form.input.textField.email.label')} 
              `}
              </InputLabel>
              <TextField
                error={!!errorMessages?.email}
                value={formData?.email || ''}
                disabled={disableFields?.email}
                id="outlined-start-adornment"
                className={classes.customInputMessage}
                type="email"
                name="email"
                fullWidth
                onChange={inputChangedHandler}
                placeholder={t('form.input.textField.email.placeHolder')}
                variant="outlined"
                helperText={!!errorMessages?.email ? errorMessages?.email : null}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          <Box className={classes.formBoxPhoneNumber}>
            <Box className={classes.flexControl}>
              <InputLabel htmlFor="outlined-start-adornment">
                {t('form.input.textField.workCellNumber.label')}
              </InputLabel>
              <PhoneNumberWithCountry
                isError={!!errorMessages?.workCellNumber}
                disabled={true}
                fullWidth
                id="outlined-start-adornment"
                placeholder={t('form.input.textField.workCellNumber.placeHolder')}
                name={'workCellNumber'}
                className={classes.countryPhnNumber}
                value={formData?.workCellNumber || ''}
                onChange={(value = null) =>
                  inputChangedHandler({ target: { name: 'workCellNumber', value } })
                }
                variant="outlined"
                error={!!errorMessages?.workCellNumber ? errorMessages?.workCellNumber : null}
                international
              />
            </Box>
            {/*<Box className={classes.flexControl}>*/}
            {/*  <InputLabel htmlFor="outlined-start-adornment">*/}
            {/*    {`${t('ho.ho_franchise.detail.franchise_information.companyCode')} */}
            {/*  `}*/}
            {/*    <RequiredAsterik />*/}
            {/*  </InputLabel>*/}
            {/*  <TextField*/}
            {/*    fullWidth*/}
            {/*    id="outlined-start-adornment"*/}
            {/*    placeholder={t('ho.ho_franchise.detail.franchise_information.companyCode')}*/}
            {/*    name="companyCode"*/}
            {/*    className={classes.customInput}*/}
            {/*    value={formData?.companyCode || ''}*/}
            {/*    onChange={inputChangedHandler}*/}
            {/*    variant="outlined"*/}
            {/*    error={!!errorMessages?.companyCode}*/}
            {/*    disabled={false}*/}
            {/*    helperText={!!errorMessages?.companyCode ? errorMessages?.companyCode : null}*/}
            {/*    InputProps={{*/}
            {/*      startAdornment: <InputAdornment position="start"></InputAdornment>,*/}
            {/*    }}*/}
            {/*  />*/}
            {/*</Box>*/}
          </Box>

          {/** Profile Image */}
          <ProfileImageUpload
            formData={formData}
            formImageKey={'image'}
            updateFormHandler={updateFormHandler}
            errorMessages={errorMessages}
            setErrorMessages={setErrorMessages}
            image={profileImage}
            setImage={setImage}
          />
        </Box>
        <Box>
          <Typography className={classes.franchisesFormTitle} variant="subtitle1">
            {t('form.input.textField.country.header')}
          </Typography>
          <Box className={classes.formBox}>
            <Box className={classes.flexControl}>
              <InputLabel>{`${t('form.input.textField.country.label')}`}</InputLabel>
              <CountrySelectHookComponent />
            </Box>
            <Box className={classes.flexControl}>
              <InputLabel disabled htmlFor="outlined-search">
                {`${t('form.input.textField.address.label')}`}
              </InputLabel>
              <TextField
                error={!!errorMessages?.address}
                id="outlined-search"
                onChange={inputChangedHandler}
                name="address"
                placeholder={t('form.input.textField.address.placeHolder')}
                variant="outlined"
                value={formData?.address || ''}
                fullWidth
                type="text"
                disabled={true}
                className={classes.customInput}
                helperText={!!errorMessages?.address ? errorMessages?.address : null}
              />
            </Box>
          </Box>
          <Box className={classes.formBox}>
            <Box className={classes.flexControl}>
              <InputLabel disabled>{`${t('form.input.textField.address2.label')}`}</InputLabel>
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
                className={classes.customInput}
                helperText={!!errorMessages?.address2 ? errorMessages?.address2 : null}
              />
            </Box>
            <Box className={classes.flexControl}>
              <InputLabel>{`${t('form.input.textField.state.label')}`}</InputLabel>
              <StateHookComponent />
            </Box>
          </Box>
          <Box className={classNames(classes.formBox, classes.formBoxLast)}>
            <Box className={classes.flexControl}>
              <InputLabel>{`${t('form.input.textField.city.label')}`}</InputLabel>
              <CityHookComponent />
            </Box>
            <Box className={classes.flexControl}>
              <InputLabel>{`${t('form.input.textField.zipCode.label')}`}</InputLabel>
              <TextField
                error={!!errorMessages?.zipCode}
                id="outlined-search"
                onChange={inputChangedHandler}
                name="zipCode"
                value={formData?.zipCode || ''}
                placeholder={t('form.input.textField.zipCode.placeHolder')}
                variant="outlined"
                fullWidth
                disabled={true}
                type="text"
                className={classes.customInput}
                helperText={!!errorMessages?.zipCode ? errorMessages?.zipCode : null}
              />
            </Box>
          </Box>
        </Box>

        <Box className={classes.sitesFieldsWrapper}>
          <Typography variant="subtitle1" className={classes.sitesFieldsTitle}>
            {t('obx.form.input.textField.additionalContacts.header')}
          </Typography>

          <Box ref={contactRef} className={classes.sitesDynamicContent}>
            <EmergencyContactsComponent
              errorMessages={errorMessages}
              formDataKey="contacts"
              formData={formData}
              updateFormHandler={updateFormHandler}
              setErrorMessages={setErrorMessages}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle1" className={classes.franchisesFormTitle}>
            {t('form.input.textField.geoFencing.header')}
            <RequiredAsterik />
          </Typography>
          {formData?.coordinates && !isObjectEmpty(formData?.franchiseLocation) && (
            <MapComponent
              formDataKey={keys?.franchise}
              updateFormHandler={updateFormHandler}
              errorMessages={errorMessages}
              setErrorMessages={setErrorMessages}
              createOrUpdate={true}
              parentBoundry={null}
              actionItemType={actionItemTypeKeys.franchise}
              sameAsFranchise={formData?.sameAsFranchise}
              siblings={[]}
              mapCenter={formData?.franchiseLocation}
              franchiseData={franchiseData || []}
              actionItem={formData || {}}
              childrenPolygons={children}
            />
          )}
        </Box>

        <Box className={classes.buttonGroupLast}>
          {cancelButtonComponent}
          {saveButtonComponent}
        </Box>
      </Box>
    </Box>
  );
};

export default FranchiseDetail;
