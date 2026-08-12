import { Box, Skeleton, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from '../suppliesForecasting.styles';

const SKELETON_BOXES = [0, 1, 2, 3];

const QuantitiesSummary = ({ quantities = [], loading = false }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="body2" className={classes.needTitle}>
        {t('obx.schedules.forecasting.needTitle')}
      </Typography>

      {loading ? (
        <Box className={classes.quantitiesRow}>
          {SKELETON_BOXES.map((index) => (
            <Box key={index} className={classes.quantityBox}>
              <Skeleton className={classes.quantityNameSkeleton} />
              <Skeleton className={classes.quantityValueSkeleton} />
            </Box>
          ))}
        </Box>
      ) : quantities.length === 0 ? (
        <Typography className={classes.noFilters}>
          {t('obx.schedules.forecasting.noFilters')}
        </Typography>
      ) : (
        <Box className={classes.quantitiesRow}>
          {quantities.map((item, index) => (
            <Box key={`${item.name}-${index}`} className={classes.quantityBox}>
              <Typography variant="subtitle2" className={classes.quantityName} title={item.name}>
                {item.name}
              </Typography>
              <Typography variant="subtitle2" className={classes.quantityValue}>
                {item.quantity}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

QuantitiesSummary.propTypes = {
  quantities: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      quantity: PropTypes.number,
    }),
  ),
  loading: PropTypes.bool,
};

export default QuantitiesSummary;
