import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import { BackIcon } from 'assets/svg/index';
import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './buttonGroup.styles';

/**
 * DeleteButtonGroup is a reusable React component for displaying button bars.
 * @param {function} handleBack - Function to handle back button.
 * @param {function} handleAccept - Function to handle back cancel.
 * @param {function} handleReject - Function to handle back Save.
 * @param {bool} disabled - function to control disable buttons
 */

const ButtonGroup = ({
  showBack,
  handleBack,
  handleReject,
  handleAccept,
  disabled,
  showApprove,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Box
      className={showBack ? `${classes.createTemplateHeader}` : `${classes.createTemplateFooter}`}
    >
      {showBack && (
        <Button
          onClick={handleBack}
          variant="tertiaryGrey"
          startIcon={<BackIcon />}
          disabled={disabled}
          disableRipple
        >
          {t('links.back')}
        </Button>
      )}
      {showApprove && (
        <Box className={classes.createTemplateBtns}>
          <Button
            disabled={disabled}
            onClick={handleReject}
            variant="destructiveSecondary"
            disableRipple
          >
            {t('buttons.reject')}
          </Button>

          <Button disabled={disabled} onClick={handleAccept} variant="primary" disableRipple>
            {t('buttons.approve')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

ButtonGroup.propTypes = {
  handleBack: PropTypes.func,
  handleReject: PropTypes.func,
  handleAccept: PropTypes.func,
  disabled: PropTypes.bool,
  showBack: PropTypes.bool,
  showApprove: PropTypes.bool,
};

ButtonGroup.defaultProps = {
  isEdit: false,
  showBack: true,
  disabled: false,
  showApprove: true,
};

export default ButtonGroup;
