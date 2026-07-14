import {
  Box,
  Button,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  Skeleton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import classNames from 'classnames';
import { EditorState } from 'draft-js';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { parsePhoneNumber } from 'react-phone-number-input';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import PhoneNumberWithCountry from 'src/app/components/common/phoneNumberWithCountry';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import RichTextEditor, { convertDataToHtml } from 'src/app/components/common/richText';
import SideDrawer from 'src/app/components/common/sideDrawer';
import { siteStatusEnum } from 'src/app/homeOffice/pages/franchise/utils/enums';
import { ACL_OBX_DISPATCH_CREATE } from 'src/app/router/constant/OBXMODULE';
import { OBX_DISPATCH } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useFormHook from 'src/hooks/useFormHook';
import { createDispatch, getDispatchTypes } from 'src/services/dispatch.services';
import { getAllSites, getSitesInstructions } from 'src/services/sites.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import {
  callerRequestOfficerCallBackOptions,
  useCallFromMonitoringServiceTypeOptions,
} from '../helper';
import CallerHistoryDrawer from './components/callerHistoryDrawer';
import { useStyles } from './createDispatch';
import SelectAddress from './SelectAddress';

const initialFormData = {
  site: {},
  dispatchType: {},
  callerName: '',
  callerAddress: '',
  buildingNumber: '',
  apartmentNumber: '',
  callerRequest: '',
  dispatchDescription: EditorState.createEmpty(),
  callerRequestOfficerCallBack: {},
  callFromMonitoringServiceType: {},
  callerPhoneNumber: '',
  dispatchAddressRadio: 'same',
  googleAddress: {},
  jobId: '',
};

// Status Enum
const DISPATCH_STATUS_ENUM = {
  NEW_ALARM: 'new_alarm',
};

