import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as ContractIcon } from 'assets/svg/contract.svg?react';
import CustomDropDown from 'commonComponents/customDropDown';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddendumContractsList } from 'services/sites.services';
import ModalComponent from 'src/app/components/common/modal';
import { useApiControllers } from 'src/helper/axios';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';

import AddendumModal from '../addendumModal';
import { useStyles } from './contractStyle';
const ContractModalBody = ({ id, handleCloseModal }) => {
  const [openAddendumModal, setOpenAddendumModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedContract, setSelectedContract] = useState({});

  const { getNewApiController } = useApiControllers();

  const handleOpenAddendumModal = () => setOpenAddendumModal(true);
  const handleCloseAddendumModal = () => {
    handleClose();
    setOpenAddendumModal(false);
  };
  const handleAddendumSubmit = () => {
    handleClose();
    setOpenAddendumModal(false);
  };
  const { t } = useTranslation();
  const classes = useStyles();

  const handleClose = () => {
    handleCloseModal();
  };

  const getAddendumContractList = async (id) => {
    const apiController = getNewApiController();

    try {
      setLoading(true);
      const response = await getAddendumContractsList(id, { signal: apiController.signal });

      if (response?.statusCode === 200) {
        const transformedContracts =
          transformArrayForOptions(response?.data?.contracts, 'name', 'id')?.map((contract) => {
            return {
              ...contract,
              label: `${contract?.label} \u2022 (${contract?.source})`,
            };
          }) || [];

        setData(transformedContracts);
        // setData(transformArrayForOptions([{ id: '1', name: 'Contract 001' }], 'name', 'id') || []);
      }
      setLoading(false);
    } catch (e) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const disableCheck = () => {
    if (data.length) {
      return isObjectEmpty(selectedContract);
    }
    return true;
  };

  useEffect(() => {
    // Get list of addendum contracts
    if (id) getAddendumContractList(id);
  }, [id]);

  return (
    <Box className={classes.modalWrapper}>
      <ContractIcon />
      <Box>
        <Typography variant="h3" className={classes.headText}>
          {t('obx.sites.details.addendum.selectContract')}!
        </Typography>
        <Typography variant="info" className={classes.closetext}>
          {t('obx.sites.details.addendum.selectContractDesc')}
        </Typography>
      </Box>
      <Box className={classes.selectWrapper}>
        <Typography variant="subtitle2" className={classes.selectLabel}>
          {t('obx.sites.details.addendum.selectContract')}
        </Typography>
        <CustomDropDown
          label={t('obx.sites.details.addendum.selectContract')}
          name="contract"
          // selectedValues={selectedContract.contract || {}}
          selectedValues={selectedContract}
          options={data}
          bordered={true}
          // handleChange={inputChangedHandler}
          handleChange={(event) => {
            setSelectedContract({ ...event?.target?.value });
          }}
          isLoading={loading}
        />
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} variant="secondaryGrey">
          {t('obx.buttons.cancel')}
        </Button>
        <Button variant="primary" onClick={handleOpenAddendumModal} disabled={disableCheck()}>
          {t('obx.sites.details.viewContract')}
        </Button>
        {openAddendumModal && (
          <AddendumModal
            id={selectedContract?.id}
            openModal={openAddendumModal}
            handleOpenContractModal={handleOpenAddendumModal}
            handleCloseModal={handleCloseAddendumModal}
            handleSubmit={handleAddendumSubmit}
            source={selectedContract?.source}
          />
        )}
      </Box>
    </Box>
  );
};

ContractModalBody.propTypes = {
  id: PropTypes.string,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

const ContractModal = ({ id, openModal, handleCloseModal, handleSubmit }) => {
  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={
        <ContractModalBody
          id={id}
          handleCloseModal={handleCloseModal}
          handleSubmit={handleSubmit}
        />
      }
    />
  );
};

ContractModal.propTypes = {
  id: PropTypes.string,
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  handleSubmit: PropTypes.func,
};

export default ContractModal;
