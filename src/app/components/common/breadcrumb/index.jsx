import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { findBreadCrumb } from 'src/utils/breadcrumbsData';
import capitalize from 'src/utils/string/capitalize';

const useStyles = makeStyles((theme) => ({
  breadCrumbIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.textPlaceholder,
    width: '20px',
    height: '20px',

    '& .MuiSvgIcon-root': {
      fill: 'transparent',
    },

    '& svg': {
      fontSize: '20px',
      color: theme.palette.textPlaceholder,
    },
  },

  breadCrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  breadCrumbText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },
}));

const BreadCrumb = ({ label, icon }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const classes = useStyles();

  const location = useLocation();

  const [breadcrumb, setBreadcrumb] = useState({});

  const splitPathNames = location.pathname.split('/');

  const getLocationName = () => {
    for (let i = 3; i >= 0; i--) {
      if (splitPathNames[i]) return splitPathNames[i];
    }
  };

  const findAndUpdateBreadCrumb = (breadcrumbKey) => {
    const result = findBreadCrumb(breadcrumbKey, t, getLabel);
    setBreadcrumb(result);
  };

  useEffect(() => {
    findAndUpdateBreadCrumb(getLocationName());
  }, [location]);
  return (
    <Box className={classes.breadCrumb}>
      <Box className={classes.breadCrumbIcon}>{icon || breadcrumb?.icon}</Box>
      <Typography className={classes.breadCrumbText} variant="body2">
        {label || capitalize(breadcrumb?.title)}
      </Typography>
    </Box>
  );
};

BreadCrumb.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.node,
};

export default BreadCrumb;
