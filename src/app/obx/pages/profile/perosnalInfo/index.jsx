import { Box, Button, FormControl, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as PasswordLockImage } from 'assets/images/lockprofileimage.svg?react';
import LoaderComponent from 'commonComponents/loader';
import ProfileImageUpload from 'commonComponents/profileImageUpload';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword } from 'services/auth.services';
import { getProfile, updateProfile } from 'services/profile.services';
import PhoneNumberWithCountry from 'src/app/components/common/phoneNumberWithCountry';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { useCustomAddressHook } from 'src/app/components/hooks/customAddressHook';
import UpdatePassword from 'src/app/obx/pages/profile/updatePassword';
import { isObjectEmpty, removeDataFromObject, removeKey } from 'src/helper/utilityFunctions';
import { setInfoData } from 'src/redux/store/slices/user';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import scssClasses from '../style.module.scss';

const useStyles = makeStyles((theme) => ({
  descriptionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  zoneCustomText: {
    '&.MuiTypography-root': {
      display: 'flex',
      gap: '2px',
      color: theme.palette.textSecondary2,
    },
  },
  updatePasswordBtn: {
    '&.MuiButton-root': {
      padding: 0,
    },
  },
  countryPhnNumber: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '0px 14px',
    borderRadius: '8px',
    '& > div': {
      '& div:nth-child(1)': {
        borderRight: `1px solid ${theme.palette.borderSubtle1}`,
        margin: '8px 8px 8px 0px',
        paddingRight: '8px',
      },
    },
    '& input': {
      height: '44px',
      border: 0,
      fontSize: '16px',
      lineHeight: '24px',
      '&::placeholder': {
        color: theme.palette.textPlaceholderField,
      },
      '&:focus , &:focus-visible': {
        border: 0,
        boxShadow: 'none',
        outline: 'none',
      },
    },
  },
}));
const profileFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  image: null,
  country: '',
  state: '',
  city: '',
  countryCode: '',
  address: '',
  postalCode: '',
  currentPassword: '',
  newPassword: '',
  passwordConfirmation: '',
};

const profileFormConstants = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  PHONE_NUMBER: 'phoneNumber',
  IMAGE: 'image',
  COUNTRY: 'country',
  COUNTRY_CODE: 'countryCode',
  STATE: 'state',
  CITY: 'city',
  ADDRESS: 'address',
  POSTAL_CODE: 'postalCode',
};

