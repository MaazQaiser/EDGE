import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import avatar from 'assets/images/Nodata.png';
import PropTypes from 'prop-types';
import * as React from 'react';

const useStyles = makeStyles((theme) => ({
  noRecordFound: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
    width: '100%',
    flex: '1',
  },

  noRecordFoundTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
}));

const NoData = (props) => {
  const { text } = props;
  const classes = useStyles();
  return (
    <Box className={classes.noRecordFound}>
      <img alt="Remy Sharp" src={avatar} />
      <Typography variant="h2" className={classes.noRecordFoundTitle}>
        {text}
      </Typography>
    </Box>
  );
};

NoData.propTypes = {
  text: PropTypes.string,
};

export default NoData;
