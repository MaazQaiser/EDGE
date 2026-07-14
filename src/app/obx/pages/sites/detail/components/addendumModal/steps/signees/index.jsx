import { Box, Typography } from '@mui/material';
import { ReactComponent as RoundedBoxIcon } from 'assets/svg/rounded-box.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ArrowNextIcon } from 'src/assets/svg/arrowNext.svg?react';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import NoChanges from '../noChanges';
import { useStyles } from '../stepsStyle';

const Signees = ({ contractName, signees }) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const NA = t('commonText.nA');

  const changeMade = signees?.length > 0;

  const addedSignees = changeMade ? signees?.filter((signee) => signee.action === 'added') : [];

  const removedSignees = changeMade ? signees?.filter((signee) => signee.action === 'removed') : [];

  const updatedSignees = changeMade
    ? signees?.filter((service) => service.action === 'updated')
    : [];

  return (
    <Box className={classes.stepsContainer}>
      <Box className={classes.header}>
        <Typography variant="h3" className={classes.title}>
          {contractName}
        </Typography>

        <Typography variant="h3" className={classes.title}>
          {t('obx.requireAttention.signees')}
        </Typography>
      </Box>
      {!changeMade && <NoChanges />}
      <Box className={classes.content}>
        {addedSignees?.length > 0 && (
          <Box className={classes.contentItem}>
            <Typography variant="h4" className={classes.itemTitle}>
              {t('obx.requireAttention.addedSignees')}
            </Typography>

            <Box className={classes.valueBoxWrapper}>
              {addedSignees?.map((signee, index) => (
                <Box className={classes.maxValue + ' ' + classes.valueBox} key={index}>
                  <Typography variant="body2">{capitalize(signee?.name?.new) || NA}</Typography>
                  <RoundedBoxIcon />
                  <Typography variant="body2">
                    {capitalizeFirstLetter(signee?.title?.new) || NA}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {removedSignees?.length > 0 && (
          <Box className={classes.contentItem}>
            <Typography variant="h4" className={classes.itemTitle}>
              {t('obx.requireAttention.removedSignees')}
            </Typography>

            <Box className={classes.valueBoxWrapper}>
              {removedSignees?.map((signee, index) => (
                <Box className={classes.minValue + ' ' + classes.valueBox} key={index}>
                  <Typography variant="body2">{capitalize(signee?.name?.old) || NA}</Typography>
                  <RoundedBoxIcon />
                  <Typography variant="body2">
                    {capitalizeFirstLetter(signee?.title?.old) || NA}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        {updatedSignees?.length > 0 && (
          <Box className={classes.contentItem}>
            <Typography variant="h4" className={classes.itemTitle}>
              Changed Signee(s)
            </Typography>
            <Box className={`${classes.valueBoxWrapper} changedAssignee`}>
              {updatedSignees?.map((signee, index) => (
                <Box key={index}>
                  <Box
                    className={`${classes.minValue} ${classes.valueBox} ${classes.minValueLine}`}
                  >
                    <Typography variant="body2">{capitalize(signee?.name?.old) || NA}</Typography>
                    <RoundedBoxIcon />
                    <Typography variant="body2">
                      {capitalizeFirstLetter(signee?.title?.old) || NA}
                    </Typography>
                  </Box>
                  <ArrowNextIcon />
                  <Box className={classes.maxValue + ' ' + classes.valueBox}>
                    <Typography variant="body2">{capitalize(signee?.name?.new) || NA}</Typography>
                    <RoundedBoxIcon />
                    <Typography variant="body2">
                      {capitalizeFirstLetter(signee?.title?.new) || NA}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

Signees.propTypes = {
  contractName: PropTypes.string,
  signees: PropTypes.object,
  loading: PropTypes.bool,
};

export default Signees;
