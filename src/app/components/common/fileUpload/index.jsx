import CloseIcon from '@mui/icons-material/Close';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as Upload } from 'assets/images/upload-icon.svg?react';
import { ReactComponent as PdfIcon } from 'assets/svg/pdf-paceholder.svg?react';
import { ReactComponent as TrasIcon } from 'assets/svg/trash.svg?react';
import ThumbnailSlider from 'commonComponents/thumbnailSlider';
import {
  allowedImageExtensions,
  pdfFileFormats,
  supportedImageFormats,
  videoFileFormats,
} from 'globalUtils/constants';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { convertFileSize, removeKey, truncateString } from 'src/helper/utilityFunctions';

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
    // marginBottom: '20px',
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
    border: '1px solid #E6E6E7',
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
    marginTop: '12px',
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
    flexDirection: 'column',
    gap: '8px',
  },
  multipleImages: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '20px',
  },
  imageListItem: {
    padding: '10px',
    borderRadius: '8px',
    border: ' 1px solid  #E6E6E7',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewImage: {
    display: 'block',
    cursor: 'pointer',
    width: 'fit-content',
  },
  fileName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      maxWidth: '400px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  fileSize: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      textTransform: 'uppercase',
      wordSpacing: '2px',
    },
  },
  fileNameWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  imageItem: {
    height: '80px',
    width: '80px',
    position: 'relative',
    opacity: 0,
    '& .MuiBox-root': {
      '&:hover': {
        opacity: '1',
      },
    },
  },
  fileDetailes: {
    display: 'flex',
    gap: '16px',
    cursor: 'pointer',
  },
  ImageWrapper: {
    display: 'flex',
    width: '40px',
    height: '40px',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '4px',
    background: ' #F6F6F8',
  },
  fileTypeImage: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  multipleImg: { width: '100%', height: '100%', borderRadius: '8px', objectFit: 'fill' },
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
  trashIconBox: {
    cursor: 'pointer',
    lineHeight: 1,
  },
}));

const getFileSize = (fileSize) => {
  return fileSize * 1024 * 1024;
};

