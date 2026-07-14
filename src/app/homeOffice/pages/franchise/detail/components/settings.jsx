import { Box, Button, InputAdornment, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { ReactComponent as CheckIcon } from 'assets/svg/check.svg?react';
import { ReactComponent as CircleCheck } from 'assets/svg/check-circle.svg?react';
import { ReactComponent as EmailIcon } from 'assets/svg/email.svg?react';
import { ReactComponent as RefreshIcon } from 'assets/svg/refresh.svg?react';
import { ReactComponent as DeleteIcon } from 'assets/svg/trash-2.svg?react';
import { ReactComponent as WarningIcon } from 'assets/svg/warning.svg?react';
import LoaderComponent from 'commonComponents/loader';
import SweetAlertModal from 'commonComponents/sweetAlertModal';
import formValidatorJoi from 'globalUtils/formValidator/formValidator.requiredCheck';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  changeFranchiseOwner,
  deActivateFranchise,
  makeThisFranchiseFunctional,
  sendFranchiseInvite,
} from 'services/franchise.services';
import ModalComponent from 'src/app/components/common/modal';
import { HO_FRANCHISE_DETAIL, HO_FRANCHISE_UPDATE } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { franchiseStatusEnum } from '../../utils/enums';
import ChangeFranchiseOwnerModal from './changeFranchiseOwnerModal';
import { useStyles } from './settingStyles';
const initialFranchiseOwnerFormData = {
  firstName: '',
  lastName: '',
  email: '',
};

/**
 * ? Note: please pass franchise data from parent if required
 */
