import { Box } from '@mui/material';
import { ReactComponent as ReportSignalLogo } from 'assets/svg/ReportSignalLogo.svg?react';
import React from 'react';

import { useStyles } from './header';

const ReportHeader = () => {
  const classes = useStyles();

  // const { t } = useTranslation();
  return (
    <Box className={classes.header}>
      <Box className={classes.pageWidth}>
        <Box className={classes.headerWrapper}>
          <Box>
            <ReportSignalLogo />
          </Box>
          {/*<Box>*/}
          {/*  <SearchComponentWithQuery*/}
          {/*    placeHolder={`${t('reportProblem.search')}`}*/}
          {/*    className="searchWidth"*/}
          {/*    //   onSearch={handleSearch}*/}
          {/*  />*/}
          {/*</Box>*/}
        </Box>
      </Box>
    </Box>
  );
};

export default ReportHeader;
