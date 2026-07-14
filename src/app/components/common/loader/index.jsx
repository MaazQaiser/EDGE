import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
// import Loader from 'assets/images/gifLoader.gif';
import classNames from 'classnames';
import Lottie from 'lottie-react';
import PropTypes from 'prop-types';
import { mainDomain } from 'src/helper/utilityFunctions';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';

const useStyles = makeStyles((_theme) => ({
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    backgroundColor: 'rgba(0,0,0,0.2)', // Change this 0.2 value for backdrop brightness ==== this value maximum will be 1 and minimum 0
  },
  avatar: {
    '&.MuiAvatar-root': {
      height: 200,
      width: 200,
    },
  },
}));

/**
 * LoaderComponent is a reusable loading component. It shows circular loading.
 *
 * @param {Object} props - Component props
 * @param {String} props.className - className for styling for the container Box
 * @param {string} props.size - The size of the CircularProgress component (small, medium, or large)
 * @param {string} props.color - The color of the CircularProgress component (e.g., 'primary', 'secondary', 'inherit')
 * @param {string} props.label - Optional label to display below the loader
 * @return {Component} - Loading component
 */
const LoaderComponent = ({ className }) => {
  const loader = MULTI_TENANT_AUTH[mainDomain()]?.loader;

  const classes = useStyles();
  return (
    <Box className={classNames(className, classes.loaderContainer)}>
      {/* <Box
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={2}
        alignSelf={'center'}
      > */}
      {/* <Avatar className={classes.avatar} alt="" src={tenantInfo?.loader} /> */}
      {/* <CircularProgress size={size} color={color} /> */}
      {/* {label && <Box sx={{ color: '#000', fontSize: 18, fontWeight: 700 }}>{label}</Box>} */}
      {/* </Box> */}
      <Lottie animationData={loader} loop={true} />
    </Box>
  );
};

LoaderComponent.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
  label: PropTypes.string,
};

LoaderComponent.defaultProps = {
  className: '',
  size: 20,
  color: 'primary',
  label: '',
};

export default LoaderComponent;
