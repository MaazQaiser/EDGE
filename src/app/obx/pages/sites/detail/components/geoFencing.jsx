import PropTypes from 'prop-types';
import { useMemo } from 'react';

import MapComponent from '../../../../../components/common/geoFencing';
export default function GeoFencing({ data }) {
  const mappedData = useMemo(() => {
    return {
      ...data,
      coordinates: data?.siteArea,
    };
  }, [JSON.stringify(data)]);
  return (
    <>
      {mappedData?.coordinates?.length > 0 && (
        <MapComponent
          franchiseFormKey="franchiseArea"
          setErrorMessages={() => {}}
          errorMessages={{}}
          updateFormHandler={() => {}}
          franchiseArea={mappedData}
          createOrUpdate={false}
        />
      )}
    </>
  );
}
GeoFencing.propTypes = {
  data: PropTypes.object,
};