const Settings = ({ franchiseData, setCurrentTabValue }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { id } = useParams();

  const [currentId, setCurrentId] = useState('');

  const [changeOwnerFormData, setChangeOwnerFormData] = useState(initialFranchiseOwnerFormData);
  const [changeOwnerErrorMessages, setChangeOwnerErrorMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const handleInviteSubmit = async (event) => {
    // Prevent page reload
    event.preventDefault();
    setDisabled(true);

    setLoading(true);

    try {
      const response = await sendFranchiseInvite(franchiseData?.id);
      if (response && response?.statusCode === 200) {
        //Show toast that Invite sent successfully.
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
      setDisabled(false);
    }
  };

  const handleChangeOwnerSubmit = async (event) => {
    // Prevent page reload
    event.preventDefault();

    setDisabled(true);

    const errors = await formValidatorJoi(changeOwnerFormData, t);
    if (errors && Object.keys(errors).length) {
      setChangeOwnerErrorMessages(errors);
      setDisabled(false);
      return;
    }

    try {
      setLoading(true);
      setDisabled(true);
      const response = await changeFranchiseOwner(franchiseData?.id, changeOwnerFormData);
      if (response && response?.statusCode === 200) {
        setLoading(false);
        setDisabled(false);
        //Show toast that Invite sent successfully.
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleOpenClose(false);
        setCurrentTabValue(0);
      }
    } catch (error) {
      setLoading(false);
      // setDisabled(false);
      setChangeOwnerErrorMessages(error?.errorObj);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setDisabled(false);
    }
  };

  const reloadFranchise = (id) => {
    history.push({
      pathname: `${HO_FRANCHISE_DETAIL}/${id}`,
      search: `?reload=${true}`,
    });
  };

  const redirectToDetail = (franchiseData) => {
    if (franchiseData?.contacts?.length === 0 || franchiseData?.coordinates?.length <= 0) {
      return true;
    }
    return false;
  };
  const gotoForm = () => {
    history.push(`${HO_FRANCHISE_UPDATE}/${id}`);
  };
  const handleDeActivateFranchise = async () => {
    setLoading(true);
    try {
      let response;

      if (franchiseData.status === franchiseStatusEnum.nonFunctional) {
        const redirect = redirectToDetail(franchiseData);
        if (redirect) {
          toaster.error({
            text: t('ho.ho_franchise.makeItFunctional'),
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          setTimeout(() => {
            gotoForm();
          }, 1000);
          return;
        }
        response = await makeThisFranchiseFunctional(currentId);
      } else {
        response = await deActivateFranchise(currentId);
      }
      setDisabled(false);

      if (response && response?.statusCode === 200) {
        setCurrentTabValue(0);

        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        reloadFranchise(franchiseData?.id);
      }
    } catch (error) {
      setDisabled(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
      changeShowModalState(false);
    }
  };

  const handleDeactivateCancelButton = () => {
    changeShowModalState(false);
  };
  const changeShowModalState = (state) => {
    setShowModal(state);
  };
  const [open, setOpen] = useState(false);
  const handleOpenClose = (openModal) => {
    setOpen(openModal);
    setChangeOwnerFormData(initialFranchiseOwnerFormData);
  };
  const removeChangeOwnerErrors = () => setChangeOwnerErrorMessages({});

  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.mainSettingWrapper}>
        {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
        <Box className={classes.emailSection}>
          <Box className={classes.mainFlexbox} component="form" onSubmit={handleInviteSubmit}>
            <Box>
              <InputLabel htmlFor="email">{t('form.input.textField.email.label')}</InputLabel>
              <TextField
                className={classes.emailCustomInput}
                type="email"
                name="email"
                placeholder={t('form.input.textField.email.placeHolder')}
                value={franchiseData?.email || ''}
                disabled={true}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
              {!franchiseData?.email && (
                <Box className={classes.invalidFeedback}>
                  {t('ho.ho_franchise.detail.settings.ownerEmailIsNotPresentForInvite')}
                </Box>
              )}
            </Box>

            <Box className={classes.inviteLink}>
              <Button
                className={classes.inviteBtn}
                variant="onlyText"
                disableRipple
                disableTouchRipple
                type="submit"
                disabled={!franchiseData?.email && !disabled}
              >
                {t('buttons.resendInvite')}
              </Button>
            </Box>
          </Box>
        </Box>
        <Box className={classes.emailSection}>
          <Button
            startIcon={<RefreshIcon />}
            variant="onlyText"
            disableRipple
            disableTouchRipple
            onClick={() => handleOpenClose(true)}
            className={classes.emailFranchiseBtn}
          >
            {t('buttons.changeFranchiseOwner')}
          </Button>
        </Box>
        <Box className={classes.emailSection}>
          <Button
            variant="onlyText"
            disableRipple
            disableTouchRipple
            startIcon={
              franchiseData.status === franchiseStatusEnum.nonFunctional ? (
                <CircleCheck />
              ) : (
                <DeleteIcon />
              )
            }
            className={
              franchiseData.status === franchiseStatusEnum.nonFunctional
                ? `${classes.activeBtn}`
                : `${classes.deleteBtn}`
            }
            onClick={() => changeShowModalState(true)}
          >
            {franchiseData.status === franchiseStatusEnum.nonFunctional
              ? t('buttons.activateFranchise')
              : t('buttons.deActivateFranchise')}
          </Button>
        </Box>
        <ModalComponent
          open={open}
          handleClose={() => {
            handleOpenClose(false);
            removeChangeOwnerErrors();
          }}
          body={
            <ChangeFranchiseOwnerModal
              formData={changeOwnerFormData}
              setFormData={setChangeOwnerFormData}
              errorMessages={changeOwnerErrorMessages}
              handleSubmit={handleChangeOwnerSubmit}
              handleClose={() => {
                handleOpenClose(false);
                removeChangeOwnerErrors();
              }}
              disabled={disabled}
            />
          }
        />
      </Box>
      <SweetAlertModal
        type="warning" // 'success', 'error', 'warning', 'info', etc.
        customClass={{
          confirmButton:
            franchiseData.status === franchiseStatusEnum.nonFunctional
              ? classes.sweetAlertConfirmBlueButton
              : classes.sweetAlertConfirmButton,
        }}
        title={
          franchiseData.status === franchiseStatusEnum.nonFunctional
            ? t('commonText.modal.makeFranchiseFunctional.title')
            : t('commonText.modal.makeFranchiseNonFunctional.title')
        }
        text={
          franchiseData.status === franchiseStatusEnum.nonFunctional
            ? t('commonText.modal.makeFranchiseFunctional.text')
            : t('commonText.modal.makeFranchiseNonFunctional.text')
        }
        confirmButtonText={
          franchiseData.status === franchiseStatusEnum.nonFunctional
            ? t('buttons.makeItFunctional')
            : t('buttons.yes')
        }
        cancelButtonText={t('buttons.no')}
        show={showModal}
        icon={
          franchiseData.status === franchiseStatusEnum.nonFunctional ? (
            <CheckIcon />
          ) : (
            <WarningIcon />
          )
        }
        handleConfirmButton={handleDeActivateFranchise}
        handleCancelButton={handleDeactivateCancelButton}
        reverseButtons={true}
      />
    </>
  );
};

Settings.propTypes = {
  franchiseData: PropTypes.object,
  setCurrentTabValue: PropTypes.func,
};

export default Settings;
