import { Box, Typography } from '@mui/material';
import { MoreVert } from 'assets/svg';
import { ReactComponent as EditIcon } from 'assets/svg/edit-drop.svg?react';
// import { ReactComponent as ReplaceIcon } from 'assets/svg/ReplaceIcon.svg';
// import { ReactComponent as TrashIcon } from 'assets/svg/trash-2.svg';
import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react';
import { useTranslation } from 'react-i18next';
import PopoverButton from 'src/app/components/common/popoverButton';

import { useStyles } from './templateActions.styles.js';

const TemplateActions = ({ handleDelete, handleReplaceModal, handleEdit, template }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const _handleOnClickDelete = () => {
    handleDelete(template);
  };
  const handleOnClickEdit = () => {
    handleEdit(template);
  };

  const _hand = () => {
    handleReplaceModal();
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
            {t('obx.templates.listing.actions.edit')}
          </Typography>
        </Box>
        {/* <Box onClick={handleReplaceModal} className={classes.templateActionsRegular}>
          <ReplaceIcon className={classes.templateActionsIconRegular} />
          <Typography className={classes.templateActionsTextRegular} variant="subtitle2">
            {t('obx.templates.listing.actions.replace')}
          </Typography>
        </Box> */}
        {/*<Box onClick={handleDelete} className={classes.templateActionsDelete}>*/}
        {/*  <TrashIcon className={classes.templateActionsIconDelete} />*/}
        {/*  <Typography className={classes.templateActionsTextDelete} variant="subtitle2">*/}
        {/*    {t('obx.templates.listing.actions.delete')}*/}
        {/*  </Typography>*/}
        {/*</Box>*/}
      </Box>
    </PopoverButton>
  );
};

// Define propTypes for your component
TemplateActions.propTypes = {
  template: PropTypes.object.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleReplaceModal: PropTypes.func.isRequired,
  handlePreview: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default TemplateActions;
