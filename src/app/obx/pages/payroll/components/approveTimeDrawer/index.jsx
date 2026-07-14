import { Info } from '@mui/icons-material';
import { Button, Checkbox, Chip, Tooltip, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { updatePayrollBreakStatus, updateSupervisorJobIntervals } from 'services/payroll.services';
import CustomDropDown from 'src/app/components/common/customDropDown';
import TimePopoverForBreakIntervals from 'src/app/obx/pages/payroll/components/timePopoverForBreakIntervals';
import { Clossicon } from 'src/assets/svg';
import { ReactComponent as Regular } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as Iregular } from 'src/assets/svg/checkbox-checked.svg?react';
import { ReactComponent as DeleteIconBin } from 'src/assets/svg/DeleteIconBin.svg?react';
import { ReactComponent as DotIcon } from 'src/assets/svg/dotgray.svg?react';
import { ReactComponent as EmployIcon } from 'src/assets/svg/EmployIcon.svg?react';
import { ReactComponent as PlusIcon } from 'src/assets/svg/plus.svg?react';
import { ReactComponent as PlusIconDisabled } from 'src/assets/svg/plusDisabled.svg?react';
// import { ReactComponent as Iregular } from 'src/assets/svg/checkbox-checked.svg';
import useDateTime from 'src/hooks/useDateTime';
import { getBreakRuleById, getBreakRuleIdByPayrollRow } from 'src/services/breakRules.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { dayjsWithStandardOffset } from '../../../schedules/helper';
import { useStyles } from './approveTimeDrawer.style';

const actionsIntervalEnum = {
  jobExecuted: 'Job Executed',
  break: 'Break',
};

