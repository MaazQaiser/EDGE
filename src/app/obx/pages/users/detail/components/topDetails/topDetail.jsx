import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import HeaderDetailsSkeleton from 'src/app/components/common/skeletonLoader/headerDetailsSkeleton';
import { franchiseStatusEnum } from 'src/app/homeOffice/pages/franchise/utils/enums';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';

import { useStyles } from './topDetailsStyles';

export default function TopDetail({ data, className, loading }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const { formatDayjsDateTime } = useDateTime();
  const NA = t('commonText.nA');

  const _statusText =
    data?.status === franchiseStatusEnum.functional
      ? `${t('commonText.statuses.franchise.functional')}`
      : `${t('commonText.statuses.franchise.requiresAttention')}`;

  let element = (
    <>
      {loading ? (
        <HeaderDetailsSkeleton hasImage={true} numberOfStatusItem={2} />
      ) : (
        <Box className={classNames(classes.usersSubHeader, { className })}>
          <Box className={classes.headerDetail}>
            <Box className={classes.avatarSection}>
              <Box className={classes.avatarImage}>
                <img
                  src={
                    data?.image ||
                    'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg'
                  }
                />
              </Box>
              <Box>
                <Box className={classes.usersTitleContainer}>
                  <Typography variant="h1" className={classes.usersTitle}>
                    {data?.name}
                  </Typography>
                  {data?.lastWorkingDay ? (
                    <Box className={classes.lastWorkingDayContainer}>
                      <Typography variant="body3" className={classes.lastWorkingDayTitle}>
                        {t('obx.users.userInformation.lastWorkingDay')}
                      </Typography>
                      <Typography variant="body3" className={classes.lastWorkingDayText}>
                        {formatDayjsDateTime({
                          value: data?.lastWorkingDay,
                          formatType: dayjsFormatsEnum.date,
                        })}
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
                <Typography className={classes.usersText} variant="body3">
                  {t('obx.users.userInformation.level')} {data?.level} {data?.label}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.rightcontent}>
              <Box className={classes.rightdetail}>
                <Typography className={classes.statusTitle} variant="body3">
                  {t('obx.users.userInformation.role')}
                </Typography>
                <Typography variant="body2" className={classes.statusText}>
                  {data?.label || NA}
                </Typography>
              </Box>
              <Box className={classes.rightdetail}>
                <Typography className={classes.statusTitle} variant="body3">
                  {t('obx.users.userInformation.contact')}
                </Typography>
                <Typography variant="body2" className={classes.statusText}>
                  {data?.phoneNumber || NA}
                </Typography>
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
