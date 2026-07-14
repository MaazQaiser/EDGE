import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import LocationPlaceHolder from 'assets/images/LocationPlaceHolder.jpeg';
import { ReactComponent as EditLocationIcon } from 'assets/svg/EditLocationIcon.svg?react';
import { ReactComponent as UnassignedLocationIcon } from 'assets/svg/UnassignedLocationIcon.svg?react';
import React, { useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DirectionsMap from 'src/app/components/common/directionsMap';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import ResponsiveTimePickers from 'src/app/components/common/timePicker';
import { ReactComponent as ArrowBack } from 'src/assets/svg/ArrowRightBlack.svg?react';
import { ReactComponent as DispatchFranchiseIcon } from 'src/assets/svg/DispatchFranchiseIcon.svg?react';
import { ReactComponent as DispatchHitIcon } from 'src/assets/svg/DispatchHitIcon.svg?react';
import { ReactComponent as SeeListIcon } from 'src/assets/svg/SeeListIcon.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { createRunSheetReducer, runSheetInitialState } from 'src/redux/reducers/runSheetReducer';

import DispatchLocationModal from '../components/dispatchLocationModal';
import { useStyles } from './runSheetDetails';

const RunSheetDetail = () => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const [expanded, setExpanded] = useState(false);
  const classes = useStyles({ expanded });
  const toggleRightSide = () => {
    setExpanded(!expanded);
  };

  const [openLocationModal, setOpenLocationModal] = useState(false);
  const handleOpenLocationModal = () => {
    setOpenLocationModal(true);
  };
  const handleCloseLocationModal = () => setOpenLocationModal(false);

  const [state, dispatch] = useReducer(createRunSheetReducer, runSheetInitialState);

  return (
    <>
      {/* {isLoadingRunsheetDetails && <LoaderComponent />} */}

      <Box className={classes.mainWrapper}>
        <Box className={classes.leftSide}>
          <Box className={classes.TopBox}>
            <Box className={classes.headingWrapper}>
              <Button className={classes.backActionButton}>
                <ArrowBack />
              </Button>
              <Typography variant="h2" className={classes.stepperHeadding}>
                {t('obx.dispatch.createARunsheet', { runsheet: getLabel('terms', 'runsheet', t) })}
              </Typography>
            </Box>
            <Box className={classes.inlineFlex}>
              <Typography variant="h5">Milwaukee Tools</Typography>
              <Typography variant="subtitle2">&#x2022;</Typography>
              <Typography variant="subtitle2">12:00 PM</Typography>
              <Typography variant="subtitle2">&#x2022;</Typography>
              <Typography variant="subtitle2">Alarm Response</Typography>
            </Box>
          </Box>
          <Box className={classes.runsheetWrapper}>
            <Box className={classes.runsheetFields}>
              <InputLabel htmlFor="runsheetName">
                {t('obx.runsheet.runsheetName', { runsheet: getLabel('terms', 'runsheet', t) })}{' '}
                <RequiredAsterik />
              </InputLabel>
              <TextField
                name="runsheetName"
                id="runsheetName"
                fullWidth
                onChange={(e) => onChangeHandler('runsheetName', e.target.value)}
                placeholder={t('obx.runsheet.enterRunsheetName', {
                  runsheet: getLabel('terms', 'runsheet', t),
                })}
                className={classes?.textFiledFilter}
              />
            </Box>

            <Box className={classes.runsheetFields}>
              <Box className={classes.splitColms}>
                <Box className={classes.fifityFifty}>
                  <InputLabel htmlFor="startTime">
                    {t('obx.runsheet.startTime')} <RequiredAsterik />
                  </InputLabel>
                  <ResponsiveTimePickers placeholder={t('obx.runsheet.selectStartTime')} />
                </Box>
                <Box className={classes.fifityFifty}>
                  <InputLabel htmlFor="Service Name">
                    {t('obx.runsheet.endTime')} <RequiredAsterik />
                  </InputLabel>
                  <ResponsiveTimePickers placeholder={t('obx.runsheet.selectEndTime')} />
                </Box>
              </Box>
            </Box>
            <Box className={classes.locationButtons}>
              <InputLabel htmlFor="runsheetName">
                {t('obx.runsheet.startingEndingLocation')}
                <RequiredAsterik />
              </InputLabel>

              <Button
                onClick={handleOpenLocationModal}
                disableRipple
                startIcon={<UnassignedLocationIcon />}
                className={classes.redButton}
                type="button"
                variant="destructive"
              >
                {t('obx.runsheet.addStartingEndingLocation')}
              </Button>

              <Button
                onClick={handleOpenLocationModal}
                disableRipple
                endIcon={<EditLocationIcon />}
                className={classes.editButton}
                type="button"
                variant="destructive"
              >
                <Box component="span" className={classes.editButtonInner}>
                  <img src={LocationPlaceHolder} alt="" />{' '}
                  {state?.startEndLocation?.name || state?.startEndLocation?.address}
                </Box>
              </Button>
            </Box>
            <Box className={classes.runsheetFields}>
              <InputLabel htmlFor="selectOfficer">
                {t('obx.dispatch.selectOfficer', {
                  officer: getLabel('terms', 'officer', t),
                })}{' '}
                <RequiredAsterik />
              </InputLabel>
              add dropdown here
            </Box>
            <Box className={classes.runsheetFields}>
              <InputLabel htmlFor="selectVehicle">{t('obx.dispatch.selectVehicle')}</InputLabel>
              add dropdown here
            </Box>
          </Box>

          <Box className={classes.bottomSticky}>
            <Button disableRipple variant="secondaryGrey">
              {t('obx.dispatch.cancel')}
            </Button>
            <Button disableRipple variant="primary">
              {t('obx.dispatch.createAssignRunsheet', {
                runsheet: getLabel('terms', 'runsheet', t),
              })}
            </Button>
          </Box>
        </Box>

        <Box className={classes.rightSide}>
          <Button
            disableRipple
            className={classes.toggleButton}
            startIcon={<SeeListIcon className={classes.iconRotate} />}
            variant="onlyText"
            onClick={toggleRightSide}
          >
            {expanded && t('obx.dispatch.seeList')}
          </Button>
          <Box className={classes.mapArea}>
            <DirectionsMap />
          </Box>
          <Box className={classes.bottomArea}>
            <Button disableRipple startIcon={<DispatchHitIcon />} variant="onlyText">
              {t('obx.dispatch.dispatchHit', {
                dispatch: getLabel('terms', 'dispatch', t),
                hit: getLabel('terms', 'hit', t),
              })}
            </Button>

            <Button disableRipple startIcon={<DispatchFranchiseIcon />} variant="onlyText">
              {t('obx.runsheet.franchise')}
            </Button>
          </Box>
        </Box>

        <DispatchLocationModal
          openModal={openLocationModal}
          handleCloseModal={handleCloseLocationModal}
          dispatch={dispatch}
          state={state}
        />
      </Box>
    </>
  );
};

export default RunSheetDetail;
