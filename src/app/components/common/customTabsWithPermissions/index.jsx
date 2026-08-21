import { Tab } from '@mui/base/Tab';
import { TabPanel } from '@mui/base/TabPanel';
import { Tabs } from '@mui/base/Tabs';
import { TabsList } from '@mui/base/TabsList';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { COMMON_SETTING } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import ErrorBoundary from 'src/hoc/ErrorBoundary';
import userHasPermissionSideBar from 'src/utils/auth/userHasPermissionSideBar';

import NoRecordFound from '../table/noRecordFound';
import { useStyles } from './customTabsWithPermissions';

/**
 * `bypassPermissions` exists for the dev preview route only, and defaults to false so
 * every real caller behaves exactly as before. It is here because a role whose ACL
 * payload comes back empty gets an entirely blank Settings page — no tabs at all — and
 * there was no way to look at a settings screen without a working permission set.
 */
const settingsTabs = (data, _t, bypassPermissions = false) => {
  if (bypassPermissions) return data;

  return data.filter(
    (link) =>
      !!userHasPermissionSideBar(link.permission, link.activeModule, link.aclPermission) ||
      link.forOnlyHO,
  );
};

const useQuery = () => {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
};

/**
 * `basePath` is the route the tab strip writes its `activeTab` query onto. It defaults
 * to Settings, which is where every real caller lives; the dev preview passes its own so
 * clicking a tab does not navigate the page out from under itself.
 */
