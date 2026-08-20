import { useEffect, useMemo, useRef, useState } from 'react';
import { getCompanyVisitSchedule } from 'services/duty.services';
import { useApiControllers } from 'src/helper/axios';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { DEFAULT_COMPANIES_VIEW, fetchWindowFor, rangeForView } from './companiesViewRange';

/**
 * The scope the Companies tab opens on: the window belonging to whichever view is
 * being restored, anchored on today.
 *
 * It takes a view because the window and the view are the same decision now — see
 * `companiesViewRange`. Called with nothing it still answers the tab's own default,
 * the rolling year, which is what every caller wanted back when there was only one.
 *
 * Forward-looking on purpose, and that is a property of the *year* window rather
 * than of this function: filters are replaced quarterly, so the question this tab
 * exists to answer is "when is this customer next due", and a year centred on today
 * would spend half its width on visits that have already happened. History is one
 * drag of the start date away.
 */
export const defaultCompanyScope = (view = DEFAULT_COMPANIES_VIEW) => ({
  ...rangeForView(view),
  customerIds: [],
  siteIds: [],
  /* Client-side, and deliberately not part of the request below: both are typed or
     clicked at reading speed against a payload that is already in memory, and a
     refetch per keystroke would make the search feel slower than the list it is
     searching. No status chosen means every status. */
  status: null,
  query: '',
});

/**
 * The Companies tab's one fetch, for whichever view is drawing it.
 *
 * Both views read the same payload, so the request belongs to neither of them —
 * it belongs to the tab, and the pane calls this once and passes the result down.
 * They each used to fetch for themselves, which meant switching view refetched
 * the identical year and the two views could disagree about the same customer for
 * as long as one request outlived the other.
 *
 * The **window and the pair are server-side**: company and location narrow the
 * payload rather than being filtered out on arrival, so a customer filtered to one
 * of its four buildings does not ship the other three for the client to hide.
 * Status and search text are the other way round — see `companyVisitFilters.js` —
 * and are absent from the query below on purpose, so touching either of them costs
 * no request at all.
 *
 * The window sent is `fetchWindowFor(scope)`, not the scope's own: the visible
 * range rounded out to whole calendar months, because the payload is a month-bucket
 * matrix and is only ever answered in whole months anyway. That is what makes
 * Day/Week/Month a **one-month request instead of a twelve-month one** while still
 * leaving every view reading buckets that mean "this whole calendar month" — the
 * day-and-week trim happens on arrival, in the same helper the status filter uses.
 * Rounding it out here rather than at each view is deliberate: a view that forgot
 * would silently fetch a different window than its neighbours and the switch would
 * refetch for no reason.
 */
const useCompanyVisitSchedule = (scope) => {
  const { getNewApiController } = useApiControllers();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchGenerationRef = useRef(0);

  /* The effect depends on the *values*, not on the object — the pane rebuilds the
     scope on every render it participates in, and keying the fetch on identity
     would refetch the same year forever. `customerIds`/`siteIds` are arrays, so
     this only holds as long as the pane leaves them referentially unchanged
     unless a filter actually moves — which is what `CompaniesPane`'s merge-based
     `setScope` does. */
  const { from, to, customerIds, siteIds } = scope || {};
  /* Keyed on the **rounded** window, not on the visible one, and that is the second
     thing rounding buys: every day of August asks for the same August, so stepping
     the Day view across a month is thirty renders and one request. Computed outside
     the memo because it is two dayjs calls returning plain strings — cheap to redo
     per render, and primitives are what the dependency list needs to compare. */
  const { from: windowFrom, to: windowTo } = fetchWindowFor({ from, to });
  const query = useMemo(
    () => ({ from: windowFrom, to: windowTo, customerIds, siteIds }),
    [windowFrom, windowTo, customerIds, siteIds],
  );

  useEffect(() => {
    const controller = getNewApiController();
    const generation = ++fetchGenerationRef.current;
    /* Both guards, not one: aborting settles the promise but a re-run that
       resolved out of order would still write a stale year into state. */
    const isStale = () => generation !== fetchGenerationRef.current || controller.signal.aborted;

    setLoading(true);
    getCompanyVisitSchedule(query, { signal: controller.signal })
      .then((response) => {
        if (isStale()) return;
        setData(response?.data || null);
        setLoading(false);
      })
      .catch((error) => {
        if (isStale()) return;
        toaster.error({
          text: error?.message || 'Something went wrong',
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setData(null);
        setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line
  }, [query]);

  return { data, loading };
};

export default useCompanyVisitSchedule;
