import { Box, Button, InputLabel, Typography } from '@mui/material';
import { ReactComponent as DuplicateIcon } from 'assets/svg/duplicate-blue.svg?react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import DaysSelection from 'src/app/components/common/daysSelection';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { duplicateRunSheet } from 'src/services/runsheet.services';
import { daysOfWeekWithVal, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { dayjsWithStandardOffset } from '../../../schedules/helper';
import { useStyles } from './duplicateRunsheetModal.styles';

const DuplicateRunsheetModal = ({
  openModal,
  handleCloseModal,
  runsheetTemplateId,
  currentRunsheetDate,
}) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const [selectedDays, setSelectedDays] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [startDate, setStartDate] = useState(currentRunsheetDate);
  const [daysError, setDaysError] = useState(false);

  const handleDayChange = (e) => {
    const days = e.target.value;
    setSelectedDays(days);
    setDaysError(days.length === 0);
  };

  const handleDateChange = (e) => {
    setStartDate(e);
  };

  const handleDuplicateRunsheet = async () => {
    if (selectedDays.length === 0) {
      setDaysError(true);
      return;
    }

    try {
      setButtonDisabled(true);
      const payload = {
        startsAt: dayjsWithStandardOffset(startDate).toISOString(),
        utcDays: selectedDays,
      };

      const response = await duplicateRunSheet(payload, runsheetTemplateId);

      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      handleCloseModal();
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setButtonDisabled(false);
    }
  };

  const duplicateModalBody = (
    <Box className={classes.modalWrapper}>
      <DuplicateIcon />
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.runsheet.duplicateRunsheet', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
          })}
          !
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.runsheet.duplicateRunsheetText', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
          })}
        </Typography>
        <Box className={classes.modalDatePicker}>
          <InputLabel>
            {t('obx.runsheet.duplicateRunsheetStartDate')}
            <RequiredAsterik />
          </InputLabel>
          <ResponsiveDatePickers
            name="startsAt"
            timeStepsMinutes={1}
            placeholder={t('sales.contract.addStartDate')}
            format="MM/DD/YYYY"
            inputFormat="MM/DD/YYYY"
            onChange={handleDateChange}
            value={startDate || null}
            id="startsAt"
            className={classes.createdDatePicker}
            minDate={currentRunsheetDate}
            disablePast={true}
          />
        </Box>
        <Box className={classes.dayWrapper}>
          <InputLabel>
            {t('obx.runsheet.duplicateRunsheetSelectDays')}
            <RequiredAsterik />
          </InputLabel>
          <Box className={classes.daysContent}>
            <DaysSelection
              name="weekDays"
              selectedDays={selectedDays}
              data={daysOfWeekWithVal(t)}
              handleChange={handleDayChange}
              truncateTo={3}
              styledClass={classes.splitCustomDutyToggles}
            />
          </Box>
          {daysError && (
            <Box className={classes.invalidFeedback}>{t('obx.runsheet.atLeastOneDayRequired')}</Box>
          )}
        </Box>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.runsheet.duplicateRunsheetDescription', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
            hits: getLabel('terms', 'hits', t).toLowerCase(),
          })}
        </Typography>
      </Box>

      <Box className={classes.inlineButtons}>
        <Button
          onClick={() => handleCloseModal()}
          disabled={buttonDisabled}
          variant="secondaryGrey"
        >
          {t('obx.runsheet.cancel')}
        </Button>
        <Button variant="primary" onClick={handleDuplicateRunsheet} disabled={buttonDisabled}>
          {t('obx.runsheet.duplicateRunsheet', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
          })}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={openModal} body={duplicateModalBody} />;
};

DuplicateRunsheetModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  runsheetTemplateId: PropTypes.number,
  currentRunsheetDate: PropTypes.object,
};

export default DuplicateRunsheetModal;
