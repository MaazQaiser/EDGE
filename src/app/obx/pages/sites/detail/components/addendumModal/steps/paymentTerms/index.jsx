import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { PaymentSkelton } from 'src/app/obx/pages/sites/detail/components/addendumModal/steps/skelton';

import NoChanges from '../noChanges';
import ServiceListItem from '../services/serviceListItem';
import { useStyles } from '../stepsStyle';

const PaymentTerms = ({ contractName, paymentTerms, loading }) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const NA = t('commonText.nA');

  const changeMade = paymentTerms?.changes?.length > 0;

  return (
    <>
      {loading ? (
        <PaymentSkelton />
      ) : (
        <Box className={classes.stepsContainer}>
          <Box className={classes.header}>
            <Typography variant="h3" className={classes.title}>
              {contractName}
            </Typography>

            <Typography variant="h3" className={classes.title}>
              {t('obx.requireAttention.paymentTerms')}
            </Typography>
          </Box>
          {!changeMade && <NoChanges />}
          <Box className={classes.content}>
            <Box className={classes.contentPaymentItem}>
              {paymentTerms?.changes?.map((change, index) => (
                <ServiceListItem
                  key={index}
                  label={change?.key}
                  oldValue={change?.old || NA}
                  newValue={change?.new || NA}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

PaymentTerms.propTypes = {
  contractName: PropTypes.string,
  paymentTerms: PropTypes.object,
  loading: PropTypes.bool,
};
export default PaymentTerms;
