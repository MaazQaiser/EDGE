import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import React, { useState } from 'react';

import { useStyles } from './scoreCard';
const data = [
  {
    completionRate: '96%',
    period: 'May 1 - 6 • Week 1',
    progressData: { value: 70, color: '#31A150', label: 'Tours/Patrols', count: '36/40' },
  },
  {
    completionRate: '96%',
    period: 'May 1 - 6 • Week 1',
    progressData: { value: 50, color: '#F4780B', label: 'Tours/Patrols', count: '36/40' },
  },
  {
    completionRate: '96%',
    period: 'May 1 - 6 • Week 1',
    progressData: { value: 25, color: '#146DFF', label: 'Tours/Patrols', count: '36/40' },
  },
  {
    completionRate: '96%',
    period: 'May 1 - 6 • Week 1',
    progressData: { value: 25, color: '#146DFF', label: 'Tours/Patrols', count: '36/40' },
  },
  {
    completionRate: '96%',
    period: 'May 1 - 6 • Week 1',
    progressData: { value: 25, color: '#146DFF', label: 'Tours/Patrols', count: '36/40' },
  },
  {
    completionRate: '96%',
    period: 'May 1 - 6 • Week 1',
    progressData: { value: 25, color: '#146DFF', label: 'Tours/Patrols', count: '36/40' },
  },
];
const progressData = [
  { value: 70, color: '#31A150', label: 'Tours/Patrols', count: '36/', countSecond: '40' },
  { value: 50, color: '#F4780B', label: 'Tours/Patrols', count: '36/', countSecond: '40' },
  { value: 25, color: '#146DFF', label: 'Tours/Patrols', count: '36/', countSecond: '40' },
];

function CircularProgressWithLabel(props) {
  const classes = useStyles();
  return (
    <Box className={classes.progressbarWithlabel}>
      <CircularProgress
        thickness={4}
        variant="determinate"
        value={100}
        {...props}
        className={classes.backgroundProgress}
      />
      <CircularProgress
        variant="determinate"
        value={50}
        thickness={4}
        className={classes.foregroundProgress}
      />
      <Box className={classes.circularBarFunction}>
        <Typography variant="body3">50%</Typography>
      </Box>
    </Box>
  );
}
const ScoreCard = () => {
  const [calendarView, setCalendarView] = useState('month'); // Initial selected value, e.g., 'week'
  const handleChangeCalenderView = (view) => () => {
    setCalendarView(view);
    // Handle other actions as needed
  };
  const classes = useStyles();
  const [_progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Box className={classes.mainScoreBoardWrapper}>
        <Box className={classes.sitesListingCommonContainer}>
          <Box className={classes.searchSectionDashboard}>
            <Box className={classes.searchSection}>
              <Box className={classes.typoBox}>
                <Typography variant="subtitle2" className={classes.scroreBoardContent}>
                  Overall Ratings
                </Typography>
                <Typography variant="h5" className={classes.scroreBoardContentText}>
                  93%
                </Typography>
              </Box>
              <Divider orientation="vertical" className={classes.verticalDivider} />
              <Box className={classes.typoBox}>
                <Typography variant="subtitle2" className={classes.scroreBoardContent}>
                  Completed Patrols
                </Typography>
                <Typography variant="h5" className={classes.scroreBoardContentText}>
                  93%
                </Typography>
              </Box>
              <Divider orientation="vertical" className={classes.verticalDivider} />
              <Box className={classes.typoBox}>
                <Typography variant="subtitle2" className={classes.scroreBoardContent}>
                  Checkpoints
                </Typography>
                <Typography variant="h5" className={classes.scroreBoardContentText}>
                  93%
                </Typography>
              </Box>
              <Divider orientation="vertical" className={classes.verticalDivider} />
              <Box className={classes.typoBox}>
                <Typography variant="subtitle2" className={classes.scroreBoardContent}>
                  Inspection Report
                </Typography>
                <Typography variant="h5" className={classes.scroreBoardContentText}>
                  93%
                </Typography>
              </Box>
            </Box>

            <>
              <ToggleButtonGroup
                onChange={handleChangeCalenderView}
                exclusive
                value={calendarView}
                className={classes.calendarHeaderToolbarToggle}
              >
                <ToggleButton className={classes.calendarHeaderToolbarToggleBtn} value="week">
                  Week
                </ToggleButton>
                <ToggleButton className={classes.calendarHeaderToolbarToggleBtn} value="month">
                  Month
                </ToggleButton>
              </ToggleButtonGroup>
            </>
          </Box>
        </Box>
        <Box>
          <Box className={classes.calendarDescription}>
            {data.map((item, index) => (
              <Box key={index} className={classes.calendarDescriptionBox}>
                <Box className={classes.borderClass}>
                  <Box className={classes.innerDescriptionBox}>
                    <Box className={classes.completionRateContent}>
                      <Typography variant="subtitle2" className={classes.completionText}>
                        Completion Rate
                      </Typography>
                      <Typography variant="h4" className={classes.completionTextOne}>
                        {item.period}
                      </Typography>
                    </Box>
                    <Typography variant="h3" className={classes.percerntageText}>
                      {item.completionRate}
                    </Typography>
                  </Box>
                </Box>
                <Box className={classes.circularProgressBarWrapper}>
                  {progressData.map((item, index) => (
                    <Box key={index} className={classes.progressBox}>
                      <Box className={classes.progressDescription}>
                        <CircularProgressWithLabel
                          sx={{ color: item.color }}
                          value={{ value: item.value }}
                        />
                        <Typography variant="subtitle2">{item.label}</Typography>
                      </Box>
                      <Box className={classes.combinationTypoBox}>
                        <Typography variant="body2" className={classes.countFirstFigure}>
                          {item.count}
                        </Typography>
                        <Typography variant="body2" className={classes.countSecondFigure}>
                          {item.countSecond}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box className={classes.mainLastContent}>
                  <Typography variant="subtitle3" className={classes.commentTypo}>
                    Comments
                  </Typography>
                  <Typography variant="body2" className={classes.prgressTypo}>
                    Good progress overall. Reliable, dedicated, and trustworthy
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ScoreCard;
