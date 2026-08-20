import { Box, Tooltip, Typography } from '@mui/material';
import { ReactComponent as WarningIcon } from 'assets/svg/warningCalander.svg';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles } from 'src/app/components/common/calendar/calendar.styles';
import { formatShiftScheduleTimeRange } from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as RunsheetIcon } from 'src/assets/svg/runsheetHit.svg';

/**
 * Same helper the legacy card wraps its status mark in, copied rather than
 * imported: `LegacyCalendarCardContent` keeps it module-private, and exporting it
 * from there would mean editing a file this change does not own.
 */
const StatusTooltip = ({ title, icon }) => (
  <Tooltip arrow title={title || ''}>
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      {icon}
    </Box>
  </Tooltip>
);

StatusTooltip.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.node,
};

/**
 * Visit card, candidate **V2** — the site scheduler's hit card, with the tour line
 * traded for the site.
 *
 * This exists to be compared against V1 (`VisitCardContent` in
 * `ScheduleCalendarGrid.jsx`) on the same grid, so the choice between them can be
 * made by looking rather than by describing. It started as a deliberate clone of
 * the HIT branch of `LegacyCalendarCardContent` — the card the Site Detail *Duty*
 * tab has always drawn — down to the class names, so that what a reviewer sees is
 * the reference and not an approximation of it. It keeps that geometry, that type
 * scale and those class names; only *which facts* fill the three lines has moved.
 *
 * The difference between the two candidates is how many facts a card spends its
 * height on:
 *
 *   V1, two lines — time · unassigned-or-prefers-day badge
 *                   site · filter count
 *   V2, three     — time
 *                   site
 *                   runsheet, or Unassigned · status mark
 *
 * V2's gain over V1 is the runsheet and the status badge sitting on the card as
 * text rather than as colour alone.
 *
 * ── Two things the reference draws that this card does not ──
 *
 * **The tour line is gone**, replaced by the site. Every visit in the FilterGo book
 * is the same service, so that line read `Tour Template 1` in every cell of every
 * week — a third of the card's height restating what the tab, the row and the grid
 * already say. It carried a fact in exactly one case, `BLOCKED_NO_TOUR`, and that
 * case is drawn anyway: the state owns the card's fill and border and is named in
 * the badge tooltip. This is decision **D13** in
 * `docs/visits-feature/06-visits-scheduler-edge-cases.md`, which V1 acted on first;
 * V2 now agrees with it, so the tour is no longer part of what the pair is being
 * judged on. Under a genuinely multi-template tenant the line is worth revisiting —
 * and if blocked ever needs to be louder than its fill, the answer is a badge, not
 * a line every card pays for.
 *
 * **The car glyph is gone from the header**, so line 1 is the time and nothing else.
 * It marked no distinction on a grid where every card is a patrol hit, and with the
 * visit's own name no longer beside it (below) it was left standing between a time
 * and empty space. Its removal is why the header's flex wrappers went with it: they
 * arranged three children, and one text node does not need arranging.
 *
 * The **site** takes the freed line, and takes it permanently rather than under a
 * grouping-dependent prop. It is the card's subject now, so it is drawn in
 * `eventSiteNameColor` (the header's own `textPrimary`) rather than the muted
 * `reassignedName` the tour used — the route below it stays muted, which puts the
 * card's hierarchy in the type rather than only in the order.
 *
 * No icon leads it. The two glyphs this card's lower lines use, `assignHit` and
 * `runsheetHit`, are a matched 14px pair of circular badges; `src/assets/svg/` has
 * nothing for a site but map pins (`SiteIcon`, `SitePin`, `PinDropIcon`), which are
 * 18-20px drop-pin shapes with baked-in fills that would read as a smudge at the
 * 10px `reassignedOfficerFlex` squeezes line icons to, and as a *location* marker
 * rather than a site. A misleading glyph costs more than an unindented line.
 *
 * `overTime` is kept from the reference because it is drawn for every duty type
 * there, hits included — it is a warning, not a hit-branch detail.
 *
 * Rendered unconditionally, with no `shiftType` gate. The reference has to branch
 * because one component draws five duty types; this one is only ever mounted for a
 * visit, and a visit is a patrol hit. Same reason V1 has no gate either.
 *
 * ── The card's fill is not this component's ──
 *
 * **This component sets no background of its own.** The wash is on the shell,
 * applied by the caller: `getVisitLegacyBgClass(classes, shift)` for V2, which is
 * the reference's own `EVENT_BG_COLOR_CLASSES` and is what "match the site
 * scheduler exactly" was asked for (D26). Two consequences come with that match,
 * inherited rather than introduced: `dutyBlueBg` resolves to
 * `theme.palette.surfaceBrandSubtle`, so on FilterGo's green brand an "in progress"
 * card renders green — case **4.12** / decision **D9 — one owner per pixel** — and
 * only three statuses have a fill at all, so unassigned, missed and cancelled are
 * told apart by the badge alone. V1 is the variant that does neither, which is part
 * of what the pair is being judged on.
 *
 * Either way the mapping is resolved once at the call site rather than copied here:
 * a second copy is exactly the two-owners mistake D9 is about. Like
 * `VisitCardContent` and `LegacyCalendarCardContent`, this component renders only
 * the card's *contents* — the shell `<Box>`, its wash and its left accent belong to
 * the call site.
 *
 * ── `alwaysNameSite` is inert ──
 *
 * It existed because the company grouping has no site row, so under that grouping
 * the header's third slot carried the site instead of the visit's name. The site now
 * has a line of its own under every grouping, and the visit's name is gone with the
 * header slot that held it, so the prop selects between nothing and nothing. Still
 * accepted so the two call sites in `ScheduleCalendarGrid.jsx` keep type-checking
 * (week grid and day grid, both passing it off `isCompanyGrouping`); it should be
 * deleted from there, and then from here, in the pass that owns that file.
 */
