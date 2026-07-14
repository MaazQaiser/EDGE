import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { isObjectEmpty } from 'src/helper/utilityFunctions';

import NoChanges from '../noChanges';
import { useStyles } from '../stepsStyle';

const Description = ({ contractName, description }) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const NA = t('commonText.nA');

  // const changeMade = description?.changes?.length > 0;
  return (
    <Box className={classes.stepsContainer}>
      <Box className={classes.header}>
        <Typography variant="h3" className={classes.title}>
          {contractName}
        </Typography>

        <Typography variant="h3" className={classes.title}>
          {t('obx.requireAttention.description')}
        </Typography>
      </Box>
      {isObjectEmpty(description) && <NoChanges />}
      <Box className={classes.content}>
        {description?.new && (
          <Box className={classes.contentItem}>
            <Typography variant="h4" className={classes.itemTitle}>
              {t('obx.requireAttention.newDescription')}
            </Typography>
            <Box className={classes.valueBoxWrapper}>
              <Box className={classes.maxValue + ' ' + classes.valueBox}>
                <Typography
                  variant="body2"
                  dangerouslySetInnerHTML={{
                    __html: description?.new || NA,
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
        {description?.old && (
          <Box className={classes.contentItem}>
            <Typography variant="h4" className={classes.itemTitle}>
              {t('obx.requireAttention.oldDescription')}
            </Typography>
            <Box className={classes.valueBoxWrapper}>
              <Box className={classes.minValue + ' ' + classes.valueBox}>
                <Typography
                  variant="body2"
                  dangerouslySetInnerHTML={{
                    __html: description?.old || NA,
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

Description.propTypes = {
  contractName: PropTypes.string,
  description: PropTypes.object,
  loading: PropTypes.bool,
};

export default Description;
