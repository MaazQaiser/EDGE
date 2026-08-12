import PropTypes from 'prop-types';
import React from 'react';
import { getVisitActionRules } from 'src/app/obx/pages/schedules/helper/visitState';
import { ACL_OBX_SCHEDULES_UPDATE } from 'src/app/router/constant/OBXMODULE';
import userHasPermission from 'src/utils/auth/userHasPermission';

import RunsheetHits from '../../../runSheets/components/runsheetHits';
import VisitAssignment from './VisitAssignment';

/**
 * One visit, opened from the visits grid or a route's stop list.
 *
 * Ordered by the question being asked: whether anyone is coming for this visit
 * (and how to fix that if not), then the work itself.
 */
const HitDetail = ({
  shiftData,
  loading,
  callbackUponAssignment,
  onAssignToRoute,
  onAssignTour,
  onChangeRunsheet,
}) => {
  // One resolution of the rules for the whole drawer, so the body cannot offer an
  // action the header has just said is unavailable.
  const rules = getVisitActionRules(shiftData || {});

  return (
    <>
      <VisitAssignment
        visit={shiftData}
        loading={loading}
        onAssignToRoute={onAssignToRoute}
        onAssignTour={onAssignTour}
        onChangeRunsheet={onChangeRunsheet}
        canAssign={userHasPermission(ACL_OBX_SCHEDULES_UPDATE)}
      />
      <RunsheetHits
        hitDetails={shiftData}
        /* No status chip in this drawer. `VisitAssignment` above already names the
           state — with its tone, its explanation and its action — so a chip 300px
           lower repeated the same word twice ("Completed" over "Completed") and
           twice under a different name ("Scheduled" over "Not Started"). The
           column carries the visit's checkpoint count instead, which nothing else
           in the body states. The runsheet screens keep their chip: there is no
           callout there, so it is their only state signal. */
        hitStatus={null}
        fetchingHitLoading={loading}
        refetchData={callbackUponAssignment}
        readOnly={rules.isReadOnly}
      />
    </>
  );
};

export default HitDetail;

HitDetail.propTypes = {
  shiftData: PropTypes.object,
  loading: PropTypes.bool,
  callbackUponAssignment: PropTypes.func,
  onAssignToRoute: PropTypes.func,
  onAssignTour: PropTypes.func,
  onChangeRunsheet: PropTypes.func,
};
