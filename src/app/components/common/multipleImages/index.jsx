import { Avatar, AvatarGroup } from '@mui/material';
import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
import ThumbnailSlider from 'commonComponents/thumbnailSlider';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
const useStyles = makeStyles((_theme) => ({
  avtarIcon: {
    '& .MuiAvatar-root.MuiAvatar-circular.MuiAvatar-colorDefault.MuiAvatarGroup-avatar': {
      width: '30px',
      height: '30px',
      fontSize: '13px',
    },
  },
}));
const MultipleImageListing = ({ images }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');

  const [open, setOpen] = useState(false);

  const transformImagesForSlider = () => {
    return images?.map((f) => ({ src: f?.url }));
  };

  return (
    <>
      {!images?.length ? (
        <>{NA}</>
      ) : (
        <Box
          onClick={() => {
            setOpen(true);
          }}
        >
          {/*{images?.slice(0, 2).map((image, index) => {*/}
          {/*  return (*/}
          {/*    <img*/}
          {/*      key={index}*/}
          {/*      src={image?.url}*/}
          {/*      alt={`${image.alt}'s Image`}*/}
          {/*      className={classNames(classes.tableImage, className)}*/}
          {/*    />*/}
          {/*  );*/}
          {/*})}*/}
          {/*{images && images.length > 2 && (*/}
          {/*  <span className={classNames(classes.tableImage, className)}>+{images.length - 2}</span>*/}
          {/*)}*/}
          <AvatarGroup className={classes.avtarIcon} max={2} total={images.length}>
            {images.map((image, index) => (
              <Avatar
                style={{ width: '30px', height: '30px' }}
                key={index}
                alt={`${image.alt}'s Image`}
                src={image?.url}
              />
            ))}
          </AvatarGroup>
        </Box>
      )}
      {open && <ThumbnailSlider files={transformImagesForSlider()} open={open} setOpen={setOpen} />}
    </>
  );
};

MultipleImageListing.propTypes = {
  images: PropTypes.array.isRequired,
  className: PropTypes.string,
};

export default MultipleImageListing;
