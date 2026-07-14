import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { SortIcon } from 'assets/svg';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  toggleButtonInner: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    gap: theme.spacing(0.5),
  },
  moduleName: {
    '&.MuiTypography-root': {
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '18px',
    },
  },
  toggleIcon: {
    '&.MuiSvgIcon-root': {
      height: 16,
      width: 16,
    },
  },
}));

const ToggleModule = ({ handleToggle, moduleName }) => {
  const classes = useStyles();
  return (
    <Box className={classes.toggleButtonInner} onClick={handleToggle}>
      <Typography className={classes.moduleName}>{moduleName}</Typography>
      <SortIcon className={classes.toggleIcon} />
    </Box>
  );
};

ToggleModule.propTypes = {
  handleToggle: PropTypes.func,
  moduleName: PropTypes.string,
};

export default ToggleModule;
