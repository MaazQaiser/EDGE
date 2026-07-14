import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as Icon } from 'assets/svg/nodataSearch.svg?react';
import PropTypes from 'prop-types';
const useStyles = makeStyles((theme) => ({
  noDataFound: {
    height: 'calc(100vh - 151px)',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '4px',
    },
  },
  desc: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  icon: {
    paddingBottom: '8px',
  },
}));

const NoDataFound = ({ title, searchedQuery, searchedTermText, showFilteredResult = false }) => {
  const classes = useStyles();
  return (
    <Box className={classes.noDataFound}>
      {(searchedQuery?.length > 0 || showFilteredResult) && (
        <Box className={classes.content}>
          <Box className={classes.icon}>
            <Icon />
          </Box>
          <Typography variant="subtitle1" className={classes.title}>
            {title}
          </Typography>
          <Typography variant="info" className={classes.desc}>
            {' '}
            {searchedTermText}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

NoDataFound.propTypes = {
  title: PropTypes.string.isRequired,
  searchedQuery: PropTypes.string.isRequired,
  searchedTermText: PropTypes.string,
  showFilteredResult: PropTypes.bool,
};

export default NoDataFound;
