import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles((_theme) => ({
  tableImage: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    objectFit: 'cover',
    objectPosition: 'center',
  },
}));

const TableImage = ({ imageUrl, alt, className }) => {
  const classes = useStyles();
  return (
    <>
      <img src={imageUrl} alt={`${alt}`} className={classNames(classes.tableImage, className)} />
    </>
  );
};

TableImage.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default TableImage;
