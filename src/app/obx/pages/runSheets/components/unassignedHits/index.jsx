import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';
import { ReactComponent as ArrowBack } from 'src/assets/svg/ArrowRightBlack.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useGetHits from 'src/hooks/useGetHits';
import { ADDED_HIT, SET_ENTIRE_STATE } from 'src/redux/reducers/runSheetReducer';
import { toastSettings } from 'src/utils/constants';
import { DRAWER_TYPE } from 'src/utils/constants/schedules';
import { toaster } from 'src/utils/toast';

import PatrolAssignTour from '../../../sites/detail/components/jobs/PatrolAssignTour';
import NewHitsAccordionListing from '../newHitsAccordionListing';
import NoTourTemplateModal from '../noTemplateAssignedModal';
import { useStyles } from './UnassignedHits';

const UnassignedHits = ({ state, dispatch, goBack, searchTerm = '', addHitToTheHitsList }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const _NA = t('commonText.nA');
  const classes = useStyles();
  const { hitsList, getHits, setHitsList, hitsLoading } = useGetHits(state, true);
  const [hitDetails, setHitDetails] = useState(null);
  const [openNoTourTemplateModal, setOpenNoTourTemplateModal] = useState(false);

  useEffect(() => {
    if (hitsList?.length) return;
    getHits();
  }, []);

  const [showDrawer, setShowDrawer] = useState({
    open: '',
    data: {},
  });

  const changeOnlyDrawerType = (value) => () => {
    setShowDrawer((prev) => ({ open: value, data: value ? prev?.data : null }));
  };

  const showSideDrawer = (value) => (data) => {
    setShowDrawer({ open: value, data: value ? data : null });
  };

  const handleShowTourAssignmentDrawer = (hitId) => {
    showSideDrawer(DRAWER_TYPE.TOUR_ASSIGNMENT)({
      id: hitId,
    });
  };

  const handleAction = async (hit) => {
    if (!hit?.tour) {
      setHitDetails(hit);
      setOpenNoTourTemplateModal(true);
      return;
    }
    try {
      let finalNewPayloadOnAddingHit = {
        ...state,
        visitSet: [...state.visitSet, { ...hit, status: ADDED_HIT }],
        pathData: [...state.pathData, { ...hit, status: ADDED_HIT }],
        isVisitsUpdated: true,
      };

      addHitToTheHitsList({ [hit?.siteName]: [hit] });
      dispatch({
        type: SET_ENTIRE_STATE,
        payload: finalNewPayloadOnAddingHit,
      });

      // Removing the hit from the specific site hits
      setHitsList((prev) => ({
        ...prev,
        [hit?.siteName]: hitsList?.[hit?.siteName].filter(
          (hitItem) => hitItem.hitId !== hit?.hitId,
        ),
      }));
      toaster.success({
        text: t('obx.runsheet.hitAdded', { hit: getLabel('terms', 'hit', t) }),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleAddTemplateAction = () => {
    setOpenNoTourTemplateModal(false);
    handleShowTourAssignmentDrawer(hitDetails?.hitId);
  };

  const filteredHits = searchTerm
    ? Object.fromEntries(
        Object.entries(hitsList).filter(([key]) =>
          key.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    : hitsList;

  const getUpdatedHitsUponTourAssignment = ({ hitId, siteName }) => {
    // set tour flag to true, for the hit whose tour is added
    setHitsList((prev) => ({
      ...prev,
      [siteName]: hitsList?.[siteName]?.map((hitItem) => {
        if (hitItem.hitId === hitId) {
          return {
            ...hitItem,
            tour: true,
          };
        }
        return hitItem;
      }),
    }));
  };

  return (
    <Box>
      {hitsLoading && <LoaderComponent />}
      <Box>
        <Button onClick={goBack}>
          <ArrowBack />
        </Button>{' '}
        {t('obx.runsheet.addUnassignedHitsToRunsheet', {
          hit: getLabel('terms', 'hit').toLowerCase(),
          runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
        })}
      </Box>
      <Box className={classes.accordionWrapper}>
        <NewHitsAccordionListing
          state={state}
          dispatch={dispatch}
          hitsList={filteredHits}
          showActions={true}
          handleAction={handleAction}
          getHits={({ hitId, siteName }) =>
            getUpdatedHitsUponTourAssignment({
              hitId: hitId,
              siteName: siteName,
            })
          }
        />
      </Box>
      <NoTourTemplateModal
        openModal={openNoTourTemplateModal}
        handleCloseModal={() => setOpenNoTourTemplateModal(false)}
        handleSubmit={handleAddTemplateAction}
      />
      {[DRAWER_TYPE.TOUR_ASSIGNMENT, DRAWER_TYPE.TOUR_TEMPLATE_PATROL].includes(
        showDrawer?.open,
      ) && (
        <PatrolAssignTour
          drawerData={{
            type: showDrawer?.open,
            hitId: hitDetails?.hitId,
            siteId: hitDetails?.siteId,
          }}
          closeSideDrawer={showSideDrawer('')}
          changeOnlyDrawerType={changeOnlyDrawerType}
          callbackUponAssignment={() => {
            getUpdatedHitsUponTourAssignment({
              hitId: hitDetails?.hitId,
              siteName: hitDetails?.siteName,
            });
          }}
          canDelete={false}
        />
      )}
    </Box>
  );
};

UnassignedHits.propTypes = {
  state: PropTypes.object,
  dispatch: PropTypes.func,
  searchTerm: PropTypes.string,
  goBack: PropTypes.func,
  addHitToTheHitsList: PropTypes.func,
  setNewlyAddedHit: PropTypes.func,
};

export default UnassignedHits;
