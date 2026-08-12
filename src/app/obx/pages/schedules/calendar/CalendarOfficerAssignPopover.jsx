import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg';
import { ReactComponent as CheckMark } from 'assets/svg/commonDropdown/checkBox.svg';
import { ReactComponent as Search } from 'assets/svg/commonDropdown/search.svg';
import { ReactComponent as NotChecked } from 'assets/svg/commonDropdown/unChecked.svg';
import PropTypes from 'prop-types';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getDaysBetweenDatesRangeWrtStandardDate,
  getDaysWrtTimezoneAsPerStandardTime,
} from 'src/app/obx/pages/schedules/helper';
import { useStyles as useOfficerDropdownStyles } from 'src/app/obx/pages/sites/detail/components/jobs/assignmentSideDrawer/assignmentSideDrawer.styles';
import { SelectChip } from 'src/app/obx/pages/sites/detail/components/jobs/assignmentSideDrawer/AssignShift/OfficerDropdown';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import {
  assignmentToRunsheet,
  assignmentToSplittedRunsheet,
  assignShift,
  fetchShiftDetailById,
  getActiveAndInActiveOfficers,
  getActiveAndInActivePatrolOfficers,
  getRunsheetShiftDetail,
} from 'src/services/duty.services';
import { officerUnavailabilityReason, toastSettings } from 'src/utils/constants';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

const UNASSIGN_VALUE = 'unassign';

const useStyles = makeStyles((theme) => ({
  loadingPaper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 320,
    minHeight: 160,
    padding: 24,
    boxSizing: 'border-box',
    position: 'relative',
  },
  menuPaper: {
    width: 'max-content !important',
    minWidth: '280px !important',
    maxWidth: 'min(520px, calc(100vw - 16px)) !important',
    maxHeight: '320px !important',
    overflow: 'hidden !important',
    boxSizing: 'border-box',
    display: 'flex !important',
    flexDirection: 'column !important',
  },
  popoverContent: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 320,
    width: 'max-content',
    minWidth: 280,
    maxWidth: 'min(520px, calc(100vw - 16px))',
    boxSizing: 'border-box',
  },
  popoverHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px 12px',
    borderBottom: `1px solid ${theme.palette?.borderSubtle1 || '#E6E6E7'}`,
    background: '#fff',
    flexShrink: 0,
    width: '100%',
    boxSizing: 'border-box',
  },
  closeRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minHeight: '28px',
  },
  closeButton: {
    '&.MuiButtonBase-root': {
      minWidth: '28px',
      width: '28px',
      height: '28px',
      padding: '4px',
      lineHeight: 0,
      borderRadius: '6px',
      color: theme.palette?.textSecondary1 || '#737378',
      '&:hover': {
        background: theme.palette?.surfaceGreySubtle || '#F5F5F6',
        color: theme.palette?.textPrimary || '#1A1A1A',
      },
      '& svg': {
        width: '18px',
        height: '18px',
        display: 'block',
      },
    },
  },
  loadingCloseButton: {
    '&.MuiButtonBase-root': {
      position: 'absolute',
      top: 8,
      right: 8,
      minWidth: '28px',
      width: '28px',
      height: '28px',
      padding: '4px',
      borderRadius: '6px',
      '& svg': {
        width: '18px',
        height: '18px',
        display: 'block',
      },
    },
  },
  searchField: {
    '&.MuiFormControl-root': {
      width: '100%',
    },
    '& .MuiOutlinedInput-root': {
      height: '32px',
      borderRadius: '8px',
      background: theme.palette?.surfaceGreySubtle || '#F5F5F6',
      '& fieldset': {
        borderColor: 'transparent',
      },
      '&:hover fieldset': {
        borderColor: theme.palette?.borderSubtle1 || '#E6E6E7',
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette?.borderBrand || '#146DFF',
        borderWidth: '1px',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '6px 8px 6px 0',
      fontSize: '13px',
    },
  },
  optionsList: {
    overflowY: 'auto',
    overflowX: 'hidden',
    flex: 1,
    minHeight: 0,
    padding: '4px 0 8px',
    width: 'max-content',
    minWidth: '100%',
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '8px 12px',
    cursor: 'pointer',
    width: 'max-content',
    minWidth: '100%',
    boxSizing: 'border-box',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
  optionRowMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '0 0 auto',
  },
  optionText: {
    display: 'flex',
    flexDirection: 'column',
    flex: '0 0 auto',
  },
  optionName: {
    '&.MuiTypography-root': {
      whiteSpace: 'nowrap',
    },
  },
  optionRole: {
    '&.MuiTypography-root': {
      whiteSpace: 'nowrap',
      color: theme.palette?.textSecondary3 || '#A0A0A3',
    },
  },
  optionChip: {
    flexShrink: 0,
    marginLeft: 'auto',
  },
  optionRowDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  optionSelected: {
    backgroundColor: 'rgba(46, 144, 250, 0.08)',
  },
  emptyState: {
    '&.MuiTypography-root': {
      padding: '16px 12px',
      color: theme.palette?.textSecondary1 || '#737378',
      fontSize: '13px',
    },
  },
}));

