import { Box, Tooltip, Typography } from '@mui/material';
import sitePlaceHolderImage from 'assets/svg/Site-Placeholder.svg';
import classNames from 'classnames';
import AvatarGroupImage from 'commonComponents/avatarGroupImage';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import HeaderDetailsSkeleton from 'src/app/components/common/skeletonLoader/headerDetailsSkeleton';
import ChipComponent from 'src/app/homeOffice/pages/franchise/detail/components/chip';
import { franchiseStatusEnum } from 'src/app/homeOffice/pages/franchise/utils/enums';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';

import { useStyles } from './topDetailsStyles';

export default function TopDetail({ data, className, loading }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');
  const { getLabel } = useTenantLabel();

  const _statusText =
    data?.status === franchiseStatusEnum.functional
      ? `${t('commonText.statuses.franchise.functional')}`
      : `${t('commonText.statuses.franchise.requiresAttention')}`;

  let element = (
    <>
      {loading ? (
        <HeaderDetailsSkeleton />
      ) : (
        <Box className={classNames(classes.sitesSubheader, { className })}>
          <Box className={classes.headerDetail}>
            <Box className={classes.avatarSection}>
              <Box className={classes.avatarImage}>
                <img src={data?.image?.[0]?.url || sitePlaceHolderImage} />
              </Box>
              <Box>
                <Typography variant="h1" className={classes.siteName}>
                  {/*{capitalizeFirstLetter(data?.name)}*/}
                  {data?.name?.length > 75 ? (
                    <>
                      <Tooltip title={data?.name} arrow>
                        {truncateString(capitalizeFirstLetter(data?.name), 75) || NA}
                      </Tooltip>
                    </>
                  ) : (
                    <>{capitalizeFirstLetter(data?.name) || NA}</>
                  )}
                </Typography>
                <Typography variant="body3" className={classes.address}>
                  {capitalizeFirstLetter(data?.zone)}
                  {data?.dutyType ? '-' : ''}
                  {data?.dutyType}
                  {data?.address ? '-' : ''}
                  {data?.address}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.rightContent}>
              <Box className={classes.rightDetail}>
                <Typography variant="body3" className={classes.textLabel}>
                  {getLabel('terms', 'supervisors', t)}
                </Typography>
                <Typography variant="body2" className={classes.textDetail}>
                  {data?.data?.supervisors?.length ? (
                    <AvatarGroupImage data={data?.data?.supervisors} />
                  ) : (
                    NA
                  )}
                </Typography>
              </Box>
              <Box className={classes.rightDetail}>
                <Typography variant="body3" className={classes.textLabel}>
                  {t('obx.sites.siteInformation.status')}
                </Typography>
                <ChipComponent status={data?.status} isSite={true} />
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
  return element;
}

TopDetail.propTypes = {
  className: PropTypes.string,
  data: PropTypes.object,
  loading: PropTypes.bool,
};
