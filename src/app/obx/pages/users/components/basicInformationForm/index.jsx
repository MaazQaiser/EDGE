import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Divider, InputLabel, TextField, Typography } from '@mui/material';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader';
import PhoneNumberWithCountry from 'src/app/components/common/phoneNumberWithCountry';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { ACL_OBX_EMPLOYEERATE_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { OBX_USER, OBX_USER_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { resetPassword } from 'src/services/auth.services';
import { getAssignedFranchises } from 'src/services/franchise.services';
import { getRolesForSettings } from 'src/services/settings.services';
import { getUsersById, updateUsersInfo } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { rolableTypeEnum, rolesEnumWithName, toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './BasicInformationForm';

const emptyState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  fileNumber: '',
  employeeType: {},
  role: {},
  assignedFranchises: [],
  perHourRate: null,
};

const employeeTypeEnum = [
  {
    value: 'W2',
    label: 'Employee (Hourly)',
  },
  {
    value: 'W2Salary',
    label: 'Employee (Full Time / Salaried)',
  },
  {
    value: '1099',
    label: 'Contractor (Hourly)',
  },
];

const BasicInformationForm = () => {
  const [formData, setFormData] = useState(emptyState);
  const [errorMessages, setErrorMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [roleTypes, setRoleTypes] = useState([]);
  const [assignedFranchises, setAssignedFranchises] = useState([]);
  const [showFranchises, setShowFranchises] = useState(true);
  const { id: userId } = useParams();
  const { t } = useTranslation();
  const classes = useStyles();
  const userRole = useSelector((state) => state.auth.userRole);
  const franchiseId = useSelector((state) => state.auth.franchiseId);
  const [isTerminated, setIsTerminated] = useState(false);

  const handleBack = () => {
    if (userId) {
      history.push(`${OBX_USER_DETAIL}/${userId}`);
    } else {
      history.push(`${OBX_USER}`);
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getUsersById(userId);
      if (response?.statusCode === 200) {
        const userRoles = await getRolesForSettings();
        let employeeTypeValue = {};
        let getRoleType = {};
        if (response?.data?.user?.employeeType !== null) {
          employeeTypeValue = employeeTypeEnum.find(
            (type) => type.value === response?.data?.user?.employeeType,
          );
        }
        let allRoles;
        let result;
        if (response?.data?.user?.roleableType === rolableTypeEnum.home_officer) {
          setShowFranchises(false);
          allRoles = userRoles?.data?.filter((role) => role.level === 'HomeOffice');
        } else {
          allRoles = userRoles?.data?.filter(
            (role) =>
              role.level === response?.data?.user?.roleableType &&
              role.slug !== rolesEnumWithName.franchise_owner.slug,
          );
          const franchises = await getAssignedFranchises();
          const allFranchises = franchises?.data?.franchises.map((franchise) => ({
            value: franchise.id,
            label: franchise.name,
          }));
          result = allFranchises.filter((item) =>
            response?.data?.user?.franchiseUserIds.includes(item.value),
          );
          setAssignedFranchises(allFranchises);
        }
        if (allRoles.length !== 0 && response?.data?.user?.role !== null) {
          const role = allRoles?.find((type) => type.value === response?.data?.user?.role);
          if (role !== undefined) {
            role.label = role.name;
            getRoleType = role;
          }
        }
        setRoleTypes(allRoles);

        setFormData((prevState) => ({
          ...prevState,
          firstName: response?.data?.user?.firstName,
          lastName: response?.data?.user?.lastName,
          email: response?.data?.user?.email,
          phoneNumber: response?.data?.user?.phoneNumber,
          fileNumber: response?.data?.user?.fileNumber,
          employeeType: employeeTypeValue,
          role: getRoleType,
          assignedFranchises: result,
          perHourRate: response?.data?.user?.perHourRate,
        }));

        if (response?.data?.user?.lastWorkingDay) setIsTerminated(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const backButtonComponent = (
    <Button variant="tertiaryGrey" onClick={handleBack} startIcon={<ArrowBackIcon />}>
      {t('links.back')}
    </Button>
  );

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId]);

  const getErrorKey = (key) => {
    return `userDetails,${key}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (franchiseId) {
      delete formData.assignedFranchises;
    } else {
      delete formData.fileNumber;
      delete formData.perHourRate;
      delete formData.employeeType;
    }

    let formDataValue = {
      ...formData,
    };

    if (franchiseId && formDataValue?.employeeType?.value === employeeTypeEnum[1].value) {
      delete formDataValue.perHourRate;
    }

    if (franchiseId && rolesEnumWithName.supervisor.slug === userRole?.slug) {
      delete formDataValue.perHourRate;
      delete formDataValue.employeeType;
    }

    if (franchiseId && rolesEnumWithName.supervisor.slug !== userRole?.slug) {
      formDataValue.employeeType = formDataValue?.employeeType?.value || null;
    }

    if ('perHourRate' in formDataValue && !userHasPermission(ACL_OBX_EMPLOYEERATE_UPDATE)) {
      delete formDataValue.perHourRate;
    }
    if (!franchiseId) {
      formDataValue.assignedFranchises = formDataValue?.assignedFranchises?.map(
        (item) => item.value,
      );
      delete formDataValue.fileNumber;
    }

    formDataValue.role = formDataValue?.role.value;
    const errors = await joiValidate({ userDetails: { ...formDataValue } }, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
    };
    if (!franchiseId) {
      payload.franchiseUserIds = formData.assignedFranchises?.map((item) => item.value);
    }
    delete payload.assignedFranchises;
    payload.type = formData.role.value;
    delete payload.role;

    if (payload?.employeeType?.value === employeeTypeEnum[1].value) {
      payload.perHourRate = null;
    }

    const newFormData = {
      user: {
        ...payload,
        employeeType: payload?.employeeType?.value,
      },
    };

    if (!userHasPermission(ACL_OBX_EMPLOYEERATE_UPDATE)) {
      delete newFormData?.user?.perHourRate;
    }
    try {
      const response = await updateUsersInfo(userId, newFormData);
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        history.push(`${OBX_USER_DETAIL}/${userId}`);
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
  const handleChangePassword = async () => {
    try {
      const response = await resetPassword({ user: { email: formData.email } });
      if (response?.statusCode === 200) {
        const anchor = document.createElement('a');
        anchor.target = '_blank';
        anchor.href = response?.data?.ticket;
        anchor.click();
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const updateFormHandler = useCallback(
    (name, value) => {
      // Remove any extra decimal points beyond two
      let processedValue = value;
      if (typeof value !== 'object' && name === 'perHourRate') {
        // First, validate that the input does not start with '0' or a dot and conforms to the pattern
        const regex = /^(?!0|\.)(\d{1,3})(\.\d{0,2})?.*$/;
        const match = processedValue.match(regex);

        if (match) {
          // If the input matches the pattern, process it to ensure only two decimal places
          processedValue = match[1]; // Digits before the decimal point
          if (match[2]) {
            // If there's a decimal part, include up to two decimal places
            processedValue += match[2].substring(0, 3);
          }
        } else {
          // If the input doesn't match the pattern, set it to an empty string or handle it accordingly
          processedValue = '';
        }
      }

      // Update the form data with the processed value
      setFormData((prevState) => ({
        ...prevState,
        [name]: processedValue,
      }));
    },
    [setFormData],
  );

  const preventNegativeValues = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      updateFormHandler(name, value);
    },
    [updateFormHandler],
  );

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box
        className={classes.infoWrapper}
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
      >
        <Box className={classes.buttonGroupUpper}>
          <Box className={classes.btnBox}>{backButtonComponent}</Box>
          <Box className={classes.buttonGroup}>
            <Button variant="secondaryGrey" onClick={handleBack}>
              {t('links.cancel')}
            </Button>
            <Button variant="primary" type="submit" disabled={isTerminated}>
              {t('obx.buttons.save')}
            </Button>
          </Box>
        </Box>
        <Divider className={classes.zonesDivider} />
        <Box className={classes.siteDetais}>
          <Box className={classes.siteDetaisWrapper}>
            <Typography variant="h4"> {t('obx.users.userInformation.title')}</Typography>
            <Box className={classNames(classes.siteDetaisFields, classes.noMarginBottom)}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="firstName">
                  {t('obx.users.userInformation.firstName')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  fullWidth
                  placeholder={t('obx.users.userInformation.john')}
                  type="text"
                  className={classes?.textFiledFilter}
                  name="firstName"
                  value={formData?.firstName || ''}
                  onChange={handleInputChange}
                  error={!!errorMessages[getErrorKey('firstName')]}
                  helperText={
                    !!errorMessages[getErrorKey('firstName')]
                      ? errorMessages[getErrorKey('firstName')]
                      : null
                  }
                  disabled={isTerminated}
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="lastName">
                  {t('obx.users.userInformation.lastName')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  fullWidth
                  placeholder={t('obx.users.userInformation.doe')}
                  type="text"
                  className={classes?.textFiledFilter}
                  name="lastName"
                  value={formData?.lastName || ''}
                  onChange={handleInputChange}
                  error={!!errorMessages[getErrorKey('lastName')]}
                  helperText={
                    !!errorMessages[getErrorKey('lastName')]
                      ? errorMessages[getErrorKey('lastName')]
                      : null
                  }
                  disabled={isTerminated}
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="email" disabled>
                  {t('obx.users.userInformation.email')} <RequiredAsterik />
                </InputLabel>
                <TextField
                  fullWidth
                  placeholder={t('obx.users.userInformation.emailPlaceholder')}
                  type="email"
                  name="email"
                  // disabled
                  className={classes?.textFiledFilter}
                  value={formData?.email || ''}
                  onChange={handleInputChange}
                  error={!!errorMessages[getErrorKey('email')]}
                  helperText={
                    !!errorMessages[getErrorKey('email')]
                      ? errorMessages[getErrorKey('email')]
                      : null
                  }
                  disabled={isTerminated}
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="number">
                  {t('obx.users.userInformation.number')} <RequiredAsterik />
                </InputLabel>
                <PhoneNumberWithCountry
                  value={formData.phoneNumber || ''}
                  onChange={(value) =>
                    handleInputChange({ target: { name: 'phoneNumber', value } })
                  }
                  name={'phoneNumber'}
                  isError={!!errorMessages[getErrorKey('phoneNumber')]}
                  international={true}
                  error={
                    !!errorMessages[getErrorKey('phoneNumber')]
                      ? errorMessages[getErrorKey('phoneNumber')]
                      : null
                  }
                  className={classes.countryPhnNumber}
                  disabled={isTerminated}
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="role">{t('obx.users.userInformation.role')}</InputLabel>
                <CustomDropDown
                  label={t('obx.users.userInformation.role')}
                  name="role"
                  options={transformArrayForOptions(roleTypes, 'name', 'value')}
                  selectedValues={formData.role}
                  handleChange={handleInputChange}
                  placeHolder={`${t('obx.users.userInformation.select')} ${t('obx.users.userInformation.role')}`}
                  placeHolderClassName={classes.placeHolderColor}
                  className={classes.dropdownWrap}
                  bordered
                  isError={!!errorMessages[getErrorKey('role')]}
                  disabled={isTerminated}
                />
                {!!errorMessages[getErrorKey('role')] && (
                  <Box className={classes.invalidFeedback}>
                    {errorMessages[getErrorKey('role')]}
                  </Box>
                )}
              </Box>
              {!franchiseId && showFranchises && (
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="assignedFranchises">
                    {t('obx.users.userInformation.assignedFranchises')} <RequiredAsterik />
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.users.userInformation.assignedFranchises')}
                    name="assignedFranchises"
                    options={assignedFranchises}
                    selectedValues={formData.assignedFranchises}
                    handleChange={handleInputChange}
                    placeHolder={`${t('obx.users.userInformation.select')} ${t('obx.users.userInformation.assignedFranchises')}`}
                    placeHolderClassName={classes.placeHolderColor}
                    className={classes.dropdownWrap}
                    bordered
                    withTiles
                    isError={!!errorMessages[getErrorKey('assignedFranchises')]}
                    multiSelect
                    disabled={isTerminated}
                    searchable
                  />
                  {!!errorMessages[getErrorKey('assignedFranchises')] && (
                    <Box className={classes.invalidFeedback}>
                      {errorMessages[getErrorKey('assignedFranchises')]}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          {franchiseId && (
            <Box className={classes.siteDetaisWrapper}>
              <Typography variant="h4"> {t('obx.users.userInformation.jobDetails')}</Typography>
              <Box className={classes.siteDetaisFields}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="file">
                    {t('obx.users.userInformation.file')} <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    fullWidth
                    placeholder={`${t('obx.users.userInformation.enter')} ${t('obx.users.userInformation.file')}`}
                    type="text"
                    className={classes?.textFiledFilter}
                    name="fileNumber"
                    value={formData?.fileNumber || ''}
                    onChange={handleInputChange}
                    error={!!errorMessages[getErrorKey('fileNumber')]}
                    helperText={
                      !!errorMessages[getErrorKey('fileNumber')]
                        ? errorMessages[getErrorKey('fileNumber')]
                        : null
                    }
                    disabled={isTerminated}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  {rolesEnumWithName.supervisor.slug !== userRole?.slug ? (
                    <>
                      <InputLabel htmlFor="type">
                        {t('obx.users.userInformation.type')} <RequiredAsterik />
                      </InputLabel>
                      <CustomDropDown
                        label={t('obx.users.userInformation.type')}
                        name="employeeType"
                        options={transformArrayForOptions(employeeTypeEnum, 'label', 'value')}
                        selectedValues={formData.employeeType}
                        handleChange={handleInputChange}
                        placeHolder={`${t('obx.users.userInformation.select')} ${t('obx.users.userInformation.type')}`}
                        placeHolderClassName={classes.placeHolderColor}
                        className={classes.dropdownWrap}
                        bordered
                        isError={!!errorMessages[getErrorKey('employeeType')]}
                        disabled={isTerminated}
                      />
                      {!!errorMessages[getErrorKey('employeeType')] && (
                        <Box className={classes.invalidFeedback}>
                          {errorMessages[getErrorKey('employeeType')]}
                        </Box>
                      )}
                    </>
                  ) : null}
                </Box>
                <RenderIfHasPermission name={ACL_OBX_EMPLOYEERATE_UPDATE}>
                  {formData.employeeType.value !== employeeTypeEnum[1].value &&
                  rolesEnumWithName.supervisor.slug !== userRole?.slug ? (
                    <>
                      {' '}
                      <Box className={classes.fieldWrapperNew}>
                        <InputLabel htmlFor="baseRate">
                          {t('obx.users.userInformation.baseRate')} <RequiredAsterik />
                        </InputLabel>
                        <TextField
                          fullWidth
                          placeholder={`${t('obx.users.userInformation.add')} ${t('obx.users.userInformation.baseRate')}`}
                          type="number"
                          className={classes?.textFiledFilter}
                          name="perHourRate"
                          onKeyDown={preventNegativeValues}
                          value={formData?.perHourRate || ''}
                          onChange={handleInputChange}
                          error={!!errorMessages[getErrorKey('perHourRate')]}
                          helperText={
                            !!errorMessages[getErrorKey('perHourRate')]
                              ? errorMessages[getErrorKey('perHourRate')]
                              : null
                          }
                          disabled={isTerminated}
                        />
                      </Box>
                    </>
                  ) : (
                    ''
                  )}
                </RenderIfHasPermission>

                {rolesEnumWithName.franchise_owner.slug === userRole?.slug && (
                  <Box className={`${classes.fieldWrapperNew} ${classes.passwordChange}`}>
                    {/* <Box className={classes.inlineButtons}> */}
                    <Button
                      variant="secondaryBlue"
                      onClick={handleChangePassword}
                      className={`${classes.btnClass}`}
                      disabled={isTerminated}
                    >
                      {t('obx.users.userInformation.changePassword')}
                    </Button>
                  </Box>
                )}
              </Box>

              {/* <Box className={classes.fieldWrapper}>
              <InputLabel htmlFor="roll">
                {t('obx.users.userInformation.roll')} <RequiredAsterik />
              </InputLabel>
              <CustomDropDown
                label={t('obx.users.userInformation.roll')}
                name="siteType"
                id="siteType"
                placeHolder={`${t('obx.users.userInformation.select')} ${t('obx.users.userInformation.roll')}`}
                placeHolderClassName={classes.placeHolderColor}
                className={classes.dropdownWrap}
                options={finalSites}
                selectedValues={queryParams.sites}
                handleChange={inputChangedHandler}
                multiSelect={true}
                searchable={false}
                withTiles={true}
                bordered
              />
            </Box> */}
              {/* <Box className={classes.fieldWrapper}>
              <InputLabel htmlFor="designation">
                {t('obx.users.userInformation.designation')} <RequiredAsterik />
              </InputLabel>
              <CustomDropDown
                label={t('obx.users.userInformation.designation')}
                name="siteType"
                id="siteType"
                placeHolder={`${t('obx.users.userInformation.select')} ${t('obx.users.userInformation.designation')}`}
                placeHolderClassName={classes.placeHolderColor}
                className={classes.dropdownWrap}
                options={finalSites}
                selectedValues={queryParams.sites}
                handleChange={inputChangedHandler}
                multiSelect={true}
                searchable={false}
                withTiles={true}
                bordered
              />
            </Box> */}
              {/* <Box className={classes.fieldWrapper}></Box> */}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default BasicInformationForm;
