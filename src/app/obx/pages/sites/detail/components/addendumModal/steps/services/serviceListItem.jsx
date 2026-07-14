import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ArrowNextIcon } from 'src/assets/svg/arrowNext.svg?react';

import { useStyles } from './servicesStyle';

const ServiceListItem = ({ label, oldValue, newValue, Icon, onClickIcon }) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const NA = t('commonText.nA');

  return (
    <Box className={classes.serviceListItem}>
      <Typography variant="body3" className={classes.serviceListItemLabel}>
        {label}
      </Typography>

      <Box className={classes.valueBox}>
        {oldValue && (
          <>
            <Typography variant="body2" className={`${classes.minValue} ${classes.minValueLine}`}>
              {oldValue || NA}
            </Typography>
          </>
        )}

        {oldValue && newValue && <ArrowNextIcon />}

        {newValue && (
          <Typography variant="body2" className={classes.maxValue}>
            {newValue || NA}
          </Typography>
        )}
        {Icon && (
          <span className={classes.icon} onClick={onClickIcon}>
            {Icon}
          </span>
        )}
      </Box>
    </Box>
  );
};

export default ServiceListItem;
ServiceListItem.propTypes = {
  label: PropTypes.string.isRequired,
  oldValue: PropTypes.string.isRequired,
  newValue: PropTypes.string.isRequired,
  Icon: PropTypes.element,
  onClickIcon: PropTypes.func,
};
