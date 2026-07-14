import { Box, LinearProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types'; // Import PropTypes

const ProgressBarWithLabelComponent = ({ label, value }) => {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={value}
            sx={{ height: '8px !important', borderRadius: '8px !important' }}
          />
        </Box>
        {label && (
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${Math.round(
              value,
            )}%`}</Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

ProgressBarWithLabelComponent.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
  label: PropTypes.bool,
};

// Set default values for optional props
ProgressBarWithLabelComponent.defaultProps = {
  label: true,
  value: 10,
};

export default ProgressBarWithLabelComponent;
