import { Box, Skeleton, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { OBX_RELEASE } from 'src/app/router/constant/ROUTE';
import { ReactComponent as ArrowBackIcon } from 'src/assets/svg/ArrowLeftBack.svg?react';
import { RELEASE_TABS } from 'src/utils/constants';

import { useStyles } from './styles';

const ReleaseNotesDetailsSkeleton = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();

  const handleBack = () => {
    history.push(`${OBX_RELEASE}?tab=${RELEASE_TABS.RELEASE_NOTES}`);
  };

  return (
    <Box className={classes.detailsContainer}>
      <Box className={classes.layoutContainer}>
        {/* Sidebar – back link + skeleton list (same design as index sidebar loader) */}
        <Box className={classes.sidebar}>
          <Box className={classes.backLink} onClick={handleBack}>
            <ArrowBackIcon />
            <Typography variant="body2" className={classes.backText}>
              {t('links.back')}
            </Typography>
          </Box>
          <Box className={classes.sidebarScrollable}>
            <Box className={classes.skeletonSidebarTabs}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
                <Box key={index} className={classes.loadMoreSkeletonItem}>
                  <Skeleton
                    variant="text"
                    animation="wave"
                    className={classes.loadMoreSkeletonText}
                    height={35}
                    width="95%"
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        {/* Main content – skeleton for tab content only */}
        <Box className={classes.mainContent}>
          <Box className={classes.contentHeader}>
            <Skeleton
              variant="text"
              animation="wave"
              height={40}
              width={220}
              sx={{ marginBottom: '12px' }}
            />
            <Skeleton variant="text" animation="wave" height={30} width={300} />
          </Box>
          <hr className={classes.contentSeparator} />
          <Box className={classes.contentBody}>
            <Box className={classes.tabContent}>
              {/* Heading */}
              <Skeleton
                variant="text"
                animation="wave"
                height={26}
                width="45%"
                sx={{ marginBottom: '16px', borderRadius: '4px' }}
              />
              {/* Paragraph block */}
              {[100, 95, 88, 92].map((widthPct, index) => (
                <Skeleton
                  key={`p1-${index}`}
                  variant="text"
                  animation="wave"
                  className={classes.skeletonContentLine}
                  width={`${widthPct}%`}
                  height={20}
                  sx={index === 3 ? { marginBottom: '24px' } : undefined}
                />
              ))}
              {/* Subheading */}
              <Skeleton
                variant="text"
                animation="wave"
                height={22}
                width="30%"
                sx={{ marginBottom: '12px', borderRadius: '4px' }}
              />
              {/* Paragraph block */}
              {[100, 88, 95].map((widthPct, index) => (
                <Skeleton
                  key={`p2-${index}`}
                  variant="text"
                  animation="wave"
                  className={classes.skeletonContentLine}
                  width={`${widthPct}%`}
                  height={20}
                  sx={index === 2 ? { marginBottom: '24px' } : undefined}
                />
              ))}
              {/* Subheading */}
              <Skeleton
                variant="text"
                animation="wave"
                height={22}
                width="35%"
                sx={{ marginBottom: '12px', borderRadius: '4px' }}
              />
              {/* Paragraph block */}
              {[100, 90, 85, 96].map((widthPct, index) => (
                <Skeleton
                  key={`p3-${index}`}
                  variant="text"
                  animation="wave"
                  className={classes.skeletonContentLine}
                  width={`${widthPct}%`}
                  height={20}
                  sx={index === 3 ? { marginBottom: 0 } : undefined}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ReleaseNotesDetailsSkeleton;
