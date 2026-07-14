import { Avatar, Box, Button, Drawer, InputLabel, Skeleton, Typography } from '@mui/material';
import { ReactComponent as ChevronDown } from 'assets/svg/commonDropdown/chevronDown.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KEY } from 'src/utils/constants/events/keyPressEvents';
import { defaultImage } from 'src/utils/constants/index.js';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater/index.js';

import DealsOwner from '../dealOwnerDrawer/index.jsx';
import { useStyles } from './dealsDropdowns.js';

const DealsDropdowns = ({
  amount,
  pipeline,
  dealOwner,
  dealId,
  onSuccess,
  isNotClosed,
  loading,
}) => {
  const locationDrawerTypes = {
    RIGHT: 'right',
    // Add other anchor positions if needed
  };
  const classes = useStyles();
  const { t } = useTranslation();
  const NA = t('commonText.nA');

  const toggleAssignmentDrawer = (anchor, open) => (event) => {
    if (event.type === KEY.UP && (event.key === KEY.TAB || event.key === KEY.SHIFT)) {
      return;
    }
    setAssignmentState({ ...assignmentState, [anchor]: open });
  };
  const [assignmentState, setAssignmentState] = useState({
    right: false,
  });
  const assignmentCloseDrawer = (anchor) => {
    setAssignmentState({ ...assignmentState, [anchor]: false });
  };

  return (
    <Box className={classes.dropinnerWrap}>
      <Box className={classes.inlineDropdwon}>
        <Typography variant="body2" className={classes.blueLabel}>
          {t('sales.deals.dealamount')}
        </Typography>
        {!loading ? (
          <Typography variant="body2" className={classes.blackLabel}>
            {amount && amount > 0 ? `$${fomatNumbersWithCommas(amount)}` : NA}
          </Typography>
        ) : (
          <Skeleton
            variant="text"
            width={100}
            height={36}
            sx={{ display: 'block', marginLeft: '8px' }}
          />
        )}
      </Box>
      <Box className={classes.inlineDropdwon}>
        <Typography variant="body2" className={classes.blueLabel}>
          {t('sales.deals.pipeline')}
        </Typography>
        {!loading ? (
          <Typography variant="body2" className={classes.blackLabel}>
            {pipeline || NA}
          </Typography>
        ) : (
          <Skeleton
            variant="text"
            width={100}
            height={36}
            sx={{ display: 'block', marginLeft: '8px' }}
          />
        )}
      </Box>
      <Box className={classes.inlineDropdwon} component="div">
        <InputLabel variant="standard" className={classes.blueLabel} htmlFor="dealOwner">
          {t('sales.locations.dealOwner')}
        </InputLabel>
        {!loading ? (
          isNotClosed ? (
            <Button
              onClick={toggleAssignmentDrawer(locationDrawerTypes.RIGHT, true)}
              className={classes.btnColor}
              variant="onlyText"
              disableRipple
              endIcon={<ChevronDown className={classes.dropIcon} />}
            >
              <Avatar
                className={classes.assignAvatar}
                alt="Remy Sharp"
                src={dealOwner?.image || defaultImage}
              />
              {dealOwner?.name || NA}
            </Button>
          ) : (
            <Button
              onClick={toggleAssignmentDrawer(locationDrawerTypes.RIGHT, true)}
              className={classes.btnColorBlck}
              variant="onlyText"
              disableRipple
              // endIcon={<ChevronDown className={classes.dropIcon} />}
              disabled
            >
              <Avatar
                className={classes.assignAvatar}
                alt="Remy Sharp"
                src={dealOwner?.image || defaultImage}
              />
              {dealOwner?.name || NA}
            </Button>
          )
        ) : (
          <Skeleton
            variant="text"
            width={100}
            height={36}
            sx={{ display: 'block', marginLeft: '8px' }}
          />
        )}
        <Drawer
          anchor={locationDrawerTypes.RIGHT}
          open={assignmentState[locationDrawerTypes.RIGHT]}
          onClose={toggleAssignmentDrawer(locationDrawerTypes.RIGHT, false)}
        >
          <DealsOwner
            anchor="right"
            assignmentCloseDrawer={assignmentCloseDrawer}
            width={796}
            dealOwner={dealOwner}
            dealId={dealId}
            onSuccess={onSuccess}
          />
        </Drawer>
      </Box>
    </Box>
  );
};

DealsDropdowns.propTypes = {
  amount: PropTypes.number, // Adjust the type accordingly based on your use case
  pipeline: PropTypes.string,
  dealOwner: PropTypes.string,
  dealId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
  isNotClosed: PropTypes.bool,
  loading: PropTypes.bool,
};

export default DealsDropdowns;
