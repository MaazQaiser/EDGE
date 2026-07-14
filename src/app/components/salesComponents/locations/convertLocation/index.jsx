import { Button, InputLabel, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { ReactComponent as AlertCircle } from 'assets/svg/alertCircle.svg?react';
import { ReactComponent as ArrowRightIcon } from 'assets/svg/arrow-right.svg?react';
import { ReactComponent as LeadsIcon } from 'assets/svg/Leads.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { SALES_DEAL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { Clossicon, DealIcon } from 'src/assets/svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import {
  convertDealIntoStage,
  getDealOwnerOptions,
  getDealStageOptions,
  getPipelineOptions,
} from 'src/services/deal.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import { stageValues as dealStageValues } from '../../deals/dealStages/stage.constant';
import { useStyles } from './convertLocation';
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: '796px',
  bgcolor: 'background.paper',
  padding: '24px 32px',
  boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
  borderRadius: '12px',
};
const FormKeys = {
  DEAL_NAME: 'dealName',
  DEAL_OWNER: 'dealOwner',
  PIPELINE: 'pipeline',
  STAGE: 'stage',
};

const formDataDefaultState = {
  [FormKeys.DEAL_NAME]: null,
  [FormKeys.DEAL_OWNER]: {},
  [FormKeys.PIPELINE]: {},
  [FormKeys.STAGE]: {},
};
const ConvertLocationModal = ({ openHandle, closeHandle, data, id }) => {
  const [formData, setFormData] = useState(formDataDefaultState);
  const [convertLoading, setConvertLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [options, setOptions] = useState({
    dealOwners: [],
    pipeline: [],
    stage: [],
  });
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');

  /**
   * Fetch deal ownders
   * @param {*} page
   * @param {*} query
   */
  const fetchDealOwners = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          dealOwners: response?.data?.owners,
        }));
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
    }
  };

  /**
   * Fetch franchise listing
   * @param {*} page
   * @param {*} query
   */
  const fetchPipeline = async () => {
    try {
      const response = await getPipelineOptions();
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          pipeline: response?.data?.pipelines,
        }));
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
    }
  };

  /**
   * Fetch Deal Stage Options
   * @param {*} pipelineId
   */
  const fetchDealStage = async (pipelineId) => {
    try {
      const response = await getDealStageOptions(dealStageValues.PROPOSAL_CREATION, pipelineId);
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          stage: response?.data?.stages,
        }));
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
    }
  };

  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    if (name === FormKeys.PIPELINE && formData?.[FormKeys.PIPELINE]?.id !== value?.id) {
      setOptions((prevOptions) => ({
        ...prevOptions,
        stage: [],
      }));
      fetchDealStage(value?.id);
      setFormData((prevData) => ({ ...prevData, [FormKeys.STAGE]: null }));
    }
    updateFormHandler(name, value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setConvertLoading(true);
    try {
      const errors = await formValidatorJoi(formData, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        setConvertLoading(false);
        return;
      }

      const payload = {
        dealName: formData[FormKeys.DEAL_NAME],
        dealOwnerId: formData[FormKeys.DEAL_OWNER].id,
        pipelineId: formData[FormKeys.PIPELINE].id,
        stageId: formData[FormKeys.STAGE].id,
        companyId: data?.company?.id,
      };
      const resp = await convertDealIntoStage(id, payload);
      if (resp?.statusCode === 200) {
        toaster.success({
          text: t('sales.deals.locationToDeal'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        const dealId = resp?.data?.deal?.id;
        if (dealId) history.push(`${SALES_DEAL}/${dealId}`);
        setConvertLoading(false);
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
      setConvertLoading(false);
    }
  };

  useEffect(() => {
    fetchDealOwners();
    fetchPipeline();
  }, []);

  return (
    <>
      {convertLoading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Modal
        open={openHandle}
        onClose={closeHandle}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          className={classes.converModal}
          sx={style}
          component="form"
          onSubmit={handleFormSubmit}
        >
          <Box className={classes.boxHeader}>
            <Box className={classes.titlehead}>
              <Typography variant="h4" className={classes.sidetitle}>
                {t('sales.locations.convertToDeal')}
              </Typography>
              <a className={classes.cbtn} href="#" onClick={closeHandle}>
                <Clossicon />
              </a>
            </Box>
            <Typography variant="body2" className={classes.bulkSubHeading}>
              {t('sales.locations.convertText')}
            </Typography>
          </Box>
          <Box className={classes.inlineIconsBox}>
            <Box className={classes.inlineBoxIcons}>
              <LeadsIcon />
              <Typography variant="subtitle2" className={classes.modalTextBlue}>
                {t('sales.locations.location')}
              </Typography>
            </Box>
            <ArrowRightIcon className={classes.arrowIcons} />
            <Box className={classes.inlineBoxIcons}>
              <DealIcon className={classes.dealIcon} />
              <Typography variant="subtitle2" className={classes.modalTextBlue}>
                {t('sales.deals.deal')}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.converInner}>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor={FormKeys.DEAL_NAME}>
                  {t('sales.locations.dealName')}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  name={FormKeys.DEAL_NAME}
                  id={FormKeys.DEAL_NAME}
                  fullWidth
                  placeholder={t('sales.locations.addDealName')}
                  error={!!errorMessages?.[FormKeys.DEAL_NAME]}
                  onChange={inputChangedHandler}
                  value={formData?.[FormKeys.DEAL_NAME] || ''}
                  helperText={errorMessages?.[FormKeys.DEAL_NAME]}
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="comapnyName">{t('sales.locations.comapnyName')}</InputLabel>
                <TextField
                  name="comapnyName"
                  id="comapnyName"
                  fullWidth
                  disabled
                  placeholder={t('sales.locations.addComapnyName')}
                  value={data?.company?.name}
                />
              </Box>
            </Box>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="contract">{t('sales.locations.convertContact')}</InputLabel>
                <TextField
                  disabled
                  name="contract"
                  id="contract"
                  fullWidth
                  placeholder={t('sales.locations.addContact')}
                  value={data?.contact ? data?.contact?.fullName : NA}
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel className={classes.blueLabel} htmlFor={FormKeys.DEAL_OWNER}>
                  {t('sales.locations.dealOwner')} <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  name={FormKeys.DEAL_OWNER}
                  id={FormKeys.DEAL_OWNER}
                  placeHolder={t('sales.locations.selectDealOwner')}
                  options={
                    transformArrayForOptions(options?.dealOwners, 'name', 'id', 'email') || []
                  }
                  label={formData?.dealOwner?.description}
                  selectedValues={formData?.[FormKeys.DEAL_OWNER] || {}}
                  handleChange={inputChangedHandler}
                  bordered
                  className={classes.dropHigh}
                  isError={errorMessages?.[FormKeys.DEAL_OWNER]}
                  placeHolderClassName={classes.placeHolderSize}
                  searchable
                />
                <span className="errorMessage">{errorMessages?.[FormKeys.DEAL_OWNER]}</span>
              </Box>
            </Box>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel className={classes.blueLabel} htmlFor={FormKeys.PIPELINE}>
                  {t('sales.locations.pipeline')}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  name={FormKeys.PIPELINE}
                  id={FormKeys.PIPELINE}
                  placeHolder={t('sales.locations.selectPipeline')}
                  options={transformArrayForOptions(options?.pipeline, 'name', 'id') || []}
                  selectedValues={formData?.[FormKeys.PIPELINE] || {}}
                  handleChange={inputChangedHandler}
                  bordered
                  className={classes.dropHigh}
                  isError={errorMessages?.[FormKeys.PIPELINE]}
                  placeHolderClassName={classes.placeHolderSize}
                />
                <span className="errorMessage">{errorMessages?.[FormKeys.PIPELINE]}</span>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel className={classes.blueLabel} htmlFor={FormKeys.STAGE}>
                  {t('sales.locations.dealStage')}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  name={FormKeys.STAGE}
                  id={FormKeys.STAGE}
                  placeHolder={t('sales.locations.selectDealStage')}
                  options={transformArrayForOptions(options?.stage, 'name', 'id') || []}
                  selectedValues={formData?.[FormKeys.STAGE] || {}}
                  handleChange={inputChangedHandler}
                  bordered
                  className={classes.dropHigh}
                  isError={errorMessages?.[FormKeys.STAGE]}
                  disabled={!formData?.[FormKeys.PIPELINE]}
                  placeHolderClassName={classes.placeHolderSize}
                />
                {!isObjectEmpty(formData?.[FormKeys.PIPELINE]) &&
                  errorMessages?.[FormKeys.STAGE] && (
                    <span className="errorMessage">{errorMessages?.[FormKeys.STAGE]}</span>
                  )}
              </Box>
            </Box>
          </Box>
          <Box className={classes.sidefooter}>
            <Box className={classes.footerText}>
              <AlertCircle className={classes.alterIcon} />
              <Typography component="p" className={classes.bulkSubHeading}>
                {t('sales.locations.convertFooter')}
              </Typography>
            </Box>
            <Box className={classes.footerButtons}>
              <Button
                variant="secondaryGrey"
                className={classNames(classes.blessbtn, classes.btn)}
                onClick={closeHandle}
              >
                {t('sales.locations.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                className={classNames(classes.bluebtn, classes.btn)}
                disabled={convertLoading}
              >
                {t('sales.locations.convert')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

ConvertLocationModal.propTypes = {
  openHandle: PropTypes.func,
  closeHandle: PropTypes.func,
  data: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ConvertLocationModal;
