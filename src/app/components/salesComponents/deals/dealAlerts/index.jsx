import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as CrossTileIcon } from 'assets/svg/commonDropdown/crossTile.svg?react';
import { ReactComponent as DealClosedIcon } from 'assets/svg/DealClosedIcon.svg?react';
import { ReactComponent as DealMarkIcon } from 'assets/svg/DealMarkIcon.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { stageValues } from '../dealStages/stage.constant';

const useStyles = makeStyles((theme) => ({
  closedWon: {
    padding: '15px 24px 20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${theme.palette.surfaceBrandSubtle}`,
  },
  closedLost: {
    padding: '15px 24px 20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${theme.palette.surfaceAlertSubtle}`,
  },
  dealInner: {
    display: 'flex',
    alignContent: 'flex-start',
    '& .MuiSvgIcon-root': {
      width: '50px',
      height: '50px',
    },
  },
  statusBoxText: {
    marginLeft: '10px',
    marginTop: '10px',
  },
  crossIconRed: {
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    '& path': {
      fill: `${theme.palette.surfaceAlertHover}`,
    },
  },
  crossIconEqua: {
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    '& path': {
      fill: `${theme.palette.surfaceBrand}`,
    },
  },
  colorGray: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
    },
  },
}));

const DealAlerts = ({ closedStage, show, setShow, dealName }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return show ? (
    <>
      {closedStage === stageValues.CLOSED_WON && (
        <Box className={classes.closedWon}>
          <Box className={classes.dealInner}>
            <DealClosedIcon className={classes.equaIcon} />
            <Box className={classes.statusBoxText}>
              <Typography variant="h4">{t('sales.deals.dealClosedWon')}</Typography>
              <Typography className={classes.colorGray} variant="body2">
                {`${dealName || 'Deal'} ${t('sales.deals.dealClosedWonText')}`}
              </Typography>
            </Box>
          </Box>
          <CrossTileIcon className={classes.crossIconEqua} onClick={() => setShow(false)} />
        </Box>
      )}
      {closedStage === stageValues.CLOSED_LOST && (
        <Box className={classes.closedLost}>
          <Box className={classes.dealInner}>
            <DealMarkIcon className={classes.equaIcon} />
            <Box className={classes.statusBoxText}>
              <Typography variant="h4">{t('sales.deals.dealClosedLost')}</Typography>
              <Typography className={classes.colorGray} variant="body2">
                {`${dealName || 'Deal'} ${t('sales.deals.dealClosedLostText')}`}
              </Typography>
            </Box>
          </Box>
          <CrossTileIcon className={classes.crossIconRed} onClick={() => setShow(false)} />
        </Box>
      )}
    </>
  ) : null;
};

DealAlerts.propTypes = {
  closedStage: PropTypes.string,
  show: PropTypes.bool,
  setShow: PropTypes.func,
  dealName: PropTypes.string,
};

export default DealAlerts;
