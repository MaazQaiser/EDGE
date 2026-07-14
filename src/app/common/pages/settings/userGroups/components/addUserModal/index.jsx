import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import { COMMON_SETTING } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import useFormHook from 'src/hooks/useFormHook';
import { createUserGroupPost, getUsersOfGroups } from 'src/services/settings.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { useStyles } from './userModalStyle';

const formDefaultValues = {
  userGroupsAttributes: [],
};

const AddUserModalBody = ({ handleCloseModal, refetch, data = {} }) => {
  const [loading, setLoading] = useState(false);
  const [dropDownOptions, setDropDownOptions] = useState({
    userGroupsAttributes: [],
  });
  const { handleInputChange, formData, errorMessages, setErrorMessages } = useFormHook({
    defaultFormData: formDefaultValues,
  });
  const getUsers = async () => {
    try {
      const response = await getUsersOfGroups({ group_id: data?.id });
      if (response?.statusCode == 200) {
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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const validationData = {
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

      const response = await createUserGroupPost(payload, data?.id);
      const apiData = response || {};

      console.log({ apiData });
      if (apiData?.statusCode === 200) {
        toaster.success({
          text: apiData?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        setTimeout(() => {
          history.push(`${COMMON_SETTING}?activeTab=userGroups`);
        }, 1000);
        refetch();
      }
      handleCloseModal();
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
  const { t } = useTranslation();
  const classes = useStyles();
  useEffect(() => {
    getUsers();
  }, []);
  console.log({ dropDownOptions });
  return (
    <Box className={classes.modalWrapper}>
      <Box className={classes.modalContentHeader}>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.settings.userGroups.addNewUsers')}
        </Typography>
        <Typography variant="body2" className={classes.subText}>
          {t('obx.settings.userGroups.addUserSubText')}
        </Typography>
      </Box>
      <Box className={classes.modalContent}>
        <Box className={classes.selectWrapper}>
          <Typography variant="body2" className={'label'}>
            {t('obx.settings.userGroups.selectUser')}
          </Typography>

          <CustomDropDown
            name="userGroupsAttributes"
            label={t('obx.settings.userGroups.selectUser')}
            placeholder={t('obx.settings.userGroups.selectUser')}
            options={dropDownOptions.userGroupsAttributes}
            selectedValues={formData?.userGroupsAttributes}
            handleChange={handleInputChange}
            bordered={true}
            multiSelect={true}
            disabled={loading}
            className={classes.leadDropdown}
          />
          {!!errorMessages?.userGroupsAttributes && (
            <Box className={classes.invalidFeedback}>{errorMessages?.userGroupsAttributes}</Box>
          )}
        </Box>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleCloseModal} disabled={loading} variant="secondaryGrey">
          {t('obx.settings.userGroups.cencel')}
        </Button>
        <Button variant="primary" disabled={loading} onClick={handleSubmit}>
          {t('obx.settings.userGroups.addUsers')}
        </Button>
      </Box>
    </Box>
  );
};
AddUserModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
  refetch: PropTypes.func,
  data: PropTypes.object,
};

const AddUserModal = ({ openModal, refetch, handleCloseModal, ...props }) => {
  return (
    <ModalComponent
      open={openModal}
      handleClose={handleCloseModal}
      body={<AddUserModalBody handleCloseModal={handleCloseModal} refetch={refetch} {...props} />}
    />
  );
};

AddUserModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
  refetch: PropTypes.func,
  data: PropTypes.object,
};

export default AddUserModal;
