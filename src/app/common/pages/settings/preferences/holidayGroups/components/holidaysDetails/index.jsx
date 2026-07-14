import { Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { MoreVert } from 'assets/svg';
import { TrashIcon } from 'assets/svg';
import { ReactComponent as EditGroupIcon } from 'assets/svg/EditGroupIcon.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';
import { Clossicon } from 'src/assets/svg';

import { useStyles } from './holidaysDetails';

const HolidayDetails = ({ setShowDrawer, selectedHoliday, handleDelete, goToHolidayGroup }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const closeDrawer = () => {
    setShowDrawer(false);
  };

  return (
    <Box className={classes.activityDrawer}>
      <Box className={classes.drawerHeader}>
        <Box className={classes.drawerHeaderTop}>
          <Box className={classes.headText}>
            <Typography variant="h3">{selectedHoliday?.groupName}</Typography>
            <Typography variant="body1">
              {t('obx.settings.preferences.holidayGroups.federalHolidaysSubText')}
            </Typography>
          </Box>

          <Box className={classes.inlineFlex}>
            <PopoverButton
              className={classes.questionBankActions}
              variant="icon"
              Icon={MoreVert}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <Box className={classes.questionBankActionsMenu}>
                <Box
                  className={classes.questionBankActionsRegular}
                  onClick={() => selectedHoliday?.id && goToHolidayGroup(selectedHoliday)}
                >
                  <EditGroupIcon className={classes.questionBankActionsIconRegular} />
                  <Typography
                    className={classes.questionBankActionsTextRegular}
                    variant="subtitle2"
                  >
                    {t('obx.settings.preferences.holidayGroups.editGroup')}
                  </Typography>
                </Box>
                <Box
                  className={classes.questionBankActionsDelete}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(event, selectedHoliday);
                  }}
                >
                  <TrashIcon className={classes.questionBankActionsIconDelete} />
                  <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
                    {t('obx.settings.preferences.holidayGroups.deleteGroup')}
                  </Typography>
                </Box>
              </Box>
            </PopoverButton>
            <Button
              className={classes.cancelIcon}
              disableRipple
              variant="onlyText"
              onClick={() => {
                closeDrawer();
              }}
            >
              <Clossicon />
            </Button>
          </Box>
        </Box>

        <Box className={classes.holidayWrapIn}>
          <Typography variant="h4">
            Group Holidays {`(${selectedHoliday?.numberOfHolidays})`}
          </Typography>
          <Box className={classes.loopHoliday}>
            {selectedHoliday?.holidays?.map((holiday) => {
              return (
                <>
                  <Box className={classes.daysDetailsHol}>
                    <Typography variant="subtitle1">{holiday?.name}</Typography>
                    <Typography variant="body3">
                      {/* Using dayjs object directly because it is not timezone oriented date*/}
                      {dayjs(holiday?.start).format('MMM Do, YYYY')} -{' '}
                      {dayjs(holiday?.end)?.format('MMM Do, YYYY')}
                    </Typography>
                  </Box>
                </>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
HolidayDetails.propTypes = {
  setShowDrawer: PropTypes.func,
  patrolTemplateId: PropTypes.number,
  selectedHoliday: PropTypes.object,
  handleDelete: PropTypes.func,
  goToHolidayGroup: PropTypes.func,
};
export default HolidayDetails;
