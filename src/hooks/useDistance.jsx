import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { distanceUnitEnums } from 'src/utils/constants';

const useDistance = () => {
  const { t } = useTranslation();
  const distanceUnit = useSelector((state) => state?.auth?.countryConfiguration?.distanceUnit);

  const isKilometers = distanceUnit === distanceUnitEnums.KILOMETERS;

  const unitConfig = {
    [distanceUnitEnums.KILOMETERS]: {
      convert: (meters) => (meters / 1000).toFixed(1) || 0,
      short: t('obx.schedules.dutyDetail.runsheetDetail.kilometersUnit'),
      long: t('commonText.kilometers'),
    },
    [distanceUnitEnums.MILES]: {
      convert: (meters) => (meters * 0.00062137119223733).toFixed(1) || 0,
      short: t('obx.schedules.dutyDetail.runsheetDetail.milesUnit'),
      long: t('commonText.miles'),
    },
  };

  const { convert, short, long } =
    unitConfig[isKilometers ? distanceUnitEnums.KILOMETERS : distanceUnitEnums.MILES];

  // Get total distance and unit
  const getDistance = (meters, shortUnits = false) =>
    `${convert(meters)} ${shortUnits ? short : long}`;

  // Get distance value
  const getDistanceValue = (meters) => convert(meters);

  // Get distance short unit
  const getDistanceShortUnit = () => short;

  return { getDistance, getDistanceValue, getDistanceShortUnit };
};

export default useDistance;
