import { Box, Button, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as CrossTileIcon } from 'assets/svg/commonDropdown/crossTile.svg?react';
import { ReactComponent as LocationClosedIcon } from 'assets/svg/DealClosedIcon.svg?react';
import { ReactComponent as LocationMarkIcon } from 'assets/svg/DealMarkIcon.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { stageValues } from '../locationStages/stage.constant';

const useStyles = makeStyles((theme) => ({
  qualified: {
    padding: '15px 24px 20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${theme.palette.surfaceBrandSubtle}`,
  },
  unqualified: {
    padding: '15px 24px 20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${theme.palette.surfaceAlertSubtle}`,
  },
  locationInner: {
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
  inlineText: {
    display: 'flex',
  },
  btnColor: {
    '&.MuiButtonBase-root': {
      padding: '0',
      height: 'auto',
      marginLeft: '5px',
    },
  },
}));

const LocationAlerts = ({ closedStage, show, setShow, locationName, handleOpenConvert }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleConvertToDeal = () => {
    handleOpenConvert();
    setShow(false);
  };
  return show ? (
    <>
      {closedStage === stageValues.QUALIFIED && (
        <Box className={classes.qualified}>
          <Box className={classes.locationInner}>
            <LocationClosedIcon className={classes.equaIcon} />
            <Box className={classes.statusBoxText}>
              <Typography variant="h4">{t('sales.locations.locationQualified')}</Typography>
              <Box className={classes.inlineText}>
                <Typography className={classes.colorGray} variant="body2">
                  {`${locationName || t('sales.locations.location')} ${t(
                    'sales.locations.locationQualifiedText',
                  )}`}
                </Typography>
                <Button
                  className={classes.btnColor}
                  onClick={handleConvertToDeal}
                  variant="onlyText"
                  disableRipple
                >
                  {t('sales.locations.clickHere')}
                </Button>
              </Box>
            </Box>
          </Box>
          <CrossTileIcon className={classes.crossIconEqua} onClick={() => setShow(false)} />
        </Box>
      )}
      {closedStage === stageValues.UNQUALIFIED && (
        <Box className={classes.unqualified}>
          <Box className={classes.locationInner}>
            <LocationMarkIcon className={classes.equaIcon} />
            <Box className={classes.statusBoxText}>
              <Typography variant="h4">{t('sales.locations.locationUnqualified')}</Typography>
              <Typography className={classes.colorGray} variant="body2">
                {`${locationName || t('sales.locations.location')} ${t(
                  'sales.locations.locationUnqualifiedText',
                )}`}
              </Typography>
            </Box>
          </Box>
          <CrossTileIcon className={classes.crossIconRed} onClick={() => setShow(false)} />
        </Box>
      )}
    </>
  ) : null;
};

LocationAlerts.propTypes = {
  closedStage: PropTypes.bool,
  show: PropTypes.bool,
  setShow: PropTypes.func,
  locationName: PropTypes.string,
  handleOpenConvert: PropTypes.func,
};

export default LocationAlerts;
