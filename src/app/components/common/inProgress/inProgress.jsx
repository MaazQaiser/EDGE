import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { WorkInProgressIcon } from 'src/assets/svg/index.jsx';
const useStyles = makeStyles((theme) => ({
  inProgress: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },

  inProgressTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginTop: '24px',
    },
  },

  inProgressText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      marginTop: '16px',
    },
  },
}));

const InProgress = ({ title, text }) => {
  const classes = useStyles();
  return (
    <Box className={classes.inProgress}>
      <WorkInProgressIcon />
      <Typography variant="h2" className={classes.inProgressTitle}>
        {title}
      </Typography>
      <Typography variant="body2" className={classes.inProgressText}>
        {text}
      </Typography>
    </Box>
  );
};

InProgress.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
};

export default InProgress;
