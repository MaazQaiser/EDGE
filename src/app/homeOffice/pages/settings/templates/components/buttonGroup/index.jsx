import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BackIcon } from '../../../../../../../assets/svg/index';
import { useStyles } from './buttonGroup.styles';

/**
 * DeleteButtonGroup is a reusable React component for displaying button bars.
 * @param {boolean} showBack - Boolean to show back button or not.
 * @param {function} handleBack - Function to handle back button.
 * @param {function} handleCancel - Function to handle back cancel.
 * @param {function} handleSave - Function to handle back Save.
 * @param {bool} disabled - function to control disable buttons
 */

const ButtonGroup = ({
  showBack,
  handleBack,
  handleCancel,
  handleSave,
  isEdit,
  showCancel,
  handleEdit,
  disabled,
  showSave,
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
      <Box className={classes.createTemplateBtns}>
        {showCancel && (
          <Button disabled={disabled} onClick={handleCancel} variant="secondaryGrey" disableRipple>
            {t('links.cancel')}
          </Button>
        )}
        {isEdit && (
          <Button disabled={disabled} onClick={handleEdit} variant="primary" disableRipple>
            {t('links.edit')}
          </Button>
        )}
        {showSave && (
          <Button disabled={disabled} onClick={handleSave} variant="primary" disableRipple>
            {t('links.save')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

ButtonGroup.propTypes = {
  showBack: PropTypes.bool,
  handleBack: PropTypes.func,
  handleCancel: PropTypes.func,
  handleSave: PropTypes.func,
  showCancel: PropTypes.bool,
  isEdit: PropTypes.bool,
  handleEdit: PropTypes.func,
  disabled: PropTypes.bool,
  showSave: PropTypes.bool,
};

ButtonGroup.defaultProps = {
  showBack: true,
  isEdit: false,
  showCancel: true,
  disabled: false,
  showSave: true,
};

export default ButtonGroup;
