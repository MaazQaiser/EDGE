import PropTypes from 'prop-types';

import MapComponent from '../../../../../components/common/geoFencing';

export default function GeoFencing({ franchiseArea }) {
  return (
    <>
      {franchiseArea && franchiseArea?.length > 0 && (
        <MapComponent franchiseFormKey="franchiseArea" franchiseArea={franchiseArea} />
      )}
    </>
  );
}

GeoFencing.propTypes = {
  franchiseArea: PropTypes.object,
};
