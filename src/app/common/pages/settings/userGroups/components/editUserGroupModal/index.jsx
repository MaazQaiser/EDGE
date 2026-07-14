import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomTabPanel from 'src/app/components/common/customTabPanel';
import ModalComponent from 'src/app/components/common/modal';
import PermissionGridSkelton from 'src/app/components/common/skeletonLoader/permissionGridSkelton';
import { getUserGroupDetails } from 'src/services/settings.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import PermissionsGrid from '../../../rolesAndPermissions/components/permissionGrid';
import UserListing from '../userListing';
import { useStyles } from './editUser';

const EditUserGroupModalBody = ({
  handleCloseModal,
  handleSubmit,
  data = {},
  disabled = false,
  setAllowEdit = () => {},
  setDisabled = () => {},
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);

  const [localData, setLocalData] = useState({});

  console.log({ data });
  const setFormValues = (data) => {
    setLocalData(data);
  };
  const handleClose = () => {
    handleCloseModal();
    setDisabled(true);
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getGroupDetails = async () => {
    try {
      setLoading(true);
      const res = await getUserGroupDetails({ groupId: data?.id });
      setLocalData(res?.data?.group?.privileges);
      setUserData(res?.data?.group?.users);
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
  useEffect(() => {
    getGroupDetails();
  }, []);
  return (
    <Box className={classes.modalWrapper}>
      <Typography variant="h3" className={classes.headText}>
        {t('obx.settings.userGroups.managerGroup')}
      </Typography>
      <Box>
        <Box className={classes.tabsfunctionalWrapper}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            className={classes.tabMainContainer}
          >
            <Tab label={t('obx.settings.userGroups.permissions')} />
            <Tab label={t('obx.settings.userGroups.users')} />
          </Tabs>
        </Box>

        <Box className={classes.tabsContent}>
          {!loading ? (
            <>
              <CustomTabPanel value={value} index={0} className={classes.tabPanelContent}>
                <Box className={classes.modalContent}>
                  <Box className={classes.modalContentHeader}>
                    <Typography variant="h3" className={classes.headText}>
                      {t('obx.settings.userGroups.groupsPermissions')}
                    </Typography>
                    {disabled && (
                      <Button
                        variant="secondaryBlue"
                        onClick={setAllowEdit}
                        className={classes.editButton}
                      >
                        {t('obx.settings.userGroups.editPermissions')}
                      </Button>
                    )}
                  </Box>
                  <Box className={classes.permissionsGridWrapper}>
                    <PermissionsGrid
                      selectedRole={{ privileges: localData }}
                      isPending={false}
                      setFormValues={setFormValues}
                      disabled={disabled}
                      handleCloseModal={handleCloseModal}
                    />
                  </Box>
                </Box>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1} className={classes.tabPanelContent}>
                <Box className={classes.userListingWrapper}>
                  <UserListing
                    key={userData}
                    refetch={getGroupDetails}
                    groupData={data}
                    userData={userData}
                  />
                </Box>
              </CustomTabPanel>
            </>
          ) : (
            <PermissionGridSkelton />
          )}
        </Box>
      </Box>

      <Box className={classes.inlineButtons}>
        {!disabled && (
          <>
            <Button onClick={handleClose} variant="secondaryGrey">
              {t('obx.settings.userGroups.cencel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                handleSubmit(localData);
              }}
            >
              {t('obx.settings.userGroups.saveChanges')}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

EditUserGroupModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
  data: PropTypes.object,
  disabled: PropTypes.bool,
  setAllowEdit: PropTypes.func,
  setDisabled: PropTypes.func,
};

const EditUserGroupModal = ({ openModal, ...props }) => {
  return <ModalComponent open={openModal} body={<EditUserGroupModalBody {...props} />} />;
};

EditUserGroupModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

export default EditUserGroupModal;