const ProfileInfo = () => {
  const classes = useStyles();

  const { t } = useTranslation();

  const [formData, setFormData] = useState(profileFormData);

  const [errorMessages, setErrorMessages] = useState({});

  const [profileImage, setImage] = useState(null);

  const [disabled, setDisabled] = useState(false);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const { CityHookComponent, StateHookComponent, CountrySelectHookComponent } =
    useCustomAddressHook({
      formData,
      setFormData,
      errorMessages,
      setErrorMessages,
    });

  const userInfo = useSelector((state) => state.user.info);
  const dispatch = useDispatch();

  const toggleUpdatePassword = () => {
    setErrorMessages({});
    setOpen((a) => !a);
    setFormData((prevState) => {
      return {
        ...prevState,
        currentPassword: '',
        newPassword: '',
        passwordConfirmation: '',
      };
    });
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

  const renderError = (name) => {
    let message = null;

    if (errorMessages[name]) {
      message = errorMessages[name];
    }
    return message;
  };

  const getSingleProfile = async (inputData = {}) => {
    try {
      setLoading(true);
      const data = await getProfile();

      if (data?.statusCode == 200) {
        let profileData = data?.data?.user;

        profileData = removeDataFromObject(
          ['address2', 'name', 'joinedOn', 'dutyType'],
          profileData,
        );

        const profileFormData = {
          ...formData,
          ...profileData,
          city: profileData?.city?.id || '',
          country: profileData?.country?.id || '',
          state: profileData?.state?.id || '',
          countryCode: profileData?.country?.countryCode || '',
        };
        setFormData(profileFormData);

        dispatch(
          setInfoData(
            !isObjectEmpty(inputData)
              ? { ...inputData, image: profileData?.image }
              : profileFormData,
          ),
        );

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ? NOTE: if the variable "image, currentPassword, newPassword, passwordConfirmation" is not getting used add _ before it or this rule will suffice the need here.
    // eslint-disable-next-line no-unused-vars
    const { image, currentPassword, newPassword, passwordConfirmation, ...rest } = formData;

    let finalPayload = JSON.parse(JSON.stringify(rest));
    let dataToValidate = {
      firstName: finalPayload?.firstName,
      lastName: finalPayload?.lastName,
      email: formData?.email,
    };
    if (formData?.phoneNumber) {
      dataToValidate = { ...dataToValidate, phoneNumber: formData?.phoneNumber };
    }

    const errors = await formValidatorJoi(dataToValidate, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));
      return;
    }
    setLoading(true);
    setDisabled(true);
    let form = new FormData();

    /**
     * picture updated by user
     */
    if (profileImage) {
      form.append('image', profileImage, profileImage.name);
    }
    for (const [key, value] of Object.entries(finalPayload)) {
      const item = value || '';
      form.append(key, item);
    }

    try {
      const res = await updateProfile(form);

      setDisabled(false);
      setLoading(false);
      setErrorMessages({});
      if (res?.statusCode === 200) {
        const updatedData = {
          ...userInfo,
          name: `${finalPayload?.firstName} ${finalPayload?.lastName}`,
        };

        await getSingleProfile(updatedData);

        setImage(null);
        toaster.success({
          text: res?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (e) {
      setDisabled(false);
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleUpdatePassword = async (event) => {
    // Prevent page reload
    event.preventDefault();

    const generatedFormData = {
      currentPassword: formData?.currentPassword,
      newPassword: formData?.newPassword,
      passwordConfirmation: formData?.passwordConfirmation,
    };

    let finalPayload = JSON.parse(JSON.stringify(generatedFormData));

    const errors = await formValidatorJoi(finalPayload, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      return;
    }
    setDisabled(true);

    try {
      setLoading(true);
      const payload = {
        user: {
          currentPassword: formData?.currentPassword,
          newPassword: formData?.newPassword,
          confirmNewPassword: formData?.passwordConfirmation,
        },
      };
      const response = await updatePassword(payload);

      setDisabled(false);
      setLoading(false);
      if (response?.statusCode === 200) {
        toggleUpdatePassword();

        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      setDisabled(false);
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (!formData?.email) {
      getSingleProfile();
    }
  }, [formData?.email]);

  return (
    <Box>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className={scssClasses.mainBoxForm}
      >
        <Box>
          <Box className={scssClasses.btnBox}>
            <Box>
              <Typography variant="h5">{t('obx.profile.personalInfo')}</Typography>
              <Typography className={classes.descriptionText} variant="body2">
                {t('obx.profile.personalInfoText')}
              </Typography>
            </Box>

            <Box className={scssClasses.buttonGroup}>
              {/* we will use this in future */}
              {/* <Button
                onClick={() => {
                  history.goBack();
                }}
                variant="secondaryGrey"
              >
                {t('links.cancel')}
              </Button> */}
              <Button disabled={disabled} type="submit" variant="primary">
                {t('links.save')}
              </Button>
            </Box>
          </Box>
        </Box>
        <Box className={scssClasses.formBoxWrapper}>
          <Box>
            <Box className={scssClasses.formBoxGrid}>
              <Box className={scssClasses.flexBox}>
                <Typography className={classes.zoneCustomText} variant="subtitle2" gutterBottom>
                  {t('obx.form.input.textField.name.label')}
                  <RequiredAsterik />
                </Typography>
              </Box>
              <Box className={scssClasses.flexTwo}>
                <Box className={scssClasses.inputGrid}>
                  <FormControl className={scssClasses.flexControl}>
                    <TextField
                      error={renderError(profileFormConstants?.FIRST_NAME) ? true : false}
                      value={formData?.firstName || ''}
                      onChange={handleInputChange}
                      name="firstName"
                      helperText={renderError(profileFormConstants?.FIRST_NAME)}
                      placeholder={t('obx.form.input.textField.firstName.label')}
                    />
                  </FormControl>
                  <FormControl className={scssClasses.flexControl}>
                    <TextField
                      error={renderError(profileFormConstants?.LAST_NAME) ? true : false}
                      value={formData?.lastName || ''}
                      onChange={handleInputChange}
                      name="lastName"
                      helperText={renderError(profileFormConstants?.LAST_NAME)}
                      placeholder={t('obx.form.input.textField.lastName.label')}
                    />
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box>
            <Box className={scssClasses.formBoxGrid}>
              <Box className={scssClasses.flexBox}>
                <Typography className={classes.zoneCustomText} variant="subtitle2" gutterBottom>
                  {t('profile.email.label')}
                </Typography>
              </Box>
              <Box className={scssClasses.flexTwo}>
                <Box className={scssClasses.singleInput}>
                  <FormControl className={scssClasses.flexControl}>
                    <TextField
                      error={renderError(profileFormConstants?.EMAIL) ? true : false}
                      value={formData?.email || ''}
                      onChange={handleInputChange}
                      name="email"
                      helperText={renderError(profileFormConstants?.EMAIL)}
                      placeholder={t('obx.form.input.textField.email.placeHolder')}
                      disabled
                    />
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box>
            <Box className={scssClasses.formBoxGrid}>
              <Box className={scssClasses.flexBox}>
                <Typography className={classes.zoneCustomText} variant="subtitle2" gutterBottom>
                  {t('obx.form.input.textField.phoneNumber.label')}
                </Typography>
              </Box>
              <Box className={scssClasses.flexTwo}>
                <Box className={scssClasses.singleInput}>
                  <FormControl className={scssClasses.flexControl}>
                    <PhoneNumberWithCountry
                      value={formData.phoneNumber || ''}
                      onChange={(value) =>
                        handleInputChange({ target: { name: 'phoneNumber', value } })
                      }
                      name={'phoneNumber'}
                      isError={renderError(profileFormConstants?.PHONE_NUMBER) ? true : false}
                      international={true}
                      error={renderError(profileFormConstants?.PHONE_NUMBER)}
                      className={classes.countryPhnNumber}
                    />
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box>
            <Box className={scssClasses.formBoxGrid}>
              <Box className={scssClasses.flexBox}>
                <Typography className={classes.zoneCustomText} variant="subtitle2" gutterBottom>
                  {t('profile.photo.label')}
                </Typography>
                <Typography className={classes.descriptionText} variant="body2">
                  {t('profile.photo.description')}
                </Typography>
              </Box>
              <Box className={scssClasses.flexTwo}>
                <Box>
                  {/** Profile Image */}
                  <ProfileImageUpload
                    formData={formData}
                    formImageKey="image"
                    updateFormHandler={updateFormHandler}
                    errorMessages={errorMessages}
                    setErrorMessages={setErrorMessages}
                    image={profileImage}
                    setImage={setImage}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box>
            <Box className={scssClasses.formBoxGrid}>
              <Box className={scssClasses.flexBox}>
                <Typography className={classes.zoneCustomText} variant="subtitle2" gutterBottom>
                  {t('profile.address.label')}
                </Typography>
              </Box>
              <Box className={scssClasses.addressModule}>
                <Box className={scssClasses.inputGrid}>
                  <FormControl className={scssClasses.flexControl}>
                    <CountrySelectHookComponent />
                  </FormControl>
                  <FormControl className={scssClasses.flexControl}>
                    <TextField
                      value={formData?.address || ''}
                      onChange={handleInputChange}
                      name="address"
                      error={renderError(profileFormConstants?.ADDRESS) ? true : false}
                      helperText={renderError(profileFormConstants?.ADDRESS)}
                      placeholder={t('obx.form.input.textField.address.placeHolder')}
                    />
                  </FormControl>
                </Box>
                <Box className={scssClasses.inputGrid}>
                  <FormControl className={scssClasses.flexControl}>
                    <StateHookComponent />
                  </FormControl>

                  <FormControl className={scssClasses.flexControl}>
                    <CityHookComponent />
                  </FormControl>
                </Box>
                <Box className={scssClasses.inputGrid}>
                  <FormControl className={scssClasses.flexControl}>
                    <TextField
                      error={renderError(profileFormConstants?.POSTAL_CODE) ? true : false}
                      value={formData?.postalCode || ''}
                      onChange={handleInputChange}
                      name="postalCode"
                      helperText={renderError(profileFormConstants?.POSTAL_CODE)}
                      placeholder={t('obx.form.input.textField.postalCode.placeHolder')}
                    />
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box>
            <Box className={scssClasses.forgetMainWrapper}>
              <Box className={scssClasses.infoWrapper}>
                <Box>
                  <Typography variant="h3" gutterBottom>
                    {t('profile.accountPassword.title')}
                  </Typography>
                  <Typography className={classes.descriptionText} variant="body2">
                    {t('profile.accountPassword.accountPasswordDesc')}
                  </Typography>
                </Box>
                <PasswordLockImage />
              </Box>
              <Box className={scssClasses.buttonWrapper}>
                <Button
                  onClick={toggleUpdatePassword}
                  disableRipple
                  className={classes.updatePasswordBtn}
                  variant="onlyText"
                >
                  {t('commonText.updatePassword')}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <UpdatePassword
        handleSubmit={handleUpdatePassword}
        handleClose={toggleUpdatePassword}
        open={open}
        formData={formData}
        handleInputChange={handleInputChange}
        renderError={renderError}
        disabled={disabled}
      />
    </Box>
  );
};

export default ProfileInfo;