const FileUpload = ({
  multiple,
  formData,
  formImageKey,
  updateFormHandler,
  errorMessages,
  setErrorMessages,
  selectedFiles,
  setFile,
  showCross,
  defaultImage,
  supportedTypes,
  supportedTypesText,
  allowedExtensions,
  disableFileUploading,
  maxAllowedFiles,
  maxFileSizeAllowed,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [open, setOpen] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    const imageFiles = event.dataTransfer?.files;
    if (
      multiple &&
      selectedFiles?.length + formData[formImageKey]?.length + imageFiles?.length > maxAllowedFiles
    ) {
      setErrorMessages((prev) => ({
        ...prev,
        [formImageKey]: t('obx.errors.maxFilesAllowed', {
          max: maxAllowedFiles,
        }),
      }));
      return;
    }

    // eslint-disable-next-line no-unused-vars
    const { [formImageKey]: key, ...rest } = errorMessages;
    setErrorMessages(rest);

    if (imageFiles && imageFiles.length > 0) {
      const newFiles = Array.from(imageFiles);

      let validFiles = [...selectedFiles];

      // Check file formats for each file
      for (const file of newFiles) {
        if (!supportedTypes.includes(file.type)) {
          setErrorMessages((prev) => ({
            ...prev,
            [formImageKey]: t('obx.errors.unsupportedImageFormat'),
          }));
          continue;
        }

        if (file.size >= getFileSize(maxFileSizeAllowed) && multiple) {
          setErrorMessages((prev) => ({
            ...prev,
            [formImageKey]: t('errors.fileSizeExceeded', {
              maxFileSize: maxFileSizeAllowed,
            }),
          }));

          continue;
        }
        validFiles = [...validFiles, file];
      }

      setFile(() => (multiple ? validFiles : imageFiles[0]));
    }
  }
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  const deleteFile = (e) => {
    e.stopPropagation();
    setFile(multiple ? [] : null);
    updateFormHandler(formImageKey, '');
  };
  function inputChangedHandler(event) {
    const { name, files } = event.target;

    if (
      multiple &&
      selectedFiles?.length + formData[formImageKey]?.length + files?.length > maxAllowedFiles
    ) {
      setErrorMessages((prev) => ({
        ...prev,
        [name]: t('obx.errors.maxFilesAllowed', {
          max: maxAllowedFiles,
        }),
      }));
      return;
    }
    // eslint-disable-next-line no-unused-vars
    const { [name]: key, ...rest } = errorMessages;
    setErrorMessages(rest);

    if (files.length > 0) {
      const newFiles = Array.from(files);

      let validFiles = [...selectedFiles];

      // Check file formats for each file
      for (const file of newFiles) {
        if (!supportedTypes.includes(file.type)) {
          setErrorMessages((prev) => ({
            ...prev,
            [name]: t('obx.errors.unsupportedImageFormat'),
          }));
          continue;
        }

        if (file.size >= getFileSize(maxFileSizeAllowed) && multiple) {
          setErrorMessages((prev) => ({
            ...prev,
            [name]: t('errors.fileSizeExceeded', {
              maxFileSize: maxFileSizeAllowed,
            }),
          }));

          continue;
        }

        // Check if the file has already been uploaded
        const exists = validFiles.find((f) => f.name === file.name);

        if (exists) {
          setErrorMessages((prev) => ({
            ...prev,
            [name]: t('obx.errors.fileAlreadyUploaded', {
              fileName: `${file.name}`,
            }),
          }));
          continue;
        }

        // const exists = newFiles.find((f) => f.name === file.name);

        validFiles = [...validFiles, file];
      }

      event.target.value = null;
      setFile(validFiles);
    }
  }
  const handleMultipleDelete = (e, i, state) => {
    if (selectedFiles?.length + formData[formImageKey]?.length - 1 < maxAllowedFiles) {
      setErrorMessages((prev) => removeKey([formImageKey], prev));
    }
    if (state === 'localState') {
      setFile(selectedFiles?.filter((_item, index) => index !== i));
      return;
    }
    updateFormHandler(
      [formImageKey],
      formData[formImageKey]?.filter((_item, index) => index !== i),
    );
  };
  const selectedImage =
    selectedFiles && !multiple
      ? URL.createObjectURL(selectedFiles)
      : formData?.[formImageKey]
        ? formData?.[formImageKey]
        : defaultImage;
  const selectedMultipleImages =
    multiple && selectedFiles?.length
      ? Array.from(selectedFiles).map((item) => {
          return {
            name: item.name,
            size: item.size,
            type: item.type,
            url: item?.url || URL.createObjectURL(item),
          };
        })
      : [];

  const callBackTransform = (f) => {
    const data = { src: f?.url, type: f?.type };
    if (videoFileFormats.includes(f?.type)) {
      data.sources = [{ src: f?.url, type: f?.type }];
      data.type = 'video';
    }
    if (supportedImageFormats.includes(f?.type)) {
      data.type = 'image';
    }
    return data;
  };

  const transformFiles = () => {
    const filesArr = [];
    if (formData[formImageKey]?.length) {
      const formFiles = formData[formImageKey]
        ?.filter((a) => !pdfFileFormats.includes(a?.type))
        ?.map(callBackTransform);
      filesArr.push(...formFiles);
    }
    if (selectedMultipleImages?.length) {
      const imageArr = selectedMultipleImages
        ?.filter((a) => !pdfFileFormats.includes(a?.type))
        ?.map(callBackTransform);
      filesArr.push(...imageArr);
    }
    return filesArr;
    // return files.map((f) => ({ src: f[key] }));
  };

  const selectedFilesFromLocalRender = useMemo(() => {
    return selectedMultipleImages.map((file, index) => {
      return (
        <Box key={index} className={classes.multipleImageWrapper}>
          <Box className={classes.imageListItem}>
            <Box className={classes.fileDetailes}>
              <Box
                className={classes.ImageWrapper}
                onClick={() => {
                  setOpen(true);
                }}
              >
                {file?.url && supportedImageFormats.includes(file?.type) && (
                  <img src={file?.url} className={classes.fileTypeImage} />
                )}

                {file?.url && videoFileFormats.includes(file?.type) && (
                  <video src={file?.url} className={classes.fileTypeImage} />
                )}

                {file?.url && pdfFileFormats.includes(file?.type) && (
                  <PdfIcon className={classes.fileTypeImage} />
                )}
              </Box>
              <Box className={classes.fileNameWrapper}>
                <a
                  href={file?.url}
                  target="_blank"
                  className={classes.viewImage}
                  rel="noopener noreferrer"
                >
                  {file?.name?.length > 65 ? (
                    <Tooltip title={file?.name} arrow>
                      <Typography variant="body2" className={classes.fileName}>
                        {truncateString(file?.name, 65)}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" className={classes.fileName}>
                      {truncateString(file?.name, 65)}
                    </Typography>
                  )}
                </a>
                <Typography variant="body3" className={classes.fileSize}>
                  {convertFileSize(file?.size)}
                </Typography>
              </Box>
            </Box>
            <Typography
              onClick={(e) => !disableFileUploading && handleMultipleDelete(e, index, 'localState')}
              variant="body2"
              className={classes.fileSize}
            >
              <Box className={classes.trashIconBox}>
                <TrasIcon />
              </Box>
            </Typography>
          </Box>
        </Box>
      );
    });
  }, [selectedMultipleImages.length]);

  const alreadySelectedDataRender = useMemo(() => {
    return (
      formData[formImageKey]?.length > 0 &&
      formData[formImageKey]?.map((file, index) => {
        return (
          <Box key={index} className={classes.multipleImageWrapper}>
            <Box className={classes.imageListItem}>
              <Box className={classes.fileDetailes}>
                <Box
                  className={classes.ImageWrapper}
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  {file?.url && supportedImageFormats.includes(file?.type) && (
                    <img src={file?.url} className={classes.fileTypeImage} />
                  )}

                  {file?.url && videoFileFormats.includes(file?.type) && (
                    <video src={file?.url} className={classes.fileTypeImage} />
                  )}

                  {file?.url && pdfFileFormats.includes(file?.type) && (
                    <PdfIcon className={classes.fileTypeImage} />
                  )}
                </Box>
                <Box className={classes.fileNameWrapper}>
                  <a
                    href={file?.url}
                    target="_blank"
                    className={classes.viewImage}
                    rel="noopener noreferrer"
                  >
                    {file?.name?.length > 65 ? (
                      <Tooltip title={file?.name} arrow>
                        <Typography variant="body2" className={classes.fileName}>
                          {truncateString(file?.name, 65)}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" className={classes.fileName}>
                        {truncateString(file?.name, 65)}
                      </Typography>
                    )}
                  </a>
                  <Typography variant="body3" className={classes.fileSize}>
                    {convertFileSize(file?.size)}
                  </Typography>
                </Box>
              </Box>
              <Typography
                onClick={(e) => !disableFileUploading && handleMultipleDelete(e, index)}
                variant="body2"
                className={classes.fileSize}
              >
                <Box className={classes.trashIconBox}>
                  <TrasIcon />
                </Box>
              </Typography>
            </Box>
          </Box>
        );
      })
    );
  }, [formData[formImageKey]?.length]);

  const render = () => {
    return (
      <>
        <Box className={classes.formBoxImage}>
          {selectedImage && !multiple && (
            <img src={selectedImage} className={classes.avatarTextImage} />
          )}
          <Paper className={classes.paperWrapper} onDrop={handleDrop} onDragOver={handleDragOver}>
            {selectedFiles && showCross && !multiple ? (
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
                      accept={allowedExtensions}
                      onChange={inputChangedHandler}
                      className={classes.customFileInput}
                      disabled={disableFileUploading}
                    />
                    {t('obx.buttons.dnd')}
                  </Typography>
                </Box>
                <Typography variant="body3" className={classes.dragTextBelow}>
                  {supportedTypesText || t('obx.buttons.imageSizeEF')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {multiple && (formData[formImageKey]?.length > 0 || selectedMultipleImages.length > 0) && (
          <Box className={classes.multipleImages}>
            {alreadySelectedDataRender}
            {selectedFilesFromLocalRender}
          </Box>
        )}
        {open && (
          <ThumbnailSlider
            files={transformFiles()}
            usedFrom={'bar'}
            open={open}
            setOpen={setOpen}
          />
        )}
        {errorMessages?.[formImageKey] && <FieldError error={errorMessages?.[formImageKey]} />}
      </>
    );
  };

  return <>{render()}</>;
};
FileUpload.defaultProps = {
  previewAvatar: true,
  showCross: true,
  multiple: true,
  defaultImage: 'https://signalassets.blob.core.windows.net/signal/assets/Avatar.png',
  supportedTypes: supportedImageFormats,
  allowedExtensions: allowedImageExtensions,
  disableFileUploading: false,
  maxAllowedFiles: 15,
  maxFileSizeAllowed: 25,
};

FileUpload.propTypes = {
  multiple: PropTypes.bool,
  formData: PropTypes.object,
  formImageKey: PropTypes.string,
  updateFormHandler: PropTypes.func,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
  selectedFiles: PropTypes.string,
  setFile: PropTypes.func,
  previewAvatar: PropTypes.bool,
  showCross: PropTypes.bool,
  defaultImage: PropTypes.string,
  supportedTypes: PropTypes.array,
  supportedTypesText: PropTypes.string,
  allowedExtensions: PropTypes.array,
  disableFileUploading: PropTypes.bool,
  maxAllowedFiles: PropTypes.number,
  maxFileSizeAllowed: PropTypes.number,
};

export default FileUpload;
