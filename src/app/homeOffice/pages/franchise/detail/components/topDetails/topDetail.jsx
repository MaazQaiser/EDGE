import { Box, Chip, Typography } from '@mui/material';
import franchisePlaceHolderImage from 'assets/svg/Franchise-Placeholder.svg';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import HeaderDetailsSkeleton from 'src/app/components/common/skeletonLoader/headerDetailsSkeleton';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import ChipComponent from '../chip';
import { useStyles } from './topDetailStyles';

export default function TopDetailComponent({ franchiseData, className, loading }) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <>
      {loading ? (
        <HeaderDetailsSkeleton />
      ) : (
        <Box className={`${classes.franchiseSubheader} ${className}`}>
          <Box className={classes.headerDetail}>
            <Box className={classes.avatarSection}>
              <img
                className={classes.avatarImage}
                src={franchiseData?.image || franchisePlaceHolderImage}
              />

              <Box>
                <Typography variant="body3" className={classes.upperText}>
                  #{franchiseData?.id}
                </Typography>
                <Typography variant="h1" className={classes.lowerText}>
                  {capitalizeFirstLetter(franchiseData?.franchiseName) || ''}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.rightContent}>
              <Box className={classes.rightDetail}>
                <Typography variant="subtitle2" className={classes.rightText}>
                  {t('obx.franchise.status')}
                </Typography>

                <ChipComponent status={franchiseData?.status || ''} />
              </Box>
              <Box className={classes.rightDetail}>
                <Typography variant="subtitle2" className={classes.rightText}>
                  {t('obx.franchise.awards')}
                </Typography>
                <Box className={classes.bottomChip}>
                  <Chip
                    color="success"
                    size="small"
                    label={`${franchiseData?.clubs || '2.5M'} Club`}
                  />
                  <Chip color="warning" size="small" label="Promise KPI" />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

TopDetailComponent.propTypes = {
  className: PropTypes.string,
  franchiseData: PropTypes.object,
  loading: PropTypes.bool,
};
