import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// import { Link } from 'react-router-dom';
import { useStyles } from './dealContract.js';

const HubSpotContract = ({ contractUrl }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');

  return (
    <>
      <Box className={classNames(classes.proposalSave, classes.proposalEdit)}>
        <Box className={classes.hubSpotProposalBox}>
          <Typography variant="h4" className={classes.hubSpotProposalBoxTitle}>
            {' '}
            {t('sales.contract.hubSpotContract')}
          </Typography>
          <a
            href={contractUrl}
            className={classes.hubSpotProposalUrl}
            target="_blank"
            rel="noreferrer"
          >
            {contractUrl || NA}
          </a>
        </Box>
      </Box>
    </>
  );
};

HubSpotContract.propTypes = {
  contractUrl: PropTypes.string,
};

export default HubSpotContract;
