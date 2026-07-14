import { Box, InputLabel, TextField } from '@mui/material';
import classNames from 'classnames';
import FieldError from 'commonComponents/fieldError';
import { t } from 'i18next';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DrawerFooter from 'salesComponents/components/drawerFooter';
import DrawerHeader from 'salesComponents/components/drawerHeader';
import FileUpload from 'src/app/components/common/fileUpload';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import {
  generateURLFromObject,
  uploadAllAssetsToAzureStorageBlob,
} from 'src/helper/utilityFunctions';
import { getVisitProfileById, udpateVistsProfileData } from 'src/services/visitorsLoads.service';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast/index.jsx';

// import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { useStyles } from './editVisitData.js';

const EditVisitData = ({
  handleCloseDrawerBanned,
  refetchData,
  refetchManagementStats,
  id,
  isLoad,
}) => {
  const classes = useStyles();

  const saasToken = useSelector((state) => state.auth.saasToken);

  const [formData, setFormData] = useState({
    images: [],
    identifier: '',
    name: '',
    reason: '',
  });

  console.log({ isLoad });

  const [errorMessages, setErrorMessages] = useState({});
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const getVisitProfileData = async () => {
    try {
      setDisabled(true);
      const response = await getVisitProfileById(id);
      if (response.statusCode === 200) {
        if (isLoad) {
          setFormData({
            identifier: response?.data?.profile.identifier,
          });
        } else {
          const imageData = {
            ...response?.data?.profile?.imageAttributes,
          };
          const images = [];
          if (imageData?.filename) {
            images.push({
              ...imageData,
              name: imageData?.filename,
              type: imageData?.contentType,
              size: imageData?.byteSize,
              url: generateURLFromObject(imageData, saasToken),
              alreadyUploaded: true,
            });
          }
          setFormData({
            ...response?.data?.profile,
            images,
          });
        }
      }

      setDisabled(false);
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    getVisitProfileData();
  }, []);

  const handleSubmit = async (e) => {
    try {
      setDisabled(true);
      e.preventDefault();
      const validatePayload = {
        visitor_load_profile: {},
      };

      if (isLoad) {
        validatePayload.visitor_load_profile.identifier = formData.identifier;
      }

      if (!isLoad) {
        validatePayload.visitor_load_profile.name = formData.name;
        validatePayload.visitor_load_profile.image =
          formData?.images?.length || attachmentFiles.length ? 'provided' : null;
      }

      const errors = await joiValidate(validatePayload, t);

      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        setDisabled(false);
        return;
      }

      const result = await uploadAllAssetsToAzureStorageBlob({
        assets: attachmentFiles,
        uploadProgressCallBack: () => {},
        cancelTokens: [],
        presetToken: saasToken,
      });

      const payload = {
        visitor_load_profile: {
          identifier: formData.identifier,
          name: formData.name,
        },
      };

      if (result?.successfullyUploaded.length) {
        payload.visitor_load_profile.imageBlobAttributes = result?.successfullyUploaded.length
          ? { ...result?.successfullyUploaded[0], checksum: '0' }
          : {};
      }

      const response = await udpateVistsProfileData(id, payload);
      if (response.statusCode === 200) {
        await Promise.all([refetchData(), refetchManagementStats()]);

        handleCloseDrawerBanned();
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }

      setDisabled(true);
    } catch (e) {
      setDisabled(false);

      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      {disabled && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <DrawerHeader
        title={isLoad ? t('visitor.editLoadProfile') : t('visitor.editVisitorProfile')}
        // subtext={t('visitor.subText')}
        handleCloseDrawer={handleCloseDrawerBanned}
        className={classes.headerProfileEdit}
      />
      <Box className={classNames(classes.innerContent, 'innerScrollBar')}>
        {!isLoad ? (
          <>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="fullName">
                  {t('visitor.fullName')}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  name="name"
                  id="fullName"
                  fullWidth
                  Disabled
                  placeholder={`${t('visitor.enter')} ${t('visitor.fullName')}`}
                  className={classes.dropHigh}
                  onChange={handleChange}
                  error={!!errorMessages?.['visitor_load_profile,name']}
                  helperText={errorMessages?.['visitor_load_profile,name']}
                  value={formData.name}
                />
              </Box>
            </Box>

            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="phone">{t('visitor.phone')}</InputLabel>
                <TextField
                  name="identifier"
                  id="identifier"
                  type="string"
                  fullWidth
                  placeholder={t('visitor.phonePlaceholder')}
                  className={classes.dropHigh}
                  onChange={handleChange}
                  error={!!errorMessages?.['visitor_load_profile,identifier']}
                  helperText={
                    errorMessages?.['visitor_load_profile,identifier']
                      ? t('visitor.phoneIsRequired')
                      : null
                  }
                  value={formData.identifier}
                />
              </Box>
            </Box>

            <InputLabel>
              {t('visitor.image')} <RequiredAsterik />
            </InputLabel>
            <Box className={classes.fileUploader}>
              <FileUpload
                formData={formData}
                formImageKey="images"
                updateFormHandler={setFormData}
                errorMessages={errorMessages}
                setErrorMessages={setErrorMessages}
                selectedFiles={attachmentFiles}
                setFile={setAttachmentFiles}
                supportedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif']}
                supportedTypesText="(max. 15mbs)"
                allowedExtensions={['.png', '.jpg', '.jpeg', '.svg']}
                disableFileUploading={false}
                maxAllowedFiles={1}
                maxFileSizeAllowed={10}
              />
              {errorMessages?.['visitor_load_profile,image'] && (
                <FieldError error={errorMessages?.['visitor_load_profile,image']} />
              )}
            </Box>
          </>
        ) : (
          <>
            {' '}
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="vehicleNumber">
                  {t('visitor.vehicleNumber')}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  name="identifier"
                  id="vehicleNumber"
                  fullWidth
                  Disabled
                  placeholder={`${t('visitor.enter')} ${t('visitor.vehicleNumber')}`}
                  className={classes.dropHigh}
                  onChange={handleChange}
                  error={!!errorMessages?.['visitor_load_profile,identifier']}
                  helperText={
                    errorMessages?.['visitor_load_profile,identifier']
                      ? t('loads.vehicleNameRequired')
                      : null
                  }
                  value={formData.identifier}
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
      <DrawerFooter
        bulkApply={t('buttons.update')}
        bulkCancel={t('visitor.cancel')}
        handleCloseDrawer={handleCloseDrawerBanned}
        onSubmit={handleSubmit}
        disabled={disabled}
        classNameFooter={classes.headerProfileEdit}
      />
    </>
  );
};

EditVisitData.propTypes = {
  handleCloseDrawerBanned: PropTypes.func,
  refetchData: PropTypes.func,
  refetchManagementStats: PropTypes.func,
  id: PropTypes.string,
  isLoad: PropTypes.bool,
};

EditVisitData.defaultProps = {
  handleCloseDrawer: () => {},
  refetchData: () => {},
  refetchManagementStats: () => {},
  isLoad: false,
};

export default EditVisitData;
