import { Box, Tooltip, Typography } from '@mui/material';
import { ReactComponent as AccessTimeIcon } from 'assets/icons/clocl.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';

import { dayjsWithStandardOffset } from '../../../schedules/helper';
import { useStyles } from '../../dashboardStyles';

const OfficerCard = ({ officer }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();
  const { getLabel } = useTenantLabel();
  const JOB_TYPE = {
    dedicated: getLabel('terms', 'dedicated', t),
    patrol: getLabel('terms', 'patrol', t),
  };

  return (
    <>
      <Box className={classes.profileContainer}>
        <Box className={classes.onDutyOfficer}>
          <Box className={classes.box}>
            {officer?.officer && (
              <>
                <img
                  src={officer?.officer?.imageUrl}
                  alt={`${officer?.officer?.name}'s profile`}
                  className={classes.officeImage}
                />
                <Typography variant="subtitle2" className={classes.pTitle}>
                  {officer?.officer?.name}
                </Typography>
              </>
            )}
          </Box>

          <Typography variant="subtitle3" className={classes.officerType}>
            <span className={classes.iconPadding}>
              {officer?.shiftType === 'patrol' ? '🚗' : '👮'}
            </span>
            {JOB_TYPE[officer?.shiftType] || officer?.shiftType}
          </Typography>
        </Box>
        <Box className={classes.onDutyOfficer}>
          <Box className={classes.box}>
            {officer?.shiftType === 'patrol' ? (
              <>
                {officer?.vehicle && (
                  <>
                    <img
                      src={officer?.vehicle?.images[0]?.url}
                      alt={`${officer?.vehicle?.name}'s image`}
                      className={classes.officeImage}
                    />
                    <Typography variant="subtitle2" className={classes.officerStatus}>
                      {officer?.vehicle?.name}
                    </Typography>
                  </>
                )}
              </>
            ) : (
              <>
                {officer?.site?.imageUrl && (
                  <img
                    src={officer?.site?.imageUrl}
                    alt={`${officer?.site?.name}'s profile`}
                    className={classes.officeImage}
                  />
                )}
                <Typography variant="subtitle2" className={classes.officerStatus}>
                  {officer?.site?.name?.length > 40 ? (
                    <Tooltip
                      arrow
                      title={<>{officer?.site?.name}</>}
                      slotProps={{
                        popper: {
                          modifiers: [
                            {
                              name: 'offset',
                              options: {
                                offset: [0, -14],
                              },
                            },
                          ],
                        },
                      }}
                    >
                      {officer?.site?.name.substring(0, 40) + '...'}
                    </Tooltip>
                  ) : (
                    officer?.site?.name
                  )}
                </Typography>
              </>
            )}
          </Box>

          <Typography variant="subtitle3" className={classes.officerType}></Typography>
        </Box>

        <Box container alignItems="center" className={classes.jobDetails}>
          <Box Box className={classes.timeIcon}>
            <AccessTimeIcon />
          </Box>
          <Typography variant="subtitle3" className={classes.dateTime}>
            {formatDate(dayjsWithStandardOffset(officer?.startsAt), ' DD MMM • ')}
            {formatDayjsDateTime({
              value: officer?.startsAt,
              formatType: dayjsFormatsEnum.time,
            })}{' '}
            -{' '}
            {formatDayjsDateTime({
              value: officer?.startsAt,
              formatType: dayjsFormatsEnum.time,
            })}
            {formatDate(dayjsWithStandardOffset(officer?.endsAt), ' • DD MMM')}
          </Typography>
        </Box>
      </Box>
    </>
  );
};
const OfficersOnDuty = ({ officers }) => {
  const classes = useStyles();
  return (
    <Box className={classes.OfficersOnDuty}>
      {officers?.map((officer, index) => (
        <OfficerCard key={index} officer={officer} />
      ))}
    </Box>
  );
};
OfficerCard.propTypes = {
  officer: PropTypes.object,
};
OfficersOnDuty.propTypes = {
  officers: PropTypes.array,
};
export default OfficersOnDuty;
