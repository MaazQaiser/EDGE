import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getVisitActionRules } from 'src/app/obx/pages/schedules/helper/visitState';

import RunsheetHits from '../../../runSheets/components/runsheetHits';
import { useStyles as useRunsheetHitsStyles } from '../../../runSheets/components/runsheetHits/runsheetHits.style';

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

/** Company and site — who the visit is for, and where. */
const VisitExtraFields = ({ shiftData }) => {
  const { t } = useTranslation();

  return (
    <>
      <Field
        label={t('obx.schedules.calendar.companies.companyColumn')}
        value={resolveCompanyName(shiftData)}
      />
      <Field label={t('obx.schedules.dutyDetail.detail.site')} value={shiftData?.siteName} />
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
 * site, the filters this visit is there to replace, report and instructions.
 * Checkpoints are hidden here: a filter-replacement visit is read by what it
 * replaces, not by a device tour, and the route's own stop list is where that
 * still belongs.
 *
 * No assignment callout, and no route link: both used to answer "is this on a
 * route", which the header's kebab and the visits grid already answer.
 */
const HitDetail = ({ shiftData, loading, callbackUponAssignment }) => (
  <RunsheetHits
    hitDetails={shiftData}
    hitStatus={shiftData?.scheduleStatus}
    fetchingHitLoading={loading}
    refetchData={callbackUponAssignment}
    readOnly={getVisitActionRules(shiftData || {}).isReadOnly}
    extraFields={<VisitExtraFields shiftData={shiftData} />}
    hideCheckpoints
  />
);

export default HitDetail;

HitDetail.propTypes = {
  shiftData: PropTypes.object,
  loading: PropTypes.bool,
  callbackUponAssignment: PropTypes.func,
};
