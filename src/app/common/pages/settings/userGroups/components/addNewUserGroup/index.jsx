import { Box, Button, Chip, TextField, Typography } from '@mui/material';
import { ReactComponent as DeleteIcon } from 'assets/svg/x-primary.svg?react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { createUserGroupPost } from 'services/settings.services';
import { getUsersWithDesiredType } from 'services/user.services';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { COMMON_SETTING } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import useFormHook from 'src/hooks/useFormHook';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import {
  accessControlList,
  organizationLevels,
  rolesEnumWithName,
  toastSettings,
} from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import PermissionChips from '../chipsWrapper';
import { useStyles } from './addNewStyle';
import { GroupDetail } from './groupDetail';

const organizationLevel = [
  {
    value: 'Franchise',
    label: 'Franchises Level',
  },
  {
    value: 'Home Officer Level',
    label: 'Home Office Level',
  },
];

const formDefaultValues = {
  name: '',
  organizationLevel: organizationLevel[0],
  permissions: accessControlList,
  userGroupsAttributes: [],
};

const AddNewUserGroup = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const authUser = useSelector((data) => data?.auth?.userRole?.slug);

  const [openModal, setOpenModal] = useState(false);

  const [view, setView] = useState({
    userGroupsAttributes: false,
    permissions: false,
  });
  const [dropDownOptions, setDropDownOptions] = useState({
    userGroupsAttributes: [],
  });

  const {
    handleInputChange,
    formData,
    disabled,
    updateFormHandler,
    errorMessages,
    setErrorMessages,
  } = useFormHook({
    defaultFormData: formDefaultValues,
  });
  const getUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsersWithDesiredType({});
      if (response?.data?.statusCode === 200) {
        setDropDownOptions((prevState) => {
          return {
            ...prevState,
            userGroupsAttributes: transformArrayForOptions(response?.data?.users, 'name', 'id').map(
              (a) => {
                return {
                  ...a,
                  label: capitalizeFirstLetter(a?.label),
                };
              },
            ),
          };
        });
      }
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const createUserGroup = async () => {
    try {
      setLoading(true);
      const validationData = {
        name: formData.name,
        groupableType:
          authUser === rolesEnumWithName.franchise_owner.slug
            ? organizationLevels?.[0]?.value
            : formData.organizationLevel?.value,
        privileges: formData.permissions,
        userGroupsAttributes:
          formData?.userGroupsAttributes?.map((user) => ({
            user_id: user.value,
          })) || [],
      };
      const errors = await formValidatorJoi(validationData, t);
      console.log({ errors, validationData });
      if (errors && Object.keys(errors).length) {
        setErrorMessages((prev) => ({ ...prev, ...errors, ...errorMessages }));
        return;
      }

      validationData.user_groups_attributes = validationData.userGroupsAttributes;
      delete validationData.userGroupsAttributes;
      const payload = {
        group: validationData,
      };

      const response = await createUserGroupPost(payload);
      const data = response || {};

      if (data?.statusCode === 200) {
        toaster.success({
          text: data?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setTimeout(() => {
          history.push(`${COMMON_SETTING}?activeTab=userGroups`);
        }, 1000);
      }
    } catch (error) {
      toaster.error({
        text: error?.message || 'Failed to create user group',
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  console.log({ formData });
  const handleChipDelete = (path) => {
    if (!path) return;

    const newPermissions = JSON.parse(JSON.stringify(formData?.permissions));

    const keys = path.split('.');
    let current = newPermissions;

    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]] === undefined) {
        return;
      }
      current = current[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    if (current[lastKey] !== undefined) {
      current[lastKey] = false;
      updateFormHandler('permissions', newPermissions);
    }
  };
  const handleSubmit = (data) => {
    updateFormHandler('permissions', data);
    console.log('submit', { data });
  };
  const handleDelete = () => {
    console.log('delete');
  };

  const toggleView = (name, value) => {
    setView((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <Box className={classes.mainWrapper}>
      {loading && <LoaderComponent loading={loading} />}
      {authUser === rolesEnumWithName.home_officer.slug && (
        <GroupDetail title={t('obx.settings.userGroups.organizationLevel')}>
          <Box className={classes.selectWrapper}>
            <Typography variant="subtitle2" className={classes.label}>
              {t('obx.settings.userGroups.selectOrganizationLevel')}
              {<RequiredAsterik />}
            </Typography>
            <CustomDropDown
              label={`${t('Select')}`}
              options={organizationLevel}
              selectedValues={formData?.organizationLevel}
              handleChange={handleInputChange}
              name="organizationLevel"
              isError={false}
              disabled={false}
              bordered={true}
              maxWidth="616px"
              className={classes.SelectGroup}
            />
          </Box>
        </GroupDetail>
      )}
      <GroupDetail title={t('obx.settings.userGroups.groupName')}>
        <Box className={classes.selectWrapper}>
          <TextField
            error={!!errorMessages?.name}
            id="outlined-search"
            onChange={handleInputChange}
            name="name"
            value={formData?.name || ''}
            placeholder={t('form.input.textField.address2.placeHolder')}
            variant="outlined"
            fullWidth
            type="text"
            helperText={!!errorMessages?.name ? errorMessages?.name : null}
          />
        </Box>
      </GroupDetail>
      <GroupDetail
        title={t('obx.settings.userGroups.permissions')}
        hasButton={true}
        openModal={openModal}
        setOpenModal={handleOpenModal}
        closeModal={handleCloseModal}
        handleSubmit={handleSubmit}
        data={formData.permissions}
      >
        <Box className={classes.chipsWrapper}>
          <PermissionChips
            permissionData={formData.permissions}
            onPermissionChange={handleChipDelete}
          />
        </Box>
      </GroupDetail>
      <GroupDetail title={t('obx.settings.userGroups.users')} hasButton={false}>
        <Box className={classes.selectWrapper}>
          <Typography variant="subtitle2" className={classes.label}>
            {t('obx.settings.userGroups.selectUsers')}
            {<RequiredAsterik />}
          </Typography>
          <CustomDropDown
            label={`${t('Select')}`}
            options={dropDownOptions.userGroupsAttributes}
            selectedValues={formData?.userGroupsAttributes}
            handleChange={handleInputChange}
            name="userGroupsAttributes"
            multiSelect
            checkmark
            searchable
            disabled={false}
            bordered={true}
            // width="100%"
            maxWidth="616px"
            className={classes.SelectGroup}
          />
          {!!errorMessages?.userGroupsAttributes && (
            <Box className={classes.invalidFeedback}>{errorMessages?.userGroupsAttributes}</Box>
          )}
        </Box>
        <Box className={classes.chipsWrapper}>
          {formData.userGroupsAttributes.length > 0
            ? formData?.userGroupsAttributes.map((data, i) => {
                return (
                  <Chip
                    key={i}
                    label={data?.label}
                    size="small"
                    color="primary"
                    onDelete={handleDelete}
                    deleteIcon={<DeleteIcon />}
                  />
                );
              })
            : null}

          {formData?.userGroupsAttributes.length > 5 && !view?.userGroupsAttributes ? (
            <Chip
              label="View all"
              size="small"
              color="primary"
              variant="filled-primary"
              onClick={() => {
                toggleView('userGroupsAttributes', true);
              }}
            />
          ) : null}
        </Box>
      </GroupDetail>

      <Box className={classes.footerWrapper}>
        <Button
          variant="secondaryGrey"
          onClick={() => {
            history.goBack();
          }}
          disableRipple
        >
          {t('obx.settings.userGroups.cencel')}
        </Button>
        <Button onClick={createUserGroup} variant="primary" disableRipple disabled={disabled}>
          {t('obx.settings.userGroups.createGroup')}
        </Button>
      </Box>
    </Box>
  );
};

export default AddNewUserGroup;
