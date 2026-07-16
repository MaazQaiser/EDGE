import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { getSingleSite } from 'src/services/sites.services';
import { breadCrumbItems, findBreadCrumb } from 'src/utils/breadcrumbsData';
import capitalize from 'src/utils/string/capitalize';
import { truncateString } from 'src/utils/string/truncate';

const useStyles = makeStyles((theme) => ({
  breadCrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
    flexWrap: 'wrap',
  },

  crumb: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },

  crumbClickable: {
    cursor: 'pointer',
    '&:hover $crumbText.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    '&:hover $breadCrumbIcon svg': {
      color: theme.palette.textPrimary,
    },
  },

  crumbCurrent: {
    '& $crumbText.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 600,
    },
  },

  breadCrumbIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.textPlaceholder,
    width: '20px',
    height: '20px',
    flexShrink: 0,

    '& .MuiSvgIcon-root': {
      fill: 'transparent',
    },

    '& svg': {
      fontSize: '20px',
      color: theme.palette.textPlaceholder,
    },
  },

  crumbText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      whiteSpace: 'nowrap',
    },
  },

  separator: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      userSelect: 'none',
    },
  },
}));

const SITE_DETAIL_SEGMENT = 'sitesDetail';
const SITE_NAME_MAX_LEN = 40;

/**
 * Map URL segments under a module (e.g. sites) to breadcrumb trail labels.
 * Parent hops let edit pages link back through detail.
 */
const getSitesTrailPages = (t) => ({
  [SITE_DETAIL_SEGMENT]: {
    // Fallback until the site property name is loaded.
    label: t('obx.sites.createSite.siteDetails', { defaultValue: 'Site Details' }),
    usesSiteName: true,
  },
  siteUpdate: {
    label: t('obx.sites.siteInformation.title', { defaultValue: 'Site Information' }),
    // siteUpdate/:id → sitesDetail/:id
    parentSegment: SITE_DETAIL_SEGMENT,
  },
  siteCreate: {
    label: t('obx.sites.createSite.createSite', { defaultValue: 'Create Site' }),
  },
  'create-site': {
    label: t('obx.sites.createSite.createSite', { defaultValue: 'Create Site' }),
  },
  createExtraDuty: {
    label: t('obx.sites.createExtraDuty', {
      extra: 'Extra',
      defaultValue: 'Create Extra Duty',
    }),
  },
});

/** Pull site id from /sites/sitesDetail/:id or /sites/siteUpdate/:id paths. */
function extractSiteIdFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const sitesIndex = segments.indexOf('sites');
  if (sitesIndex < 0) return null;

  const pageSegment = segments[sitesIndex + 1];
  const pageId = segments[sitesIndex + 2];
  if (
    pageId &&
    (pageSegment === SITE_DETAIL_SEGMENT || pageSegment === 'siteUpdate') &&
    /^\d+$/.test(pageId)
  ) {
    return pageId;
  }
  return null;
}

/**
 * Build clickable crumb trail from the current pathname.
 * Example: /app/obx/sites/siteUpdate/1
 *   → Sites → {site.name} → Site Information
 */
