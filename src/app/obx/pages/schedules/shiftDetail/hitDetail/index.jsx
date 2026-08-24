import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getVisitActionRules } from 'src/app/obx/pages/schedules/helper/visitState';

import RunsheetHits from '../../../runSheets/components/runsheetHits';
import { useStyles as useRunsheetHitsStyles } from '../../../runSheets/components/runsheetHits/runsheetHits.style';
import RouteLink from './RouteLink';

/**
 * The customer a visit belongs to, read the same defensive chain
 * `ScheduleCalendarGrid.resolveVisitCompanyName` uses for the grid's own company chip.
 * Duplicated rather than imported — that function is local to a grid component and isn't
 * exported. **Change both if either changes.**
 */
const resolveCompanyName = (hit = {}) =>
  `${
    hit.company?.name ||
    hit.companyName ||
    hit.customer?.name ||
    hit.customerName ||
    hit.site?.company ||
    hit.site?.companyName ||
    ''
  }`.trim();

/** One more field in `RunsheetHits`' three-column grid — wraps to its own row for free. */
const Field = ({ label, value }) => {
  const classes = useRunsheetHitsStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.hitItem}>
      <Typography variant="body3" className={classes.hitItemTitle}>
        {label}
      </Typography>
      <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
        {value || t('commonText.nA')}
      </Typography>
    </Box>
  );
};

Field.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
};

/**
 * Company, site, location and filter count — four facts the design's three-field
 * row (service time, visit type, status) leaves out. `Site` names the building,
 * `Location` names the part of it this visit is for — the same relationship the
 * product's own Sites > Locations feature has, and a checkpoint's own
 * `location.locationName` a floor below it — and `Filter Count` is what the visit
 * is there to replace.
 */
const VisitExtraFields = ({ shiftData }) => {
  const { t } = useTranslation();

  return (
    <>
      <Field
        label={t('obx.schedules.calendar.companies.companyColumn')}
        value={resolveCompanyName(shiftData)}
      />
      <Field label={t('obx.schedules.dutyDetail.detail.site')} value={shiftData?.siteName} />
      <Field label={t('obx.schedules.dutyDetail.detail.location')} value={shiftData?.location} />
      <Field
        label={t('obx.schedules.dutyDetail.detail.filterCount')}
        value={shiftData?.filterCount}
      />
    </>
  );
};

VisitExtraFields.propTypes = {
  shiftData: PropTypes.object,
};

/**
 * One visit, opened from the visits grid or a route's stop list.
 *
 * `RunsheetHits` is the work itself — service time, visit type, status, company,
 * site, location, filter count, checkpoints, report, instructions — the same
 * summary a route's own stop list reads a hit through. `RouteLink` sits beneath
 * the fields, naming the route the visit is on and doubling as the way back to
 * it.
 *
 * No assignment callout: the state it used to name now lives in the route link's
 * click-through and the header's kebab, which is where the visit's other actions
 * already were.
 */
const HitDetail = ({ shiftData, loading, callbackUponAssignment, onOpenRoute }) => (
  <RunsheetHits
    hitDetails={shiftData}
    hitStatus={shiftData?.scheduleStatus}
    fetchingHitLoading={loading}
    refetchData={callbackUponAssignment}
    readOnly={getVisitActionRules(shiftData || {}).isReadOnly}
    extraFields={<VisitExtraFields shiftData={shiftData} />}
    belowFields={<RouteLink shiftData={shiftData} loading={loading} onOpenRoute={onOpenRoute} />}
  />
);

export default HitDetail;

HitDetail.propTypes = {
  shiftData: PropTypes.object,
  loading: PropTypes.bool,
  callbackUponAssignment: PropTypes.func,
  onOpenRoute: PropTypes.func,
};
