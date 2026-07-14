import { Button, Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HitsAccordionListing from 'src/app/obx/pages/runSheets/components/hitsAccordionListing';
import HitReassignmentDrawerContent from 'src/app/obx/pages/schedules/components/hitReassignmentDrawer/hitReassignmentDrawerContent';
import PatrolHeader from 'src/app/obx/pages/schedules/shiftDetail/components/patrolHeader';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { createRunSheetReducer, runSheetInitialState } from 'src/redux/reducers/runSheetReducer';
import { getRunsheetReassignedHits } from 'src/services/runsheet.services';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import { useStyles } from './MissedHitsDrawer';

const HitReassignmentDrawer = ({
  shiftData,
  // runsheetHitsList,
  closeDrawer,
  shiftType,
  id,
  onClickBack,
  callBackOnSuccess,
}) => {
  const [state, dispatch] = useReducer(createRunSheetReducer, runSheetInitialState);

  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();

  const [_selectedMissedHit, setSelectedMissedHit] = useState(null);

  const [showAssignRunsheet, setShowAssignRunsheet] = useState(false);

  const [checked, setChecked] = useState(null);
  const [reassignedHitsList, setReassignedHitsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const _handleShow = (missedHit) => {
    setSelectedMissedHit(missedHit);
  };

  const handleBackBtn = () => {
    setShowAssignRunsheet(false);
  };

  // runsheetHitsList?.filter(
  //         (item) =>
  //           !!item?.isVisited == false &&
  //           !!item?.isMoved == false &&
  //           !!item?.isDisabled == false &&
  //           !!item?.isCancelled == false &&
  //           !!item?.isInactive == false &&
  //           !!!item?.dispatchId &&
  //           item?.visitType !== 'dispatch',
  //       )
  const finalProps = {
    shiftData,
    hitsList: reassignedHitsList ?? [],
    showSelectionCheckBox: true,
    idKey: 'hitId',
    checked,
    setChecked,
    dispatch,
    state,
    singleHitRequired: shiftData?.scheduleStatus === calendarShiftStatusEnum.IN_PROGRESS,
    useUniqueId: true,
  };

  const handleGetReassignedHits = async () => {
    try {
      setIsLoading(true);
      const response = await getRunsheetReassignedHits(id, {
        startsAt: shiftData?.startsAt,
        endsAt: shiftData?.endsAt,
        shiftActivityLogId: shiftData?.shiftActivityLogId,
      });
      // const res = await getRunsheetReassignedHits(id);
      setReassignedHitsList(response?.data?.hits ?? []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) handleGetReassignedHits();
  }, [id]);

  return (
    <>
      {showAssignRunsheet ? (
        <HitReassignmentDrawerContent
          {...{
            closeDrawer,
            handleBackBtn,
            shiftData: shiftData,
            headerTitle: t('obx.schedules.dutyDetail.reassignHit.headerTitleReassignHits', {
              hit: getLabel('terms', 'hit', t),
            }),
            loading: false,
            selectedHits: state?.visitSet,
            id,
            callbackUponReassignHit: (shiftId) => {
              onClickBack();
              callBackOnSuccess(shiftId);
            },
          }}
        />
      ) : (
        <Box className={classes.activityDrawer}>
          <PatrolHeader
            loading={false}
            shiftData={shiftData}
            closeDrawer={closeDrawer}
            shiftType={shiftType}
            headerTitle={
              shiftData?.name + (shiftData?.site?.name ? ` - ${shiftData?.site?.name}` : '')
            }
          />

          {/*<Box className={classes.drawerHeader}>*/}
          {/*  <Typography variant="h2" className={classes.drawerHeaderTitle}>*/}
          {/*    {t('obx.runsheet.missedHits')}*/}
          {/*  </Typography>*/}
          {/*  <Button*/}
          {/*    className={classes.cancelIcon}*/}
          {/*    disableRipple*/}
          {/*    variant="onlyText"*/}
          {/*    onClick={props?.closeDrawer}*/}
          {/*  >*/}
          {/*    <Clossicon />*/}
          {/*  </Button>*/}
          {/*</Box>*/}

          <Box className={classes.drawerBody}>
            <>
              <Typography variant="subtitle2" className={classes.labelClass}>
                {t('obx.schedules.dutyDetail.reassignHit.selectHit', {
                  hit: getLabel('terms', 'hit', t),
                })}
              </Typography>

              <Typography variant="subtitle2" className={classes.labelClass}>
                {t('obx.schedules.dutyDetail.reassignHit.selectHitDes', {
                  hit: getLabel('terms', 'hit', t).toLowerCase(),
                  runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
                })}
              </Typography>
              {isLoading ? (
                <Box className={classes.loaderBox}>
                  <Skeleton variant="rectangular" />
                  <Skeleton variant="rectangular" />
                  <Skeleton variant="rectangular" />
                </Box>
              ) : (
                <Box className={classes.drawerBodyInner}>
                  <HitsAccordionListing {...finalProps} />
                </Box>
              )}
            </>
          </Box>
          <Box className={classes.footerArea}>
            <Box className={classes.totalTime}>
              <Typography variant="body1" className={classes.totalTimeText}>
                {t('obx.schedules.dutyDetail.reassignHit.selectedHit', {
                  hit: getLabel('terms', 'hit', t),
                })}
              </Typography>
              <Typography variant="h4" className={classes.totalTimeText}>
                {state?.visitSet.length || 0}
              </Typography>
            </Box>

            <Box className={classes.totalTime}>
              <Button
                variant="secondaryGrey"
                onClick={() => {
                  onClickBack();
                }}
              >
                {t('obx.payroll.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowAssignRunsheet(true);
                }}
                disabled={!state?.visitSet.length > 0}
              >
                {t(
                  'obx.schedules.assignDedicatedDuty.assignShift.reassignment.reassignSelectedHit',
                  {
                    hit: getLabel('terms', 'hit', t),
                  },
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

HitReassignmentDrawer.propTypes = {
  runsheetHitsList: PropTypes.array,
  closeDrawer: PropTypes.func,
  shiftData: PropTypes.object,
  shiftType: PropTypes.string,
  id: PropTypes.string,
  onClickBack: PropTypes.func,
  callBackOnSuccess: PropTypes.func,
};

export default HitReassignmentDrawer;
