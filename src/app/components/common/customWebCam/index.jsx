import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Webcam from 'react-webcam';

import { useStyles } from './customWebCam.styles';

const CustomWebCam = ({ toggleCamera, saveImageData }) => {
  const webcamRef = useRef(null); // create a webcam reference
  const classes = useStyles();
  const [imgSrc, setImgSrc] = useState(null); // initialize it
  const { t } = useTranslation();
  // create a capture function
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setImgSrc(() => imageSrc);
      saveImageData(imageSrc);

      toggleCamera(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  return (
    <>
      {imgSrc ? (
        <img src={imgSrc} alt="webcam" />
      ) : (
        <Webcam
          width={850}
          ref={webcamRef}
          mirrored={true}
          screenshotFormat="image/png"
          screenshotQuality={0.8}
          style={{
            borderRadius: '8px',
          }}
        />
      )}
      <Box className={classes.webCamBtn}>
        {imgSrc ? (
          <Button variant="primary" onClick={retake}>
            {t('visitor.liveRetakePhoto')}
          </Button>
        ) : (
          <Button variant="primary" onClick={capture}>
            {t('visitor.liveCapturePhoto')}
          </Button>
        )}
      </Box>
    </>
  );
};

CustomWebCam.propTypes = {
  toggleCamera: PropTypes.func,
  saveImageData: PropTypes.func,
};

export default CustomWebCam;
