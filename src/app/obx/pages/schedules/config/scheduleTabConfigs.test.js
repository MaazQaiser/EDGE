import { getScheduleHeaderTabs } from './scheduleTabConfigs';

/**
 * The header tab row, for the two tenant shapes that produce different rows.
 *
 * What is worth pinning here is **order**, not membership: `calendar/index.jsx` opens
 * the page on `scheduleHeaderTabs[0]`, so the first entry is not a layout detail — it
 * is which surface the scheduler lands on. The person tab was added second in both
 * branches for exactly that reason, and "second" is the kind of thing a later edit
 * changes without noticing what it costs.
 *
 * `getLabel` stands in for the tenant's label set. Filter Go's words, because the
 * plural/singular question the officer tab settles (`Installers`, not `Installer`) is
 * only visible against a tenant that renames the term at all.
 */
const getLabel = (_namespace, key) =>
  ({ officers: 'Installers', patrol: 'Filter Replacement Service' })[key];

const idsOf = (tabs) => tabs.map((tab) => tab.id);

const tabsFor = (services, overrides = {}) =>
  getScheduleHeaderTabs({
    services,
    getLabel,
    t: (key) => key,
    includeOfficerTab: true,
    /* Var 2 in every case below — Companies is the grouping toggle's third segment
       now, not a tab, so leaving it in would test a row the scheduler no longer
       draws. `includeCompaniesTab` has its own coverage through the layout flag. */
    includeCompaniesTab: false,
    ...overrides,
  });

const SINGLE_SERVICE = { patrol: true, dedicated: false };
const MULTI_SERVICE = { patrol: true, dedicated: true };

describe('the header tab row', () => {
  /* The Filter Go case: one service, so no Overview tab — the service tab is the
     overview-backed one and has to stay first. */
  it('puts the person tab after the service tab for a single-service tenant', () => {
    expect(tabsFor(SINGLE_SERVICE).map((tab) => `${tab.id}:${tab.label}`)).toEqual([
      'overview:Filter Replacement Service',
      'officer:Installers',
    ]);
  });

  it('puts it after Overview for a multi-service tenant', () => {
    expect(idsOf(tabsFor(MULTI_SERVICE))).toEqual(['overview', 'officer', 'dedicated', 'patrol']);
  });

  /* The way back. Both branches read one flag, so a tenant whose backend does not
     answer `view=officer` loses the tab and nothing else. */
  it('drops it in both shapes when the flag is off', () => {
    expect(idsOf(tabsFor(SINGLE_SERVICE, { includeOfficerTab: false }))).toEqual(['overview']);
    expect(idsOf(tabsFor(MULTI_SERVICE, { includeOfficerTab: false }))).toEqual([
      'overview',
      'dedicated',
      'patrol',
    ]);
  });
});