const VisitCardContentV2 = memo(({ shift, statusIcon, statusValue, is24Hours }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { name, site, siteName, startsAt, endsAt, runsheetName, overTime } = shift || {};

  const eventTime = formatShiftScheduleTimeRange(startsAt, endsAt, is24Hours);
  const unassignedLabel = t('obx.schedules.calendar.unassigned');
  /* Falls back to the visit's own name rather than rendering an empty line: every
     visit in this book has a site, so the fallback is defensive only, and a card
     that silently loses a line breaks the fixed shape a row is read by (D12). */
  const resolvedSiteName = site?.name || siteName || name;

  return (
    <>
      {overTime ? (
        <Box className={classes.warnWrapper}>
          <WarningIcon />
          <Typography className={classes.eventSiteNameColor} variant="subtitle4">
            {t('obx.schedules.calendar.scheduleStatus.overTime')}
          </Typography>
        </Box>
      ) : (
        ''
      )}

      {/* No wrapper: `eventDetailHeaderWrapper`/`eventDetailHeader` existed to lay
          out three children in a row and to reserve a right-hand slot this card
          never filled. One text node lays itself out. */}
      <Typography className={classes.eventSiteNameColor} variant="subtitle4">
        {eventTime}
      </Typography>

      <Typography
        className={classes.eventSiteNameColor}
        variant="subtitle4"
        title={resolvedSiteName}
      >
        {resolvedSiteName}
      </Typography>

      <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
        <Box className={classes.reassignedFooterFlex}>
          <Box className={classes.reassignedOfficerFlex}>
            <RunsheetIcon />
          </Box>
          <Typography className={classes.reassignedName} variant="subtitle4">
            {runsheetName || unassignedLabel}
          </Typography>
        </Box>
        <StatusTooltip title={statusValue} icon={statusIcon} />
      </Box>
    </>
  );
});

VisitCardContentV2.displayName = 'VisitCardContentV2';
VisitCardContentV2.propTypes = {
  shift: PropTypes.object,
  statusIcon: PropTypes.node,
  statusValue: PropTypes.string,
  is24Hours: PropTypes.bool,
  /** @deprecated Inert — the site has its own line under every grouping now.
   *  Declared only so the grid's two call sites keep type-checking until it is
   *  removed there. */
  alwaysNameSite: PropTypes.bool,
};

export default VisitCardContentV2;
