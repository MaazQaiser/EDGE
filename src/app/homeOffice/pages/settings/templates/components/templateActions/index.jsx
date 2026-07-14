import { Box, Typography } from '@mui/material';
import { MoreVert } from 'assets/svg';
import { EditIcon } from 'assets/svg';
import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';

import { useStyles } from './templateActions.styles.js';

const TemplateActions = ({ handleDelete, handleCloneModal, handleEdit, template }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const _handleOnClickDelete = () => {
    handleDelete(template);
  };
  const handleOnClickEdit = () => {
    handleEdit(template);
  };
  const _handleOnClickClone = () => {
    handleCloneModal(template);
  };

  return (
    <PopoverButton
      className={classes.templateActions}
      variant="icon"
      Icon={MoreVert}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
    >
      <Box className={classes.templateActionsMenu}>
        <Box onClick={handleOnClickEdit} className={classes.templateActionsRegular}>
          <EditIcon className={classes.templateActionsIconRegular} />
          <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
            {t('ho.templates.listing.actions.edit')}
          </Typography>
        </Box>
        {/* <Box onClick={handleOnClickClone} className={classes.templateActionsRegular}>
          <CopyIcon className={classes.templateActionsIconRegular} />
          <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
            {t('ho.templates.listing.actions.clone')}
          </Typography>
        </Box> */}
        {/* <Box onClick={handleOnClickDelete} className={classes.templateActionsDelete}>
          <TrashIcon className={classes.templateActionsIconDelete} />
          <Typography className={classes.templateActionsTextDelete} variant="subtitle2">
            {t('ho.templates.listing.actions.delete')}
          </Typography>
        </Box> */}
      </Box>
    </PopoverButton>
  );
};

// Define propTypes for your component
TemplateActions.propTypes = {
  template: PropTypes.object.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleCloneModal: PropTypes.func.isRequired,
  handlePreview: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default TemplateActions;
