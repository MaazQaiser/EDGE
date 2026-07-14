import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import noChangesImg from 'src/assets/images/no-changes-img.png';

import { useStyles } from './noChangesStyle';

const NoChanges = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Box className={classes.noChangesContainer}>
      <Box className={classes.noChangesImage}>
        <img src={noChangesImg} alt={t('obx.requireAttention.noChangesMade')} />
      </Box>
      <Box className={classes.noChangesContent}>
        <Typography variant="h3" className={classes.noChangesTitle}>
          {t('obx.requireAttention.noChangesMade')}
        </Typography>
        <Typography variant="body2" className={classes.noChangesSubtitle}>
          {t('obx.requireAttention.noChangesMadeDesc')}
        </Typography>
      </Box>
    </Box>
  );
};

export default NoChanges;
