import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as ReplaceIcon } from 'assets/svg/replace.svg?react';
import PopoverButton from 'commonComponents/popoverButton';
import PropTypes from 'prop-types';
import React from 'react';
import ChipComponent from 'src/app/homeOffice/pages/franchise/detail/components/chip';
import { useStyles } from 'src/app/obx/pages/zones/form/formZone';
import { CrossPopOverIcon, MoreVert, TrashIcon } from 'src/assets/svg';

const SitesCard = ({
  setConfirmationModal,
  setShowActionModal,
  data,
  hasCross,
  onClickCross,
  index,
  setSiteId,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.assignedSiteZones}>
      <Box className={classes.assignedSiteZonesLeft}>
        {data?.images?.[0] && (
          <img src={data?.images?.[0]?.url} alt="" className={classes.assignedSiteZonesImage} />
        )}
        <Box>
          <Box className={classes.assignedSiteZonesLeftFlex}>
            <Typography className={classes.assignedSiteZoneName} variant="subtitle2">
              {data?.name}
            </Typography>
            <ChipComponent status={data?.status} />
          </Box>
          <Typography className={classes.assignedSiteZoneNameType} variant="body3">
            {data?.siteType}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.questionBankAction}>
        {hasCross && (
          <Button
            onClick={() => {
              onClickCross(index);
            }}
            disableRipple
            className={classes.closeBtn}
          >
            <CrossPopOverIcon />
          </Button>
        )}
        {!hasCross && (
          <PopoverButton
            className={classes.questionBankActions}
            variant="icon"
            Icon={MoreVert}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
            <Box className={classes.questionBankActionsMenu}>
              <Box
                onClick={() => {
                  setSiteId(data?.id);
                  setShowActionModal(true);
                }}
                className={classes.questionBankActionsRegular}
              >
                <ReplaceIcon className={classes.questionBankActionsIconRegular} />
                <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
                  Change
                </Typography>
              </Box>
              {data?.status !== 'functional' && (
                <Box
                  onClick={() => {
                    setSiteId(data?.id);
                    setConfirmationModal(true);
                  }}
                  className={classes.questionBankActionsDelete}
                >
                  <TrashIcon className={classes.questionBankActionsIconDelete} />
                  <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
                    Remove
                  </Typography>
                </Box>
              )}
            </Box>
          </PopoverButton>
        )}
      </Box>
    </Box>
  );
};

SitesCard.propTypes = {
  setConfirmationModal: PropTypes.func,
  setShowActionModal: PropTypes.func,
  data: PropTypes.object.isRequired,
  hasCross: PropTypes.bool,
  index: PropTypes.number,
  onClickCross: PropTypes.func,
  setSiteId: PropTypes.func,
};

SitesCard.defaultProps = {
  hasCross: false,
};

export default SitesCard;
