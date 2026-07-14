import CloseIcon from '@mui/icons-material/Close';
import { Box, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as Upload } from 'assets/images/upload-icon.svg?react';
import { ReactComponent as TrashIcon } from 'assets/svg/trash-2.svg?react';
import classNames from 'classnames';
import { supportedImageFormats } from 'globalUtils/constants';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { removeKey } from 'src/helper/utilityFunctions';

import FieldError from '../fieldError';
const useStyles = makeStyles((theme) => ({
  dragText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  dragTextBelow: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  boldText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  loginButton: {
    '&.MuiButtonBase-root': {
      height: 'auto',
      padding: '10px 16px ',
    },
  },
  formBoxImage: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
  },

  avatarTextImage: {
    height: '64px',
    width: '64px',
    borderRadius: '50%',
  },

  paperWrapper: {
    flex: '1',
    width: '100%',
    padding: '16px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    border: '1px solid #D0CFD2',
    boxShadow: 'none !important',
    borderRadius: '8px !important',
  },

  inputFileWrapper: {
    position: 'relative',
    padding: '0 !important',
    height: 'unset !important',
  },

  uploadBtn: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
    marginTop: '10px',
  },

  customFileInput: {
    position: 'absolute',
    top: '0',
    left: '0',
    height: '100%',
    width: '100%',
    opacity: '0',
    padding: '0 !important',
    cursor: 'pointer',
  },

  multipleImageWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    marginTop: '20px',
  },

  imageItem: {
    height: '80px',
    width: '80px',
    position: 'relative',
    '& .MuiBox-root': {
      '&:hover': {
        opacity: '1',
      },
    },
  },

  multipleImg: { width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' },
  trashIcon: {
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    top: '50%',
    cursor: 'pointer',
    '& svg ': {
      '& #trash-2': {
        '& path': {
          stroke: '#fff !important',
        },
      },
    },
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%)',
    color: '#F1F1F1',
    width: '100%',
    transition: '0.5s ease',
    opacity: 0,

    textAlign: 'center',
    height: '100%',
    borderRadius: '8px',
  },
}));
const ProfileImageUpload = ({
  multiple = false,
  formData,
  formImageKey,
  updateFormHandler,
  errorMessages,
  setErrorMessages,
  image,
  profileImageClass,
  setImage,
  showCross,
  defaultImage = 'https://signalassets.blob.core.windows.net/signal/assets/Avatar.png',
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  function handleDrop(event) {
    event.preventDefault();
    const imageFiles = event.dataTransfer?.files;
    if (multiple && image?.length + formData[formImageKey]?.length + imageFiles?.length > 4) {
      setErrorMessages((prev) => ({
        ...prev,
        [formImageKey]: t('obx.errors.lessThanFour'),
      }));
      return;
    }
    if (imageFiles && imageFiles.length > 0) {
      // Check file formats for each dropped file
      for (const file of Array.from(imageFiles)) {
        if (!supportedImageFormats.includes(file.type)) {
          setErrorMessages((prev) => ({
            ...prev,
            [formImageKey]: t('obx.errors.unsupportedImageFormat'),
          }));
          return;
        }
      }

      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [formImageKey]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
      // Set the images array or concatenate new files to the existing array
      setImage((prevImages) =>
        multiple ? [...prevImages, ...Array.from(imageFiles)] : Array.from(imageFiles),
      );
    }
  }
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  const deleteFile = (e) => {
    e.stopPropagation();
    setImage(multiple ? [] : null);
    updateFormHandler(formImageKey, '');
  };
  function inputChangedHandler(event) {
    const { name, files, type } = event.target;
    if (multiple && image?.length + formData[formImageKey]?.length + files?.length > 4) {
      setErrorMessages((prev) => ({
        ...prev,
        [name]: t('obx.errors.lessThanFour'),
      }));
      return;
    }
    if (type === 'file' && files.length > 0) {
      const newFiles = Array.from(files);
      // Check file formats for each file
      for (const file of newFiles) {
        if (!supportedImageFormats.includes(file.type)) {
          setErrorMessages((prev) => ({
            ...prev,
            [name]: t('obx.errors.unsupportedImageFormat'),
          }));
          return;
        }
      }
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
      setImage((prevImages) => (multiple ? [...prevImages, ...newFiles] : newFiles[0]));
    }
  }
  const handleMultipleDelete = (e, i, state) => {
    if (image?.length + formData[formImageKey]?.length - 1 < 5) {
      setErrorMessages((prev) => removeKey([formImageKey], prev));
    }
    if (state === 'localState') {
      setImage(image?.filter((_item, index) => index != i));
      return;
    }
    updateFormHandler(
      [formImageKey],
      formData[formImageKey]?.filter((_item, index) => index != i),
    );
  };
  const selectedImage =
    image && !multiple
      ? URL.createObjectURL(image)
      : formData?.[formImageKey]
        ? formData?.[formImageKey]
        : defaultImage;
  const selectedMultipleImages =
    multiple && image?.length ? image?.map((item) => URL.createObjectURL(item)) : [];
  const render = () => {
    return (
      <>
        <Box className={classNames(classes.formBoxImage, profileImageClass)}>
          {selectedImage && !multiple && (
            <img src={selectedImage} className={classes.avatarTextImage} />
          )}
          <Paper className={classes.paperWrapper} onDrop={handleDrop} onDragOver={handleDragOver}>
            {image && showCross && !multiple ? (
              <>
                <Upload />
                <Typography variant="subtitle1">{t('obx.buttons.fileSelected')}</Typography>
                <Typography variant="subtitle2">{formData?.[formImageKey].name}</Typography>
                <CloseIcon onClick={deleteFile} />
              </>
            ) : (
              <Box className={classes.inputFileWrapper}>
                <Upload />
                <Box className={classes.uploadBtn}>
                  <Typography variant="subtitle2" className={classes.boldText}>
                    {t('obx.buttons.clickToUpload')}
                  </Typography>
                  <Typography variant="body2" className={classes.dragText}>
                    <input
                      multiple={multiple}
                      name={formImageKey}
                      type="file"
                      accept=".png, .jpg, .jpeg, .svg"
                      onChange={inputChangedHandler}
                      className={classes.customFileInput}
                    />
                    {t('obx.buttons.dnd')}
                  </Typography>
                </Box>
                <Typography variant="body3" className={classes.dragTextBelow}>
                  {t('obx.buttons.imageSizeEF')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        {multiple && (formData[formImageKey].length > 0 || selectedMultipleImages.length > 0) && (
          <Box className={classes.multipleImageWrapper}>
            {formData[formImageKey].length > 0 &&
              formData[formImageKey].map((imageItem, i) => (
                <Box
                  key={i}
                  className={classes.imageItem}
                  onClick={(e) => handleMultipleDelete(e, i, 'formState')}
                >
                  <img src={imageItem?.url} className={classes.multipleImg} />
                  <Box className={classes.overlay}>
                    <Box className={classes.trashIcon}>
                      <TrashIcon />
                    </Box>
                  </Box>
                </Box>
              ))}
            {selectedMultipleImages.length > 0 &&
              selectedMultipleImages.map((imageItem, i) => (
                <Box
                  key={i}
                  className={classes.imageItem}
                  onClick={(e) => handleMultipleDelete(e, i, 'localState')}
                >
                  <img src={imageItem} className={classes.multipleImg} />
                  <Box className={classes.overlay}>
                    {' '}
                    <Box className={classes.trashIcon}>
                      <TrashIcon />
                    </Box>
                  </Box>
                </Box>
              ))}
          </Box>
        )}
        {errorMessages?.[formImageKey] && <FieldError error={errorMessages?.[formImageKey]} />}
      </>
    );
  };
  return <>{render()}</>;
};
ProfileImageUpload.defaultProps = {
  previewAvatar: true,
  showCross: true,
};

ProfileImageUpload.propTypes = {
  multiple: PropTypes.bool,
  formData: PropTypes.object,
  formImageKey: PropTypes.string,
  updateFormHandler: PropTypes.func,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  image: PropTypes.string,
  setImage: PropTypes.func,
  previewAvatar: PropTypes.bool,
  showCross: PropTypes.bool,
  defaultImage: PropTypes.string,
  profileImageClass: PropTypes.string,
};

export default ProfileImageUpload;
