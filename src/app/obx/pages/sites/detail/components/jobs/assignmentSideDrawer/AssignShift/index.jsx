import { Avatar, Box, Button, Chip, Radio, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  dayjsWithStandardOffset,
  isShiftAssignmentFrozen,
} from 'src/app/obx/pages/schedules/helper';
import { AlertIcon } from 'src/assets/svg';
import { ReactComponent as InfoIcon } from 'src/assets/svg/infoCurrentColor.svg?react';
import { ReactComponent as PlusIcon } from 'src/assets/svg/plus.svg?react';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';
import { DRAWER_TYPE, ShiftStatus } from 'src/utils/constants/schedules';

import { defaultCreateTourTemplateValues } from '..';
import { useStyles } from '../assignmentSideDrawer.styles';
import CustomShift from '../editShift/CustomShift';
import ThisAndFollowingShift from '../editShift/ThisandFolowingShift';
import ThisShift from '../editShift/ThisShift';
import Tours from './Tours';

const AssignShift = ({
  changeOnlyDrawerType,
  handleChangeValue,
  formDataTours,
  setFormDataTours,
  setDeletedTours,
  assignmentValue,
  setAssignmentValue,
  reports,
  checkpoints,
  shiftDetail,
  drawerData,
  errorMessagesTours,
  setErrorMessagesTours,
  allOfficers,
  locations,
  loading,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { formatDayjsDateTime, dateformat } = useDateTime();
  const assignmentFrozen = isShiftAssignmentFrozen(shiftDetail);

  const EDIT_SHIFT_TABS = {
    THIS_SHIFT: 'THIS_SHIFT',
    THIS_AND_FOLLOWING: 'THIS_AND_FOLLOWING',
    CUSTOM: 'CUSTOM',
  };

  const [editShiftTab, setEditShiftTab] = React.useState(
    drawerData?.fromJobSection ? EDIT_SHIFT_TABS.THIS_AND_FOLLOWING : EDIT_SHIFT_TABS.THIS_SHIFT,
  );

  const isOngoingShift = shiftDetail?.shiftStatus === ShiftStatus.SHIFT_STARTED;

  useEffect(() => {
    if (!isOngoingShift) {
      return;
    }
    if (
      editShiftTab === EDIT_SHIFT_TABS.THIS_AND_FOLLOWING ||
      editShiftTab === EDIT_SHIFT_TABS.CUSTOM
    ) {
      setEditShiftTab(EDIT_SHIFT_TABS.THIS_SHIFT);
    }
  }, [isOngoingShift, editShiftTab]);

  const handleChangeEditShiftTab = (_, newValue) => {
    setEditShiftTab(newValue);

    // Reset location and officer selection when switching tabs
    setAssignmentValue((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        value: null,
        selectedDates: [],
        error: {
          ...prev.location?.error,
          value: '',
          date: '',
        },
      },
      officer: {
        ...prev.officer,
        value: null,
        selectedDays: [],
        selectedDates: [],
        error: {
          ...prev.officer?.error,
          value: '',
          date: '',
          days: [],
        },
      },
    }));
  };

  const renderEditShiftTabLabel = (tabValue, title, subtitle, isDisabled = false) => (
    <Box className={classes.editShiftTimeTabContent}>
      <Radio
        size="small"
        disabled={isDisabled}
        checked={editShiftTab === tabValue}
        className={classes.editShiftTimeRadio}
      />
      <Box className={classes.editShiftTimeTabLabelWrapper}>
        <Typography
          className={classNames(
            !isDisabled
              ? classes.editShiftTimeTabLabelPrimary
              : classes.disabledEditShiftTimeTabLabelPrimary,
          )}
          variant="body2"
        >
          {title}
        </Typography>
        <Typography
          className={
            !isDisabled
              ? classes.editShiftTimeTabLabelSecondary
              : classes.disabledEditShiftTimeTabLabelSecondary
          }
          variant="caption"
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );

  const _handleClickEditReassignment = () => {
    changeOnlyDrawerType(DRAWER_TYPE.EDIT_REASSIGNMENT)();
  };

  // Is location changed wrt. original location AND the value exists
  const isLocationChanged =
    assignmentValue?.location?.value?.id !== shiftDetail?.location?.id &&
    !!assignmentValue?.location?.value?.label;

  // Is officer changed wrt. original officer AND the value exists
  const isOfficerChanged =
    assignmentValue?.officer?.value?.id !== shiftDetail?.officer?.id &&
    !!assignmentValue?.officer?.value?.label;

  // Is officer changed wrt. original officer AND the value exists
  const isReassignedOfficerChanged =
    !isObjectEmpty(shiftDetail?.reassignOfficer) &&
    assignmentValue?.reassignedOfficer?.value?.officerId !==
      shiftDetail?.reassignOfficer?.officerId &&
    !!assignmentValue?.reassignedOfficer?.value?.label;

  // Is reassigned start time changed wrt. original start time AND the value exists
  const isReassignedStartTimeChanged =
    !isObjectEmpty(shiftDetail?.reassignOfficer) &&
    assignmentValue?.reassignedOfficer?.selectedDates?.[0]?.toISOString() !==
      shiftDetail?.reassignOfficer?.startsAt;

  const isChanged =
    isLocationChanged ||
    isOfficerChanged ||
    isReassignedOfficerChanged ||
    isReassignedStartTimeChanged;

  const fmtTabDate = (d) => {
    const x = d ? dayjsWithStandardOffset(d) : null;
    return x?.isValid() ? x.format(dateformat) : '';
  };
  const rangeStart = fmtTabDate(assignmentValue?.actionStartDate ?? assignmentValue?.shiftDate);
  const rangeEnd = fmtTabDate(assignmentValue?.actionEndDate);
  const thisAndFollowingTabSubtitle =
    rangeStart && rangeEnd ? `${rangeStart} - ${rangeEnd}` : rangeStart || rangeEnd || '';
  const thisShiftDay = assignmentValue?.shiftDate
    ? dayjsWithStandardOffset(assignmentValue.shiftDate)
    : null;
  const thisShiftTabSubtitle = thisShiftDay?.isValid()
    ? `${thisShiftDay.format('ddd')}, ${thisShiftDay.format(dateformat)}`
    : '';

  return (
    <Box className={classes.assignShiftBodyMain}>
      {loading ? (
        <Box className={classes.shiftsSkeleton}>
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
          <Skeleton animation="wave" />
        </Box>
      ) : (
        <Box className={classes.editShiftTimeWrapper}>
          <Tabs
            value={editShiftTab}
            onChange={handleChangeEditShiftTab}
            className={classes.editShiftTimeTabs}
          >
            {(!drawerData?.fromJobSection || isOngoingShift) && (
              <Tab
                disableRipple
                className={classes.editShiftTimeTab}
                value={EDIT_SHIFT_TABS.THIS_SHIFT}
                label={renderEditShiftTabLabel(
                  EDIT_SHIFT_TABS.THIS_SHIFT,
                  t('obx.schedules.assignDedicatedDuty.assignShift.thisShift.title'),
                  thisShiftTabSubtitle,
                )}
              />
            )}
            <Tab
              disableRipple
              disabled={isOngoingShift || shiftDetail?.isTimeUpdated}
              className={classes.editShiftTimeTab}
              value={EDIT_SHIFT_TABS.THIS_AND_FOLLOWING}
              label={renderEditShiftTabLabel(
                EDIT_SHIFT_TABS.THIS_AND_FOLLOWING,
                t('obx.schedules.assignDedicatedDuty.assignShift.thisAndFollowingShift.title'),
                thisAndFollowingTabSubtitle,
                isOngoingShift || shiftDetail?.isTimeUpdated,
              )}
            />
            <Tab
              disableRipple
              disabled={isOngoingShift || shiftDetail?.isTimeUpdated}
              className={classes.editShiftTimeTab}
              value={EDIT_SHIFT_TABS.CUSTOM}
              label={renderEditShiftTabLabel(
                EDIT_SHIFT_TABS.CUSTOM,
                t('obx.schedules.assignDedicatedDuty.assignShift.customShift.title'),
                t('obx.schedules.assignDedicatedDuty.assignShift.customShift.subtitle'),
                isOngoingShift || shiftDetail?.isTimeUpdated,
              )}
            />
          </Tabs>
          {shiftDetail?.isTimeUpdated && (
            <Box
              className={classNames(classes.reassignShiftChip, classes.reassignShiftChipInScroll)}
            >
              <Chip
                icon={<AlertIcon />}
                label={t('obx.schedules.assignDedicatedDuty.assignShift.editedDedicetedShift')}
                color="primary"
              />
            </Box>
          )}
          <Box className={classes.editShiftTimeBody}>
            {editShiftTab === EDIT_SHIFT_TABS.THIS_SHIFT && (
              <ThisShift
                formData={assignmentValue}
                handleInputChange={handleChangeValue}
                errorMessages={{}}
                locations={locations}
                allOfficers={allOfficers}
                setAssignmentValue={setAssignmentValue}
                shiftDetail={shiftDetail}
              />
            )}
            {editShiftTab === EDIT_SHIFT_TABS.THIS_AND_FOLLOWING && (
              <ThisAndFollowingShift
                formData={assignmentValue}
                handleInputChange={handleChangeValue}
                errorMessages={{}}
                locations={locations || []}
                allOfficers={allOfficers}
                setAssignmentValue={setAssignmentValue}
                shiftDetail={shiftDetail}
              />
            )}
            {editShiftTab === EDIT_SHIFT_TABS.CUSTOM && (
              <CustomShift
                formData={assignmentValue}
                handleInputChange={handleChangeValue}
                errorMessages={{}}
                locations={locations || []}
                allOfficers={allOfficers}
                setAssignmentValue={setAssignmentValue}
                shiftDetail={shiftDetail}
              />
            )}
          </Box>
          <Box className={classes.assignShiftToursScrollOnly}>
            {formDataTours?.length === 0 && (
              <AddTourComp
                {...{
                  setFormDataTours,
                  isOptional: true,
                  readOnlyMode:
                    !drawerData?.fromJobSection &&
                    (shiftDetail?.assignmentReadOnlyMode || assignmentFrozen),
                }}
              />
            )}
            {formDataTours?.length !== 0 && (
              <Tours
                {...{
                  changeOnlyDrawerType,
                  formDataTours,
                  setFormDataTours,
                  setDeletedTours,
                  reports,
                  checkpoints,
                  siteId: drawerData?.siteId,
                  errorMessagesTours,
                  setErrorMessagesTours,
                  readOnlyMode:
                    !drawerData?.fromJobSection &&
                    (shiftDetail?.assignmentReadOnlyMode || assignmentFrozen),
                }}
              />
            )}
          </Box>
          {isChanged && (
            <Box className={classes.chnagesToApply}>
              <Typography className={classes.changesToApplyTitle} variant="h5">
                {t('obx.schedules.assignDedicatedDuty.assignShift.changesToApply.title')}
              </Typography>
              <Box className={classes.changesToApplyContent}>
                {isLocationChanged && (
                  <ChangesToApplyItem
                    label={t(
                      'obx.schedules.assignDedicatedDuty.assignShift.changesToApply.location',
                    )}
                    value={
                      assignmentValue?.location?.value?.label ||
                      assignmentValue?.location?.value?.name
                    }
                  />
                )}
                {isOfficerChanged && (
                  <ChangesToApplyItem
                    label={t(
                      'obx.schedules.assignDedicatedDuty.assignShift.changesToApply.officer',
                    )}
                    value={
                      assignmentValue?.officer?.value?.label ||
                      assignmentValue?.officer?.value?.name
                    }
                    avatar={shiftDetail?.reassignOfficer?.imageUrl}
                    isOfficer={true}
                  />
                )}
                {isReassignedOfficerChanged && (
                  <ChangesToApplyItem
                    label={t(
                      'obx.schedules.assignDedicatedDuty.assignShift.changesToApply.reassignedOfficer',
                    )}
                    value={
                      assignmentValue?.reassignedOfficer?.value?.label ||
                      assignmentValue?.reassignedOfficer?.value?.name
                    }
                    avatar={shiftDetail?.reassignOfficer?.imageUrl}
                    isOfficer={true}
                  />
                )}
                {isReassignedStartTimeChanged && (
                  <ChangesToApplyItem
                    label={t(
                      'obx.schedules.assignDedicatedDuty.assignShift.changesToApply.reassignedStartTime',
                    )}
                    value={formatDayjsDateTime({
                      value: assignmentValue?.reassignedOfficer?.selectedDates?.[0],
                      formatType: dayjsFormatsEnum.dateTime,
                    })}
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AssignShift;

AssignShift.propTypes = {
  changeOnlyDrawerType: PropTypes.func,
  handleChangeValue: PropTypes.func,
  formDataTours: PropTypes.object,
  setFormDataTours: PropTypes.func,
  setDeletedTours: PropTypes.func,
  handleInputChangeTours: PropTypes.func,
  assignmentValue: PropTypes.object,
  setAssignmentValue: PropTypes.func,
  reports: PropTypes.array,
  checkpoints: PropTypes.array,
  shiftDetail: PropTypes.object,
  drawerData: PropTypes.object,
  errorMessagesTours: PropTypes.array,
  setErrorMessagesTours: PropTypes.func,
  allOfficers: PropTypes.object,
  locations: PropTypes.array,
  loading: PropTypes.bool,
};

export const AddTourComp = ({
  setFormDataTours,
  isOptional,
  readOnlyMode = false,
  showToursInfo = true,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  return (
    <Box>
      <Box className={classes.assignShiftBodyAddTours}>
        <Button
          className={classes.assignShiftBodyAddToursBtn}
          disableRipple
          variant="onlyText"
          startIcon={<PlusIcon opacity={readOnlyMode ? 0.5 : 1} />}
          onClick={() => {
            setFormDataTours((prev) => {
              const key = (prev?.[prev?.length - 1]?.key || null) + 1;
              return [...prev, { key: key, ...defaultCreateTourTemplateValues }];
            });
          }}
          disabled={readOnlyMode}
        >
          {t('obx.schedules.assignDedicatedDuty.assignShift.addTours', {
            tours: getLabel('terms', 'tours', t),
          })}
        </Button>
        {isOptional && (
          <Typography variant="subtitle2" className={classes.assignShiftBodyAddToursText}>
            {t('obx.schedules.assignDedicatedDuty.assignShift.optional')}
          </Typography>
        )}
      </Box>
      {showToursInfo && (
        <Box className={classes.toursInfoBox}>
          <InfoIcon className={classes.toursInfoIcon} />
          <Typography variant="body2" className={classes.toursInfoText}>
            {t('obx.schedules.assignDedicatedDuty.assignShift.toursInfo', {
              defaultValue:
                'These tours will apply to all future shifts, regardless of selected shift type',
            })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

AddTourComp.propTypes = {
  setFormDataTours: PropTypes.func,
  isOptional: PropTypes.bool,
  readOnlyMode: PropTypes.bool,
  showToursInfo: PropTypes.bool,
};

const ChangesToApplyItem = ({ label, value, avatar, isOfficer = false }) => {
  const classes = useStyles();

  return (
    <Box className={classes.changesToApplyItem}>
      <Typography className={classes.changesToApplyLabel} variant="body2">
        {label}
      </Typography>
      <Typography className={classes.changesToApplyArrow} variant="body2">
        <ArrowIcon />
      </Typography>
      <Box
        className={isOfficer ? classes.changesToApplyOfficerValue : classes.changesToApplyValue}
        variant="body2"
      >
        {avatar && <Avatar className={classes.changesToApplyAvatar} src={avatar} />}
        <Typography className={classes.changesToApplyValue}>{value}</Typography>
      </Box>
    </Box>
  );
};

ChangesToApplyItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  avatar: PropTypes.string,
  isOfficer: PropTypes.bool,
};
