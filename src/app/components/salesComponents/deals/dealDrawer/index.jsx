import { InputLabel, Stack, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import {
  createDeal,
  getCompanyLeadOptions,
  getDealStageOptions,
  updateDeal,
} from 'src/services/deal.service';
import { getLocationDetail } from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { stageValues } from '../dealStages/stage.constant';
import { useStyles } from './dealDrawer.js';

const formDataDefaultState = {
  dealName: '',
  dealOwner: {},
  pipeline: {},
  company: {},
  property: {},
  stage: {},
};

const DealDrawer = ({
  anchor,
  dealCloseDrawer,
  width,
  options,
  setOptions,
  editDealData,
  onSuccess,
  companiesPagination,
  fetchMoreOptions,
  loadingCompaniesDropDown,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const NA = t('commonText.nA');
  const [formData, setFormData] = useState(editDealData ? editDealData : formDataDefaultState);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isFetchingDealStageOptions, setIsFetchingDealStageOptions] = useState(
    !!editDealData || false,
  );
  const [isFetchingCompanyLeadOptions, setIsFetchingCompanyLeadOptions] = useState(
    !!editDealData || false,
  );
  const [isFetchingPropertyDetails, setIsFetchingPropertyDetails] = useState(
    !!editDealData || false,
  );

  const isFetching =
    isFetchingDealStageOptions || isFetchingCompanyLeadOptions || isFetchingPropertyDetails;

  const [errorMessages, setErrorMessages] = useState({});
  const persistPrefilledData = useRef(!!editDealData);

  useEffect(() => {
    if (formData?.pipeline?.id) {
      fetchDealStageOptions(formData.pipeline.id);
      setOptions((prevData) => ({
        ...prevData,
        stages: [],
      }));
      if (!persistPrefilledData.current)
        setFormData((prevData) => ({
          ...prevData,
          stage: null,
        }));
    }
  }, [formData.pipeline]);

  useEffect(() => {
    if (formData?.company?.id) {
      fetchCompanyLeadOptions(formData.company.id);
      setOptions((prevData) => ({
        ...prevData,
        locations: [],
      }));
      if (!persistPrefilledData.current)
        setFormData((prevData) => ({
          ...prevData,
          property: null,
        }));
    }
  }, [formData.company?.id]);

  useEffect(() => {
    if (formData?.property?.id) fetchPropertyDetails(formData.property.id);
  }, [formData.property?.id]);

  /**
   * Fetch Property Detail
   * @param {*} locationId
   */
  const fetchPropertyDetails = async (locationId) => {
    try {
      setIsFetchingPropertyDetails(true);
      const response = await getLocationDetail(locationId);
      if (response.statusCode === 200) {
        setFormData((prevData) => ({
          ...prevData,
          property: {
            ...prevData.property,
            ...response?.data?.location,
          },
        }));
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsFetchingPropertyDetails(false);
    }
  };
  /**
   * Fetch Company Lead Options
   * @param {*} companyId
   */
  const fetchCompanyLeadOptions = async (companyId) => {
    try {
      setIsFetchingCompanyLeadOptions(true);
      const response = await getCompanyLeadOptions(companyId);
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          locations: response?.data?.locations,
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
    } finally {
      setIsFetchingCompanyLeadOptions(false);
    }
  };

  /**
   * Fetch Deal Stage Options
   * @param {*} pipelineId
   */
  const fetchDealStageOptions = async (pipelineId) => {
    try {
      setIsFetchingDealStageOptions(true);
      const response = await getDealStageOptions(
        editDealData ? editDealData.dealStageKey : stageValues.PROPOSAL_CREATION,
        pipelineId,
      );
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          stages: response?.data?.stages,
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
    } finally {
      setIsFetchingDealStageOptions(false);
    }
  };

  if (!isFetching) persistPrefilledData.current = false;

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
    updateFormHandler(name, value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      const errors = await formValidatorJoi(formData, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }
      const payload = {
        dealName: formData.dealName,
        dealOwnerId: formData.dealOwner.id,
        locationId: formData.property.id,
        stageId: formData.stage.id,
        pipelineId: formData.pipeline.id,
      };

      let apiResponse;
      if (editDealData) apiResponse = await updateDeal(editDealData.id, payload);
      else apiResponse = await createDeal(payload);

      if (apiResponse.statusCode === 200) {
        onSuccess(apiResponse.data?.deal);
        toaster.success({
          text: editDealData ? t('sales.deals.updatedDeal') : t('sales.deals.createdDeal'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        /**
         * close the side drawer after successful response
         */
        dealCloseDrawer(anchor);
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
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <Box
      className={classes?.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
      component="form"
      onSubmit={handleFormSubmit}
    >
      {isSubmittingForm && (
        <LoaderComponent size={50} color={'primary'} label={t('sales.loading')} />
      )}
      <Stack className={classes?.boxInner} justifyContent="space-between">
        <Box className={classes?.sideHeader}>
          <DrawerHeader
            title={t(editDealData ? 'sales.deals.editDeal' : 'sales.deals.createDeal')}
            subtext={t(
              editDealData ? 'sales.deals.editText' : 'sales.locations.createLocationText',
            )}
            handleCloseDrawer={dealCloseDrawer}
            anchor={anchor}
          />
        </Box>

        <Box className={classNames(classes.locationForm, 'innerScrollBar')}>
          <Box className={classes.sideBySideCol}>
            <Box className={classes.fieldWrapper}>
              <InputLabel htmlFor="dealName">
                {t('sales.locations.dealName')}
                <RequiredAsterik />
              </InputLabel>
              <TextField
                id="dealName"
                name="dealName"
                fullWidth
                Disabled
                placeholder={t('sales.locations.addDealName')}
                className={classes.dropdownWrap}
                error={!!errorMessages?.dealName}
                onChange={inputChangedHandler}
                value={formData?.dealName || ''}
                helperText={errorMessages?.dealName}
              />
            </Box>
            <Box className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}>
              <InputLabel htmlFor="dealOwner">
                {t('sales.locations.dealOwner')}
                <RequiredAsterik />
              </InputLabel>
              <CustomDropDown
                name="dealOwner"
                id="dealOwner"
                placeHolder={t('sales.locations.addDealOwner')}
                placeHolderClassName={classes?.placeHolderColor}
                options={transformArrayForOptions(options.dealOwners, 'name', 'id', 'email') || []}
                label={formData?.dealOwner?.description}
                selectedValues={formData?.dealOwner || {}}
                handleChange={inputChangedHandler}
                className={classes.dropdownWrap}
                bordered
                searchable
                isError={errorMessages?.dealOwner}
              />
              <span className="errorMessage">{errorMessages?.dealOwner}</span>
            </Box>
          </Box>
          <Box className={classes.sideBySideCol}>
            <Box className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}>
              <InputLabel htmlFor="pipeline">
                {t('sales.deals.pipleline')} <RequiredAsterik />
              </InputLabel>
              <CustomDropDown
                name="pipeline"
                id="pipeline"
                placeHolder={t('sales.deals.selectPipleline')}
                placeHolderClassName={classes?.placeHolderColor}
                options={transformArrayForOptions(options.pipelines, 'name', 'id') || []}
                selectedValues={formData?.pipeline || {}}
                handleChange={inputChangedHandler}
                className={classes.dropdownWrap}
                bordered
                searchable
                isError={errorMessages?.pipeline}
              />
              <span className="errorMessage">{errorMessages?.pipeline}</span>
            </Box>
            <Box className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}>
              <InputLabel htmlFor="stage">
                {t('sales.deals.mappingStage')}
                <RequiredAsterik />
              </InputLabel>
              <CustomDropDown
                name="stage"
                id="stage"
                placeHolder={t('sales.deals.selectMappingStage')}
                placeHolderClassName={classes?.placeHolderColor}
                options={transformArrayForOptions(options.stages, 'name', 'id') || []}
                selectedValues={formData?.stage || {}}
                handleChange={inputChangedHandler}
                className={classes.dropdownWrap}
                disabled={!formData?.pipeline}
                bordered
                isError={errorMessages?.stage}
                searchable
              />
              <span className="errorMessage">{errorMessages?.stage}</span>
            </Box>
          </Box>
          <Box className={classes.sideBySideCol}>
            <Box className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}>
              <InputLabel htmlFor="company">
                {t('sales.locations.company')}
                <RequiredAsterik />
              </InputLabel>
              <CustomDropDown
                name="company"
                id="company"
                placeHolder={t('sales.deals.selectCompany')}
                placeHolderClassName={classes?.placeHolderColor}
                options={transformArrayForOptions(options.companies, 'name', 'id') || []}
                selectedValues={formData?.company || {}}
                handleChange={inputChangedHandler}
                className={classes.dropdownWrap}
                disabled={isFetchingPropertyDetails}
                bordered
                searchable
                isError={errorMessages?.company}
                pagination={companiesPagination}
                fetchMoreOptions={fetchMoreOptions}
                isLoading={loadingCompaniesDropDown}
              />
              <span className="errorMessage">{errorMessages?.company}</span>
            </Box>
            <Box className={classes.fieldWrapper}>
              <InputLabel disabled htmlFor="parentCompany">
                {t('sales.locations.parentCompany')}
              </InputLabel>
              <TextField
                name="parentCompany"
                id="parentCompany"
                disabled
                fullWidth
                placeholder={t('sales.locations.parentCompanyPlaceholder')}
                value={formData?.company?.parentCompanyName}
                className={classes.dropdownWrap}
              />
            </Box>
          </Box>
          <Box className={classes.sideBySideCol}>
            <Box className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}>
              <InputLabel htmlFor="property">
                {t('sales.locations.propertyName')} <RequiredAsterik />
              </InputLabel>
              <CustomDropDown
                name="property"
                id="property"
                placeHolder={t('sales.locations.propertyNamePlaceholder')}
                placeHolderClassName={classes?.placeHolderColor}
                options={transformArrayForOptions(options.locations, 'name', 'id') || []}
                selectedValues={formData?.property || {}}
                handleChange={inputChangedHandler}
                className={classes.dropdownWrap}
                disabled={!formData?.company}
                bordered
                searchable
                isError={errorMessages?.property}
              />
              <span className="errorMessage">
                {errorMessages?.property && t('sales.deals.locationNameError')}
              </span>
            </Box>
            <Box className={classes.fieldWrapper}>
              <InputLabel disabled htmlFor="locationSource">
                {t('sales.locations.locationSource')}
              </InputLabel>
              <TextField
                name="locationSource"
                id="locationSource"
                disabled
                fullWidth
                placeholder={t('sales.locations.locationSourcePlaceholder')}
                value={formData?.property?.type || ''}
                className={classes.dropdownWrap}
              />
            </Box>
          </Box>
          <Box
            className={`${classes.sideBySideCol}  ${classes.noMarginBottom} ${classes.fiftyWidth}`}
          >
            <Box className={classes.fieldWrapper}>
              <InputLabel disabled htmlFor="associatedFranchise">
                {t('sales.locations.associatedFranchise')}
              </InputLabel>
              <TextField
                name="associatedFranchise"
                id="associatedFranchise"
                disabled
                fullWidth
                placeholder={t('sales.locations.associatedFranchisePlaceholder')}
                value={formData?.property?.franchiseName || ''}
                className={classes.dropdownWrap}
              />
            </Box>
          </Box>

          {/* New Additional Fields */}
          {/*<Box className={classes.additionalFieldBox}>*/}
          {/*  <Typography variant="h4" className={classes.approveTextBoxTitle}>*/}
          {/*    {t('sales.deals.additionalDetails')}*/}
          {/*  </Typography>*/}
          {/*  <Box className={classes.sideBySideCol}>*/}
          {/*    <Box className={classes.fieldWrapper}>*/}
          {/*      <InputLabel htmlFor="noOfUnits">{t('sales.locations.otherNoOfUnits')}</InputLabel>*/}
          {/*      <TextField*/}
          {/*        name="noOfUnits"*/}
          {/*        id="noOfUnits"*/}
          {/*        fullWidth*/}
          {/*        placeholder={t('sales.locations.otherNoOfUnitsPlaceholder')}*/}
          {/*        value={formData?.company?.parentCompanyName}*/}
          {/*        className={classes.dropdownWrap}*/}
          {/*      />*/}
          {/*    </Box>*/}
          {/*    <Box className={classes.fieldWrapper}>*/}
          {/*      <InputLabel htmlFor="occupancyRate">*/}
          {/*        {t('sales.locations.otherOccupancyRate')}*/}
          {/*      </InputLabel>*/}
          {/*      <TextField*/}
          {/*        name="occupancyRate"*/}
          {/*        id="occupancyRate"*/}
          {/*        fullWidth*/}
          {/*        placeholder={t('sales.locations.otherOccupancyRatePlaceholder')}*/}
          {/*        value={formData?.company?.parentCompanyName}*/}
          {/*        className={classes.dropdownWrap}*/}
          {/*      />*/}
          {/*    </Box>*/}
          {/*  </Box>*/}
          {/*  <Box className={`${classes.sideBySideCol} ${classes.noMarginBottom}`}>*/}
          {/*    <Box className={classes.fieldWrapper}>*/}
          {/*      <InputLabel htmlFor="averageRate">*/}
          {/*        {t('sales.locations.otherAverageRate')}*/}
          {/*      </InputLabel>*/}
          {/*      <TextField*/}
          {/*        name="averageRate"*/}
          {/*        id="averageRate"*/}
          {/*        fullWidth*/}
          {/*        placeholder={t('sales.locations.otherAverageRatePlaceholder')}*/}
          {/*        value={formData?.property?.type || ''}*/}
          {/*        className={classes.dropdownWrap}*/}
          {/*      />*/}
          {/*    </Box>*/}
          {/*    <Box className={classes.fieldWrapper}>*/}
          {/*      <InputLabel htmlFor="managementCompany">*/}
          {/*        {t('sales.locations.otherManagementCompany')}*/}
          {/*      </InputLabel>*/}
          {/*      <TextField*/}
          {/*        name="managementCompany"*/}
          {/*        id="managementCompany"*/}
          {/*        fullWidth*/}
          {/*        placeholder={t('sales.locations.otherManagementCompanyPlaceholder')}*/}
          {/*        value={formData?.property?.type || ''}*/}
          {/*        className={classes.dropdownWrap}*/}
          {/*      />*/}
          {/*    </Box>*/}
          {/*  </Box>*/}
          {/*</Box> */}
          <Box className={classes.approveTextBox}>
            <Typography variant="h4" className={classes.approveTextBoxTitle}>
              {t('sales.locations.contactDetails')}
            </Typography>
            <Box className={classes.companyFlex}>
              <Typography variant="body1" className={classes.cLabel}>
                {t('sales.locations.name')}
              </Typography>
              <Typography variant="body1" className={classes.compDetName}>
                {!formData?.property?.contact?.firstName && !formData?.property?.contact?.lastName
                  ? NA
                  : `${formData?.property?.contact?.firstName} ${formData?.property?.contact?.lastName}`}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.approveTextBox}>
            <Typography variant="h4" className={classes.approveTextBoxTitle}>
              {t('sales.locations.address')}
            </Typography>
            <Box className={classes.companyFlex}>
              <Typography variant="body1" className={classes.cLabel}>
                {t('sales.locations.streetAddress')}
              </Typography>
              <Typography variant="body1" className={classes.compDetName}>
                {formData?.property?.street || NA}
              </Typography>
            </Box>
            <Box className={classes.companyFlex}>
              <Typography variant="body1" className={classes.cLabel}>
                {t('sales.locations.city')}
              </Typography>
              <Typography variant="body1" className={classes.compDetName}>
                {formData?.property?.city || NA}
              </Typography>
            </Box>
            <Box className={classes.companyFlex}>
              <Typography variant="body1" className={classes.cLabel}>
                {t('sales.locations.state')}
              </Typography>
              <Typography variant="body1" className={classes.compDetName}>
                {formData?.property?.state || NA}
              </Typography>
            </Box>
            <Box className={classes.companyFlex}>
              <Typography variant="body1" className={classes.cLabel}>
                {t('sales.locations.postalCode')}
              </Typography>
              <Typography variant="body1" className={classes.compDetName}>
                {formData?.property?.postalCode || NA}
              </Typography>
            </Box>
          </Box>
        </Box>

        <DrawerFooter
          bulkApply={t(editDealData ? 'sales.locations.save' : 'sales.deals.createDeal')}
          bulkCancel={t('sales.locations.cancel')}
          handleCloseDrawer={dealCloseDrawer}
          anchor={anchor}
          type="submit"
          disabled={isSubmittingForm || isFetching}
          classNameFooter={classes.sideDrawerFooter}
        />
      </Stack>
    </Box>
  );
};

DealDrawer.propTypes = {
  anchor: PropTypes.string,
  dealCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  options: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setOptions: PropTypes.func,
  editDealData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  onSuccess: PropTypes.func,
  companiesPagination: PropTypes.object,
  fetchMoreOptions: PropTypes.func,
  loadingCompaniesDropDown: PropTypes.bool,
};

export default DealDrawer;
