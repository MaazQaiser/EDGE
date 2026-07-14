import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater';

import { useStyles } from '../../dashboardStyles.js';
const TopSitesList = ({ image, name, revenue }) => {
  const classes = useStyles();

  const { t } = useTranslation();
  return (
    <>
      <Box className={classes.inventoaryListWrapper}>
        <Box className={classes.inventoryList}>
          <Box className={classes.leftListSide}>
            <Box className={classes.topImageWrapper}>
              <img src={image} alt="imageCar" className={classes.topImage} />
            </Box>
            <Typography variant="subtitle3" className={classes.inventoryName}>
              {name}
            </Typography>
          </Box>
          <Box className={classes.rightListSide}>
            <Box className={classes.ListItem}>
              <Typography variant="overline" className={classes.inventoryTotal}>
                {t('obx.dashboard.contractedRevenue')}
              </Typography>
              <Typography variant="overline" className={classes.inventoryName}>
                ${fomatNumbersWithCommas(revenue)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};
TopSitesList.propTypes = {
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  revenue: PropTypes.string.isRequired,
};
export default TopSitesList;
