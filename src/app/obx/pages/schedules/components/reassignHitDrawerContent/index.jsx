import { Avatar, Button, Chip, InputLabel, Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useJsApiLoader } from '@react-google-maps/api';
import { ReactComponent as DotIcon } from 'assets/svg/dot.svg';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
// import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import SearchComponent from 'src/app/components/common/search';
import { DisplayDateTimeRange } from 'src/app/components/obxComponents/ShiftVisitsStatus';
import { useApiControllers } from 'src/helper/axios';
import {
  calculateAndDisplayRouteUtils,
  updateLastItemWithUniqueId,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { addMissedHitToRunsheet, fetchRunsheetList } from 'src/services/duty.services';
import { getVisitorsLoadsOfficersOptions } from 'src/services/visitorsLoads.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { GOOGLE_MAPS_API_VERSION, GOOGLE_MAPS_LIBRARIES, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { NoRunsheetFound } from '../../../runSheets/listing';
import {
  dayjsWithTimezone,
  getCurrentTimeWithDisabledDlsInIso,
  runsheetTotalCount,
  toRunsheetArray,
} from '../../helper';
import PatrolHeader from '../../shiftDetail/components/patrolHeader';
import { useStyles } from './reassignHitDrawerContent';

/**
 * Who is on a route — **from either shape the API has used.**
 *
 * The rows read `runsheet.officer.name` and `runsheet.officer.imageUrl`; the payload carries
 * `assignedTo`, a bare name string. So the installer column was blank on every row even once
 * rows existed, and an avatar was rendered for an image that was never there.
 */
const runsheetAssignee = (runsheet) => {
  if (runsheet?.officer?.name)
    return { name: runsheet.officer.name, image: runsheet.officer.imageUrl };
  if (typeof runsheet?.assignedTo === 'string' && runsheet.assignedTo) {
    return { name: runsheet.assignedTo, image: null };
  }
  return null;
};

/**
 * The Google Maps SDK, loaded when a route is **picked** rather than when the picker opens.
 *
 * ## What this fixes, measured
 *
 * Opening this screen fired **eight requests, every one of them Google Maps**, and nothing else:
 * `/maps/api/js` alone took **2.1s**, with ~265KB of SDK behind it across `main`, `places`,
 * `util`, `common`, `drawing` and `geometry`. The route list and the installer list did not
 * appear in the timings at all. So the two seconds a planner waited on this screen were **not
 * the route data** — that arrives immediately — they were an SDK being fetched before anybody
 * had chosen anything.
 *
 * It was also being fetched for no one: the hook's result was assigned to `_isLoaded` and never
 * read. The only thing in this flow that needs `window.google` is
 * `calculateAndDisplayRouteUtils`, which builds the new route's polyline on **commit** — it
 * calls `new google.maps.DirectionsService()` as a bare global and does not guard, so the SDK
 * does have to be present by the time `Assign` is pressed. It does not have to be present to
 * *read a list*.
 *
 * So the load moves to selection. The planner picks a route, the footer appears, and the SDK
 * fetches while they read the sentence in it — by the time the button is pressed it is warm, and
 * if it is not, the button says so rather than failing on a missing global.
 *
 * **A component rather than a flag**, because `useJsApiLoader` is a hook and cannot be called
 * conditionally. Mounting the caller is how you make a hook lazy.
 *
 * The library set stays `GOOGLE_MAPS_LIBRARIES` even though Directions needs none of `places`,
 * `drawing` or `geometry`: the loader is a singleton keyed on its options, and every other
 * screen in the product asks for that set — a second set here would make whichever screen
 * mounted first win and warn about it.
 */
const MapsPrefetch = ({ onReady }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (isLoaded) onReady();
  }, [isLoaded, onReady]);

  return null;
};

MapsPrefetch.propTypes = { onReady: PropTypes.func.isRequired };

