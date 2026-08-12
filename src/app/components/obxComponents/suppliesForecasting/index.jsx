import DownloadIcon from '@mui/icons-material/Download';
import { Box, Button, Divider, IconButton, Skeleton, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DateRangePicker from 'src/app/components/common/RangeDatepicker';
import DetailDrawer from 'src/app/components/common/rightDrawer';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { ReactComponent as CloseIcon } from 'src/assets/svg/close.svg';
import useSuppliesForecast from 'src/hooks/useSuppliesForecast';

import DetailBreakdown from './components/detailBreakdown';
import QuantitiesSummary from './components/quantitiesSummary';
import { useStyles } from './suppliesForecasting.styles';

const DRAWER_WIDTH = '680px';
const DEFAULT_WINDOW_DAYS = 7;
const MAX_WINDOW_DAYS = 30;
// PDF type param for the scheduling /pdf endpoint (fixed for this feature)
const FORECAST_PDF_TYPE = 'suppliesForecast';

const SuppliesForecastingDrawer = ({ open, onClose }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data, loading, fetchForecast, pdfDownloading, downloadForecastPdf } =
    useSuppliesForecast();

  // Selectable window: today → today + 29 days (30-day window incl. today), FRANCHISE timezone.
  // Default range: today → today + 6 days (7-day window incl. today).
  const today = dayjsWithStandardOffset().startOf('day');
  const minDate = today;
  const maxDate = today.add(MAX_WINDOW_DAYS - 1, 'day').endOf('day');

  const [dates, setDates] = useState([today, today.add(DEFAULT_WINDOW_DAYS - 1, 'day')]);

  // Key the fetch effect on the date VALUES (not the array reference), so the range picker
  // re-emitting the same dates with a new array on mount doesn't trigger a duplicate fetch.
  const windowKey = `${dates?.[0]?.valueOf() ?? ''}_${dates?.[1]?.valueOf() ?? ''}`;

  useEffect(() => {
    if (!open || !dates?.[0] || !dates?.[1]) return;
    fetchForecast({ windowStart: dates[0], windowEnd: dates[1] });
  }, [open, windowKey, fetchForecast]);

  const shouldDisableDate = (date) => date.isBefore(minDate, 'day') || date.isAfter(maxDate, 'day');

  const quantities = data?.quantities || [];
  const details = data?.details || [];
  const totalJobCount = data?.totalJobCount || 0;
  const showBreakdown = loading || quantities.length > 0;

  return (
    <DetailDrawer open={open} position="right" onClose={onClose} width={DRAWER_WIDTH}>
      <Box className={classes.drawerRoot}>
        {/* Header */}
        <Box className={classes.header}>
          <Box className={classes.headerTextWrap}>
            <Typography variant="h3" className={classes.heading}>
              {t('obx.schedules.forecasting.heading')}
            </Typography>
            <Typography variant="body1" className={classes.subheading}>
              {t('obx.schedules.forecasting.subheading')}
            </Typography>
          </Box>
          <IconButton className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Body */}
        <Box className={classes.body}>
          <Box>
            <Typography className={classes.sectionLabel}>
              {t('obx.schedules.forecasting.dateLabel')}
            </Typography>
            <Box className={classes.datePickerWrapper}>
              <DateRangePicker
                selectedDates={dates}
                setDates={setDates}
                format="MM/DD/YYYY"
                minDate={minDate}
                maxDate={maxDate}
                shouldDisableDate={shouldDisableDate}
              />
            </Box>

            {loading ? (
              <Skeleton className={classes.jobsCountSkeleton} />
            ) : (
              <Typography className={classes.jobsCount}>
                <span className={classes.jobsCountStrong}>{totalJobCount}</span>{' '}
                {t('obx.schedules.forecasting.jobsInPeriod')}
              </Typography>
            )}

            <Divider className={classes.divider} />
          </Box>

          <QuantitiesSummary quantities={quantities} loading={loading} />

          {showBreakdown && (
            <Box className={classes.breakdownSection}>
              <DetailBreakdown details={details} loading={loading} />
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box className={classes.footer}>
          <Button
            variant="secondaryGrey"
            className={classes.viewPdfButton}
            startIcon={<DownloadIcon />}
            disabled={loading || !data || pdfDownloading}
            onClick={() =>
              downloadForecastPdf({
                type: FORECAST_PDF_TYPE,
                windowStart: dates[0],
                windowEnd: dates[1],
              })
            }
          >
            {t('obx.schedules.forecasting.downloadPdf')}
          </Button>
        </Box>
      </Box>
    </DetailDrawer>
  );
};

SuppliesForecastingDrawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default SuppliesForecastingDrawer;
