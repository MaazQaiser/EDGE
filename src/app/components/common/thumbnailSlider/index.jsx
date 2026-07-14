import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

import { Box } from '@mui/material';
import { ReactComponent as CloseSliderIcon } from 'assets/svg/CloseSliderIcon.svg?react';
import { ReactComponent as LeftArrow } from 'assets/svg/LeftArrow.svg?react';
import { ReactComponent as RightArrow } from 'assets/svg/RightArrow.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useRef } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Video from 'yet-another-react-lightbox/plugins/video';

import { useStyles } from './thumbnailSlider';
const ThumbnailSlider = ({ files, open, setOpen, index = 0 }) => {
  const thumbnailsRef = useRef(null);
  const classes = useStyles();
  const isOpen = typeof open === 'boolean' ? open : open?.state;

  const handleClose = () => {
    if (typeof open === 'boolean') {
      setOpen(false);
    } else {
      setOpen({ state: false, index: 0 });
    }
  };

  const handleToggleThumbnails = () => {
    if (thumbnailsRef.current?.visible) {
      thumbnailsRef.current?.hide?.();
    } else {
      thumbnailsRef.current?.show?.();
    }
  };

  return (
    <Box className={classes.liteBox}>
      <Lightbox
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0, 0, 0, .5)' } }}
        open={isOpen}
        close={handleClose}
        index={index}
        slides={files}
        plugins={[Thumbnails, Video]}
        thumbnails={{
          ref: thumbnailsRef,
          width: 80,
          height: 130,
          imageFit: 'cover',
          borderRadius: 8,
          padding: 0,
          gap: 19,
          borderColor: 'transparent',
        }}
        carousel={{
          padding: '50px',
          borderRadius: 8,
        }}
        video={{
          controls: true,
          autoPlay: true,
          muted: true,
          disablePictureInPicture: true,
          disableRemotePlayback: true,
        }}
        on={{
          click: handleToggleThumbnails,
        }}
        render={{
          iconPrev: () => <LeftArrow />,
          iconNext: () => <RightArrow />,
          iconClose: () => <CloseSliderIcon />,
        }}
      />
    </Box>
  );
};

ThumbnailSlider.propTypes = {
  files: PropTypes.string,
  usedFrom: PropTypes.string,
  open: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({ state: PropTypes.bool, index: PropTypes.number }),
  ]).isRequired,
  setOpen: PropTypes.func.isRequired,
  index: PropTypes.number,
};

export default ThumbnailSlider;
