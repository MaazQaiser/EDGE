import { Button } from '@mui/material';
import { ReactComponent as DownloadIcon } from 'assets/svg/DownloadIcon.svg?react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { getCSVData } from 'src/services/reports.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

/**
 
 *
 * @param {Array} dates
 * @param {String} test 
 * @return Component
 */

const currentDate = dayjs();
const weekLateDate = dayjs().add(7, 'day');

const CSVDownload = ({ dates, text }) => {
  const csvRef = useRef(null);
  const [dateRange, setDateRange] = useState([currentDate, weekLateDate]);
  const [csvPayload, setCSVPayload] = useState(null);
  const [loading, setLoading] = useState(false);

  const downloadCSV = async () => {
    try {
      setLoading(true);
      const data = await getCSVData({
        windowEnd: dateRange[1].utc().format(),
        windowStart: dateRange[0].utc().format(),
      });

      setCSVPayload(data.data);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (csvPayload) {
      csvRef.current.link.click();
      setLoading(false);
    }
  }, csvPayload);

  useEffect(() => {
    dates && setDateRange(dates);
  }, [dates]);

  return (
    <>
      <CSVLink filename="shift-report.csv" ref={csvRef} data={csvPayload || []}></CSVLink>
      <Button
        onClick={downloadCSV}
        variant="secondaryGrey"
        disabled={loading}
        startIcon={<DownloadIcon style={{ color: loading ? '#D0CFD2' : '#6A6A70' }} />}
      >
        {text}
      </Button>
    </>
  );
};

CSVDownload.propTypes = {
  dates: PropTypes.array,
  text: PropTypes.string,
};

export default CSVDownload;
