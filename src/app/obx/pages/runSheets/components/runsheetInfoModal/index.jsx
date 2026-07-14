import { Box, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import { ReactComponent as BlackArrowIcon } from 'src/assets/svg/BlackArrowIcon.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './RunsheetInfoModal';

const AddBody = () => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();

  // const handleClose = () => {
  //   handleCloseModal();
  // };

  return (
    <Box className={classes.modalWrapper}>
      <Box className={classes.textWrap}>
        <Box className={classes.textWrapInner}>
          <Typography variant="h4" className={classes.headText}>
            {t('obx.runsheet.dayTimeRunsheet', {
              runsheet: getLabel('terms', 'runsheet', t),
            })}
          </Typography>
          <Chip
            color="primary"
            size="small"
            label={t('obx.runsheet.patrol', {
              patrol: getLabel('terms', 'patrol', t),
            })}
          />
        </Box>

        <BlackArrowIcon />
      </Box>

      <Box>
        <Typography variant="body3" className={classes.secondText}>
          {t('obx.runsheet.estimatedTime', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
          })}
        </Typography>{' '}
        <Typography variant="body3" className={classes.thirdText}>
          9a - 9p (12h)
        </Typography>
      </Box>
    </Box>
  );
};

AddBody.propTypes = {
  handleCloseModal: PropTypes.func,
};

const RunsheetInfoModal = ({ openModal, handleCloseModal }) => {
  return (
    <ModalComponent
      open={openModal}
      handleClose={handleCloseModal}
      body={<AddBody handleCloseModal={handleCloseModal} />}
    />
  );
};

RunsheetInfoModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
};

export default RunsheetInfoModal;
