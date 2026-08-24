import { Box, Button, List, ListItem, Skeleton, Typography } from '@mui/material';
// import { ReactComponent as BeaconIcon } from 'assets/svg/beacon.svg';
// import { ReactComponent as DotIcon } from 'assets/svg/dot.svg';
// import { ReactComponent as NfcSecurityIcon } from 'assets/svg/NFC.svg';
import { ReactComponent as BlueReportIcon } from 'assets/svg/BlueReportIcon.svg?react';
import { ReactComponent as SettingIcon } from 'assets/svg/settings.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDeviceTypeName } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { DRAWER_TYPE } from 'src/utils/constants/schedules';

import { ScheduleStatusChips } from '../../../schedules/components/scheduleStatusChips';
import PatrolAssignTour from '../../../sites/detail/components/jobs/PatrolAssignTour';
import { useStyles } from './runsheetHits.style';
const RunsheetHits = ({
  hitDetails,
  refetchData = () => {},
  fetchingHitLoading,
  hitStatus,
  readOnly = false,
  extraFields = null,
  belowFields = null,
  hideCheckpoints = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [showDrawer, setShowDrawer] = useState({
    open: '',
    data: {},
  });

  const { getLabel } = useTenantLabel();
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

  return (
    <Box>
      {fetchingHitLoading ? (
        <Box className={classes.hitCardWrapper}>
          <Box className={classes.hitSkeleton}>
            <Skeleton />
          </Box>
          <Box className={classes.hitSkeleton}>
            <Skeleton />
          </Box>
          <Box className={classes.hitSkeleton}>
            <Skeleton />
          </Box>
          <Box className={classes.hitSkeleton}>
            <Skeleton />
          </Box>
        </Box>
      ) : (
        <Box className={classes.hitCardWrapper}>
          <Box className={classes.HitStats}>
            <Box className={classes.hitItem}>
              <Typography variant="body3" className={classes.hitItemTitle}>
                {t('obx.runsheet.serviceTime')}
              </Typography>
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {hitDetails?.duration || 0} {t('obx.runsheet.durationUnit')}
              </Typography>
            </Box>
            {!hitStatus && (
              <Box className={classes.hitItem}>
                <Typography variant="body3" className={classes.hitItemTitle}>
                  {t('obx.runsheet.checkpoints')}
                </Typography>
                <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                  {hitDetails?.tour?.checkpoints?.length || 0}
                </Typography>
              </Box>
            )}
            <Box className={classes.hitItem}>
              <Typography variant="body3" className={classes.hitItemTitle}>
                {t('obx.runsheet.visitType')}
              </Typography>
              <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                {hitDetails?.visitType}
              </Typography>
            </Box>
            {hitStatus && (
              <Box className={classes.hitItem}>
                <Typography variant="body3" className={classes.hitItemTitle}>
                  {t('obx.runsheet.status')}
                </Typography>
                <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                  <ScheduleStatusChips scheduleStatus={hitStatus} />
                </Typography>
              </Box>
            )}
            {/* A fourth field the three-track grid gives its own row for free — see
                `RunsheetDetail`'s identical pay-rate-override placement. */}
            {extraFields}
          </Box>
          {belowFields}
          {/* The filters this visit is there to replace — a site's own product/quantity
              breakdown, the same one a submitted report states in prose ("Filter Size:
              100*100*2 * Quantity: 1"). Independent of `hitDetails?.tour`: a visit can
              know what it's replacing before any tour or report exists for it. */}
          {hitDetails?.filters?.length > 0 && (
            <Box className={classes.filtersWrapper}>
              <Typography variant="h6" className={classes.title}>
                {t('obx.runsheet.filtersSection')}
              </Typography>
              <FiltersList filters={hitDetails.filters} />
            </Box>
          )}
          {/* //checkpoints? */}
          {!hideCheckpoints && hitDetails?.tour && (
            <Box className={classes.checkPointsWrapper}>
              <Typography variant="h6" className={classes.title}>
                {t('obx.runsheet.checkpointsSection')}
              </Typography>
              <CheckPoints checkpoints={hitDetails?.tour?.checkpoints} />
            </Box>
          )}
          {/* //Reports ? */}
          {hitDetails?.tour && (
            <Box className={classes.checkPointsWrapper}>
              <Typography variant="h6" className={classes.title}>
                {t('obx.runsheet.reportsSection')}
              </Typography>
              <Box className={classes.LeftListItem}>
                <BlueReportIcon className={classes.reportICon} />

                <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                  {hitDetails?.tour?.tourReportName}
                </Typography>
              </Box>
            </Box>
          )}
          {/* //patrol setup ?
              Suppressed when the caller says the visit is read-only — a completed,
              cancelled or past-dated visit must not be offered a primary action
              directly under a notice saying it cannot be changed. Defaults to
              false, so the runsheet screens are unaffected. */}
          {!hitDetails?.tour && !readOnly && (
            <Box className={classes.patrolSetupWrapper}>
              <Typography variant="body3" className={classes.patrolSetupText}>
                {t('obx.runsheet.noReportsText')}
              </Typography>
              <Button
                variant="primary"
                type="button"
                startIcon={<SettingIcon />}
                onClick={() => handleShowTourAssignmentDrawer(hitDetails?.hitId)}
              >
                {t('obx.runsheet.patrolSetup', {
                  patrol: getLabel('terms', 'patrol'),
                })}
              </Button>
            </Box>
          )}
          {/* //Instruction ? */}
          <Box className={classes.instructionWrapper}>
            <Box className={classes.instructionHeading}>
              <Typography variant="h4" className={classes.instructionTitle}>
                {t('obx.runsheet.instructionsSection')}:
              </Typography>
              <Box className={classes.instructionDivider} />
            </Box>
            {hitDetails?.instructions ? (
              <Box className={classes.instructionTextStyle}>
                <span dangerouslySetInnerHTML={{ __html: hitDetails?.instructions }} />
              </Box>
            ) : (
              <Typography variant="body3">{t('obx.runsheet.noInstructions')}</Typography>
            )}
          </Box>

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
              callbackUponAssignment={refetchData}
            />
          )}
        </Box>
      )}
    </Box>
  );
};
RunsheetHits.propTypes = {
  hitDetails: PropTypes.object,
  refetchData: PropTypes.func,
  fetchingHitLoading: PropTypes.bool,
  hitStatus: PropTypes.string,
  readOnly: PropTypes.bool,
  extraFields: PropTypes.node,
  belowFields: PropTypes.node,
  hideCheckpoints: PropTypes.bool,
};

