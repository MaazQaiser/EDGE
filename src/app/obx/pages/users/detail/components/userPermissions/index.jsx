import { Box, Button, Skeleton } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { updateUsersPermissions } from 'services/user.services';
import PermissionsGrid from 'src/app/common/pages/settings/rolesAndPermissions/components/permissionGrid';
import { useStyles } from 'src/app/common/pages/settings/rolesAndPermissions/RolesAndPermission.style';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

const UserPermissions = ({ data, loadingApi, id, setData }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isPending, startTransition] = useTransition();
  const gridRef = useRef({});
  const [isEdited, setIsEditied] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = useSelector((state) => state.user?.info?.id);

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
  useEffect(() => {
    if (!isObjectEmpty(data)) {
      handleRoleSelection(data);
    }
  }, [data]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const privileges = gridRef.current;
      const response = await updateUsersPermissions({ user: { privileges } }, selectedRole?.id);

      if (response?.statusCode === 200) {
        setData((prev) => ({
          ...prev,
          privileges,
        }));
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
      // refetch();
      setLoading(false);
    }
  };
  console.log({ loadingApi, loading });
  if (loadingApi) {
    return (
      <>
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
        <Skeleton className={classes.rowSkeleton} />
      </>
    );
  }

  return (
    <Box>
      <Box className={classes.moudlesRoles}>
        <React.Fragment key={selectedRole?.id}>
          <PermissionsGrid
            key={JSON.stringify(selectedRole)}
            setFormValues={handleGridValueUpdate}
            isPending={isPending}
            selectedRole={selectedRole}
          />
        </React.Fragment>
      </Box>

      {!isObjectEmpty(selectedRole) && isEdited && !loadingApi && userId != id && (
        <Box onClick={handleSubmit} disabled={loading} className={classes.rolesBottombar}>
          <Button variant="primary" disabled={loading}>
            {t('obx.settings.rolesPermissions.save')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

UserPermissions.propTypes = {
  data: PropTypes.object,
  loadingApi: PropTypes.bool,
  id: PropTypes.string,
  setData: PropTypes.func,
};

export default UserPermissions;