const ReassignHitDrawerContent = ({
  closeDrawer,
  handleBackBtn,
  shiftData,
  headerTitle,
  loading,
  callbackUponReassignHit,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const { getNewApiController } = useApiControllers();

  const currentStandardDate = dayjs(dayjsWithTimezone().format('YYYY-MM-DD')); // date of franchise timezone as per DLS enabled or not

  /**
   * The window of routes offered — **anchored on the visit, not on today.**
   *
   * It was `today … today + 6d` regardless of the visit being placed, and on the canonical demo
   * that window *excluded the visit's own date*: a visit missed on 23 Aug opened a picker
   * offering 25–31 Aug. So the most likely correct answer — a route on or near the day the work
   * was actually due — was the one thing not on screen, and nothing explained why.
   *
   * Now it opens on the visit's own date and runs a week from there. A missed visit is usually
   * in the past, and `minDate` still forbids booking backwards, so the start is clamped to today
   * — which means for an old miss the window is `today … +6d` exactly as before, and for a
   * recent one it now contains the day the planner is thinking about.
   */
  const visitDate = shiftData?.startsAt ? dayjs(shiftData.startsAt) : null;
  const windowStart =
    visitDate?.isValid() && visitDate.isAfter(currentStandardDate)
      ? dayjs(visitDate.format('YYYY-MM-DD'))
      : currentStandardDate;
  const [selectedDates, setSelectedDates] = useState([
    windowStart,
    windowStart.add(6, 'day').endOf('day'),
  ]);
  const [queryParams, setQueryParams] = useState({
    search: '',
    selectedOfficers: [],
  });
  const [runsheetList, setRunsheetList] = useState(null);
  const [runsheetTotal, setRunsheetTotal] = useState(null);
  const [officersList, setOfficersList] = useState();
  const [selectedRunsheet, setSelectedRunsheet] = useState(null);

  /**
   * The search is **one filter, not two.**
   *
   * This handler used to narrow `runsheetList` in place *and* `filteredRunsheetList` re-filtered
   * the result by the same string — the same query applied twice through two mechanisms, with
   * the fetched list overwritten as a side effect of typing. `runsheetListOriginal` existed only
   * to undo that. Now the query is state and the filtering happens once, at render.
   */
  const onChangeSearch = (e) => {
    setQueryParams((prev) => ({ ...prev, search: e.target?.value || '' }));
  };
  const handleChangeSelectedOfficers = (e) => {
    setQueryParams((prev) => ({
      ...prev,
      selectedOfficers: e.target?.value,
    }));
  };

  const selectDatesHandler = (dates) => {
    setSelectedDates([dates?.[0], dayjs(dates?.[1]).endOf('day')]);
  };

  const getRunsheetList = async ({ startsAt, endsAt, selectedOfficers }) => {
    const apiController = getNewApiController();
    try {
      setRunsheetList(undefined);
      const config = { signal: apiController.signal };

      const params = {
        startsAt: getCurrentTimeWithDisabledDlsInIso(startsAt),
        endsAt: getCurrentTimeWithDisabledDlsInIso(endsAt),
        officerId: selectedOfficers?.map((officer) => officer?.id),
      };

      const response = await fetchRunsheetList({
        params,
        config,
      });
      setRunsheetList(toRunsheetArray(response?.data));
      /* What the window holds, as opposed to what it sent — see `runsheetTotalCount`. */
      setRunsheetTotal(runsheetTotalCount(response?.data));
    } catch (err) {
      if (!apiController.signal.aborted) {
        setRunsheetList(null);
        toast.error(err?.message, {
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };
  const getOfficersList = async () => {
    try {
      setOfficersList(undefined);
      const response = await getVisitorsLoadsOfficersOptions();
      setOfficersList(response?.data?.officers || []);
    } catch (err) {
      setOfficersList(null);
    }
  };

  // get runsheets listing as per selected date range
  useEffect(() => {
    if (
      selectedDates[0] &&
      selectedDates[1] &&
      dayjs(selectedDates[0]).isValid() &&
      dayjs(selectedDates[1]).isValid()
    ) {
      getRunsheetList({
        startsAt: selectedDates[0],
        endsAt: selectedDates[1],
        selectedOfficers: queryParams?.selectedOfficers,
      });
    }
  }, [selectedDates[0], selectedDates[1], queryParams?.selectedOfficers]);

  // Get Officers List
  useEffect(() => {
    getOfficersList();
  }, []);

  /**
   * Picking a route **selects** it; the footer commits it.
   *
   * It used to open a `SweetAlertModal` on the row's click — a third layer over an already
   * two-layer drawer, whose copy named neither the visit nor the route ("Reassign this hit to
   * this runsheet?"), so the one moment that wanted specifics was the most generic screen in the
   * flow. It also made a single click on a row feel destructive, with no way to hold a candidate
   * while comparing it against the next one.
   *
   * Selection is now a state the list shows and the footer names. Clicking the selected row
   * again clears it, so the choice is reversible without leaving the screen.
   */
  const toggleRunsheetSelection = (runsheet) => {
    setSelectedRunsheet((current) => (current?.id === runsheet?.id ? null : runsheet));
  };

  const handleCancelConfirmationModal = () => {
    setSelectedRunsheet(null);
  };

  const [assigning, setAssigning] = useState(false);
  /* Seeded from the global, so a planner arriving from a screen that already loaded the SDK
     never sees a preparing state at all. */
  const [mapsReady, setMapsReady] = useState(() => Boolean(window.google?.maps));
  const handleMapsReady = useCallback(() => setMapsReady(true), []);

  const handleReassignHit = async () => {
    /* The commit is several awaits deep — a route calculation, then the write — so the footer
       has to say it is working or a slow network reads as a dead button. */
    setAssigning(true);
    try {
      // Start --> Creating path data
      const hitPayload = {
        endsAt: shiftData?.endsAt,
        hitId: shiftData?.hitId,
        name: shiftData?.hitName || shiftData?.name,
        startsAt: shiftData?.startsAt,
        position: shiftData?.position,
        siteName: shiftData?.siteName,
        siteImage: shiftData?.siteImage,
        start_location: shiftData?.position,
      };
      const startEndLocation = selectedRunsheet?.startEndLocation;
      const existingPathData = selectedRunsheet?.pathData || [];

      const updatedPathData =
        existingPathData.length === 0
          ? [
              startEndLocation, // start
              hitPayload, // middle
            ]
          : [...existingPathData, hitPayload];

      const waypoints = updatedPathData?.slice(1);

      const result = await calculateAndDisplayRouteUtils(updatedPathData?.[0], waypoints, t);

      let pathData = result?.visitSetPolyLines;
      if (selectedRunsheet?.startEndLocation?.id) {
        pathData = updateLastItemWithUniqueId(
          { pathData: pathData },
          selectedRunsheet?.startEndLocation?.id,
        );
      }
      // End --> Creating path data
      const payload = {
        runsheetDate: selectedRunsheet?.startsAt,
        hitId: shiftData?.hitId,
        siteId: shiftData?.siteId,
        hitRunsheetId: shiftData?.shiftActivityLogId
          ? shiftData?.shiftActivityLogId
          : shiftData?.runsheetId,
        pathData,
        missedHitId: shiftData?.missedHitId,
        startsAt: selectedRunsheet?.startsAt,
        endsAt: selectedRunsheet?.endsAt,
        activityLogId: selectedRunsheet?.activityLogId || null,
      };

      const res = await addMissedHitToRunsheet({
        runsheetId: selectedRunsheet?.id,
        payload,
      });

      setAssigning(false);
      handleCancelConfirmationModal();
      handleBackBtn();
      callbackUponReassignHit?.();

      toaster.success({
        text: res?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } catch (error) {
      setAssigning(false);
      /* The selection survives a failed write. Clearing it made a network error look like the
         planner's choice had been rejected, and cost them the row they had just found. */
      toaster.error({
        text: error?.message || error?.e,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const loadedRunsheets = Array.isArray(runsheetList) ? runsheetList : [];
  const search = (queryParams?.search || '').toLowerCase();
  const filteredRunsheetList = search
    ? loadedRunsheets.filter((runsheet) => runsheet?.name?.toLowerCase()?.includes(search))
    : loadedRunsheets;

  /**
   * **Two empty states, because they have two different fixes.**
   *
   * The old screen had one condition (`runsheetList?.length === 0`) and it could never be true,
   * so a search matching nothing rendered *nothing at all* — no rows and no explanation. These
   * separate the window having no routes in it (widen the dates) from the query matching none of
   * the routes it does have (clear the search).
   */
  const hasLoaded = Array.isArray(runsheetList);
  const noRoutesInWindow = hasLoaded && loadedRunsheets.length === 0;
  /* Only when the response actually said there are more than it sent. */
  const truncated =
    runsheetTotal !== null && loadedRunsheets.length > 0 && runsheetTotal > loadedRunsheets.length;
  const noRoutesMatchSearch =
    hasLoaded && loadedRunsheets.length > 0 && !filteredRunsheetList.length;

  return (
    <>
      <PatrolHeader
        {...{
          handleBackBtn,
          shiftData,
          subTitleText: shiftData?.hitName || shiftData?.name,
          closeDrawer,
          headerTitle,
          loading,
        }}
      />

      {/* Body */}
      <Box className={classes.drawerInnerNew}>
        {/* **No `PLACING` card.** It quoted the visit — site, window, and the route it was
            missed from — above the controls, on the argument that you should not have to choose a
            route for something you can no longer see. Removed on instruction. The header's own
            subtitle still carries the visit's kind, window and date, so the *identity* of what is
            being placed is not gone; what is gone is the site name, which lived only here. */}
        <Box className={classes.drawerBodyTop}>
          <Typography variant="h5" className={classes.drawerBodyTitle}>
            {t('obx.schedules.dutyDetail.reassignHit.description', {
              runsheet: getLabel('terms', 'runsheet', t),
              hit: getLabel('terms', 'hit', t),
            })}
          </Typography>
          <Box className={classes.drawerDateRange}>
            <InputLabel htmlFor="start-date">
              {t('obx.schedules.dutyDetail.reassignHit.selectDatesLabel')}
            </InputLabel>
            <DateRangePickerWithButtons
              className={classes.drawerDateRangePicker}
              placeHolder="MM/DD/YYYY - MM/DD/YYYY"
              selectedDates={selectedDates}
              setDates={selectDatesHandler}
              minDate={currentStandardDate}
            />
          </Box>
          <Box className={classes.drawerFilters}>
            <SearchComponent
              className={classes.searchComponent}
              placeholder={t('obx.schedules.dutyDetail.reassignHit.searchPlaceholder', {
                runsheet: getLabel('terms', 'runsheet', t),
              })}
              onSearch={onChangeSearch}
            />

            <CustomDropDown
              label={t('obx.schedules.dutyDetail.reassignHit.officersLabel', {
                officers: getLabel('terms', 'officers', t),
              })}
              name="officers"
              options={transformArrayForOptions(officersList, 'name', 'id')}
              selectedValues={queryParams?.selectedOfficers}
              handleChange={handleChangeSelectedOfficers}
              multiSelect={true}
              checkmark={true}
              searchable={true}
              searchPlaceholder={t(
                'obx.schedules.dutyDetail.reassignHit.officersSearchPlaceholder',
                { officer: getLabel('terms', 'officer', t) },
              )}
              clearAll
            />
          </Box>
        </Box>

        <Box className={classes.drawerBody}>
          {runsheetList === undefined && (
            <Box className={classes.loaderBox}>
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
            </Box>
          )}

          {/**
           * **The page boundary, stated.**
           *
           * The response carries `pagination.totalCount` and no caller has ever read it, so a
           * franchise with more routes than fit one page showed the first page and said nothing —
           * the rest were unreachable and invisible, which is the kind of limit a planner
           * discovers by being wrong. Nothing here requests page two (see `runsheetTotalCount`
           * for why inventing that param was the wrong call); it names the limit and points at
           * the two controls that genuinely narrow the set.
           */}
          {truncated ? (
            <Typography variant="body3" className={classes.routeTruncated}>
              {t('obx.schedules.dutyDetail.reassignHit.showingOf', {
                shown: loadedRunsheets.length,
                total: runsheetTotal,
                runsheets: getLabel('terms', 'runsheets', t).toLowerCase(),
              })}
            </Typography>
          ) : null}

          {/* The window has no routes at all — the fix is the date range above. */}
          {noRoutesInWindow && <NoRunsheetFound />}

          {/* The window has routes and the query matches none of them — a different fix, and
              previously no message at all. */}
          {noRoutesMatchSearch && (
            <Typography variant="body3" className={classes.routeEmptySearch}>
              {t('obx.schedules.dutyDetail.reassignHit.noSearchMatch', {
                runsheets: getLabel('terms', 'runsheets', t).toLowerCase(),
              })}
            </Typography>
          )}

          {filteredRunsheetList?.map((runsheet, index) => {
            const assignee = runsheetAssignee(runsheet);
            /* The route's own stop count, which the payload has carried all along under `hits`
               and no row has ever shown. It is the closest thing to a capacity signal this
               endpoint gives, and "how much is already on this route" is the question a planner
               is actually answering when they pick one. */
            const stops = Number.isFinite(Number(runsheet?.hits)) ? Number(runsheet.hits) : null;
            /* Whether this route falls on the day the visit was originally due. The likeliest
               right answer, and previously something the planner had to work out by reading
               dates off every row. */
            const sameDay =
              visitDate?.isValid() &&
              runsheet?.startsAt &&
              dayjs(runsheet.startsAt).isSame(visitDate, 'day');
            const isSelected = selectedRunsheet?.id === runsheet?.id;

            return (
              <Box
                key={runsheet?.id ?? index}
                component="button"
                type="button"
                aria-pressed={isSelected}
                className={`${classes.reassignHit} ${isSelected ? classes.reassignHitSelected : ''}`}
                onClick={() => toggleRunsheetSelection(runsheet)}
              >
                <Box className={classes.reassignHitHead}>
                  <Typography variant="h5" className={classes.reassignHitTitle}>
                    {runsheet?.name}
                  </Typography>
                  {sameDay ? (
                    <Chip
                      size="small"
                      className={classes.reassignHitSameDay}
                      label={t('obx.schedules.dutyDetail.reassignHit.sameDay')}
                    />
                  ) : null}
                  {/* The meta shares the name's line and is pushed to the right edge, rather
                      than sitting on a second one. Two lines per route made seven routes fill
                      the pane; one line fits about thirteen, which is what "the route data is
                      too much" was actually about once the 2s SDK fetch was off the open. The
                      name still leads and still carries the weight — what changed is that the
                      facts qualifying it no longer cost a row each. */}
                  <Box className={classes.reassignHitMeta}>
                    {runsheet?.startsAt ? (
                      <>
                        <Typography variant="subtitle4" className={classes.reassignHitText}>
                          <DisplayDateTimeRange
                            startsAt={runsheet?.startsAt}
                            endsAt={runsheet?.endsAt}
                          />
                        </Typography>
                        <DotIcon />
                      </>
                    ) : null}
                    {stops !== null ? (
                      <>
                        <Typography variant="subtitle4" className={classes.reassignHitText}>
                          {t('obx.schedules.dutyDetail.reassignHit.stopCount', { count: stops })}
                        </Typography>
                        {assignee ? <DotIcon /> : null}
                      </>
                    ) : null}
                    {assignee ? (
                      <Box className={classes.reassignHitUser}>
                        <Avatar alt={assignee.name} src={assignee.image || undefined} />
                        <Typography variant="subtitle3">{assignee.name}</Typography>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/**
         * The commit, **in the drawer rather than in a modal over it.**
         *
         * This replaces `SweetAlertModal`. The modal was a third layer, it named neither the
         * visit nor the route, and it turned a click on a row into something that felt
         * destructive. A footer that appears when a route is chosen says exactly what is about
         * to happen, in the surface where both halves of it are still visible.
         *
         * It is only mounted once something is selected, so the list keeps its full height while
         * the planner is still looking.
         */}
        {/* Fetches while the planner reads the footer below it. Mounted with the selection, so
            an unopened picker costs nothing. */}
        {selectedRunsheet ? <MapsPrefetch onReady={handleMapsReady} /> : null}

        {selectedRunsheet ? (
          <Box className={classes.assignFooter}>
            <Typography variant="body3" className={classes.assignFooterText}>
              {t('obx.schedules.dutyDetail.reassignHit.assignSummary', {
                site: shiftData?.siteName || shiftData?.name,
                runsheet: selectedRunsheet?.name,
              })}
            </Typography>
            <Box className={classes.assignFooterActions}>
              <Button
                variant="secondaryGrey"
                disableRipple
                onClick={handleCancelConfirmationModal}
                disabled={assigning}
              >
                {t('obx.buttons.cancel')}
              </Button>
              <Button
                variant="primary"
                disableRipple
                onClick={handleReassignHit}
                disabled={assigning || !mapsReady}
              >
                {/* Three states, and the middle one is the point: the commit needs the Maps SDK
                    for the route's polyline, so if the planner beats the fetch the button says
                    what it is waiting for instead of throwing on a missing global. */}
                {assigning
                  ? t('obx.schedules.dutyDetail.reassignHit.assigning')
                  : mapsReady
                    ? t('obx.schedules.dutyDetail.reassignHit.assignConfirm')
                    : t('obx.schedules.dutyDetail.reassignHit.preparing')}
              </Button>
            </Box>
          </Box>
        ) : null}
      </Box>
    </>
  );
};

export default ReassignHitDrawerContent;

ReassignHitDrawerContent.propTypes = {
  closeDrawer: PropTypes.func,
  handleBackBtn: PropTypes.func,
  shiftData: PropTypes.object,
  headerTitle: PropTypes.string,
  loading: PropTypes.bool,
  callbackUponReassignHit: PropTypes.func,
};
