import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import capitalize from 'src/utils/string/capitalize';

import { useStyles } from './topDetailsStyles';

export default function TopDetail({ data, className }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');

  let element = (
    <>
      <Box className={classNames(classes.sitessubheader, { className })}>
        <Box className={classes.headrdetail}>
          <Box className={classes.avatarsection}>
            <Box className={classes.avatarimage}>
              <img
                src={
                  data?.image ||
                  'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg'
                }
              />
            </Box>
            <Box>
              <Typography className={classes.siteName}>{capitalize(data?.name) || NA}</Typography>
              <Typography className={classes.address}>Level {data?.level || NA}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
  return element;
}
TopDetail.propTypes = {
  className: PropTypes.string,
  data: PropTypes.object,
};