const CreateDispatch = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(786));
  const { t } = useTranslation();
  const [showDrawer, setShowDrawer] = useState(false);
  const [allSites, setAllSites] = useState([]);
  const [isSitesLoading, setIsSitesLoading] = useState(true);
  const [instructions, setInstructions] = useState({});
  const franchiseId = useSelector((state) => state.auth.franchiseId);
  const currentUser = useSelector((state) => state.user.info.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleInputChange, errorMessages, setErrorMessages, formData } = useFormHook({
    defaultFormData: initialFormData,
  });
  const [dipatchTypeOptions, setDipatchTypeOptions] = useState([]);
  const dispatchOptions = useCallFromMonitoringServiceTypeOptions(t);
  const { getLabel } = useTenantLabel();

  const getDispatchTypesFunc = async () => {
    try {
      const response = await getDispatchTypes();

      const DISPATCH_TYPE_OPTIONS = Object.keys(response || {}).map((key) => ({
        value: key,
        label: response[key],
      }));

      setDipatchTypeOptions(DISPATCH_TYPE_OPTIONS || []);
    } catch (error) {
      toaster.error({
        text: error?.response?.data?.message || error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    getDispatchTypesFunc();
  }, []);

  const handlePhoneNumber = (event) => {
    if (!event) return;
    handleInputChange({
      target: {
        value: event,
        name: 'callerPhoneNumber',
      },
    });
  };

  const handleChangeDispatchAndSiteAddressCheck = (e) => {
    const val = e?.target?.value;
    handleInputChange({
      target: {
        value: val,
        name: 'dispatchAddressRadio',
      },
    });
    handleChangeAddress({});
  };

  const handleChangeAddress = (value) => {
    handleInputChange({
      target: {
        value: value,
        name: 'googleAddress',
      },
    });
  };

  const fetchSitesInstruction = async () => {
    try {
      const response = await getSitesInstructions(formData?.site?.id, {
        instructionType: 'dispatch',
      });

      if (response?.statusCode === 200) {
        if (!isObjectEmpty(response?.data?.instruction)) {
          setInstructions(response?.data?.instruction);
        }
      }
    } catch {
      setInstructions({});
    }
  };

  const fetchAllSites = async () => {
    try {
      const response = await getAllSites({ status: siteStatusEnum.functional });

      if (response?.statusCode === 200) {
        let transformedSites =
          transformArrayForOptions(response?.data?.sites, 'name', 'id', 'address') || [];
        setAllSites([...transformedSites]);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsSitesLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const validatePayload = {
        site: formData?.site?.id || null,
        dispatchType: formData?.dispatchType?.value || null,
        callerPhoneNumber: formData?.callerPhoneNumber || null,
        callerName: formData?.callerName || null,
        callerAddress: formData?.callerAddress || null,
        dispatchDescription: convertDataToHtml(formData?.dispatchDescription) || null,
        callerRequestOfficerCallBack: formData.callerRequestOfficerCallBack.value ?? false,
        address:
          formData?.dispatchAddressRadio === 'different'
            ? formData?.googleAddress?.name || null
            : undefined,
      };

      const errors = await joiValidate(validatePayload, t);
      if (errors && Object.keys(errors).length) {
        errors.googleAddress = errors?.address;
        // if (!errors?.callerPhoneNumber) {
        //   const parsedPhoneNumber = parsePhoneNumber(formData?.callerPhoneNumber);
        //   if (parsedPhoneNumber?.nationalNumber?.length !== 10) {
        //     errors.callerPhoneNumber = t('obx.dispatch.callerPhoneNoLengthError');
        //   }
        // }
        setErrorMessages(errors);
        return;
      }
      const dispatchAddress = {
        address: formData?.googleAddress?.name,
        lat: formData?.googleAddress?.position?.lat,
        lng: formData?.googleAddress?.position?.lng,
      };

      const payload = {
        siteId: formData?.site?.id,
        dispatchType: formData?.dispatchType?.value,
        status: DISPATCH_STATUS_ENUM.NEW_ALARM,
        callerDetails: {
          phoneNumber: formData?.callerPhoneNumber,
          buildingNumber: formData?.buildingNumber,
          apartmentNumber: formData?.apartmentNumber,
          name: formData?.callerName,
          address: formData?.callerAddress,
          monitoringServiceType: formData?.callFromMonitoringServiceType?.value,
        },
        callBack: formData.callerRequestOfficerCallBack.value,
        createdBy: currentUser,
        description: convertDataToHtml(formData?.dispatchDescription),
        franchiseId,
        ...(formData?.dispatchAddressRadio === 'different' ? dispatchAddress : null),
        ...(formData?.jobId ? { jobId: formData?.jobId } : {}),
      };

      const response = await createDispatch(payload);
      if (response && response.statusCode === 200) {
        history.push(OBX_DISPATCH);
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
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!allSites.length) fetchAllSites();
    if (!isObjectEmpty(formData.site)) fetchSitesInstruction();
  }, [formData.site.id]);

  return (
    <Box className={classes.mainCreateWraper}>
      <Box className={classNames(classes.dispatchMainWrapper, 'innerScrollBar')}>
        <Box className={classes.CreateDispatchWrapper}>
          <Typography variant="body1" className={classes.mainHeading}>
            {`${t('obx.dispatch.dispatchDetails', {
              dispatch: getLabel('terms', 'dispatch', t),
            })}`}
          </Typography>
          <Box className={classes.rowGaps}>
            {!isSitesLoading ? (
              <Box className={classes.rowField}>
                <InputLabel htmlFor={t('obx.dispatch.site')}>
                  {`${t('obx.dispatch.select')} ${t('obx.dispatch.site')}`}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  maxWidth={isMobile ? '300px' : '700px'}
                  searchPlaceholder={`${t('obx.dispatch.searchByNameOrAddress')}`}
                  label={t('obx.dispatch.site')}
                  placeHolder={`${t('obx.dispatch.searchByNameOrAddress')}`}
                  name={'site'}
                  selectedValues={formData.site || {}}
                  options={allSites || []}
                  handleChange={handleInputChange}
                  searchable
                  bordered
                  searchByDesc
                  className={classes.dropdownWrap}
                  isError={!!errorMessages['site']}
                />
                {errorMessages && (
                  <Box className={classes.invalidFeedback}>
                    {!!errorMessages['site'] ? errorMessages['site'] : null}
                  </Box>
                )}
              </Box>
            ) : (
              <Skeleton className={classes.dropDownSkeleton} />
            )}
            {formData?.site?.address && (
              <Box className={classes.rowField}>
                <Box className={classes.rowFieldInline}>
                  <InputLabel>{`${t('obx.dispatch.siteAddress')} :`}</InputLabel>
                  <Typography variant="body2">{formData?.site?.address}</Typography>
                </Box>
              </Box>
            )}
            {formData?.site?.id && !isObjectEmpty(instructions) && (
              <Box className={classes.rowField}>
                <Box className={classes.rowFieldBlueBox}>
                  <Typography>{`${t('obx.dispatch.dispatchPostOrders', {
                    dispatch: getLabel('terms', 'dispatch', t),
                  })}`}</Typography>
                  <Typography className={classes.text}>
                    {' '}
                    <Box
                      dangerouslySetInnerHTML={{
                        __html: instructions?.content,
                      }}
                    />
                  </Typography>
                </Box>
              </Box>
            )}

            <Box className={classes.rowField}>
              <InputLabel
                htmlFor={t('obx.dispatch.dispatchAddress', {
                  dispatch: getLabel('terms', 'dispatch', t),
                })}
              >
                {t('obx.dispatch.dispatchAddress', {
                  dispatch: getLabel('terms', 'dispatch', t),
                })}
                <RequiredAsterik />
              </InputLabel>
              <Box className={classes.radioWrapper}>
                <RadioGroup
                  column
                  aria-labelledby="demo-radio-buttons-group-label"
                  name={'radio-buttons-group'}
                  row
                  value={formData?.dispatchAddressRadio}
                  onChange={handleChangeDispatchAndSiteAddressCheck}
                >
                  <FormControlLabel
                    value="same"
                    control={<Radio />}
                    label={t('obx.dispatch.sameAsSiteAddress')}
                    className=""
                  />
                  <FormControlLabel
                    value="different"
                    control={<Radio />}
                    label={t('obx.dispatch.useDifferentAddress')}
                    className=""
                  />
                </RadioGroup>
              </Box>
            </Box>
            {formData?.dispatchAddressRadio === 'different' && (
              <Box className={classes.rowField}>
                <SelectAddress
                  handleChangeAddress={handleChangeAddress}
                  formData={formData}
                  errorMessages={errorMessages}
                />
              </Box>
            )}

            <Box className={classes.rowField}>
              <InputLabel
                htmlFor={t('obx.dispatch.dispatchType', {
                  dispatch: getLabel('terms', 'dispatch', t),
                })}
              >
                {t('obx.dispatch.dispatchType', {
                  dispatch: getLabel('terms', 'dispatch', t),
                })}
                <RequiredAsterik />
              </InputLabel>
              <CustomDropDown
                label={t('obx.dispatch.dispatchType', {
                  dispatch: getLabel('terms', 'dispatch', t),
                })}
                placeHolder={`${t('obx.dispatch.select')} ${t('obx.dispatch.dispatchType', {
                  dispatch: getLabel('terms', 'dispatch', t),
                })}`}
                name={'dispatchType'}
                selectedValues={formData?.dispatchType || {}}
                options={[...dipatchTypeOptions]}
                handleChange={handleInputChange}
                searchable
                bordered
                className={classes.dropdownWrap}
                isError={!!errorMessages['dispatchType']}
              />
              {errorMessages && (
                <Box className={classes.invalidFeedback}>
                  {!!errorMessages['dispatchType'] ? errorMessages['dispatchType'] : null}
                </Box>
              )}
            </Box>
            <Box className={classes.rowField}>
              <InputLabel>{t('obx.dispatch.jobId')}</InputLabel>
              <TextField
                className={classes.fullWidth}
                name={'jobId'}
                placeholder={`${t('obx.dispatch.type')} ${t('obx.dispatch.jobId')}`}
                type="text"
                onChange={handleInputChange}
                value={formData?.jobId}
                // error={!!errorMessages?.jobId}
                // helperText={errorMessages?.jobId ? errorMessages?.jobId : null}
              />
            </Box>
          </Box>
          <Box className={classes.rowGaps}>
            <Typography variant="body1" className={classes.mainHeading}>
              {`${t('obx.dispatch.callerDetails')}`}
            </Typography>
            <Box className={classes.rowField}>
              <InputLabel>
                {t('obx.dispatch.callerPhoneNumber')}
                <RequiredAsterik />
              </InputLabel>
              <PhoneNumberWithCountry
                value={formData.callerPhoneNumber}
                onChange={handlePhoneNumber}
                name={'callerPhoneNumber'}
                className={classes.countryPhnNumber}
                isError={!!errorMessages?.callerPhoneNumber}
                international={true}
                error={errorMessages?.callerPhoneNumber}
              />
              {/* <Button
                variant="onlyText"
                className={classes.callHistory}
                disableRipple
                onClick={() => setShowDrawer(true)}
              >
                View 5 Previous Calls
              </Button> */}
            </Box>
            <Box className={classes.rowField}>
              <InputLabel>
                {t('obx.dispatch.callerName')} <RequiredAsterik />
              </InputLabel>
              <TextField
                className={classes.fullWidth}
                name={'callerName'}
                placeholder={`${t('obx.dispatch.type')} ${t('obx.dispatch.callerName')}`}
                type="text"
                onChange={handleInputChange}
                value={formData?.callerName}
                error={!!errorMessages?.callerName}
                helperText={errorMessages?.callerName ? errorMessages?.callerName : null}
              />
            </Box>
            <Box className={classes.rowField}>
              <InputLabel>
                {t('obx.dispatch.callerAddress')}
                <RequiredAsterik />
              </InputLabel>
              <TextField
                className={classes.fullWidth}
                name={'callerAddress'}
                placeholder={`${t('obx.dispatch.type')} ${t('obx.dispatch.callerAddress')}`}
                type="text"
                onChange={handleInputChange}
                value={formData?.callerAddress}
                error={!!errorMessages?.callerAddress}
                helperText={errorMessages?.callerAddress ? errorMessages?.callerAddress : null}
              />
            </Box>
            <Box className={classes.rowField}>
              <Box className={classes.rowFieldTwo}>
                <Box>
                  <InputLabel>{t('obx.dispatch.buildingNumber')}</InputLabel>
                  <TextField
                    className={classes.fullWidth}
                    name={'buildingNumber'}
                    placeholder={`${t('obx.dispatch.type')} ${t('obx.dispatch.buildingNumber')}`}
                    type="text"
                    onChange={handleInputChange}
                    value={formData?.buildingNumber}
                    error={!!errorMessages?.buildingNumber}
                    helperText={
                      errorMessages?.buildingNumber ? errorMessages?.buildingNumber : null
                    }
                  />
                </Box>
                <Box>
                  <InputLabel>{t('obx.dispatch.apartmentNumber')}</InputLabel>
                  <TextField
                    className={classes.fullWidth}
                    name={'apartmentNumber'}
                    placeholder={`${t('obx.dispatch.type')} ${t('obx.dispatch.apartmentNumber')}`}
                    type="text"
                    onChange={handleInputChange}
                    value={formData?.apartmentNumber}
                    error={!!errorMessages?.apartmentNumber}
                    helperText={
                      errorMessages?.apartmentNumber ? errorMessages?.apartmentNumber : null
                    }
                  />
                </Box>
              </Box>
            </Box>

            <Box className={classes.rowField}>
              <Box className={classes.rowFieldTwo}>
                <Box>
                  <InputLabel htmlFor={t('obx.dispatch.callerRequestOfficerCallBack')}>
                    {t('obx.dispatch.callerRequestOfficerCallBack', {
                      officer: getLabel('roles', 'officer', t),
                    })}
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.dispatch.callerRequestOfficerCallBack', {
                      officer: getLabel('roles', 'officer', t),
                    })}
                    placeHolder={`${t('obx.dispatch.select')}`}
                    name={'callerRequestOfficerCallBack'}
                    options={callerRequestOfficerCallBackOptions(t)}
                    selectedValues={formData?.callerRequestOfficerCallBack}
                    bordered
                    className={classes.dropdownWrap}
                    handleChange={handleInputChange}
                    isError={!!errorMessages['callerRequestOfficerCallBack']}
                  />
                  {errorMessages && (
                    <Box className={classes.invalidFeedback}>
                      {!!errorMessages['callerRequestOfficerCallBack']
                        ? errorMessages['callerRequestOfficerCallBack']
                        : null}
                    </Box>
                  )}
                </Box>
                <Box>
                  <InputLabel htmlFor={t('obx.dispatch.callFromMonitoringServiceType')}>
                    {t('obx.dispatch.callFromMonitoringServiceType')}
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.dispatch.callFromMonitoringServiceType')}
                    placeHolder={`${t('obx.dispatch.select')}`}
                    name={'callFromMonitoringServiceType'}
                    options={dispatchOptions}
                    selectedValues={formData?.callFromMonitoringServiceType}
                    bordered
                    className={classes.dropdownWrap}
                    handleChange={handleInputChange}
                    isError={!!errorMessages['callFromMonitoringServiceType']}
                  />
                  {errorMessages && (
                    <Box className={classes.invalidFeedback}>
                      {!!errorMessages['callFromMonitoringServiceType']
                        ? errorMessages['callFromMonitoringServiceType']
                        : null}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            <Box className={classes.rowField}>
              <RichTextEditor
                handleChange={(event) => handleInputChange(event)}
                name={'dispatchDescription'}
                placeholder={t('obx.dispatch.rictTextPlaceholder', {
                  dispatch: getLabel('terms', 'dispatch', t).toLowerCase(),
                })}
                value={formData?.dispatchDescription || EditorState.createEmpty()}
                className={classes.richText}
                error={!!errorMessages?.dispatchDescription}
              />
              {!!errorMessages?.dispatchDescription && (
                <Typography className={classes.errorMessage}>
                  {errorMessages.dispatchDescription}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className={classes.bottomButtons}>
        <Button variant="secondaryGrey" onClick={() => history.goBack()} disableRipple>
          {t('obx.dispatch.cancel')}
        </Button>

        <RenderIfHasPermission name={ACL_OBX_DISPATCH_CREATE}>
          <Button variant="primary" disabled={isSubmitting} disableRipple onClick={handleSubmit}>
            {t('obx.dispatch.createDispatch', {
              dispatch: getLabel('terms', 'dispatch', t),
            })}
          </Button>
        </RenderIfHasPermission>
      </Box>
      <SideDrawer isOpen={showDrawer} totalWidth={'920px'}>
        <CallerHistoryDrawer showDrawer={showDrawer} setShowDrawer={setShowDrawer} />
      </SideDrawer>
    </Box>
  );
};

export default CreateDispatch;
