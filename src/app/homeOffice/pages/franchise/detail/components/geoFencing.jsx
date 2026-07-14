import PropTypes from 'prop-types';
import { isObjectEmpty } from 'src/helper/utilityFunctions';

import MapComponent from '../../../../../components/common/geoFencing';

export default function GeoFencing({ franchiseArea }) {
  const showMap =
    franchiseArea?.franchiseArea?.length || !isObjectEmpty(franchiseArea?.franchiseLocation);
  return (
    <>
      {showMap && (
        <MapComponent
          franchiseFormKey="franchiseArea"
          formDataKey={''}
          setErrorMessages={() => {}}
          errorMessages={{}}
          updateFormHandler={() => {}}
          franchiseArea={franchiseArea}
          createOrUpdate={false}
          mapCenter={franchiseArea?.franchiseLocation}
        />
      )}
    </>
  );
}

GeoFencing.propTypes = {
  franchiseArea: PropTypes.object,
};
