import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Collapse, Divider, Skeleton, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useDateTime from 'src/hooks/useDateTime';
import { dayjsFormatsEnum } from 'src/utils/constants';

import { useStyles } from '../suppliesForecasting.styles';

const groupDetailsByDate = (details) => {
  const sorted = [...details].sort((a, b) =>
    a.startsAt < b.startsAt ? -1 : a.startsAt > b.startsAt ? 1 : 0,
  );

  const groupsByDate = {};

  sorted.forEach((item) => {
    const dateKey = item.startsAt.slice(0, 10);
    if (!groupsByDate[dateKey]) {
      groupsByDate[dateKey] = { dateKey, startsAt: item.startsAt, rows: [] };
    }
    groupsByDate[dateKey].rows.push(item);
  });

  return Object.values(groupsByDate);
};

const countDistinctJobs = (rows) => {
  const seen = {};
  rows.forEach((row) => {
    seen[row.name] = true;
  });
  return Object.keys(seen).length;
};

const DetailBreakdown = ({ details = [], loading = false }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const { formatDayjsDateTime } = useDateTime();

  const groups = useMemo(() => groupDetailsByDate(details), [details]);

  if (loading) {
    return <Skeleton className={classes.breakdownToggleSkeleton} />;
  }

  return (
    <Box>
      <Box className={classes.breakdownToggle} onClick={() => setExpanded((prev) => !prev)}>
        <Typography className={classes.breakdownToggleText}>
          {t('obx.schedules.forecasting.detailBreakdown')}
        </Typography>
        <KeyboardArrowDownIcon
          className={`${classes.breakdownCaret} ${expanded ? classes.breakdownCaretOpen : ''}`}
        />
      </Box>

      <Divider className={classes.breakdownDivider} />

      <Collapse in={expanded} unmountOnExit>
        {details.length > 0 && (
          <Box className={classes.breakdownTable}>
            <Box className={classes.columnsHeader}>
              <Typography className={classes.columnHeading}>
                {t('obx.schedules.forecasting.colProduct')}
              </Typography>
              <Typography className={classes.columnHeading}>
                {t('obx.schedules.forecasting.colQty')}
              </Typography>
              <Typography className={classes.columnHeading}>
                {t('obx.schedules.forecasting.colJob')}
              </Typography>
            </Box>

            {groups.map((group) => (
              <Box key={group.dateKey}>
                <Box className={classes.dateGroupHeader}>
                  <Typography className={classes.dateGroupTitle}>
                    {formatDayjsDateTime({
                      value: group.startsAt,
                      formatType: dayjsFormatsEnum.dateHeader,
                    })}
                  </Typography>
                  <Typography className={classes.dateGroupCount}>
                    {`· ${t('obx.schedules.forecasting.jobsPerDay', {
                      count: countDistinctJobs(group.rows),
                    })}`}
                  </Typography>
                </Box>

                {group.rows.map((row, index) => (
                  <Box key={`${group.dateKey}-${index}`} className={classes.detailRow}>
                    <Box className={classes.productPill}>{row.productName}</Box>
                    <Typography className={classes.rowQty}>{row.quantity}</Typography>
                    <Typography className={classes.rowJob}>
                      {`${formatDayjsDateTime({ value: row.startsAt })} - ${formatDayjsDateTime({ value: row.endsAt })} · ${row.name}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

DetailBreakdown.propTypes = {
  details: PropTypes.arrayOf(
    PropTypes.shape({
      startsAt: PropTypes.string,
      endsAt: PropTypes.string,
      name: PropTypes.string,
      productName: PropTypes.string,
      quantity: PropTypes.number,
    }),
  ),
  loading: PropTypes.bool,
};

export default DetailBreakdown;
