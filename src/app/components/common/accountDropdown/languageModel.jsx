import { Box, Button, Skeleton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as CheckIcon } from 'assets/svg/onlycheck.svg?react';
import classNames from 'classnames';
import ModalComponent from 'commonComponents/modal';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentLanguage } from 'src/redux/store/slices/auth';
import { getLanguages, updateLanguage } from 'src/services/profile.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

const useStyles = makeStyles((theme) => ({
  languageModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 600px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
    borderRadius: '12px',
    padding: '24px',
  },
  modalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  modalDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },
  ListWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  ListMainWrapper: {
    padding: '20px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  iconDiv: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  name: {
    '&.MuiTypography-root ': {
      color: theme.palette.textPrimary,
      textTransform: 'uppercase',
    },
  },
  Icon: {
    display: 'none',
  },
  active: {
    background: theme.palette.surfaceBrandSubtle,
    '& .MuiTypography-root ': {
      color: theme.palette.textBrand,
    },
    '& .MuiBox-root': {
      '& .MuiBox-root': {
        display: 'block',
      },
    },
  },
  buttonWrraper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '20px',
  },
  listWrapperDisabled: {
    pointerEvents: 'none',
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  languageModalSkeletonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  languageModalSkeleton: {
    '&.MuiSkeleton-root': {
      borderRadius: '8px !important',
    },
  },
}));

const LanguageModel = ({ open, handleClose }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = useSelector((state) => state.auth.currentLanguage);
  const dispatch = useDispatch();
  const [languageList, setLanguageList] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getSystemLanguage();
  }, []);

  const getSystemLanguage = async () => {
    try {
      setLoading(true);
      const response = await getLanguages();

      if (response?.statusCode == 200) {
        setLanguageList(response?.data?.languages);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const classes = useStyles();
  const handleSelected = async (item) => {
    try {
      setLoading(true);
      const response = await updateLanguage({ user: { language_id: item.id } });
      if (response?.statusCode == 200) {
        i18n.changeLanguage(item.code);
        dispatch(setCurrentLanguage(item));

        // Maintaing the selected language locally
        setSelectedLanguage(item);

        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  // Reloading the page after changing the language
  useEffect(() => {
    if (selectedLanguage && selectedLanguage.id === currentLanguage.id) {
      window.location.reload();
    }
  }, [selectedLanguage, currentLanguage]);

  const modalBody = (
    <Box className={classes.languageModal}>
      <Typography variant="h3" className={classes.modalTitle}>
        {t('commonText.modal.languageModal.title')}
      </Typography>
      <Typography variant="body2" className={classes.modalDescription}>
        {t('commonText.modal.languageModal.description')}
      </Typography>
      <Box className={classes.ListMainWrapper}>
        {loading ? (
          <Box className={classes.languageModalSkeletonWrapper}>
            <Skeleton variant="rectangular" height={45} className={classes.languageModalSkeleton} />
            <Skeleton variant="rectangular" height={45} className={classes.languageModalSkeleton} />
            <Skeleton variant="rectangular" height={45} className={classes.languageModalSkeleton} />
          </Box>
        ) : (
          <>
            {languageList.map((item, index) => (
              <Box
                key={index}
                className={classNames(
                  classes.ListWrapper,
                  item.id === currentLanguage.id ? classes.active : '',
                )}
                onClick={() => handleSelected(item)}
              >
                <Typography variant="subtitle1" className={classes.name}>
                  {item.name}
                </Typography>
                <Box className={classes.iconDiv}>
                  <Box className={classes.Icon}>
                    {item.id == currentLanguage.id && <CheckIcon />}
                  </Box>
                  <img src={item?.image} />
                  <Box>{item.icon}</Box>
                </Box>
              </Box>
            ))}
          </>
        )}
      </Box>
      <Box className={classes.buttonWrraper}>
        <Button variant="secondaryGrey" type="button" onClick={handleClose}>
          {t('sales.contract.cancel')}
        </Button>
        {/* <Button variant="primary" type="button">
          {t('sales.contract.save')}
        </Button> */}
      </Box>
    </Box>
  );
  return <ModalComponent open={open} handleClose={handleClose} body={modalBody}></ModalComponent>;
};

LanguageModel.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};
export default LanguageModel;
