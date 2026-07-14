import { Box, Button, Checkbox, Chip, CircularProgress, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import JobWagePopover from 'src/app/obx/pages/payroll/components/jobWagePopover';
import { ACL_OBX_PAYROLL_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { ReactComponent as BlueTickIcon } from 'src/assets/svg/BlueTickIcon.svg?react';
import { ReactComponent as CalanderIcon } from 'src/assets/svg/CalanderIcon.svg?react';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg?react';
import { ReactComponent as CheckBoxCheckedDisabledIcon } from 'src/assets/svg/checkbox-checked-disabled.svg?react';
import { ReactComponent as CheckboxDisabledIcon } from 'src/assets/svg/checkbox-disabled.svg?react';
import { ReactComponent as ClockIcon } from 'src/assets/svg/clockWithLayer.svg?react';
import { ReactComponent as EmployIcon } from 'src/assets/svg/EmployIcon.svg?react';
import { ReactComponent as UnlockedIcon } from 'src/assets/svg/UnlockedIcon.svg?react';
import { formatTimeToHandM } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';
import { toaster } from 'src/utils/toast';

import { columnIdsEnum, PAYROLL_TYPES } from '../../payrollListing';
import TextFieldPopover from '../invoiceAbleHoursPopover';
import { useStyles } from './renderTableCell.styles';
const getBadgeTooltipKey = (row, checkBadgeCondition) => {
  const badge = row?.adpBadgeNumber || '';
  const isValid = checkBadgeCondition(row);

  if (!badge) return 'obx.payroll.noBadgeToolTip';
  if (!isValid) return 'obx.payroll.incompleteBadgeToolTip';
  return null;
};

const RenderTableCell = ({
  row,
  column,
  index,
  handleCheckboxChange,
  selectedItems,
  handleRowUpdate,
  checkBadgeCondition,
  isUpdating,
  handleViewSchedule,
  setShowDrawerHours,
  setSelectedRow,
  selectedTab,
  setShowSelectedHoursModal,
  update,
  selectedRow,
}) => {
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();
  const NA = t('commonText.nA');
  const classes = useStyles();
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const { getLabel } = useTenantLabel();

  const handleApprovePayroll = async (rowData) => {
    const row = rowData ?? selectedRow;

    if (!row) return;

    try {
      setIsApprovalLoading(true);
      const payload = {
        id: row.id,
        dataType: row.dataType,
        isApproved: true,
        invoiceableHours: row.invoiceableHours,
        payableHours: row.payableHours,
        isBreakPayable: row.isBreakPayable,
        jobWage: row.jobWage?.toString(),
        jobIntervals: row.jobIntervals,
        approvedDutyIntervals: row.jobIntervals,
        // approvedStartsAt: row?.approvedStartsAt,
        // approvedEndsAt: row?.approvedEndsAt,
      };
      if (selectedTab === PAYROLL_TYPES.PATROL) payload.isPatrol = true;

      await update([payload]);
      setIsApprovalLoading(false);
    } catch (error) {
      setIsApprovalLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setIsApprovalLoading(false);
      setShowSelectedHoursModal(false);
    }
  };

  if (column.id === columnIdsEnum.employeeName) {
    return (
      <>
        {
          <Box className={selectedTab === PAYROLL_TYPES.DEDICATED && classes.employeeNameClass}>
            {row?.officer?.name?.length > 13 ? (
              <Tooltip
                title={<Box sx={{ textTransform: 'capitalize' }}>{row?.officer?.name} </Box>}
                placement="right"
                arrow
              >
                {truncateString(row?.officer?.name, 13) || NA}
              </Tooltip>
            ) : (
              row?.officer?.name
            )}
            {/* {row?.site?.id && row?.notes?.length ? <EmployIcon /> : ''} */}
            {row?.site?.id && row?.notes?.length ? (
              <Tooltip
                title={
                  <Box>
                    {row?.notes?.map((note) => {
                      return (
                        <Box key={note.id} className={classes.repateNotes}>
                          <Typography className={classes.notesSubHeading} variant="subtitle2">
                            {note.text}
                          </Typography>
                          <Typography className={classes.notesArea} variant="subtitle3">
                            {note.updatedAt
                              ? `Updated: ${formatDayjsDateTime({ value: note.updatedAt, formatType: dayjsFormatsEnum.dateTime })}`
                              : `Created: ${formatDayjsDateTime({ value: note.createdAt, formatType: dayjsFormatsEnum.dateTime })}`}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                }
                placement="right"
                arrow
              >
                <Box component="span" sx={{ cursor: 'pointer' }}>
                  <EmployIcon
                    onClick={(e) => {
                      if (selectedTab !== PAYROLL_TYPES.DEDICATED) return;
                      e.stopPropagation();
                      handleViewSchedule(row, true);
                    }}
                  />
                </Box>
              </Tooltip>
            ) : (
              ''
            )}
          </Box>
        }
      </>
    );
  }
  if (column.id === columnIdsEnum.action) {
    const badgeTooltipKey = getBadgeTooltipKey(row, checkBadgeCondition);
    const badgeIcon = <BlueTickIcon />;

    return (
      <>
        {
          <Box className={classes.actionButtons}>
            {/*{selectedTab === PAYROLL_TYPES.PATROL && (*/}
            {/*  <Button*/}
            {/*    disableRipple*/}
            {/*    onClick={() => setShowDetailsDrawer(true)}*/}
            {/*    className={classes.notesCloseBtn}*/}
            {/*    variant="onlyText"*/}
            {/*    startIcon={<EyeViewIcon />}*/}
            {/*  ></Button>*/}
            {/*)}*/}

            <>
              <Button
                disableRipple
                className={classes.notesCloseBtn}
                variant="onlyText"
                onClick={() => {
                  if (row?.officer?.id) {
                    setShowDrawerHours(true);
                    setSelectedRow(row);
                  }
                }}
                startIcon={
                  <Box>
                    <ClockIcon />
                  </Box>
                }
              ></Button>
              <Tooltip
                title={
                  row?.shiftId
                    ? t('obx.payroll.viewShiftDetails')
                    : t('obx.payroll.supervisorTooltip', {
                        supervisor: getLabel('terms', 'supervisor', t),
                      })
                }
                arrow
              >
                <span>
                  {' '}
                  {/* Tooltip needs a wrapper that can accept events even if the button is disabled */}
                  <Button
                    disableRipple
                    className={classes.notesCloseBtn}
                    variant="onlyText"
                    onClick={() => handleViewSchedule(row)}
                    disabled={selectedTab === PAYROLL_TYPES.SUPERVISOR}
                    startIcon={<CalanderIcon />}
                  />
                </span>
              </Tooltip>
            </>
            <RenderIfHasPermission name={ACL_OBX_PAYROLL_UPDATE}>
              {row.isApproved ? (
                <Button
                  disableRipple
                  className={classes.notesCloseBtn}
                  variant="onlyText"
                  startIcon={<UnlockedIcon />}
                ></Button>
              ) : isApprovalLoading ? (
                <CircularProgress size={14} />
              ) : (
                <Button
                  disableRipple
                  className={classes.notesCloseBtn}
                  variant="onlyText"
                  startIcon={
                    <Box>
                      {badgeTooltipKey ? (
                        <Tooltip title={t(badgeTooltipKey)} arrow>
                          {badgeIcon}
                        </Tooltip>
                      ) : (
                        badgeIcon
                      )}
                    </Box>
                  }
                  disabled={(!row?.approvedStartsAt && !row?.approvedEndsAt) || isApprovalLoading}
                  onClick={
                    () => {
                      console.log('i am calling', row?.officer?.id, checkBadgeCondition(row));
                      row?.officer?.id && checkBadgeCondition(row) && handleApprovePayroll(row);
                    }
                    // row?.officer?.id && checkBadgeCondition(row) && handleShiftHourModal(row)
                  }
                ></Button>
              )}
            </RenderIfHasPermission>
          </Box>
        }
      </>
    );
  }
  if (column.id === columnIdsEnum.invoiceableHours) {
    return (
      <>
        <TextFieldPopover
          disabled={!userHasPermission(ACL_OBX_PAYROLL_UPDATE) ? true : !row?.officer?.id}
          value={row.invoiceableHours}
          onSave={(time) => handleRowUpdate(index, 'invoiceableHours', time)}
          isLoading={isUpdating}
        />
      </>
    );
  }

  if (column.id === columnIdsEnum.jobWage) {
    return (
      <>
        <JobWagePopover
          disabled={!row?.officer?.id}
          value={row.jobWage}
          onSave={(time) => handleRowUpdate(index, 'jobWage', time)}
          isLoading={isUpdating}
        />
      </>
    );
  }
  if (column.id === columnIdsEnum.approvedHours) {
    return (
      <>
        {
          <>
            {/* {selectedTab === PAYROLL_TYPES.SUPERVISOR && (
                <Box className={classes.inlineField}>
                  <TimePopover
                    isSinglePopover={true}
                    disabled={
                      !userHasPermission(ACL_OBX_PAYROLL_UPDATE)
                        ? true
                        : !row?.officer?.id ||
                          !row?.approvedStartsAt ||
                          (selectedTab === PAYROLL_TYPES.SUPERVISOR &&
                            userRole.slug === rolesEnumWithName.supervisor.slug)
                    }
                    value={
                      row?.approvedStartsAt ? dayjsWithStandardOffset(row?.approvedStartsAt) : ''
                    }
                    secondValue={
                      row?.approvedEndsAt ? dayjsWithStandardOffset(row?.approvedEndsAt) : ''
                    }
                    onSave={({ startTime, endTime, noApprovedHours }) => {
                      handleApprovedHoursUpdate(index, startTime, endTime, noApprovedHours);
                    }}
                    noApprovedHours={row?.noApprovedHours}
                    isLoading={isUpdating}
                  />
                  <Typography className={classes.hourValue}>
                    ({formatTimeToHandM(row?.payableHours) || 0})
                  </Typography>
                </Box>
              )} */}

            <Box className={classes.hoursNewField}>
              <Typography className={classes.hourValueBox}>
                {row?.noApprovedHours
                  ? `${NA} - ${NA}`
                  : `${row?.approvedStartsAt ? formatDayjsDateTime({ value: row?.approvedStartsAt }) : NA} - ${row?.approvedEndsAt ? formatDayjsDateTime({ value: row?.approvedEndsAt }) : NA}`}
              </Typography>{' '}
              {!row?.noApprovedHours && (
                <Typography>({formatTimeToHandM(row?.payableHours) || 0})</Typography>
              )}
            </Box>
          </>
        }
      </>
    );
  }

  if (column.id === columnIdsEnum.name) {
    return (
      <Box className={selectedTab === PAYROLL_TYPES.PATROL && classes.employeeNameClass}>
        {row?.[column.id]?.length > 13 ? (
          <>
            <Tooltip title={row?.[column.id]} arrow>
              {truncateString(capitalizeFirstLetter(row?.[column.id]), 13) || NA}
            </Tooltip>
          </>
        ) : (
          <>{capitalizeFirstLetter(row?.[column.id]) || NA}</>
        )}
        {selectedTab === PAYROLL_TYPES.PATROL && row?.notes?.length ? (
          <Tooltip
            title={
              <Box>
                {row?.notes?.map((note) => {
                  return (
                    <Box key={note.id} className={classes.repateNotes}>
                      <Typography className={classes.notesSubHeading} variant="subtitle2">
                        {note.text}
                      </Typography>
                      <Typography className={classes.notesArea} variant="subtitle3">
                        {note.updatedAt
                          ? `Updated: ${formatDayjsDateTime({ value: note.updatedAt, formatType: dayjsFormatsEnum.dateTime })}`
                          : `Created: ${formatDayjsDateTime({ value: note.createdAt, formatType: dayjsFormatsEnum.dateTime })}`}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            }
            placement="right"
            arrow
          >
            <Box component="span" sx={{ cursor: 'pointer' }}>
              <EmployIcon
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewSchedule(row, true);
                }}
              />
            </Box>
          </Tooltip>
        ) : (
          ''
        )}
      </Box>
    );
  }

  if (column.id === columnIdsEnum.site) {
    return <>{row?.[column.id]?.name || NA}</>;
  }
  if (column.id === columnIdsEnum.location) {
    return <>{row?.[column.id]?.name || NA}</>;
  }
  if (column.id === columnIdsEnum.employeeType) {
    return <>{row?.officer.type || NA}</>;
  }
  if (column.id === columnIdsEnum.shiftDate) {
    return (
      <>
        {formatDayjsDateTime({
          value: row?.startsAt,
          formatType: dayjsFormatsEnum.date,
        })}
      </>
    );
  }
  if (column.id === columnIdsEnum.shiftTime) {
    return (
      <>{`${formatDayjsDateTime({ value: row?.startsAt })} - ${formatDayjsDateTime({ value: row?.endsAt })}`}</>
    );
  }
  if (column.id === columnIdsEnum.punchinOut) {
    return (
      <>{`${row?.checkin ? formatDayjsDateTime({ value: row?.checkin }) : 0} - ${row?.checkout ? formatDayjsDateTime({ value: row?.checkout }) : 0}  (${formatTimeToHandM(row?.punchedHours) || 0})`}</>
    );
  }
  if (column.id === columnIdsEnum.checkbox) {
    return (
      <>
        <Checkbox
          checked={selectedItems.includes(row?.id)}
          onChange={(event) => row?.officer?.id && handleCheckboxChange(event, row)}
          icon={row?.isApproved ? <CheckboxDisabledIcon /> : <CheckBoxRegularIcon />}
          checkedIcon={row?.isApproved ? <CheckBoxCheckedDisabledIcon /> : <CheckBoxCheckedIcon />}
          disableRipple
          className={classes.checkBoxCustom}
          disabled={row?.isApproved || !checkBadgeCondition(row)}
        />
      </>
    );
  }
  if (column.id === columnIdsEnum.hourlyRate) {
    return <>{`$${row?.hourlyRate}`}</>;
  }
  if (column.id === columnIdsEnum.adpBadgeNumber) {
    return (
      <Box>
        {row?.adpBadgeNumber?.length > 9 ? (
          <>
            <Tooltip title={row?.adpBadgeNumber} placement="right" arrow>
              {truncateString(row?.adpBadgeNumber, 9) || NA}
            </Tooltip>
          </>
        ) : (
          <>{row?.adpBadgeNumber || NA}</>
        )}
      </Box>
    );
  }
  if (column.id === columnIdsEnum.isAdhocPayroll) {
    return (
      <>
        {row?.isAdhocPayroll ? (
          <Chip className={classes.adhocPayrollChip} label={t('obx.payroll.adhoc')} />
        ) : (
          <Chip color="primary" label={t('obx.payroll.logged')} />
        )}
      </>
    );
  }

  if (
    column.id === columnIdsEnum.breakTime ||
    column.id === columnIdsEnum.totalHours ||
    column.id === columnIdsEnum.breakTimeNonPayable
  ) {
    return <>{row?.[column.id] ? formatTimeToHandM(row?.[column.id]) : 0}</>;
  }

  if (column.id === columnIdsEnum.hitsDone) {
    return <>{`${row?.hits?.hitsDone || 0}`}</>;
  }

  if (row?.[column.id] === 0) {
    return <>{row?.[column.id]}</>;
  }

  return <>{row?.[column.id] || NA}</>;
};

RenderTableCell.propTypes = {
  row: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  handleCheckboxChange: PropTypes.func.isRequired,
  selectedItems: PropTypes.array.isRequired,
  handleRowUpdate: PropTypes.func.isRequired,
  checkBadgeCondition: PropTypes.func.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  handleViewSchedule: PropTypes.func.isRequired,
  setShowDrawerHours: PropTypes.func.isRequired,
  setSelectedRow: PropTypes.func.isRequired,
  selectedTab: PropTypes.string.isRequired,
  setShowSelectedHoursModal: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  selectedRow: PropTypes.object.isRequired,
};

export default RenderTableCell;
