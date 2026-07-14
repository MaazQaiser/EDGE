import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import ModalComponent from 'src/app/components/common/modal';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { followUpActionTypeConstant } from 'src/app/sales/pages/deals/deals.constant';
import {
  checkIfTimeIsPassedAlready,
  checkIfTimeIsSame,
  isObjectEmpty,
} from 'src/helper/utilityFunctions';

// import { removeKey } from 'src/helper/utilityFunctions';
import { useStyles } from './dealFollowUpModal.styles';

const DealFollowUpModal = ({
  showFollowUpModal,
  handleCloseModalFollowUp,
  formData,
  handleInputChange,
  errorMessages,
  setErrorMessages,
  isSubmittingForm,
  handleFormSubmit,
  followUpActionType,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  /**
   * get today date and time
   */
  // const today = dayjs();

  const handleDescription = (event) => {
    if (event.target.value?.length <= 225) handleInputChange('reason', event.target.value);
  };

  const errorExist = () => {
    if (!isObjectEmpty(errorMessages)) return true;
    return false;
  };

  const disableForm = () => {
    // check if form has error
    if (errorExist()) return true;
    // check if the form is being submitted
    if (isSubmittingForm) return true;
    return false;
  };

  return (
    <ModalComponent
      open={showFollowUpModal}
      handleClose={handleCloseModalFollowUp}
      body={
        <Box className={classes.followUpModal} component="form" onSubmit={handleFormSubmit}>
          <Box className={classes.followUpModalHeader}>
            <Typography variant="h4" className={classes.followUpModalHeaderTitle}>
              {followUpActionType === followUpActionTypeConstant.CREATE
                ? t('sales.deals.addFollowUp')
                : t('sales.deals.edit')}{' '}
              {t('sales.deals.followUpModalTitle')}
            </Typography>
            <Typography variant="body2" className={classes.followUpModalHeaderText}>
              {t('sales.deals.followUpModalText')}
            </Typography>
          </Box>
          <Box className={classes.followUpModalBody}>
            <Box className={classes.textArea}>
              <InputLabel>
                {t('sales.deals.followUpReason')}
                <RequiredAsterik />
              </InputLabel>
              <TextField
                name="reason"
                id="reason"
                multiline={true}
                rows={6}
                placeholder={t('sales.deals.followUpModalAddNotes')}
                className={classes.followUpModalTextArea}
                error={!!errorMessages?.reason}
                onChange={handleDescription}
                value={formData?.reason || ''}
                mb={'0px'}
              />
              <span className="errorMessage">{errorMessages?.reason}</span>
              <Typography className={classes.wordLimitText} variant="body3">
                {`${formData?.reason?.length ? 225 - formData?.reason?.length : 225} ${t('sales.deals.charactersLeft')}`}
              </Typography>
            </Box>
            <Box className={classes.followUpModalDate}>
              <InputLabel>
                {t('sales.deals.followUpModalDate')}
                <RequiredAsterik />
              </InputLabel>
              <ResponsiveDatePickers
                value={formData?.followUpDate ? dayjs(formData?.followUpDate) : null}
                onChange={(value) => {
                  // check if date is valid or not
                  const isValidDate = !isNaN(value['$d']);
                  handleInputChange(
                    'followUpDate',
                    isValidDate && value ? value.toISOString() : null,
                  );
                  // // Check if the selected date is today. If true, then set start time and end time.
                  // if (
                  //   dayjs(value).isSame(dayjs(), 'day') // Check if the start date is today
                  // ) {
                  //   handleInputChange('startTime', dayjs(value));
                  //   handleInputChange('endTime', dayjs(value));
                  //   return;
                  // }
                }}
                placeholder={`${t('sales.locations.dataPlaceHolder')}`}
                error={errorMessages?.followUpDate}
                timezone="default"
                minDate={dayjs()}
                helperText={errorMessages?.followUpDate}
              />
            </Box>
            <Box className={classes.followUpModalDateTimers}>
              <Box>
                <InputLabel>
                  {t('sales.deals.followUpModalStartTime')} <RequiredAsterik />
                </InputLabel>
                <ResponsiveTimePickers
                  value={formData?.startTime ? dayjs(formData?.startTime) : null}
                  // onChange={(value) => {
                  //   handleInputChange('startTime', value ? value.toISOString() : null);
                  // }}
                  onChange={(value) => {
                    if (
                      dayjs(formData?.followUpDate).isSame(dayjs(), 'day') &&
                      formData?.endTime &&
                      value >= formData?.endTime
                    ) {
                      setErrorMessages((prev) => ({
                        ...prev,
                        startTime: t('sales.deals.startTimeShouldBeBeforeThanEndTime'),
                      }));
                      return;
                    }

                    // Check if the selected date is today. If true, then check if the selected time is in the past.
                    if (checkIfTimeIsPassedAlready(formData?.followUpDate, value)) {
                      setErrorMessages((prev) => ({
                        ...prev,
                        startTime: t('sales.deals.startTimePassedAlready'),
                      }));
                      return;
                    }

                    if (checkIfTimeIsSame(formData?.startTime, value)) {
                      setErrorMessages((prev) => ({
                        ...prev,
                        endTime: t('sales.deals.startTimeAndEndTimeCannotBeSame'),
                      }));
                      return;
                    }

                    handleInputChange('startTime', value ? value.toISOString() : null);
                  }}
                  placeholder={`${t('obx.commonText.startTime')}`}
                  minValue={
                    (formData?.followUpDate && dayjs(formData?.followUpDate) > dayjs()) || !dayjs()
                      ? null
                      : dayjs()
                  }
                  error={errorMessages?.startTime}
                  timezone="default"
                  helperText={
                    formData?.followUpDate && errorMessages?.startTime
                      ? errorMessages?.startTime
                      : null
                  }
                  // helperText={errorMessages?.startTime}
                  disabled={!formData?.followUpDate}
                />
              </Box>
              <Box>
                <InputLabel>
                  {t('sales.deals.followUpModalEndTime')}
                  <RequiredAsterik />
                </InputLabel>
                <ResponsiveTimePickers
                  value={formData?.endTime ? dayjs(formData?.endTime) : null}
                  // onChange={(value) =>
                  //   handleInputChange('endTime', value ? value.toISOString() : null)
                  // }
                  onChange={(value) => {
                    handleInputChange('endTime', value ? value.toISOString() : null);
                    if (
                      dayjs(formData?.followUpDate).isSame(dayjs(), 'day') &&
                      formData?.startTime &&
                      value <= formData?.startTime
                    ) {
                      setErrorMessages((prev) => ({
                        ...prev,
                        endTime: t('sales.deals.endTimeGreaterThanSTartTime'),
                      }));
                      return;
                    }

                    if (checkIfTimeIsSame(formData?.startTime, value)) {
                      setErrorMessages((prev) => ({
                        ...prev,
                        endTime: t('sales.deals.startTimeAndEndTimeCannotBeSame'),
                      }));
                      return;
                    }

                    // Check if the selected date is today. If true, then check if the selected time is in the past.
                    if (checkIfTimeIsPassedAlready(formData?.followUpDate, value)) {
                      setErrorMessages((prev) => ({
                        ...prev,
                        endTime: t('sales.deals.endTimePassedAlready'),
                      }));
                      return;
                    }
                    // handleInputChange('endTime', value ? value.toISOString() : null);
                  }}
                  placeholder={`${t('obx.commonText.endTime')}`}
                  minValue={formData?.startTime ? dayjs(formData?.startTime) : null}
                  error={errorMessages?.endTime}
                  timezone="default"
                  helperText={
                    formData?.startTime && errorMessages?.endTime ? errorMessages?.endTime : null
                  }
                  disabled={!formData?.startTime}
                />
              </Box>
            </Box>
          </Box>

          <Box className={classes.followUpModalFooter}>
            <Button onClick={handleCloseModalFollowUp} variant="secondaryGrey">
              {t('links.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={disableForm()}>
              {followUpActionType === followUpActionTypeConstant.CREATE
                ? t('sales.deals.followUpModalButtonAddText')
                : t('sales.deals.followUpModalButtonUpdateText')}
            </Button>
          </Box>
        </Box>
      }
    />
  );
};

DealFollowUpModal.propTypes = {
  showFollowUpModal: PropTypes.bool,
  handleCloseModalFollowUp: PropTypes.func,
  handleInputChange: PropTypes.func,
  formData: PropTypes.object,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  isSubmittingForm: PropTypes.bool,
  handleFormSubmit: PropTypes.func,
  followUpActionType: PropTypes.string,
};

export default DealFollowUpModal;
