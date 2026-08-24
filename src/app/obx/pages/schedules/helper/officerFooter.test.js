import { SCHEDULE_STATS_FOOTER_VARIANTS } from '../components/scheduleStatsFooter';
import { mapFooterStatsToScheduleStatsFooter } from './scheduleResponseAdapter';

/**
 * The person tab's footer, and the one property that makes it that variant.
 *
 * `ScheduleStatsFooter` decides its own height from the *payload*, not from the
 * variant name — `hasKpiMetrics` is `Boolean(data.metrics?.length)`. So "short" is not
 * something `OFFICER` declares, it is something it has to avoid declaring: the moment
 * this branch returns a `metrics` array, the footer draws the tall overview layout and
 * prints a 0% coverage ring over a response that carries no KPI block. That is exactly
 * what `OVERVIEW` does here, and exactly why this variant exists.
 *
 * The `extra` id is the other half of it. `PATROL` reports the bucket as
 * `extraRunsheet`, which its presentation labels `{{extra}} {{runsheet}}` — "Extra
 * Route" — a distinction that means something on the patrol tab and nothing on a row
 * that is a person.
 */
const FOOTER_STATS = {
  legend: { patrol: 5, extraJob: 0, dedicated: 2, dispatch: 1 },
  statuses: { completed: 2, inProgress: 0, notStarted: 3, unassigned: 0, split: 0 },
  overview: { coverage: { percentage: 80 } },
};

const idsOf = (stats) => (stats || []).map((stat) => stat.id);

describe('the officer footer variant', () => {
  const officer = mapFooterStatsToScheduleStatsFooter(
    FOOTER_STATS,
    SCHEDULE_STATS_FOOTER_VARIANTS.OFFICER,
  );

  /* The whole reason the variant exists. Asserted against a payload that *does* carry
     an `overview` block, so this cannot pass by the fixture simply lacking one. */
  it('reports no metrics, so the footer stays short', () => {
    expect(officer.metrics).toBeUndefined();
    expect(officer.coverage).toBeUndefined();
  });

  it('names the plain extra bucket, not the patrol runsheet one', () => {
    expect(idsOf(officer.dutyStats)).toContain('extra');
    expect(idsOf(officer.dutyStats)).not.toContain('extraRunsheet');
  });

  /* The shift vocabulary, Split included — a fact about one person's day, which is
     what this surface's rows are. The visits variant drops it; this must not. */
  it('keeps the shift status list', () => {
    expect(idsOf(officer.statusStats)).toContain('split');
  });

  /* The two it is deliberately not. Stated here because the temptation on the next
     edit is to collapse this branch back into one of them. */
  it('differs from the variants it sits between', () => {
    const overview = mapFooterStatsToScheduleStatsFooter(
      FOOTER_STATS,
      SCHEDULE_STATS_FOOTER_VARIANTS.OVERVIEW,
    );
    const patrol = mapFooterStatsToScheduleStatsFooter(
      FOOTER_STATS,
      SCHEDULE_STATS_FOOTER_VARIANTS.PATROL,
    );

    expect(overview.metrics?.length).toBeGreaterThan(0);
    expect(idsOf(patrol.dutyStats)).toContain('extraRunsheet');
  });
});
