import { useSelector } from 'react-redux';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { dayjsFormatsEnum } from 'src/utils/constants';

// If we get 12hrs from BE then we will show time format in 12 hours and if we receive 24hrs we show date in 24 hours format
const useDateTime = () => {
  const userTimeFormat =
    useSelector((state) => {
      return state?.auth?.timeFormat;
    }) || '12hrs';

  const dateformat =
    useSelector((state) => state?.auth?.countryConfiguration?.dateFormat?.toUpperCase()) ||
    'YYYY-MM-DD';

  let is24Hours = userTimeFormat === '24hrs';

  let timeFormatType = is24Hours ? 'HH:mm' : 'hh:mm a';

  let dateTimeFormat = `${dateformat}, ${timeFormatType}`;

  let monDY = 'MMM DD, YYYY';

  let dayMonDY = 'dddd MMM D, YYYY';

  let dateSlash = 'MM/DD/YYYY';

  const timeFormat = (value) => {
    value = dayjsWithStandardOffset(value);
    const minutes = value.minute();
    const timeFormat = is24Hours
      ? 'HH:mm' // Always same for 24-hour format
      : minutes === 0
        ? 'ha'
        : 'h:mma';

    const formatted = value.format(timeFormat);
    return is24Hours ? formatted : formatted.replace('m', '');
  };

  const formatDayjsDateTime = ({
    formatType = dayjsFormatsEnum.time,
    value,
    bypassFranchiseTimezone = false,
  }) => {
    value = value
      ? dayjsWithStandardOffset(value, bypassFranchiseTimezone)
      : dayjsWithStandardOffset();

    switch (formatType) {
      case dayjsFormatsEnum.time:
        return timeFormat(value);

      case dayjsFormatsEnum.dateTime: {
        return value?.format(`${dateTimeFormat}`);
      }

      case dayjsFormatsEnum.date: {
        return value?.format(`${dateformat}`);
      }

      case dayjsFormatsEnum.monDY: {
        return value?.format(`${monDY}`);
      }

      case dayjsFormatsEnum.dayMonDY: {
        return value?.format(`${dayMonDY}`);
      }

      case dayjsFormatsEnum.dateSlash: {
        return value?.format(`${dateSlash}`);
      }

      default:
        return value?.format(`${dateformat}`);
    }
  };

  return {
    timeFormat,
    formatDayjsDateTime,
    is24Hours,
    dateformat,
    dateTimeFormat,
    timeFormatType,
  };
};

export default useDateTime;
