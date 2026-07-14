import { Box, Button, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader';
import ModalComponent from 'src/app/components/common/modal';
import { WarningIcon } from 'src/assets/svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { getFranchisesOptions, updateLocation } from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

const useStyles = makeStyles((theme) => ({
  notesBox: {
    '&.MuiBox-root': {
      textAlign: 'center',
      padding: '40px !important',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
  notesError: {
    '&.MuiTypography-root': {
      margin: '30px 0px 0px 0px',
    },
  },
  notesMessage: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary2}`,
      marginBottom: '14px',
    },
  },
  moreFilter: {
    gap: '4px',
  },

  associateModalContent: {
    display: ' flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    borderRadius: '12px',
    padding: '24px',
    width: '500px',

    '& .MuiSvgIcon-root': {
      width: '48px',
      height: '48px',
    },
  },

  associateModalTitle: {
    '&.MuiTypography-root': {
      marginTop: '16px',
      color: theme.palette.textPrimary,
    },
  },

  associateModalText: {
    '&.MuiTypography-root': {
      marginTop: '4px',
      color: theme.palette.textPlaceholder,
    },
  },

  associateModalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
  },

  associateModalDropdown: {
    height: '36px',
    marginTop: '16px',
  },
}));

const AssociateFranchiseModal = ({ showModal, closeModal, locationId, setFranchiseLinked }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState({});

  const handleAssociateFranchise = async () => {
    setLoading(true);
    try {
      const response = await updateLocation(locationId, {
        associatedFranchiseId: selectedFranchise?.id,
      });

      if (response?.statusCode === 200) {
        toaster.success({
          text: t('sales.locations.franchiseAssociatedMessage'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setFranchiseLinked(true);
        setLoading(false);
        closeModal();
      }
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };
  /**
   * Fetch franchise listing
   * @param {*} page
   * @param {*} query
   */
  const fetchFranchises = async () => {
    try {
      const response = await getFranchisesOptions();
      if (response?.statusCode === 200) setFranchises(response?.data?.franchises);
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    fetchFranchises();
  }, []);

  const modalBody = (
    <Box className={classes.associateModalContent}>
      <WarningIcon />
      <Box>
        <Typography variant="h4" className={classes.associateModalTitle}>
          {t('sales.deals.associateFranchise!')}
        </Typography>
        <Typography variant="body2" className={classes.associateModalText}>
          {t('sales.deals.associateText')}
        </Typography>
      </Box>

      <CustomDropDown
        name="associatedFranchise"
        id="associatedFranchise"
        label={t('sales.locations.associatedFranchise')}
        options={transformArrayForOptions(franchises, 'name', 'id') || []}
        selectedValues={selectedFranchise}
        handleChange={(e) => setSelectedFranchise(e.target.value)}
        searchPlaceholder={t('sales.locations.associateFranchiseDropdownSearchPlaceholder')}
        placeHolder={t('sales.locations.associateFranchiseDropdownPlaceholder')}
        bordered
        searchable
        className={classes.associateModalDropdown}
      />

      <Box className={classes.associateModalActions}>
        <Button variant="secondaryGrey" onClick={closeModal}>
          {t('sales.contract.cancel')}
        </Button>
        <Button
          disabled={isObjectEmpty(selectedFranchise) || loading}
          onClick={handleAssociateFranchise}
          variant="primary"
        >
          {t('sales.deals.associateFranchise')}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />}
      <ModalComponent open={showModal} onClose={closeModal} body={modalBody} />
    </>
  );
};

AssociateFranchiseModal.propTypes = {
  showModal: PropTypes.bool,
  closeModal: PropTypes.func,
  locationId: PropTypes.string,
  setFranchiseLinked: PropTypes.func,
};

export default AssociateFranchiseModal;
