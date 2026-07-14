import { Box, Skeleton } from '@mui/material';
import React, { Suspense, useState } from 'react';

import classes from './appMain.module.scss';
import RouterConfig from './routerConfig';
const Sidebar = React.lazy(() => import('./sideBar'));
const Navbar = React.lazy(() => import('./navBar/navBar'));

export default function AppMain() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarTransformed, setIsSidebarTransformed] = useState(false);

  const sidebarCollapseHandler = () => {
    setIsCollapsed((prevState) => {
      return !prevState;
    });
  };

  const toggleSidebarTransformHandler = () => {
    setIsSidebarTransformed((prevState) => {
      return !prevState;
    });
  };

  let content = (
    <>
      <Box className={classes.dashboardContainer}>
        <Suspense fallback={<Skeleton variant="rect" width={'100vw'} height={'100vh'} />}>
          <Sidebar
            className={classes.sidebarMain}
            toggleSidebar={sidebarCollapseHandler}
            isCollapsed={isCollapsed}
            isSidebarTransformed={isSidebarTransformed}
            transformSidebar={setIsSidebarTransformed.bind(null, false)}
          />
          <div className={classes.dashboardContentContainer} data-simplebar>
            <Navbar
              toggleSidebarTransform={toggleSidebarTransformHandler}
              isTransformed={isSidebarTransformed}
              toggleSidebar={sidebarCollapseHandler}
              isCollapsed={isCollapsed}
            />
            <RouterConfig />
          </div>
        </Suspense>
      </Box>
    </>
  );

  return content;
}