const isPatrolLike = (shiftType) =>
  [SCHEDULE_DUTIES.PATROL, SCHEDULE_DUTIES.DISPATCH].includes(shiftType);

const isDedicatedLike = (shiftType) =>
  [SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(shiftType);

const getDetailOfficer = (detailResponse, shiftType) => {
  // Dedicated: response.data.shift; Patrol: response.data (runsheet detail)
  const detail = isDedicatedLike(shiftType)
    ? detailResponse?.data?.shift || detailResponse?.data
    : detailResponse?.data;
  return detail?.officer || detail?.reassignedOfficer || detail?.reassignedShift?.officer || null;
};

const INITIAL_POPOVER_STATE = {
  open: false,
  anchorEl: null,
  shift: null,
};

const CalendarOfficerAssignPopover = forwardRef(({ onAssignmentSuccess }, ref) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const officerClasses = useOfficerDropdownStyles();
  const { getNewApiController } = useApiControllers();
  const [allOfficers, setAllOfficers] = useState(undefined);
  const [latestOfficer, setLatestOfficer] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [searchText, setSearchText] = useState('');
  // Open state lives here so ScheduleCalendarGrid / FullCalendar do not re-render on open.
  const [{ open, anchorEl, shift }, setPopoverState] = useState(INITIAL_POPOVER_STATE);
  const [placement, setPlacement] = useState({
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'left' },
  });

  const close = useCallback(() => {
    setPopoverState(INITIAL_POPOVER_STATE);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open: (nextAnchorEl, nextShift) => {
        if (!nextAnchorEl || !nextShift) return;
        setPopoverState({ open: true, anchorEl: nextAnchorEl, shift: nextShift });
      },
      close,
    }),
    [close],
  );

  const startsAt = shift?.startsAt;
  const endsAt = shift?.endsAt;
  const shiftType = shift?.shiftType;
  const currentOfficer = latestOfficer || shift?.officer || shift?.reassignedOfficer || null;

  useEffect(() => {
    if (!open) {
      setSearchText('');
      setAllOfficers(undefined);
      setLatestOfficer(null);
      setAssigning(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !anchorEl) return;

    const rect = anchorEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = window.innerWidth - rect.left;
    const openAbove = spaceBelow < 280 && spaceAbove > spaceBelow;
    const openLeft = spaceRight < 280;

    setPlacement({
      anchorOrigin: {
        vertical: openAbove ? 'top' : 'bottom',
        horizontal: openLeft ? 'right' : 'left',
      },
      transformOrigin: {
        vertical: openAbove ? 'bottom' : 'top',
        horizontal: openLeft ? 'right' : 'left',
      },
    });
  }, [open, anchorEl]);

  useEffect(() => {
    if (!open || !shift || !startsAt || !endsAt) {
      setAllOfficers(undefined);
      return undefined;
    }

    const apiController = getNewApiController();
    let cancelled = false;

    const load = async () => {
      try {
        setAllOfficers(undefined);
        setLatestOfficer(null);

        const queryParams = { start: startsAt, end: endsAt };
        const officersPromise = (async () => {
          if (isDedicatedLike(shiftType)) {
            const localDays = getDaysBetweenDatesRangeWrtStandardDate(startsAt, startsAt);
            queryParams.assignmentDays = getDaysWrtTimezoneAsPerStandardTime(
              startsAt,
              localDays,
              true,
            );
            return getActiveAndInActiveOfficers({
              shiftId: shift?.shiftId || shift?.id,
              queryParams,
              config: { signal: apiController.signal },
            });
          }

          if (isPatrolLike(shiftType)) {
            if (shift?.isParent || shift?.isChild || shiftType === SCHEDULE_DUTIES.DISPATCH) {
              queryParams.isReassigned = true;
            }
            const runsheetId =
              shift?.runsheetId || shift?.runsheet?.id || shift?.id || shift?.shiftId;
            if (!runsheetId) return null;
            return getActiveAndInActivePatrolOfficers({
              runsheetId,
              queryParams,
              config: { signal: apiController.signal },
            });
          }

          return { data: {} };
        })();

        const detailPromise = (async () => {
          // Same ids/params as ShiftDetail drawer
          try {
            if (isDedicatedLike(shiftType)) {
              if (!shift?.id) return null;
              return await fetchShiftDetailById({
                shiftId: shift.id,
                shiftDate: startsAt,
              });
            }
            if (isPatrolLike(shiftType)) {
              if (!shift?.id) return null;
              return await getRunsheetShiftDetail({
                runsheetId: shift.id,
                params: {
                  startsAt,
                  endsAt,
                  shiftActivityLogId: shift?.shiftActivityLogId,
                },
              });
            }
            return null;
          } catch {
            return null;
          }
        })();

        const [officersResponse, detailResponse] = await Promise.all([
          officersPromise,
          detailPromise,
        ]);

        if (cancelled) return;

        if (officersResponse === null) {
          setAllOfficers(null);
          return;
        }

        const freshOfficer = getDetailOfficer(detailResponse, shiftType);
        if (freshOfficer) setLatestOfficer(freshOfficer);

        const data = officersResponse?.data || {};
        const currentId = freshOfficer?.id || shift?.officer?.id || shift?.reassignedOfficer?.id;
        const assigned = (data?.assigned || []).map((officer) => ({
          ...officer,
          disabled: officer?.isAssigned,
          role: officer?.label,
          label: officer?.name,
        }));
        const unassigned = (data?.unassigned || []).map((officer) => ({
          ...officer,
          reason: officer?.reason || officerUnavailabilityReason.AVAILABLE,
          role: officer?.label,
          label: officer?.name,
        }));
        const assignMe = data?.assignMe && {
          ...data.assignMe,
          disabled: data.assignMe?.isAssigned,
        };
        const unassignOfficer = currentId
          ? {
              id: UNASSIGN_VALUE,
              name: t('obx.schedules.assignDedicatedDuty.assignShift.unassignOfficer', {
                officer: getLabel('terms', 'officer', t),
              }),
              imageUrl: null,
              role: getLabel('terms', 'officer', t) || 'Officer',
              label: t('obx.schedules.assignDedicatedDuty.assignShift.unassignOfficer', {
                officer: getLabel('terms', 'officer', t),
              }),
              value: UNASSIGN_VALUE,
              isAssigned: false,
            }
          : null;

        setAllOfficers({ ...data, assigned, assignMe, unassignOfficer, unassigned });
      } catch (error) {
        if (!apiController.signal.aborted && !cancelled) {
          setAllOfficers(null);
          toaster.error({
            text: error?.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          close();
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      apiController.abort();
    };
  }, [
    open,
    shift?.id,
    shift?.shiftId,
    shift?.shiftActivityLogId,
    startsAt,
    endsAt,
    shiftType,
    close,
  ]);

  const officerOptions = useMemo(() => {
    if (!allOfficers) return [];
    return [
      allOfficers?.unassignOfficer,
      ...(allOfficers?.unassigned || []),
      ...(allOfficers?.assigned || []),
    ].filter((officer) => officer?.id != null || officer?.value != null);
  }, [allOfficers]);

  const filteredOptions = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return officerOptions;
    return officerOptions.filter((officer) => {
      const name = `${officer?.name || officer?.label || ''}`.toLowerCase();
      const role = `${officer?.role || ''}`.toLowerCase();
      return name.includes(query) || role.includes(query);
    });
  }, [officerOptions, searchText]);

  const handleSelectOfficer = async (selected) => {
    if (!selected?.id || assigning || selected?.disabled) return;
    if (selected.id === currentOfficer?.id) {
      close();
      return;
    }

    try {
      setAssigning(true);
      let response;

      if (isDedicatedLike(shiftType)) {
        const localDays = getDaysBetweenDatesRangeWrtStandardDate(startsAt, startsAt);
        const assignedDays =
          getDaysWrtTimezoneAsPerStandardTime(startsAt, localDays, true) || localDays;
        const payload = {
          officer: {
            id: selected.id === UNASSIGN_VALUE ? undefined : selected.id,
            assignedDays,
            assignmentDuration: { start: startsAt, end: endsAt },
          },
          activityLogId: shift?.shiftActivityLogId || shift?.logId || shift?.id,
          isTimeUpdated: false,
        };
        if (shift?.location?.id) {
          payload.location = {
            id: shift.location.id,
            assignmentDuration: { start: startsAt, end: endsAt },
          };
        }
        response = await assignShift({
          payload,
          shiftId: shift?.shiftId || shift?.id,
        });
      } else if (isPatrolLike(shiftType)) {
        if (shift?.isParent || shift?.isChild || shiftType === SCHEDULE_DUTIES.DISPATCH) {
          response = await assignmentToSplittedRunsheet({
            shiftActivityLogId: shift?.shiftActivityLogId || shift?.id,
            payload: {
              id: selected.id === UNASSIGN_VALUE ? undefined : selected.id,
              assignmentType: 'officer',
              isTimeUpdated: false,
            },
          });
        } else {
          response = await assignmentToRunsheet({
            runsheetId: shift?.runsheetId || shift?.runsheet?.id || shift?.id || shift?.shiftId,
            payload: {
              officer: {
                id: selected.id === UNASSIGN_VALUE ? undefined : selected.id,
                assignmentDuration: { start: startsAt, end: endsAt },
              },
              isTimeUpdated: false,
            },
          });
        }
      } else {
        return;
      }

      toaster.success({
        text: response?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      close();
      onAssignmentSuccess?.({
        previousShift: shift,
        assignment: response?.data || null,
        selectedOfficer: selected.id === UNASSIGN_VALUE ? null : selected,
      });
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setAssigning(false);
    }
  };

  const isLoading = typeof allOfficers === 'undefined' || assigning;

  return (
    <Popover
      open={Boolean(open && anchorEl)}
      anchorEl={anchorEl}
      onClose={close}
      anchorOrigin={placement.anchorOrigin}
      transformOrigin={placement.transformOrigin}
      marginThreshold={8}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      slotProps={{
        paper: {
          className: isLoading ? undefined : classes.menuPaper,
          sx: {
            p: 0,
            borderRadius: '8px',
            border: '1px solid #e6e6e7',
            boxShadow:
              '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1)',
            ...(isLoading
              ? {}
              : {
                  width: 'max-content',
                  minWidth: 280,
                  maxWidth: 'min(520px, calc(100vw - 16px))',
                  maxHeight: 320,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }),
          },
        },
      }}
    >
      {isLoading ? (
        <Box className={classes.loadingPaper}>
          <Button
            variant="onlyText"
            className={classes.loadingCloseButton}
            onClick={close}
            disableRipple
            aria-label={t('commonText.close', { defaultValue: 'Close' })}
          >
            <CloseIcon />
          </Button>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box className={classes.popoverContent}>
          <Box className={classes.popoverHeader}>
            <Box className={classes.closeRow}>
              <Button
                variant="onlyText"
                className={classes.closeButton}
                onClick={close}
                disableRipple
                aria-label={t('commonText.close', { defaultValue: 'Close' })}
              >
                <CloseIcon />
              </Button>
            </Box>
            <TextField
              type="text"
              placeholder={t('commonText.dropDown.searchPlaceholder')}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              fullWidth
              size="small"
              className={classes.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box className={classes.optionsList}>
            {filteredOptions.length === 0 ? (
              <Typography variant="subtitle1" className={classes.emptyState}>
                {t('commonText.table.noRecordFound')}
              </Typography>
            ) : (
              filteredOptions.map((officer) => {
                const isSelected = `${officer?.id}` === `${currentOfficer?.id}`;
                const isUnassignOption = officer?.id === UNASSIGN_VALUE;
                return (
                  <Box
                    key={officer?.id || officer?.value}
                    className={`${classes.optionRow} ${
                      officer?.disabled ? classes.optionRowDisabled : ''
                    } ${isSelected ? classes.optionSelected : ''}`}
                    onClick={() => handleSelectOfficer(officer)}
                  >
                    <Box className={classes.optionRowMain}>
                      <Box className={officerClasses.customDropdownCheckboxIcon}>
                        {isSelected ? <CheckMark /> : <NotChecked />}
                      </Box>
                      <Avatar
                        className={officerClasses.singleOfficerOptionImage}
                        src={officer?.imageUrl}
                      />
                      <Box className={classes.optionText}>
                        <Typography variant="body2" className={classes.optionName}>
                          {officer?.name || officer?.label}
                        </Typography>
                        {officer?.role ? (
                          <Typography variant="body3" className={classes.optionRole}>
                            {officer.role}
                          </Typography>
                        ) : null}
                      </Box>
                    </Box>
                    {!isUnassignOption ? (
                      <Box className={classes.optionChip}>
                        <SelectChip officerData={officer} />
                      </Box>
                    ) : null}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      )}
    </Popover>
  );
});

CalendarOfficerAssignPopover.displayName = 'CalendarOfficerAssignPopover';

CalendarOfficerAssignPopover.propTypes = {
  onAssignmentSuccess: PropTypes.func,
};

export default CalendarOfficerAssignPopover;
