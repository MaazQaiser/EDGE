import { Avatar, Box, Typography } from '@mui/material';
import { ReactComponent as UploadIcon } from 'assets/svg/upload-plus.svg?react';
import classNames from 'classnames';
import CustomWebCam from 'commonComponents/customWebCam';
import ModalComponent from 'commonComponents/modal';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloseIcon } from 'src/assets/svg';
import { isObjectEmpty } from 'src/helper/utilityFunctions';

import { useStyles } from './dynamicWebCamImage.style';

const DynamicWebCamImage = (props) => {
  const [openCamera, setOpenCamera] = useState(false);

  const { t } = useTranslation();
  const classes = useStyles();

  const [selfImage, setSelfImage] = useState(props?.multi ? [] : {});

  const [alreadyUploadedImages, setAlreadyUploadedImages] = useState(props.answers || {});

  const saveImageData = async (data) => {
    setSelfImage((prevState) => {
      if (props?.multi) {
        return [...prevState, data];
      } else {
        setAlreadyUploadedImages({});
        return data;
      }
    });
  };

  const toggleCamera = () => {
    setOpenCamera((a) => !a);
  };

  useEffect(() => {
    if (selfImage) {
      const data = {
        target: {
          value: selfImage,
          name: props?.id,
        },
      };

      props?.removeError(props?.nameField);

      props?.handleChange(data);
    }
  }, [selfImage.length]);

  const VisitorCardModalBody = () => {
    return (
      <Box className={classes.modalWrapper}>
        <Box className={classes.headWrapper}>
          <Typography variant="h3"> {`${t('visitor.livePhotoTitle')}`}</Typography>
          <a href="#" onClick={() => setOpenCamera(false)}>
            <CloseIcon />
          </a>
        </Box>
        <Box className={classes.cardContent}>
          <CustomWebCam toggleCamera={toggleCamera} saveImageData={saveImageData} />
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box className={classes.uploadedImageFlex}>
        <Box
          className={classNames(
            props?.classes.previewTemplateUploaded,
            props?.fieldDisable && props?.classes.disabledEvent,
          )}
          onClick={toggleCamera}
        >
          <UploadIcon />
        </Box>

        {props?.multi &&
          alreadyUploadedImages?.map((a, i) => {
            return (
              <Avatar
                key={i}
                className={classes.profileImageUploaded}
                src={a}
                alt="webcam"
              ></Avatar>
            );
          })}

        {!props?.multi && !isObjectEmpty(alreadyUploadedImages) && (
          <Avatar
            className={classes.profileImageUploaded}
            src={alreadyUploadedImages}
            alt="webcam"
          />
        )}

        {props?.multi &&
          selfImage?.map((a, i) => {
            return (
              <Avatar
                key={i}
                className={classes.profileImageUploaded}
                src={a}
                alt="webcam"
              ></Avatar>
            );
          })}

        {!isObjectEmpty(selfImage) && !props?.multi && (
          <Avatar className={classes.profileImageUploaded} src={selfImage} alt="webcam" />
        )}

        <ModalComponent
          open={openCamera}
          handleClose={toggleCamera}
          body={VisitorCardModalBody()}
        />
      </Box>
      <Box>
        {!!props?.errorMessage && (
          <Box className={props?.classes.invalidData}>{t('errors.dynamic.webCam.required')}</Box>
        )}
      </Box>
    </Box>
  );
};

DynamicWebCamImage.propTypes = {
  handleChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  removeError: PropTypes.func,
  errorMessage: PropTypes.string,
  classes: PropTypes.object,
  fieldDisable: PropTypes.bool,
  nameField: PropTypes.string,
  id: PropTypes.number,
  answers: PropTypes.string,
  type: PropTypes.string,
  multi: PropTypes.bool,
};

export default DynamicWebCamImage;
