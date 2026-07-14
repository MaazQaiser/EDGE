import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import { MoreVert } from 'assets/svg';
import { ReactComponent as ArrowLeftBack } from 'assets/svg/ArrowLeftBack.svg?react';
import { ReactComponent as Dustbin } from 'assets/svg/DeleteIconBin.svg?react';
import { ReactComponent as EditGroupIcon } from 'assets/svg/EditGroupIcon.svg?react';
import { ReactComponent as PlusIconPrimary } from 'assets/svg/plus.svg?react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';
import CustomInput from 'src/app/components/common/templates/customInput';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import {
  createBreakType,
  getBreakTypes,
  updateBreakTypeById,
} from 'src/services/breakRules.service';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import RemoveTypeModal from '../removeTypeDrawer';
import { useStyles } from './breakTypeStyle';

const BreakType = ({ handleCloseDrawer }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [breakTypes, setBreakTypes] = useState([]);
  const [selectedBreakType, setSelectedBreakType] = useState(null);
  const [openAddBreakTypeModal, setOpenAddBreakTypeModal] = useState(false);
  const [addBreakType, setAddBreakType] = useState('');
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);

  const resetStates = () => {
    setSelectedBreakType(null);
    setAddBreakType('');
  };

  const handleAddBreakType = () => setOpenAddBreakTypeModal(true);
  const handleClose = () => {
    resetStates();
    setOpenAddBreakTypeModal(false);
  };

  const [isLoadingStates, setIsLoadingStates] = useState({
    getBreakTypes: false,
    createBreakType: false,
    updateBreakType: false,
  });

  const handleDelete = (breakType) => {
    setSelectedBreakType(breakType);
    setOpenDeleteModal(true);
  };

  const fetchBreakTypes = async () => {
    try {
      setIsLoadingStates((prev) => ({ ...prev, getBreakTypes: true }));
      const response = await getBreakTypes();
      if (response && response?.statusCode === 200) {
        setBreakTypes(response?.data?.breakTypes);
        setIsLoadingStates((prev) => ({ ...prev, getBreakTypes: false }));
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoadingStates((prev) => ({ ...prev, createBreakType: true }));
      const response = await createBreakType({ name: addBreakType });
      if (response && response?.statusCode === 200) {
        fetchBreakTypes();
        setOpenAddBreakTypeModal(false);
        resetStates();
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoadingStates((prev) => ({ ...prev, createBreakType: false }));
    }
  };

  const handleEdit = (breakType) => {
    setSelectedBreakType(breakType);
    setOpenAddBreakTypeModal(true);
    setAddBreakType(breakType?.name);
  };

  const handleUpdate = async () => {
    try {
      setIsLoadingStates((prev) => ({ ...prev, updateBreakType: true }));
      const response = await updateBreakTypeById(selectedBreakType?.id, { name: addBreakType });
      if (response && response?.statusCode === 200) {
        fetchBreakTypes();
        setOpenAddBreakTypeModal(false);
        resetStates();
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsLoadingStates((prev) => ({ ...prev, updateBreakType: false }));
    }
  };

  useEffect(() => {
    fetchBreakTypes();
  }, []);

  return (
    <Box className={classes.breakTypeWrapper}>
      <Box className={classes.header}>
        <Box className={classes.headerLeft}>
          <Box className={classes.headingBackIcon}>
            {openAddBreakTypeModal && (
              <Button variant="secondaryGrey" onClick={handleClose}>
                <ArrowLeftBack />
              </Button>
            )}

            <Typography variant="h3" className={classes.headerTitle}>
              {t('obx.settings.preferences.breakRules.breakType')}
            </Typography>
          </Box>

          <Typography variant="body1" className={classes.headerSubtitle}>
            {t('obx.settings.preferences.breakRules.manageBreakTypes')}
          </Typography>
        </Box>

        <CloseIcon onClick={handleCloseDrawer} className={classes.closeDrawerIcon} />
      </Box>
      {!openAddBreakTypeModal ? (
        <Box className={classes.content}>
          {isLoadingStates?.getBreakTypes ? (
            <Box className={classes.languageModalSkeletonWrapper}>
              <Skeleton
                variant="rectangular"
                height={45}
                width={430}
                className={classes.languageModalSkeleton}
              />
              <Skeleton
                variant="rectangular"
                height={45}
                width={430}
                className={classes.languageModalSkeleton}
              />
              <Skeleton
                variant="rectangular"
                height={45}
                width={430}
                className={classes.languageModalSkeleton}
              />
            </Box>
          ) : (
            breakTypes?.map((breakType) => (
              <Box className={classes.contentItem} key={breakType?.id}>
                <Typography variant="body1" className={classes.contentItemTitle}>
                  {breakType?.name}
                </Typography>
                <PopoverButton
                  className={classes.questionBankActions}
                  label="icon"
                  variant="icon"
                  Icon={MoreVert}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                >
                  <Box className={classes.questionBankActionsMenu}>
                    <Box
                      className={classes.questionBankActionsRegular}
                      onClick={() => handleEdit(breakType)}
                    >
                      <EditGroupIcon className={classes.questionBankActionsIconRegular} />
                      <Typography
                        className={classes.questionBankActionsTextRegular}
                        variant="subtitle2"
                      >
                        {t('obx.settings.preferences.breakRules.editType')}
                      </Typography>
                    </Box>
                    <Box
                      className={classes.questionBankActionsDelete}
                      onClick={() => handleDelete(breakType)}
                    >
                      <Dustbin className={classes.questionBankActionsIconDelete} />
                      <Typography
                        className={classes.questionBankActionsTextDelete}
                        variant="subtitle2"
                      >
                        {t('obx.settings.preferences.breakRules.deleteType')}
                      </Typography>
                    </Box>
                  </Box>
                </PopoverButton>
              </Box>
            ))
          )}

          <Button
            variant="onlyText"
            className={classes.contentItemButton}
            startIcon={<PlusIconPrimary />}
            onClick={() => handleAddBreakType()}
            disableRipple
          >
            {t('obx.settings.preferences.breakRules.addBreakType')}
          </Button>
        </Box>
      ) : (
        <Box className={classes.content}>
          <CustomInput
            label={t('obx.settings.preferences.breakRules.breakTypeName')}
            required
            placeholder={t('obx.settings.preferences.breakRules.addBreakTypeName')}
            name={'breakTypeName'}
            customWrapper="full-width"
            value={addBreakType}
            onChange={(e) => setAddBreakType(e.target.value)}
          />
        </Box>
      )}
      {openAddBreakTypeModal && (
        <Box className={classes.footer}>
          <Button onClick={handleClose} variant="secondaryGrey">
            {t('obx.settings.preferences.breakRules.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={isObjectEmpty(selectedBreakType) ? handleSubmit : handleUpdate}
            disabled={
              (isObjectEmpty(selectedBreakType)
                ? isLoadingStates?.createBreakType
                : isLoadingStates?.updateBreakType) || !addBreakType
            }
          >
            {isObjectEmpty(selectedBreakType)
              ? t('obx.settings.preferences.breakRules.addBreakType')
              : t('obx.settings.preferences.breakRules.updateBreakType')}
          </Button>
        </Box>
      )}
      <RemoveTypeModal
        openModal={openDeleteModal}
        handleCloseModal={handleCloseDeleteModal}
        breakType={selectedBreakType}
        refetchBreakTypes={fetchBreakTypes}
        setSelectedBreakType={setSelectedBreakType}
      />
    </Box>
  );
};

export default BreakType;
BreakType.propTypes = {
  handleCloseDrawer: PropTypes.func.isRequired,
};
