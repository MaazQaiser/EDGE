import PropTypes from 'prop-types';
import React from 'react';

import RunsheetHits from '../../../runSheets/components/runsheetHits';

const HitDetail = ({ shiftData, loading, callbackUponAssignment }) => {
  return (
    <RunsheetHits
      hitDetails={shiftData}
      hitStatus={shiftData?.scheduleStatus || shiftData?.hitStatus}
      fetchingHitLoading={loading}
      refetchData={callbackUponAssignment}
    />
  );
};

export default HitDetail;

HitDetail.propTypes = {
  shiftData: PropTypes.object,
  loading: PropTypes.bool,
  callbackUponAssignment: PropTypes.func,
};
