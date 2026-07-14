import { Box, Button, Drawer, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as EmptyProposalIcon } from 'assets/svg/emptyProposal.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';
import { AddIcon } from 'src/assets/svg/index.jsx';
import { createContract } from 'src/services/deal.service';
import { toastSettings } from 'src/utils/constants';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { toaster } from 'src/utils/toast';

import ContractDrawer from '../contractDrawer';
import AssociateFranchiseModal from './associateFranchiseMoal';

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

const ContractEmptyState = ({
  dealId,
  handleShowContractForm,
  isFranchiseLinked,
  handleLocationRedirection,
  setContractData,
  locationId,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [franchiseLinked, setFranchiseLinked] = useState(false);
  const [isCreatingContract, setIsCreatingContract] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const locationDrawerTypes = {
    RIGHT: 'right',
  };

  const [moreFilterState, setmoreFilterState] = useState({
    right: false,
  });
  const toggleFiltersDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setmoreFilterState({ ...moreFilterState, [anchor]: open });
  };
  const filterCloseDrawer = (anchor) => {
    setmoreFilterState({ ...moreFilterState, [anchor]: false });
  };

  const handleCreateProposal = (event) => {
    if (isFranchiseLinked || franchiseLinked) {
      toggleFiltersDrawer(locationDrawerTypes.RIGHT, true)(event);
      return;
    }
    openModal(true);
  };

  const createProposal = async (payload) => {
    try {
      setIsCreatingContract(true);
      const response = await createContract(dealId, payload);
      if (response.statusCode === 200) {
        setContractData(response?.data?.contract);
        handleShowContractForm();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsCreatingContract(false);
    }
  };

  return (
    <Box className={classes.notesBox}>
      {isCreatingContract && (
        <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />
      )}
      <EmptyProposalIcon />
      <Typography variant="h2" className={classes.notesError}>
        {t('sales.deals.createProposal')}
      </Typography>
      <Typography variant="body2" className={classes.notesMessage}>
        {t('sales.deals.createproposalText')}
      </Typography>
      <Button
        onClick={handleCreateProposal}
        disableRipple
        className={classes.moreFilter}
        variant="primary"
      >
        <AddIcon /> {t('sales.deals.createProposalDrawer')}
      </Button>
      <Drawer
        anchor={locationDrawerTypes.RIGHT}
        open={moreFilterState[locationDrawerTypes.RIGHT]}
        onClose={toggleFiltersDrawer(locationDrawerTypes.RIGHT, false)}
      >
        {moreFilterState?.right && (
          <ContractDrawer
            anchor={locationDrawerTypes.RIGHT}
            filterCloseDrawer={filterCloseDrawer}
            width={399}
            createProposal={createProposal}
          />
        )}
      </Drawer>

      {/* modal to associate franchise */}
      {showModal && (
        <AssociateFranchiseModal
          showModal={showModal}
          closeModal={closeModal}
          handleLocationRedirection={handleLocationRedirection}
          locationId={locationId}
          setFranchiseLinked={setFranchiseLinked}
        />
      )}
    </Box>
  );
};

ContractEmptyState.propTypes = {
  dealId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleShowContractForm: PropTypes.func,
  isFranchiseLinked: PropTypes.bool,
  handleLocationRedirection: PropTypes.func,
  setContractData: PropTypes.func,
  locationId: PropTypes.string,
};

export default ContractEmptyState;