const CustomTabsWithPermissions = ({
  data,
  defaultTab = 0,
  bypassPermissions = false,
  basePath = COMMON_SETTING,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const query = useQuery();

  const activeTab = query.get('activeTab');

  const [tabs, setTabs] = useState([]);

  /* `tabs` is `[]` both before the filter has run and after it has removed everything, and
     those two states must not look the same — without this the empty message flashes on
     every mount before the real tabs appear. */
  const [resolved, setResolved] = useState(false);

  const [tabVal, setTabVal] = useState(0);

  const [innerTabVal, setInnerTabVal] = useState(0);

  /* The outer index the URL effect below last resolved to, so it can tell an actual tab
     change from one of its own unrelated re-runs. `null` means it has not run yet. */
  const previousTabRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setInnerTabVal(0);
    if (tabs[newValue]?.tabValue) {
      history.push(`${basePath}?activeTab=${tabs[newValue]?.tabValue}`);
      return;
    }
    setTabVal(newValue);
  };
  const handleChange = (event, newValue) => {
    setInnerTabVal(newValue);
  };

  const visibleComponents = useCallback(
    (data) =>
      data?.components?.filter(
        (link) =>
          bypassPermissions ||
          !!userHasPermissionSideBar(link.permission, link.activeModule, link.aclPermission),
      ),
    [bypassPermissions],
  );

  /* Plain functions rather than `useCallback`: both are invoked during render on every
     render, so memoising them saved nothing while the empty dependency arrays froze the
     `visibleComponents` and `classes` they close over. They also take the already
     filtered list instead of the raw tab, so the permission filter runs once per tab and
     the guard below can test the same array that is actually rendered. */
  /* Each panel is boundaried on its own. One settings screen that throws on mount used to
     unmount the whole app — `LoaderComponent`'s Lottie animation does exactly that while a
     panel is still fetching ("Cannot add property completed, object is not extensible"),
     which blanks the page and reads as a broken build rather than one broken screen. The
     boundary keeps the strip, the list and every other panel usable. */
  const panels = (visible) =>
    visible.map((b, i) => (
      <TabPanel key={i} value={i} className={classes.horizontalTabPanel}>
        <ErrorBoundary>{b?.component}</ErrorBoundary>
      </TabPanel>
    ));

  const tabsList = (visible) =>
    visible.map((b, i) => (
      <Tab value={i} key={i} className={classes.verticalTabsItems}>
        {b.title}
      </Tab>
    ));

  const tabsAndPanels = () => {
    return tabs?.map((data, index) => {
      /* Guard on the filtered length, not `data.components.length`. A role that can see
         the parent tab but none of its sub-items would otherwise get an empty `TabsList`
         and no panel at all, and because `{0 && <X/>}` renders a literal `0` in React,
         an empty `components` array would print a stray zero into the layout. */
      const visible = visibleComponents(data) ?? [];
      const hasVisibleComponents = visible.length > 0;

      return (
        <TabPanel key={index} value={index} index={index}>
          <Tabs
            value={innerTabVal}
            onChange={handleChange}
            orientation="vertical"
            className={classes.horizontalmainWrapper}
          >
            {hasVisibleComponents && (
              <TabsList className={classes.horizontalTabList}>{tabsList(visible)}</TabsList>
            )}

            {hasVisibleComponents && panels(visible)}

            {data?.component && (
              <TabPanel key={index} className={classes.horizontalTabComponent}>
                <ErrorBoundary>{data?.component}</ErrorBoundary>
              </TabPanel>
            )}
          </Tabs>
        </TabPanel>
      );
    });
  };

  useEffect(() => {
    const tabsData = settingsTabs(data, t, bypassPermissions);
    setTabs(tabsData);
    setResolved(true);

    /* Named in the console because the screen cannot name them: the message a user gets
       has to be about access, not about `settings.reportTemplates.view`. Whoever is asked
       to fix the role still needs the exact keys, and this is the only place that knows
       both the full list and which of it survived. */
    if (!tabsData.length && data?.length) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Settings] No tabs passed the permission filter. Keys checked:',
        data.map((tab) => tab?.aclPermission || '(none)'),
      );
    }
  }, [bypassPermissions]);

  useEffect(() => {
    setTabVal(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const getActiveIndex = tabs.findIndex((a) => a.tabValue == activeTab);
    const resolvedTab = getActiveIndex != -1 ? getActiveIndex : defaultTab;

    setTabVal(resolvedTab);

    /* `handleTabChange` clears the vertical selection when the user clicks a top-level
       tab, but a good deal of navigation never goes through it: the sidebar's Settings
       link is a plain URL (`COMMON_SETTING_PREFERENCES`), and so are browser Back/Forward
       and pasted deep links. Those changed `tabVal` here while leaving `innerTabVal`
       pointing at the previous tab's sub-item, so Back out of Harmonization landed on
       Preferences with its second item selected, and a tab that has one panel showed an
       empty pane because index 1 does not exist there.

       The comparison is against the last index this effect resolved, not a bare reset,
       because the effect also runs when `tabs` first populates and on every `query`
       change — resetting unconditionally would throw away a sub-tab the user had just
       picked. Only a genuine change of the outer tab clears it. */
    if (previousTabRef.current !== null && previousTabRef.current !== resolvedTab) {
      setInnerTabVal(0);
    }
    previousTabRef.current = resolvedTab;
  }, [query, activeTab, tabs, defaultTab]);

  /* A role can hold `settings.view` — enough for the sidebar link and the route guard —
     while holding none of the per-tab keys under it, which filtered every tab out and left
     a header, a hairline and nothing else. A blank page reads as a broken build, so it got
     reported as one repeatedly; this says what actually happened. */
  if (resolved && !tabs.length) {
    return (
      <Box className={classes.detailsnWrapper}>
        <NoRecordFound
          data={[]}
          type="listing"
          title={t('obx.settings.noAccessTitle')}
          description={t('obx.settings.noAccessText')}
        />
      </Box>
    );
  }

  return (
    <Box className={classes.detailsnWrapper}>
      <Box className={classes.detailsSplitWrapper}>
        <Box className={classes.rightSideArea}>
          <Tabs value={tabVal} onChange={handleTabChange} className={classes.tabWrapper}>
            <Box className={classes.tabListMainBox}>
              <TabsList className={classes.mainListTabs}>
                {tabs?.map((data, index) => {
                  return (
                    <Tab className={classes.tabItems} value={index} key={index}>
                      {data?.title}
                    </Tab>
                  );
                })}
              </TabsList>
            </Box>

            {tabsAndPanels()}
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
};
CustomTabsWithPermissions.propTypes = {
  bypassPermissions: PropTypes.bool,
  basePath: PropTypes.string,
  /* An array, and always has been — every caller passes one and `settingsTabs` filters
     it. `object` here made React warn on each of them. */
  data: PropTypes.array,
  currentTab: PropTypes.number,
  defaultTab: PropTypes.number,
};
export default CustomTabsWithPermissions;
