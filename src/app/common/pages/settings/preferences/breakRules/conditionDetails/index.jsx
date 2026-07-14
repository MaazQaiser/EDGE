import { Box, Typography } from '@mui/material';
import { MoreVert } from 'assets/svg';
import { EditIcon } from 'assets/svg';
import { ReactComponent as Dustbin } from 'assets/svg/DeleteIconBin.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';
import { differenceInMinutes, minutesToHoursFormat } from 'src/app/obx/pages/schedules/helper';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './conditionDetailStyle';

const ConditionDetails = ({ onEdit, onDelete, condition = null }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const handleEdit = () => {
    if (condition) onEdit(condition);
  };

  const handleDelete = () => {
    if (condition) onDelete(condition.index);
  };

  return (
    <Box className={classes.conditionDetailsWrapper}>
      <Box className={classes.conditionItem}>
        <Typography variant="subtitle1" className={classes.headerTitle}>
          {t('obx.settings.preferences.breakRules.condition')}
        </Typography>
        <PopoverButton
          className={classes.templateActions}
          label="icon"
          variant="icon"
          Icon={MoreVert}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Box className={classes.templateActionsMenu}>
            <Box className={classes.templateActionsRegular} onClick={handleEdit}>
              <EditIcon className={classes.templateActionsIconRegular} />
              <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
                {t('obx.settings.preferences.breakRules.editCondition')}
              </Typography>
            </Box>
            <Box className={classes.visitorsActionsDelete} onClick={handleDelete}>
              <Dustbin />
              <Typography className={classes.visitorsActionsTextDelete} variant="subtitle2">
                {t('obx.settings.preferences.breakRules.deleteCondition')}
              </Typography>
            </Box>
          </Box>
        </PopoverButton>
      </Box>
      <Box className={classes.conditionContent}>
        <Box className={classes.conditionItem}>
          <Typography variant="subtitle2" className={classes.title}>
            {t('obx.settings.preferences.breakRules.duration')}
          </Typography>
          <Typography variant="subtitle2" className={classes.value}>
            {!isObjectEmpty(condition?.breakType) ? condition?.breakType?.name : 'N/A'}
          </Typography>
        </Box>
        <Box className={classes.conditionItem}>
          <Typography variant="subtitle2" className={classes.title}>
            {t('obx.settings.preferences.breakRules.duration')}
          </Typography>
          <Typography variant="subtitle2" className={classes.value}>
            {!isObjectEmpty(condition?.duration) ? condition?.duration?.label : 'N/A'}
          </Typography>
        </Box>
        <Box className={classes.conditionItem}>
          <Typography variant="subtitle2" className={classes.title}>
            {t('obx.settings.preferences.breakRules.breakTime')}
          </Typography>
          <Typography variant="subtitle2" className={classes.value}>
            {!isObjectEmpty(condition?.breakStartsOffset)
              ? `${minutesToHoursFormat(differenceInMinutes(condition?.breakStartsOffset))} after clocking in`
              : 'N/A'}
          </Typography>
        </Box>
        <Box className={classes.conditionItem}>
          <Typography variant="subtitle2" className={classes.title}>
            {t('obx.settings.preferences.breakRules.notifyOfficer', {
              officer: getLabel('terms', 'officer', t),
            })}
          </Typography>
          <Typography variant="subtitle2" className={classes.value}>
            {!isObjectEmpty(condition?.preBreakAlert)
              ? `${minutesToHoursFormat(differenceInMinutes(condition?.preBreakAlert))} before break`
              : 'N/A'}
          </Typography>
        </Box>
        <Box className={classes.conditionItem}>
          <Typography variant="subtitle2" className={classes.title}>
            {t('obx.settings.preferences.breakRules.payOfficer', {
              officer: getLabel('terms', 'officer', t),
            })}
          </Typography>
          <Typography variant="subtitle2" className={classes.value}>
            {condition?.payable
              ? t('obx.settings.preferences.breakRules.yes')
              : t('obx.settings.preferences.breakRules.no')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ConditionDetails;

ConditionDetails.propTypes = {
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  condition: PropTypes.object,
};