function buildCrumbTrail(pathname, t, getLabel, overrideLabel, overrideIcon, siteName) {
  const segments = pathname.split('/').filter(Boolean);
  const knownSectionKeys = new Set(
    breadCrumbItems(t, getLabel)
      .map((item) => item.key)
      .filter(Boolean),
  );

  let sectionIndex = -1;
  let sectionKey;
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    if (knownSectionKeys.has(segments[i])) {
      sectionKey = segments[i];
      sectionIndex = i;
      break;
    }
  }

  if (sectionIndex < 0) {
    return [];
  }

  const sectionMeta = findBreadCrumb(sectionKey, t, getLabel) || {};
  const sectionPath = `/${segments.slice(0, sectionIndex + 1).join('/')}`;
  const trail = [
    {
      key: 'section',
      label: overrideLabel || capitalize(sectionMeta.title),
      path: sectionPath,
      icon: overrideIcon || sectionMeta.icon,
      isCurrent: sectionPath === pathname,
    },
  ];

  // Only sites (and HO sites) get nested page crumbs for now.
  if (sectionKey !== 'sites') {
    return trail;
  }

  const pageDefs = getSitesTrailPages(t);
  const rest = segments.slice(sectionIndex + 1);
  // rest e.g. ['sitesDetail', '1'] or ['siteUpdate', '1'] or ['create-site']
  if (!rest.length) {
    return trail;
  }

  const pageSegment = rest[0];
  const pageId = rest[1]; // may be undefined for create-site
  const pageDef = pageDefs[pageSegment];

  const resolveSiteLabel = (fallback) => {
    if (siteName) return truncateString(siteName, SITE_NAME_MAX_LEN);
    return fallback;
  };

  if (!pageDef) {
    trail.push({
      key: pageSegment,
      label: capitalize(pageSegment.replace(/[-_]/g, ' ')),
      path: pathname,
      isCurrent: true,
    });
    return trail;
  }

  // If edit page declares a parent (siteUpdate → sitesDetail), insert that hop with site name.
  if (pageDef.parentSegment && pageId) {
    const parentDef = pageDefs[pageDef.parentSegment];
    trail.push({
      key: pageDef.parentSegment,
      label: resolveSiteLabel(parentDef?.label || capitalize(pageDef.parentSegment)),
      path: `${sectionPath}/${pageDef.parentSegment}/${pageId}`,
      isCurrent: false,
      title: siteName || undefined,
    });
  }

  const crumbLabel = pageDef.usesSiteName ? resolveSiteLabel(pageDef.label) : pageDef.label;

  trail.push({
    key: pageSegment,
    label: crumbLabel,
    path: pathname,
    isCurrent: true,
    title: pageDef.usesSiteName && siteName ? siteName : undefined,
  });

  // Mark last as current; section is never current when nested pages exist.
  trail[0].isCurrent = false;
  return trail;
}

const BreadCrumb = ({ label, icon }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();

  const siteId = useMemo(() => extractSiteIdFromPath(location.pathname), [location.pathname]);
  const [siteName, setSiteName] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadSiteName = async () => {
      if (!siteId) {
        setSiteName('');
        return;
      }
      try {
        const response = await getSingleSite(siteId);
        if (!cancelled) {
          setSiteName(response?.data?.site?.name || '');
        }
      } catch {
        if (!cancelled) setSiteName('');
      }
    };

    loadSiteName();
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  const crumbs = useMemo(
    () => buildCrumbTrail(location.pathname, t, getLabel, label, icon, siteName),
    [location.pathname, t, getLabel, label, icon, siteName],
  );

  if (!crumbs.length) {
    return null;
  }

  const navigate = (path, isCurrent) => {
    if (!isCurrent && path) history.push(path);
  };

  return (
    <Box className={classes.breadCrumb} aria-label="breadcrumb">
      {crumbs.map((crumb, index) => {
        const isClickable = !crumb.isCurrent && !!crumb.path;
        return (
          <React.Fragment key={crumb.key}>
            {index > 0 && (
              <Typography className={classes.separator} variant="body2" aria-hidden>
                /
              </Typography>
            )}
            <Box
              className={`${classes.crumb} ${isClickable ? classes.crumbClickable : ''} ${
                crumb.isCurrent ? classes.crumbCurrent : ''
              }`}
              onClick={() => navigate(crumb.path, crumb.isCurrent)}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-current={crumb.isCurrent ? 'page' : undefined}
              title={crumb.title}
              onKeyDown={(event) => {
                if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  navigate(crumb.path, crumb.isCurrent);
                }
              }}
            >
              {index === 0 && crumb.icon ? (
                <Box className={classes.breadCrumbIcon}>{crumb.icon}</Box>
              ) : null}
              <Typography className={classes.crumbText} variant="body2">
                {crumb.label}
              </Typography>
            </Box>
          </React.Fragment>
        );
      })}
    </Box>
  );
};

BreadCrumb.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.node,
};

export default BreadCrumb;
