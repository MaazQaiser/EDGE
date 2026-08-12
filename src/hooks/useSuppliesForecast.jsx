import { useCallback, useEffect, useRef, useState } from 'react';
import { appendDefaultStartAndEndTimeWithDates } from 'src/app/obx/pages/schedules/helper';
import { downloadFileFromResponse } from 'src/helper/utilityFunctions';
import { getShiftHitsForecast, getSuppliesForecastPdf } from 'src/services/runsheet.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

const FORECAST_PDF_FILE_NAME = 'Supplies_Forecast.pdf';

// Convert the selected date range to windowStart/windowEnd the same way the rest of the app
// does (time-off request, attendance, payroll) — via the shared franchise helper.
const toForecastWindow = (windowStart, windowEnd) => {
  const [start, end] = appendDefaultStartAndEndTimeWithDates([windowStart, windowEnd]);
  return { windowStart: start, windowEnd: end };
};

const useSuppliesForecast = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const forecastAbortRef = useRef(null);

  // Abort any in-flight forecast request on unmount.
  useEffect(() => () => forecastAbortRef.current?.abort(), []);

  const fetchForecast = useCallback(async ({ windowStart, windowEnd }) => {
    // Cancel a previous in-flight forecast call before starting a new one.
    forecastAbortRef.current?.abort();
    const controller = new AbortController();
    forecastAbortRef.current = controller;

    setLoading(true);
    try {
      const response = await getShiftHitsForecast(toForecastWindow(windowStart, windowEnd), {
        signal: controller.signal,
      });
      if (!controller.signal.aborted) setData(response);
    } catch (e) {
      // A cancelled request is expected — don't surface it as an error.
      if (!controller.signal.aborted) {
        toaster.error({
          text: e?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  const downloadForecastPdf = useCallback(async ({ type, windowStart, windowEnd }) => {
    setPdfDownloading(true);
    try {
      const payload = { type, ...toForecastWindow(windowStart, windowEnd) };
      const response = await getSuppliesForecastPdf(payload);
      const url = response?.data?.url;
      if (url) {
        const pdfResponse = await fetch(url);
        if (!pdfResponse.ok) throw new Error(pdfResponse.statusText);
        const pdfBlob = await pdfResponse.blob();
        downloadFileFromResponse(pdfBlob, FORECAST_PDF_FILE_NAME);
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setPdfDownloading(false);
    }
  }, []);

  return { data, loading, fetchForecast, pdfDownloading, downloadForecastPdf };
};

export default useSuppliesForecast;
