import { Box, Button, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import LoaderComponent from 'src/app/components/common/loader';
import SideDrawer from 'src/app/components/common/sideDrawer';
import { ACL_OBX_SETTINGS_MAPPING_PREFERENCE_ROLES_PERMISSIONS_UPDDATE } from 'src/app/router/constant/OBXMODULE';
// import { ReactComponent as PlusIcon } from 'src/assets/svg/WhitePlusIcon.svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import {
  getRolesForSettings,
  resetPrivileges,
  updatePermissions,
} from 'src/services/settings.services';
import { organizationLevelsObject, rolableTypeEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import ActivityLogDrawer from './components/activityLogsDrawer';
import PermissionsGrid from './components/permissionGrid';
import ResetModal from './components/resetModal';
import RoleModal from './components/roleModal';
import { useStyles } from './RolesAndPermission.style';

const SideTabsList = ({ renderList, selectedRole, handleRoleSelection }) => {
  const classes = useStyles();

  const [localSelection, setLocalSelection] = useState(selectedRole);
  const handleClick = (data) => {
    const tempSelectedRole = { ...data };
    setLocalSelection(tempSelectedRole);
    handleRoleSelection(data);
  };
  useEffect(() => {
    if (selectedRole) {
      setLocalSelection(selectedRole);
    }
  }, [JSON.stringify(selectedRole)]);
  return renderList?.map((data) => (
    <React.Fragment key={data?.id}>
      <Button
        variant={`${localSelection?.id === data?.id ? 'primary' : 'secondary'}`}
        onClick={() => {
          handleClick(data);
        }}
        className={classes.rolesButton}
      >
        {data?.name}
      </Button>
    </React.Fragment>
  ));
};

const RolesAndPermissions = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const authUserType = useSelector((data) => data?.auth?.userRole?.slug);
  const authUser = useSelector((state) => state?.user?.info?.roleableType);

  // const authUser = useSelector((data) => data?.auth?.userRole?.slug);
  const franchiseId = useSelector((state) => state?.auth?.franchiseId);

  const [loading, setLoading] = useState(false);
  const [openResetModal, setOpenResetModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const gridRef = useRef({});
  const [isEdited, setIsEditied] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedTab, setSelectedTab] = useState(() => {
    return organizationLevelsObject.franchise;
  });
  const [rolesList, setRolesList] = useState({
    [organizationLevelsObject.HO]: [],
    [organizationLevelsObject.franchise]: [],
  });

  const [openRoleModal, setOpenRoleModal] = useState(false);

  // const handleResetModalOpen = () => {
  //   setOpenResetModal(true);
  // };

  const handleResetModalClose = () => {
    setOpenResetModal(false);
  };

  // const handleRoleModalOpen = () => {
  //   setOpenRoleModal(true);
  // };

  const handleRoleModalClose = () => {
    setOpenRoleModal(false);
  };

  const [showDrawer, setShowDrawer] = useState(false);
  const handleSelection = (event, newSelection) => {
    if (newSelection !== null) {
      setSelectedTab(newSelection);
    }
  };

  const handleGridValueUpdate = (data) => {
    if (!isObjectEmpty(data)) {
      setIsEditied(true);
    }

    gridRef.current = data;
  };
  const handleRoleSelection = (data) => {
    startTransition(() => {
      setIsEditied(false);
      setSelectedRole(data);
    });
  };
  const refetch = () => {
    getRolesAndPermissions();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await updatePermissions(
        { role: { privileges: gridRef.current } },
        selectedRole?.id,
      );

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      refetch();
      setLoading(false);
    }
  };

  const handleResetRole = async () => {
    try {
      setLoading(true);
      const res = await resetPrivileges(selectedRole?.id);
      if (res?.data?.statusCode === 200) {
        toaster.success({
          text: res?.data?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      refetch();
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      handleResetModalClose();
      setLoading(false);
    }
  };

  const getRolesAndPermissions = async () => {
    try {
      setLoading(true);
      let dataSet = { ho: [], franchises: [] };
      const data = await getRolesForSettings();

      if (data?.data) {
        data?.data?.forEach((item) => {
          if (authUser === rolableTypeEnum.home_officer) {
            if (item?.level === rolableTypeEnum.franchise) {
              dataSet.franchises.push(item);
            } else {
              dataSet.ho.push(item);
            }
          } else {
            if (item?.roleableType === rolableTypeEnum.franchise) {
              dataSet.franchises.push(item);
            } else {
              dataSet.ho.push(item);
            }
          }
        });
        dataSet.ho = dataSet.ho.map((item) => {
          if (item.name === 'Home Officer') {
            item.name = 'Home Office Admin';
          }
          return item;
        });
        setRolesList({
          [organizationLevelsObject.HO]: dataSet.ho,
          [organizationLevelsObject.franchise]: dataSet.franchises,
        });

        let selectedRoleNew = null;
        selectedRoleNew = dataSet.franchises?.[0] || {};

        setSelectedRole(!isObjectEmpty(selectedRole) ? selectedRole : selectedRoleNew);
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRolesAndPermissions();
  }, []);

  const renderList = rolesList?.[selectedTab] || [];

  // save button if the selected role is same as the logged in user type
  const hideOnBasisOFRole = !(selectedRole?.slug === authUserType);
  return (
    <Box className={classes.rolesTopWrapper}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.rolesMian}>
        <Box className={classes.rolesLeftBar}>
          {authUser === rolableTypeEnum.home_officer && !franchiseId && (
            <>
              <ToggleButtonGroup
                value={selectedTab}
                className={classes.statesButtons}
                exclusive
                onChange={handleSelection}
                aria-label="toggle button tabs"
              >
                <ToggleButton
                  value={organizationLevelsObject.HO}
                  aria-label="tab 1"
                  className={classes.firstButton}
                >
                  {t('obx.settings.rolesPermissions.ho')}
                </ToggleButton>
                <ToggleButton
                  value={organizationLevelsObject.franchise}
                  aria-label="tab 2"
                  className={classes.lastButton}
                >
                  {t('obx.settings.rolesPermissions.franchies')}
                </ToggleButton>
              </ToggleButtonGroup>
            </>
          )}
          <Box className={classes.rolesValueButton}></Box>
          <SideTabsList
            renderList={renderList}
            selectedRole={selectedRole}
            handleRoleSelection={handleRoleSelection}
          />
        </Box>
        <Box className={classes.rolesRightBar}>
          <Box className={classes.rolesButtonsBar}>
            <Box className={classes.buttonBarLeft}>
              <Typography variant="h4" className={classes.zoneCustomText}>
                {t('obx.settings.rolesPermissions.title')}
              </Typography>
              <Typography variant="body2" className={classes.zoneDetailText}>
                {t('obx.settings.rolesPermissions.subTitle')}{' '}
                {!franchiseId && t('obx.settings.rolesPermissions.subTitleNote')}
              </Typography>
            </Box>

            <RenderIfHasPermission
              name={ACL_OBX_SETTINGS_MAPPING_PREFERENCE_ROLES_PERMISSIONS_UPDDATE}
            >
              {!isObjectEmpty(selectedRole) && hideOnBasisOFRole && (
                <Box className={classes.buttonBarRight}>
                  <Box className={classes.rightButtons}>
                    {/* <Button variant="secondaryGrey" onClick={handleResetModalOpen}>
                      {t('obx.settings.rolesPermissions.resetToDefault')}
                    </Button> */}
                    <ResetModal
                      openModal={openResetModal}
                      handleCloseModal={handleResetModalClose}
                      handleSubmit={handleResetRole}
                      selectedRole={selectedRole}
                    />
                    {/* <Button variant="secondaryGrey" onClick={() => setShowDrawer(true)}>
                  {t('obx.settings.rolesPermissions.viewActivity')}
                </Button> */}

                    {/*<Button startIcon={<PlusIcon />} variant="primary" onClick={handleRoleModalOpen}>*/}
                    {/*  {t('obx.settings.rolesPermissions.addNewRole')}*/}
                    {/*</Button>*/}

                    <RoleModal
                      openModal={openRoleModal}
                      handleCloseModal={handleRoleModalClose}
                      handleSubmit={handleRoleModalClose}
                      refetch={refetch}
                    />
                  </Box>
                </Box>
              )}
            </RenderIfHasPermission>
          </Box>
          <Box className={classes.moudlesRoles}>
            <React.Fragment key={selectedRole?.id}>
              <PermissionsGrid
                disabled={!hideOnBasisOFRole}
                // key={JSON.stringify(selectedRole)}
                setFormValues={handleGridValueUpdate}
                isPending={isPending}
                selectedRole={selectedRole}
              />
            </React.Fragment>
          </Box>
        </Box>
      </Box>
      <RenderIfHasPermission name={ACL_OBX_SETTINGS_MAPPING_PREFERENCE_ROLES_PERMISSIONS_UPDDATE}>
        {!isObjectEmpty(selectedRole) && isEdited && hideOnBasisOFRole && (
          <Box onClick={handleSubmit} disabled={loading} className={classes.rolesBottombar}>
            <Button variant="primary" disabled={loading}>
              {t('obx.settings.rolesPermissions.save')}
            </Button>
          </Box>
        )}
      </RenderIfHasPermission>
      <SideDrawer isOpen={showDrawer} totalWidth={'1144px'}>
        <ActivityLogDrawer showDrawer={showDrawer} setShowDrawer={setShowDrawer} />
      </SideDrawer>
    </Box>
  );
};

export default RolesAndPermissions;
