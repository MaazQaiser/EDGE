import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { deepClone, isObjectEmpty } from 'src/helper/utilityFunctions';
import { accessControlList } from 'src/utils/constants';

import PermissionsGrid from '../../../rolesAndPermissions/components/permissionGrid';
import { useStyles } from './permissionModalStyle';

const calculateCountOfSelectedPermissions = (obj) => {
  let count = 0;
  let level = 0;
  const recursiveCount = (currentObj, subLevel) => {
    if (subLevel > 2) {
      return;
    }
    Object.keys(currentObj).forEach((key) => {
      if (typeof currentObj[key] === 'object' && !Array.isArray(currentObj[key])) {
        recursiveCount(currentObj[key], subLevel + 1);
      } else if (currentObj[key] === true) {
        count += 1;
      }
    });
  };
  recursiveCount(obj, level);
  return count;
};
const PermissionModalBody = ({ handleCloseModal, handleSubmit, data = null }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [count, setCount] = useState(0);
  const [localData, setLocalData] = useState(() => {
    let temp = deepClone(data);
    return isObjectEmpty(temp) ? accessControlList : temp;
  });
  const setFormValues = (data) => {
    setLocalData(data);
    setCount(calculateCountOfSelectedPermissions(data));
  };

  const handleButtonClick = () => {
    handleSubmit(localData);
    handleClose();
  };
  const handleClose = () => {
    handleCloseModal();
  };

  return (
    <Box className={classes.modalWrapper}>
      <Typography variant="h3" className={classes.headText}>
        {t('obx.settings.userGroups.managerGroup')}
      </Typography>
      <Box className={classes.modalContent}>
        <PermissionsGrid
          selectedRole={{ privileges: localData }}
          isPending={false}
          setFormValues={setFormValues}
        />
      </Box>
      <Box className={classes.footerWrapper}>
        <Typography variant="subtitle2" className={classes.headText}>
          {t('obx.settings.userGroups.permissionsSelected')}
          {count}
        </Typography>
        <Box className={classes.inlineButtons}>
          <Button onClick={handleClose} variant="secondaryGrey">
            {t('obx.settings.userGroups.cencel')}
          </Button>
          <Button variant="primary" onClick={handleButtonClick}>
            {t('obx.settings.userGroups.saveChanges')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

PermissionModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
  data: PropTypes.object,
};

const PermissionModal = ({ openModal, ...props }) => {
  return <ModalComponent open={openModal} body={<PermissionModalBody {...props} />} />;
};

PermissionModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
  data: PropTypes.object,
};

export default PermissionModal;
