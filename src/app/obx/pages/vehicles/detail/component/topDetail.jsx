import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import HeaderDetailsSkeleton from 'src/app/components/common/skeletonLoader/headerDetailsSkeleton';

import { useStyles } from './commonTabsStyle';

export default function Clients({ vehicleData, className, loading }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');
  return (
    <>
      {loading ? (
        <HeaderDetailsSkeleton hasImage={false} numberOfStatusItem={0} />
      ) : (
        <Box className={`${classes.franchiseSubHeader} ${className}`}>
          <Box className={classes.headerDetail}>
            <Typography variant="h1" className={classes.headerTitle}>
              {vehicleData?.registrationNumber || NA}
            </Typography>
            <Typography variant="body3" className={classes.lowerText}>
              {vehicleData?.assignedTo || NA}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}

Clients.propTypes = {
  vehicleData: PropTypes.object,
  className: PropTypes.string,
  loading: PropTypes.bool,
};
