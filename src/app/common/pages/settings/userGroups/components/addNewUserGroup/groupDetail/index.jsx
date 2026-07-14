import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactComponent as PlusIcon } from 'src/assets/svg/Whiteplus.svg?react';

import PermissionModal from '../../permissionModal';
import { useStyles } from './groupDetailStyle';
export const GroupDetail = ({
  title,
  children,
  hasButton = false,
  openModal,
  setOpenModal,
  closeModal,
  handleSubmit,
  data = null,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Box className={classes.formContainer}>
      <Box className={classes.formContentHeader}>
        <Typography variant="h4" className={classes.title}>
          {title}
        </Typography>
        {hasButton && (
          <Button variant="primary" startIcon={<PlusIcon />} onClick={setOpenModal}>
            {t('obx.settings.userGroups.permissions')}
          </Button>
        )}
      </Box>
      <Box className={classes.formContent}>{children}</Box>
      <PermissionModal
        data={data}
        openModal={openModal}
        handleCloseModal={closeModal}
        handleSubmit={handleSubmit}
      />
    </Box>
  );
};
GroupDetail.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  hasButton: PropTypes.bool,
  openModal: PropTypes.func,
  setOpenModal: PropTypes.func,
  closeModal: PropTypes.func,
  handleSubmit: PropTypes.func,
  data: PropTypes.object,
};
