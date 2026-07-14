import { Box, Typography } from '@mui/material';
import { ReactComponent as RoundedBoxIcon } from 'assets/svg/rounded-box.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { DeviceSkelton } from 'src/app/obx/pages/sites/detail/components/addendumModal/steps/skelton';
import { ReactComponent as ArrowNextIcon } from 'src/assets/svg/arrowNext.svg?react';

import NoChanges from '../noChanges';
import { useStyles } from '../stepsStyle';

const Devices = ({ contractName, devices, loading }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const NA = t('commonText.nA');

  const devicesExists = !!devices?.length;

  const addedDevices = devicesExists ? devices?.filter((device) => device.action === 'added') : [];
  const removedDevices = devicesExists
    ? devices?.filter((device) => device.action === 'removed')
    : [];
  const updatedDevices = devicesExists
    ? devices?.filter((device) => device.action === 'updated')
    : [];

  return (
    <>
      {loading ? (
        <DeviceSkelton />
      ) : (
        <Box className={classes.stepsContainer}>
          <Box className={classes.header}>
            <Typography variant="h3" className={classes.title}>
              {contractName}
            </Typography>

            <Typography variant="h3" className={classes.title}>
              {t('obx.requireAttention.devices')}
            </Typography>
          </Box>
          {!devicesExists && <NoChanges />}
          <Box className={classes.content}>
            {addedDevices?.length > 0 && (
              <Box className={classes.contentItem}>
                <Typography variant="h4" className={classes.itemTitle}>
                  {t('obx.requireAttention.addedDevices')}
                </Typography>
                <Box className={classes.valueBoxWrapper}>
                  {addedDevices?.map((device, index) => (
                    <Box key={index} className={classes.maxValue + ' ' + classes.valueBox}>
                      <img
                        src={device?.imageUrl}
                        className={classes.deviceIcons}
                        height={16}
                        width={16}
                      />
                      <Typography variant="body2">{device?.changes?.new?.name || NA}</Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">{device?.changes?.new?.price || NA}</Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">
                        {t('obx.requireAttention.quantity')} x {device?.changes?.new?.quantity}
                      </Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">
                        {Number(device?.changes?.new?.price) *
                          Number(device?.changes?.new?.quantity)}{' '}
                        ({t('obx.requireAttention.occurrence')})
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            {removedDevices?.length > 0 && (
              <Box className={classes.contentItem}>
                <Typography variant="h4" className={classes.itemTitle}>
                  {t('obx.requireAttention.removedDevices')}
                </Typography>
                <Box className={classes.valueBoxWrapper}>
                  {removedDevices?.map((device, index) => (
                    <Box key={index} className={classes.maxValue + ' ' + classes.valueBox}>
                      <img
                        src={device?.imageUrl}
                        className={classes.deviceIcons}
                        height={16}
                        width={16}
                      />
                      <Typography variant="body2">{device?.changes?.old?.name || NA}</Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">{device?.changes?.old?.price || NA}</Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">
                        {t('obx.requireAttention.quantity')} x {device?.changes?.old?.quantity}
                      </Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">
                        {Number(device?.changes?.new?.price) *
                          Number(device?.changes?.new?.quantity)}{' '}
                        ({t('obx.requireAttention.occurrence')})
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            {updatedDevices?.length > 0 && (
              <Box className={classes.contentItem}>
                <Typography variant="h4" className={classes.itemTitle}>
                  {t('obx.requireAttention.changedDevices')}
                </Typography>
                {updatedDevices?.map((device, index) => (
                  <Box key={index} className={classes.valueBoxWrapper}>
                    <Box
                      className={`${classes.minValue} ${classes.valueBox} ${classes.minValueLine}`}
                    >
                      <img
                        src={device?.imageUrl}
                        className={classes.deviceIcons}
                        height={16}
                        width={16}
                      />
                      <Typography variant="body2">{device?.changes?.old?.name || NA}</Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">{device?.changes?.old?.price || NA}</Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">
                        {t('obx.requireAttention.quantity')} x {device?.changes?.old?.quantity}
                      </Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">
                        {Number(device?.changes?.old?.price) *
                          Number(device?.changes?.old?.quantity)}{' '}
                        ({t('obx.requireAttention.occurrence')})
                      </Typography>
                    </Box>
                    <ArrowNextIcon />
                    <Box className={classes.maxValue + ' ' + classes.valueBox}>
                      <img
                        src={device?.imageUrl}
                        className={classes.deviceIcons}
                        height={16}
                        width={16}
                      />
                      <Typography variant="body2">{device?.changes?.new?.name || NA}</Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">{device?.changes?.new?.price || NA}</Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">
                        {t('obx.requireAttention.quantity')} x {device?.changes?.new?.quantity}
                      </Typography>
                      <RoundedBoxIcon />
                      <Typography variant="body2">
                        {Number(device?.changes?.new?.price) *
                          Number(device?.changes?.new?.quantity)}{' '}
                        ({t('obx.requireAttention.occurrence')})
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

Devices.propTypes = {
  contractName: PropTypes.string,
  devices: PropTypes.array,
  loading: PropTypes.bool,
};

export default Devices;
