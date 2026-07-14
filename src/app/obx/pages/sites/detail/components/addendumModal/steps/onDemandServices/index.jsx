import { Box, Typography } from '@mui/material';
import { ReactComponent as RoundedBoxIcon } from 'assets/svg/rounded-box.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { OnDemandSkelton } from 'src/app/obx/pages/sites/detail/components/addendumModal/steps/skelton';
import { ReactComponent as ArrowNextIcon } from 'src/assets/svg/arrowNext.svg?react';

import NoChanges from '../noChanges';
import { useStyles } from '../stepsStyle';

const OnDemandServices = ({ contractName, onDemandServices, loading }) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const NA = t('commonText.nA');

  const changeMade = onDemandServices?.length > 0;

  return (
    <>
      {loading ? (
        <OnDemandSkelton />
      ) : (
        <Box className={classes.stepsContainer}>
          <Box className={classes.header}>
            <Typography variant="h3" className={classes.title}>
              {contractName}
            </Typography>

            <Typography variant="h3" className={classes.title}>
              {t('obx.requireAttention.onDemandServices')}
            </Typography>
          </Box>
          {!changeMade && <NoChanges />}
          <Box className={classes.content}>
            {/*{onDemandServices?.added?.length > 0 && (*/}
            {/*  <Box className={classes.contentItem}>*/}
            {/*    <Typography variant="h4" className={classes.itemTitle}>*/}
            {/*      {t('obx.requireAttention.addedServices')}*/}
            {/*    </Typography>*/}
            {/*    <Box className={classes.valueBoxWrapper}>*/}
            {/*      {onDemandServices?.added?.map((service, index) => (*/}
            {/*        <Box key={index} className={classes.maxValue + ' ' + classes.valueBox}>*/}
            {/*          <Typography variant="body2">{service?.name || NA}</Typography>*/}
            {/*          <RoundedBoxIcon />*/}
            {/*          <Typography variant="body2">${service?.price}</Typography>*/}
            {/*          <RoundedBoxIcon />*/}
            {/*          <Typography variant="body2">*/}
            {/*            {' '}*/}
            {/*            {t('obx.requireAttention.quantity')} x {service?.quantity}*/}
            {/*          </Typography>*/}
            {/*          <RoundedBoxIcon />*/}
            {/*          <Typography variant="body2">*/}
            {/*            {Number(service?.quantity) * Number(service?.price)} (*/}
            {/*            {t('obx.requireAttention.occurrence')})*/}
            {/*          </Typography>*/}
            {/*        </Box>*/}
            {/*      ))}*/}
            {/*    </Box>*/}
            {/*  </Box>*/}
            {/*)}*/}
            {/*{onDemandServices?.removed?.length > 0 && (*/}
            {/*  <Box className={classes.contentItem}>*/}
            {/*    <Typography variant="h4" className={classes.itemTitle}>*/}
            {/*      {t('obx.requireAttention.removedServices')}*/}
            {/*    </Typography>*/}
            {/*    <Box className={classes.valueBoxWrapper}>*/}
            {/*      {onDemandServices?.removed?.map((service, index) => (*/}
            {/*        <Box key={index} className={classes.minValue + ' ' + classes.valueBox}>*/}
            {/*          <Typography variant="body2">{service?.name || NA}</Typography>*/}
            {/*          <RoundedBoxIcon />*/}
            {/*          <Typography variant="body2">${service?.price}</Typography>*/}
            {/*          <RoundedBoxIcon />*/}
            {/*          <Typography variant="body2">*/}
            {/*            {t('obx.requireAttention.quantity')} x {service?.quantity}*/}
            {/*          </Typography>*/}
            {/*          <RoundedBoxIcon />*/}
            {/*          <Typography variant="body2">*/}
            {/*            {Number(service?.quantity) * Number(service?.price)} (*/}
            {/*            {t('obx.requireAttention.occurrence')}))*/}
            {/*          </Typography>*/}
            {/*        </Box>*/}
            {/*      ))}*/}
            {/*    </Box>*/}
            {/*  </Box>*/}
            {/*)}*/}

            {onDemandServices?.map((serviceChanges, sIndex) => (
              <Box className={classes.contentItem} key={sIndex}>
                <Typography variant="body2">{serviceChanges?.serviceName || NA}</Typography>

                {/*<Box className={classes.valueBoxWrapper}>*/}
                {serviceChanges?.changes?.map((service, index) => (
                  <Box className={classes.valueBoxWrapper} key={index}>
                    <Typography variant="body2">{service?.key || NA}</Typography>
                    <RoundedBoxIcon />

                    <Box key={index} className={classes.valueBox}>
                      {/*<Typography variant="body2">{service?.serviceName || NA}</Typography>*/}
                      {service?.old && (
                        <>
                          <Typography
                            variant="body2"
                            className={classes.minValue}
                            sx={{ textDecoration: 'line-through' }}
                          >
                            {service?.old}
                          </Typography>
                        </>
                      )}
                      {service?.new && service?.old && (
                        <>
                          <ArrowNextIcon />
                        </>
                      )}
                      {service?.new && (
                        <>
                          <Typography variant="body2" className={classes.maxValue}>
                            {service?.new}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                ))}
                {/*</Box>*/}
              </Box>
            ))}
            {/*<Box className={classes.contentItem}>*/}
            {/*  <Typography variant="h4" className={classes.itemTitle}>*/}
            {/*    Changed Service(s)*/}
            {/*  </Typography>*/}
            {/*  <Box className={classes.valueBoxWrapper}>*/}
            {/*    <Box className={`${classes.minValue} ${classes.valueBox} ${classes.minValueLine}`}>*/}
            {/*      <Typography variant="body2">NFC Tag</Typography>*/}
            {/*      <RoundedBoxIcon />*/}
            {/*      <Typography variant="body2">$7</Typography>*/}
            {/*      <RoundedBoxIcon />*/}
            {/*      <Typography variant="body2">Quantity x 10</Typography>*/}
            {/*      <RoundedBoxIcon />*/}
            {/*      <Typography variant="body2">$70 (one time)</Typography>*/}
            {/*    </Box>*/}
            {/*    <Box className={classes.maxValue + ' ' + classes.valueBox}>*/}
            {/*      <Typography variant="body2">NFC Tag</Typography>*/}
            {/*      <RoundedBoxIcon />*/}
            {/*      <Typography variant="body2">$7</Typography>*/}
            {/*      <RoundedBoxIcon />*/}
            {/*      <Typography variant="body2">Quantity x 10</Typography>*/}
            {/*      <RoundedBoxIcon />*/}
            {/*      <Typography variant="body2">$70 (one time)</Typography>*/}
            {/*    </Box>*/}
            {/*  </Box>*/}
            {/*</Box>*/}
          </Box>
        </Box>
      )}
    </>
  );
};

OnDemandServices.propTypes = {
  contractName: PropTypes.string,
  onDemandServices: PropTypes.object,
  loading: PropTypes.bool,
};
export default OnDemandServices;