const ApproveTimeDrawer = ({
  setShowDrawer,
  selectedRow,
  setSelectedRow,
  data,
  setData,
  disabled = false,
  isSupervisorTab = false,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { formatDayjsDateTime } = useDateTime();
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(selectedRow?.noApprovedHours || false);
  const [breakIntervals, setBreakIntervals] = useState([]);
  const [moreActivityAllowded, setMoreActivityAllowded] = useState(false);
  const [_jobsDuration, setJobsDuration] = useState(null);

  useEffect(() => {
    if (checked !== selectedRow?.noApprovedHours) setLoading(false);
  }, [checked]);

  const closeDrawer = () => {
    setSelectedRow(null);
    setShowDrawer(false);
  };
  const [_time, _setTime] = useState(dayjsWithStandardOffset('10:00px'));

  const [jobIntervals, setJobIntervals] = useState(
    JSON.parse(JSON.stringify(selectedRow?.jobIntervals)),
  );
  const updateRowsOnTimeChange = (key, time, rowIndex) => {
    const data = [...jobIntervals];

    if (!data[rowIndex]) {
      throw new Error('Invalid row index.');
    }

    if (key === 'end') {
      // Update the end time of the selected row
      data[rowIndex].end = time;
      data[rowIndex].error = false;

      // Check if there's a next row and update its start time
      const nextRowIndex = rowIndex + 1;
      if (data[nextRowIndex]) {
        data[nextRowIndex].start = time;
        data[rowIndex].error = false;
      }
    } else if (key === 'start') {
      // Update the start time of the selected row
      data[rowIndex].start = time;
      data[rowIndex].error = false;

      // Check if there's a previous row and update its end time
      const prevRowIndex = rowIndex - 1;
      if (data[prevRowIndex]) {
        data[prevRowIndex].end = time;
        data[rowIndex].error = false;
      }
    } else {
      throw new Error("Invalid key. Use 'start' or 'end'.");
    }

    setJobIntervals(data);
  };

  const validateAndUpdateJobIntervals = () => {
    // Create a copy of the current state
    const updatedIntervals = jobIntervals.map((interval) => {
      const startTime = dayjsWithStandardOffset(interval.start)
        .set('second', 0)
        ?.set('millisecond', 0);
      const endTime = dayjsWithStandardOffset(interval.end).set('second', 0)?.set('millisecond', 0);

      // Add an `error` key if end time is less than start time
      return {
        ...interval,
        error: endTime.isBefore(startTime) || endTime.isSame(startTime),
      };
    });

    // Update the state with the new array
    setJobIntervals(updatedIntervals);

    // Check if any interval has an error
    const hasErrors = updatedIntervals.some((interval) => interval.error);

    return hasErrors;
  };

  const updateBreakIntervals = async () => {
    try {
      //bypass the date validations in case of No approved hours check checked
      const isDataInValid = !checked ? validateAndUpdateJobIntervals() : false;

      if (isDataInValid) {
        // setLoading(true);
        return '';
      }
      setLoading(true);
      const payload = {
        // Passing the previous result if noApprovedHours boolean is checked
        aprrovedDutyIntervals: checked
          ? selectedRow?.jobIntervals
          : jobIntervals.map((a) => {
              delete a.error;
              return {
                ...a,
                start: dayjsWithStandardOffset(a?.start)?.set('second', 0)?.set('millisecond', 0),
                end: dayjsWithStandardOffset(a?.end)?.set('second', 0)?.set('millisecond', 0),
              };
            }),
        // Passing noApprovedHours boolean for saving 0 hours
        noApprovedHours: checked,
      };
      const apiCall = isSupervisorTab ? updateSupervisorJobIntervals : updatePayrollBreakStatus;
      const response = await apiCall(selectedRow?.id, payload);
      if (response && response?.statusCode === 200) {
        const updatedData = data.map((item) => {
          if (item.id === selectedRow.id) {
            return {
              ...item,
              ...response.data,
            };
          }
          return item;
        });
        setData(updatedData);

        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        // Update with complete response data including all fields
        closeDrawer();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const getApprovedTime = useMemo(() => {
    let hours = 0;
    let minutes = 0;
    let totalMinutes = 0;
    jobIntervals.map((item) => {
      const startTime = dayjsWithStandardOffset(item?.start).set('second', 0);
      const endTime = dayjsWithStandardOffset(item?.end).set('second', 0);
      const diffInMilliseconds = endTime.diff(startTime);

      const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60)); // Use Math.round instead of Math.floor
      let innerHours = Math.floor(diffInMinutes / 60);
      if (diffInMinutes > 0) {
        totalMinutes = totalMinutes + diffInMinutes;
      }
      if (innerHours > 0) {
        hours = hours + innerHours;
      }
      let innerMinutes = diffInMinutes % 60;
      if (innerMinutes > 0) {
        minutes = minutes + innerMinutes;
      }
    });

    const hours1 = Math.floor(totalMinutes / 60);
    const minutes1 = totalMinutes % 60;

    const decimalHours = (totalMinutes / 60).toFixed(2);
    setJobsDuration(decimalHours);

    return `${hours1}h ${minutes1}m`.trim();
  }, [jobIntervals]);

  const _lastIndex = jobIntervals.length - 1;

  const fetchBreakRuleById = async (id) => {
    try {
      const response = await getBreakRuleById(id);
      if (response && response?.statusCode === 200) {
        setBreakIntervals(
          transformArrayForOptions(
            response?.data?.breakRule?.breakRuleConditions,
            'breakTypeName',
            'breakTypeName',
          ),
        );
        setMoreActivityAllowded(true);
      }
    } catch (error) {
      setMoreActivityAllowded(false);
      setBreakIntervals([
        {
          label: 'Break',
          value: 'break',
          payable: selectedRow?.isBreakPayable,
        },
      ]);
    }
  };

  const fetchBreakRuleIdOfPayroll = async () => {
    try {
      const response = await getBreakRuleIdByPayrollRow(selectedRow?.id);
      if (response && response?.statusCode === 200) {
        if (response?.data?.breakRuleId) {
          await fetchBreakRuleById(response?.data?.breakRuleId);
        } else {
          setMoreActivityAllowded(false);
          setBreakIntervals([
            {
              label: 'Break',
              value: 'break',
              payable: selectedRow?.isBreakPayable,
            },
          ]);
        }
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (!isSupervisorTab) {
      fetchBreakRuleIdOfPayroll();
    }
  }, []);

  const addNewInterval = () => {
    const newInterval = [
      ...jobIntervals,
      {
        action: {},
        isEdit: true,
        hasError: false,
        isDropDown: true,
        start: jobIntervals[jobIntervals.length - 1]?.end,
        end: jobIntervals[jobIntervals.length - 1]?.end,
      },
      {
        action: 'jobExecuted',
        isEdit: false,
        start: jobIntervals[jobIntervals.length - 1]?.end,
        end: jobIntervals[jobIntervals.length - 1]?.end,
      },
    ];

    setJobIntervals(newInterval);
  };

  const handleDropDownChange = (e, index) => {
    const updateJobInterval = [...jobIntervals];
    updateJobInterval[index].action = e.target.value?.value;
    updateJobInterval[index].isEdit = false;
    updateJobInterval[index].hasDelete = true;
    updateJobInterval[index].hasError = false;
    updateJobInterval[index].isBreakPayable =
      e?.target?.value?.payable != undefined ? e?.target?.value?.payable : undefined;
    setJobIntervals(updateJobInterval);
    setLoading(false);
  };

  const removeBreakRule = (index) => {
    const newInterval = [...jobIntervals];
    const lastIntervalTime = jobIntervals[index]?.end;
    newInterval.splice(index, 1);
    newInterval.splice(index, 1);
    if (newInterval[index]) {
      newInterval[index].end = lastIntervalTime;
    }
    setJobIntervals(newInterval);
  };

  return (
    <Box className={classes.activityDrawer}>
      <Box className={classes.drawerHeader}>
        <Box className={classes.drawerTitle}>
          <Typography className={classes.Title} variant="h4">
            {selectedRow?.officer?.name}
          </Typography>
          <Box className={classes.detalsTitle}>
            <Typography variant="subtitle3">
              {selectedRow?.site?.name || selectedRow?.name}
            </Typography>
            <DotIcon />
            <Typography variant="subtitle3">
              {formatDayjsDateTime({
                value: selectedRow?.startsAt,
                formatType: dayjsFormatsEnum.date,
              })}
            </Typography>
            <DotIcon />
            <Typography variant="subtitle3">{`${formatDayjsDateTime({ value: selectedRow?.startsAt })} - ${formatDayjsDateTime({ value: selectedRow?.endsAt })}`}</Typography>
            {selectedRow?.site?.id && selectedRow?.notes?.length ? (
              <Tooltip
                title={
                  <Box>
                    {selectedRow?.notes?.map((note) => {
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
                <span style={{ display: 'inline-flex', cursor: 'pointer' }}>
                  <EmployIcon />
                </span>
              </Tooltip>
            ) : (
              ''
            )}
          </Box>
        </Box>
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
      <Box className={classes.container}>
        <Alert icon={<Info />} severity="info" className={classes.grayAlert}>
          {t('obx.payroll.dedicatedShiftAlert')}
        </Alert>
        <Box className={classes.mainContent}>
          <Box className={classes.gridContainer}>
            <Box className={classes.headerRow}>
              <Typography variant="subtitle3" className={classes.headerText}>
                {t('obx.payroll.activity')}
              </Typography>
              <Typography variant="subtitle3" className={classes.headerText}>
                {t('obx.payroll.loggedTime')}
              </Typography>
              <Typography variant="subtitle3" className={classes.headerText}>
                {t('obx.payroll.approvedTime')}
              </Typography>
            </Box>

            {/* Activity rows */}
            <Box className={classes.activityRowWrapper}>
              {jobIntervals.map((item, index) => {
                const startTime = dayjsWithStandardOffset(item?.start).set('second', 0);
                const endTime = dayjsWithStandardOffset(item?.end).set('second', 0);
                const diffInMilliseconds = endTime.diff(startTime);
                const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60));
                const hours = Math.floor(diffInMinutes / 60);
                const minutes = diffInMinutes % 60;
                let minValStart = null;
                let maxValEnd = dayjsWithStandardOffset(selectedRow?.startsAt).add(2, 'days');
                // Initialize the duration string
                let duration = '';

                // Add hours and minutes to the duration string
                if (hours > 0) {
                  duration += `${hours}h`;
                }

                if (minutes > 0) {
                  duration += `${minutes}m`;
                }

                if (index == 0) {
                  minValStart = selectedRow?.startsAt;
                } else if (index != 0) {
                  minValStart = item?.start;
                }

                duration = `${hours > 0 ? hours : 0}h ${minutes > 0 ? minutes : 0}m`.trim();

                return (
                  <Box key={index} className={classes.activityRow}>
                    {item?.isEdit ? (
                      <CustomDropDown
                        label={t('obx.payroll.selectActivityLabel')}
                        name="action"
                        options={breakIntervals}
                        selectedValues={item?.action}
                        handleChange={(e) => {
                          handleDropDownChange(e, index);
                        }}
                        isError={item?.hasError}
                        bordered={true}
                      />
                    ) : (
                      <Typography variant="subtitle2" className={classes.activityText}>
                        {actionsIntervalEnum[item?.action] ? (
                          actionsIntervalEnum[item?.action]
                        ) : item.action.length > 20 ? (
                          <Tooltip title={item.action} placement="right" arrow>
                            {item?.action?.substring(0, 20) + '...'}
                          </Tooltip>
                        ) : (
                          item?.action
                        )}
                        {item['isBreakPayable'] !== undefined ? (
                          <>
                            <br />
                            <Chip
                              label={
                                item?.isBreakPayable
                                  ? t('obx.payroll.payable')
                                  : t('obx.payroll.notPayable')
                              }
                              size="small"
                              color={item?.isBreakPayable ? 'success' : 'primary'}
                            />
                          </>
                        ) : null}
                      </Typography>
                    )}

                    <Box className={classes.timeCellMiddle}>
                      <Typography variant="body2" className={classes.timeText}>
                        {formatDayjsDateTime({
                          value: item?.start,
                        })}
                        {' - '}
                        {formatDayjsDateTime({
                          value: item?.end,
                        })}
                      </Typography>
                      <Typography variant="body2" className={classes.timeText}>
                        {duration ? `(${duration})` : null}
                      </Typography>
                    </Box>
                    <Box className={classes.timeCell}>
                      <TimePopoverForBreakIntervals
                        value={
                          item?.start ? dayjsWithStandardOffset(item?.start).set('seconds', 0) : ''
                        }
                        onSave={(time) => {
                          updateRowsOnTimeChange('start', time, index);
                          setLoading(false);
                        }}
                        minValue={minValStart}
                        maxValue={item?.end}
                        disabled={disabled || checked}
                      />
                      <Typography className={classes.spaceer}>-</Typography>
                      {/*<Tooltip title={t('obx.payroll.approvedEndsAtTooltip')} arrow>*/}
                      <Box>
                        <TimePopoverForBreakIntervals
                          value={
                            item?.end ? dayjsWithStandardOffset(item?.end).set('seconds', 0) : ''
                          }
                          onSave={(time) => {
                            updateRowsOnTimeChange('end', time, index);
                            setLoading(false);
                          }}
                          error={item?.error}
                          helperText={item?.error ? t('obx.payroll.endTimeError') : null}
                          disabled={disabled || checked}
                          maxValue={maxValEnd}
                          minValue={minValStart}
                        />
                      </Box>
                      {/*</Tooltip>*/}
                      <Typography variant="body2" className={classes.duration}>
                        {duration ? `(${duration})` : null}
                      </Typography>
                      {item?.hasDelete && !disabled ? (
                        <Typography
                          onClick={() => {
                            removeBreakRule(index);
                          }}
                          className={classes.duration}
                        >
                          <DeleteIconBin />
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box className={classes.addButtonActive}>
            {moreActivityAllowded && !checked && !disabled ? (
              <Button
                startIcon={<PlusIcon />}
                variant="onlyText"
                className={classes.blueBtn}
                onClick={addNewInterval}
              >
                {t('obx.payroll.addActivity')}
              </Button>
            ) : !disabled ? (
              <Tooltip title={<Box>{t('obx.payroll.needBreakRule')}</Box>} placement="right" arrow>
                <Button
                  startIcon={<PlusIconDisabled />}
                  variant="onlyText"
                  className={classes.disabledBlueBtn}
                  disableRipple
                >
                  {t('obx.payroll.addActivity')}
                </Button>
              </Tooltip>
            ) : (
              <></>
            )}
          </Box>
          {!disabled && (
            <Box className={classes.checkboxPanel}>
              <Box className={classes.checkbox}>
                <Checkbox
                  icon={<Regular />}
                  checkedIcon={<Iregular />}
                  checked={checked}
                  onChange={() => setChecked((prev) => !prev)}
                  className="custom-checkbox"
                  disabled={disabled}
                />
                <Typography variant="body2">{t('obx.payroll.noApprovedHours')}</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Box className={classes.summaryPanel}>
        <Box className={classes.totalTime}>
          <Typography variant="body1" className={classes.totalTimeText}>
            {t('obx.payroll.totalApprovedTime')}:
          </Typography>
          <Typography variant="h4" className={classes.totalTimeText}>
            {`${getApprovedTime || 0}`}
          </Typography>
        </Box>
        <Box className={classes.totalTime}>
          {!disabled && (
            <>
              <Button
                variant="secondaryGrey"
                className={classes.cancelButton}
                onClick={() => {
                  closeDrawer();
                }}
              >
                {t('obx.payroll.cancel')}
              </Button>
              <Button
                variant="primary"
                className={classes.saveButton}
                disableElevation
                onClick={updateBreakIntervals}
                disabled={loading}
              >
                {t('obx.payroll.saveChanges')}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

ApproveTimeDrawer.propTypes = {
  setShowDrawer: PropTypes.func,
  selectedRow: PropTypes.object,
  setSelectedRow: PropTypes.func,
  data: PropTypes.array.isRequired,
  setData: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isSupervisorTab: PropTypes.bool,
};

export default ApproveTimeDrawer;