RunsheetHits.defaultProps = {
  hitDetails: {},
  refetchData: () => {},
  fetchingHitLoading: true,
  hitStatus: '',
  readOnly: false,
  extraFields: null,
  belowFields: null,
  hideCheckpoints: false,
};

export default RunsheetHits;

const CheckPoints = ({ checkpoints = [] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  return (
    <List>
      {checkpoints?.length ? (
        checkpoints?.map((checkpoint, index) => (
          <ListItem key={index} className={classes.ListItem}>
            <Box className={classes.LeftListItem}>
              <Box className={classes.listNumber}>
                <Typography variant="subtitle2" className={classes.BlueNumerICon}>
                  {index + 1}
                </Typography>
              </Box>
              {/* The place leads, the reader type follows. It used to be the other
                  way round — "NFC" in bold over a muted "Roof Plant Room — AHU-1"
                  — which made every checkpoint in a list look the same and buried
                  the only line that says where the technician has to walk. The
                  device type is how the checkpoint is read, not what it is. */}
              <Box>
                <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
                  {checkpoint?.location?.locationName || NA}
                </Typography>
                <Typography variant="body3" className={classes.hitItemTitle}>
                  {formatDeviceTypeName(checkpoint?.type || checkpoint?.checkpointType) || NA}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.listIcon}>
              <img src={checkpoint?.imageUrl} />
            </Box>
          </ListItem>
        ))
      ) : (
        <Box>
          <Typography variant="body3">{t('obx.runsheet.noCheckpointsSection')}</Typography>
        </Box>
      )}
      {/* <ListItem className={classes.ListItem}>
        <Box className={classes.LeftListItem}>
          <Box className={classes.listNumber}>
            <Typography variant="subtitle2" className={classes.BlueNumerICon}>
              1
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
              NFC Security Room
            </Typography>
            <Typography variant="body3" className={classes.hitItemTitle}>
              NFC 4 <DotIcon /> Room 04, 3rd floor
            </Typography>
          </Box>
        </Box>
        <Box className={classes.listIcon}>
          <NfcSecurityIcon />
        </Box>
      </ListItem> */}
      {/* <ListItem className={classes.ListItem}>
        <Box className={classes.LeftListItem}>
          <Box className={classes.listNumber}>
            <Typography variant="subtitle2" className={classes.BlueNumerICon}>
              2
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
              Basement 03 Beacon
            </Typography>
            <Typography variant="body3" className={classes.hitItemTitle}>
              Beacon 2 <DotIcon /> Basement 03 parking
            </Typography>
          </Box>
        </Box>
        <Box className={classes.listIcon}>
          <BeaconIcon />
        </Box>
      </ListItem>
      <ListItem className={classes.ListItem}>
        <Box className={classes.LeftListItem}>
          <Box className={classes.listNumber}>
            <Typography variant="subtitle2" className={classes.BlueNumerICon}>
              3
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" className={classes.hitItemSubTitle}>
              Stairs QR
            </Typography>
            <Typography variant="body3" className={classes.hitItemTitle}>
              QR 2 <DotIcon /> 1st floor Stairs
            </Typography>
          </Box>
        </Box>
        <Box className={classes.listIcon}>
          <QrCodeIcon />
        </Box>
      </ListItem> */}
    </List>
  );
};

CheckPoints.propTypes = {
  checkpoints: PropTypes.array,
};

CheckPoints.defaultProps = {
  checkpoints: [],
};

/**
 * The filters a visit is there to replace, one line per size — a grey chip
 * naming the size, the count beside it rather than inside it. Read the way a
 * submitted report already prints it ("Filter Size: 100*100*2 * Quantity: 1"),
 * as a stack of lines instead of a paragraph.
 */
const FiltersList = ({ filters = [] }) => {
  const classes = useStyles();

  return (
    <Box className={classes.filtersList}>
      {filters.map((filter, index) => (
        <Box key={`${filter?.dimension}-${index}`} className={classes.filterRow}>
          <Box className={classes.filterChip}>
            <Typography component="span" className={classes.filterChipDimension}>
              {filter?.dimension}
            </Typography>
          </Box>
          <Typography component="span" className={classes.filterQty}>
            ×{filter?.quantity}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

FiltersList.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      dimension: PropTypes.string,
      quantity: PropTypes.number,
    }),
  ),
};
