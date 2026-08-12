import { Box, Button, Chip, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import CustomDropDown from 'src/app/components/common/customDropDown';
import SearchComponent from 'src/app/components/common/search';
import * as ROUTE from 'src/app/router/constant/ROUTE';
import { ReactComponent as BackIcon } from 'src/assets/svg/ArrowRightBlack.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './buildRoute.styles';
import CandidatePool from './components/CandidatePool';
import CapacityMeter from './components/CapacityMeter';
import RouteTimeline from './components/RouteTimeline';
import { buildRoutePlan, buildVanLoad } from './helper';
import { CURRENT_POSITION, DEPOT, MOCK_RUNSHEETS, MOCK_VISITS } from './mockVisits';

const START_OPTIONS = [
  { value: 'current', label: 'Current position' },
  { value: 'depot', label: 'Depot' },
];

const END_OPTIONS = [
  { value: 'start', label: 'Return to start' },
  { value: 'last', label: 'End at last visit' },
];

const DAY_START_MINUTES = 9 * 60;

/**
 * Build a day's route by clubbing visits together — across days, and into a
 * runsheet that may already be running.
 */
const BuildRoute = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const history = useHistory();

  const [selectedIds, setSelectedIds] = useState(new Set(['v-201', 'v-101']));
  const [startPointKey, setStartPointKey] = useState('current');
  const [endPointKey, setEndPointKey] = useState('start');
  const [search, setSearch] = useState('');
  const [targetRunsheet, setTargetRunsheet] = useState('');

  const visitsTerm = getLabel('terms', 'visits', t) || 'Visits';
  const startPoint = startPointKey === 'depot' ? DEPOT : CURRENT_POSITION;

  const filteredVisits = useMemo(() => {
    if (!search.trim()) return MOCK_VISITS;
    const needle = search.trim().toLowerCase();
    return MOCK_VISITS.filter(
      (visit) =>
        visit.siteName.toLowerCase().includes(needle) ||
        visit.address.toLowerCase().includes(needle),
    );
  }, [search]);

  const selectedVisits = useMemo(
    () => MOCK_VISITS.filter((visit) => selectedIds.has(visit.id)),
    [selectedIds],
  );

  const plan = useMemo(
    () =>
      buildRoutePlan({
        startPoint,
        visits: selectedVisits,
        returnToStart: endPointKey === 'start',
        dayStartMinutes: DAY_START_MINUTES,
      }),
    [startPoint, selectedVisits, endPointKey],
  );

  const vanLoad = useMemo(() => buildVanLoad(selectedVisits), [selectedVisits]);

  const toggleVisit = (id) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (bucket, shouldSelect) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      filteredVisits
        .filter((visit) => visit.bucket === bucket)
        .forEach((visit) => {
          if (shouldSelect) next.add(visit.id);
          else next.delete(visit.id);
        });
      return next;
    });
  };

  const goBack = () => history.push(ROUTE.OBX_RUNSHEET);

  const handleApply = () => {
    const target = MOCK_RUNSHEETS.find((runsheet) => runsheet.id === targetRunsheet);
    toaster.success({
      text: t('obx.runsheet.buildRoute.appliedToast', {
        count: selectedVisits.length,
        runsheet: target?.name || t('obx.runsheet.buildRoute.newRunsheet'),
      }),
      position: 'top-right',
      autoClose: toastSettings.AUTO_CLOSE,
    });
  };

  const hasSelection = selectedVisits.length > 0;

  return (
    <Box className={classes.page}>
      <Box className={classes.header}>
        <Button
          disableRipple
          variant="onlyText"
          onClick={goBack}
          startIcon={<BackIcon />}
          className={classes.backButton}
          aria-label={t('buttons.back')}
        />
        <Typography variant="h2" className={classes.headerTitle}>
          {t('obx.runsheet.buildRoute.title')}
        </Typography>
        <Chip className={classes.liveChip} label={t('obx.runsheet.buildRoute.live')} />
      </Box>
      <Typography className={classes.headerSubtitle}>
        {t('obx.runsheet.buildRoute.subtitle', { visits: visitsTerm.toLowerCase() })}
      </Typography>

      <Box className={classes.controls}>
        <Box className={classes.control}>
          <Typography className={classes.controlLabel}>
            {t('obx.runsheet.buildRoute.startFrom')}
          </Typography>
          <CustomDropDown
            options={START_OPTIONS}
            selectedValues={START_OPTIONS.find((option) => option.value === startPointKey)}
            handleChange={(event) => setStartPointKey(event?.target?.value)}
            name="startPoint"
            placeHolder={t('obx.runsheet.buildRoute.startFrom')}
            bordered
          />
        </Box>

        <Box className={classes.control}>
          <Typography className={classes.controlLabel}>
            {t('obx.runsheet.buildRoute.endAt')}
          </Typography>
          <CustomDropDown
            options={END_OPTIONS}
            selectedValues={END_OPTIONS.find((option) => option.value === endPointKey)}
            handleChange={(event) => setEndPointKey(event?.target?.value)}
            name="endPoint"
            placeHolder={t('obx.runsheet.buildRoute.endAt')}
            bordered
          />
        </Box>

        <Box className={classes.control}>
          <Typography className={classes.controlLabel}>
            {t('obx.runsheet.buildRoute.mergeInto')}
          </Typography>
          <CustomDropDown
            options={[
              { value: '', label: t('obx.runsheet.buildRoute.newRunsheet') },
              ...MOCK_RUNSHEETS.map((runsheet) => ({
                value: runsheet.id,
                label: `${runsheet.name}${runsheet.status === 'live' ? ' · live' : ''}`,
              })),
            ]}
            selectedValues={{ value: targetRunsheet }}
            handleChange={(event) => setTargetRunsheet(event?.target?.value)}
            name="targetRunsheet"
            placeHolder={t('obx.runsheet.buildRoute.newRunsheet')}
            bordered
          />
        </Box>
      </Box>

      <Box className={classes.body}>
        <Box className={classes.pool}>
          <Box className={classes.poolHeader}>
            <Typography className={classes.sectionLabel}>
              {t('obx.runsheet.buildRoute.candidates')}
            </Typography>
            <SearchComponent
              name="visitSearch"
              onSearch={(event) => setSearch(event?.target?.value || '')}
              placeholder={t('obx.runsheet.buildRoute.searchSites')}
            />
          </Box>

          <CandidatePool
            visits={filteredVisits}
            selectedIds={selectedIds}
            onToggle={toggleVisit}
            onToggleGroup={toggleGroup}
          />
        </Box>

        <Box className={classes.plan}>
          <Box className={classes.planScroll}>
            {hasSelection ? (
              <>
                <Box className={classes.planCard}>
                  <Box className={classes.planCardHeader}>
                    <Typography className={classes.sectionLabel}>
                      {t('obx.runsheet.buildRoute.orderedRoute')}
                    </Typography>
                    <Typography className={classes.legendText}>
                      {t('obx.runsheet.buildRoute.stopCount', { count: plan.stops.length })}
                    </Typography>
                  </Box>
                  <Box className={classes.planCardBody}>
                    <RouteTimeline
                      stops={plan.stops}
                      startLabel={startPoint.label}
                      endLabel={
                        endPointKey === 'start'
                          ? startPoint.label
                          : t('obx.runsheet.buildRoute.lastVisit')
                      }
                      returnLegMinutes={plan.returnLegMinutes}
                      finishMinutes={plan.finishMinutes}
                    />
                  </Box>
                </Box>

                <Box className={classes.planCard}>
                  <Box className={classes.planCardHeader}>
                    <Typography className={classes.sectionLabel}>
                      {t('obx.runsheet.buildRoute.vanLoad')}
                    </Typography>
                    <Typography className={classes.legendText}>
                      {t('obx.runsheet.buildRoute.vanLoadHint')}
                    </Typography>
                  </Box>
                  <Box className={classes.planCardBody}>
                    <Box className={classes.loadGrid}>
                      {vanLoad.map((item) => (
                        <Box key={item.name} className={classes.loadItem}>
                          <Typography className={classes.loadName}>{item.name}</Typography>
                          <Typography className={classes.loadQty}>{item.quantity}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </>
            ) : (
              <Box className={classes.emptyPlan}>
                <Typography className={classes.emptyTitle}>
                  {t('obx.runsheet.buildRoute.emptyTitle')}
                </Typography>
                <Typography className={classes.emptyText}>
                  {t('obx.runsheet.buildRoute.emptyText', { visits: visitsTerm.toLowerCase() })}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <CapacityMeter
        serviceMinutes={plan.serviceMinutes}
        travelMinutes={plan.travelMinutes}
        totalMinutes={plan.totalMinutes}
      >
        {plan.overflowMinutes > 0 && (
          <Button disableRipple variant="secondaryGrey">
            {t('obx.runsheet.buildRoute.secondRoute')}
          </Button>
        )}
        <Button disableRipple variant="primary" disabled={!hasSelection} onClick={handleApply}>
          {targetRunsheet
            ? t('obx.runsheet.buildRoute.addToRunsheet', { count: selectedVisits.length })
            : t('obx.runsheet.buildRoute.createRunsheet', { count: selectedVisits.length })}
        </Button>
      </CapacityMeter>
    </Box>
  );
};

export default BuildRoute;
