import { Box, Button, InputLabel, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './RunsheetTimeModal';
const TimeModalBody = ({ handleCloseModal }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();

  const handleClose = () => {
    handleCloseModal();
  };

  return (
    <Box className={classes.modalWrapper}>
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.runsheet.runsheetTime', { runsheet: getLabel('terms', 'runsheet', t) })}
        </Typography>
      </Box>

      <Box className={classes.timeColuns}>
        <InputLabel htmlFor="startsAt">
          {t('obx.runsheet.startTime')} <RequiredAsterik />
        </InputLabel>
        <ResponsiveTimePickers
          name="startsAt"
          // disabled={!!!state?.startDate}
          // onChange={(e) => onChangeHandler('startsAt', e)}
          // id="startsAt"
          // useLocalTimeZone
          // error={!!errorMessages?.startsAt}
          // helperText={!!errorMessages?.startsAt ? errorMessages?.startsAt : null}
          // value={state?.startsAt || null}
          placeholder={t('obx.runsheet.selectStartTime')}
        />
      </Box>
      <Box className={classes.timeColuns}>
        <InputLabel htmlFor="endsAt">
          {t('obx.runsheet.endTime')} <RequiredAsterik />
        </InputLabel>
        <ResponsiveTimePickers
          // error={!!errorMessages?.endsAt}
          // helperText={!!errorMessages?.endsAt ? errorMessages?.endsAt : null}
          name="endsAt"
          // useLocalTimeZone
          // disabled={!!!state?.startsAt}
          // onChange={(e) => onChangeHandler('endsAt', e)}
          // value={state?.endsAt || null}
          // id="endsAt"
          placeholder={t('obx.runsheet.selectEndTime')}
        />
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} variant="secondaryGrey">
          {t('obx.runsheet.cancel')}
        </Button>
        <Button variant="primary">{t('obx.runsheet.save')}</Button>
      </Box>
    </Box>
  );
};

TimeModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
};

const RunsheetTimeModal = ({ openModal, handleCloseModal }) => {
  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={<TimeModalBody handleCloseModal={handleCloseModal} />}
    />
  );
};

RunsheetTimeModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
};

export default RunsheetTimeModal;
