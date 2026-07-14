import { Box, Typography } from '@mui/material';
import { MoreVert } from 'assets/svg';
import { EditIcon, TrashIcon } from 'assets/svg';
import { ReactComponent as DuplicateIcon } from 'assets/svg/copy.svg?react';
import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import PopoverButton from 'src/app/components/common/popoverButton';
import {
  ACL_OBX_RUNSHEET_DELETE,
  ACL_OBX_RUNSHEET_UPDATE,
} from 'src/app/router/constant/OBXMODULE';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';

import { useStyles } from './HitsPopoverButtons.js';

const HitsActions = ({ setOpenDeleteModal, setDuplicateRunsheetModal, editAction }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const tenantPermissions = useSelector((state) => state?.auth?.tenantPermissions);

  return (
    <>
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
          <RenderIfHasPermission name={ACL_OBX_RUNSHEET_UPDATE}>
            <Box className={classes.questionBankActionsRegular} onClick={() => editAction()}>
              <EditIcon className={classes.questionBankActionsIconRegular} />
              <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
                {t('obx.runsheet.editRunsheet', { runsheet: getLabel('terms', 'runsheet', t) })}
              </Typography>
            </Box>
          </RenderIfHasPermission>
          {tenantPermissions?.runsheets?.runsheetDetails?.showDuplicateRunsheet && (
            <RenderIfHasPermission name={ACL_OBX_RUNSHEET_UPDATE}>
              <Box
                className={classes.questionBankActionsRegular}
                onClick={() => setDuplicateRunsheetModal(true)}
              >
                <DuplicateIcon className={classes.questionBankActionsIconRegular} />
                <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
                  {t('obx.runsheet.duplicateRunsheet', {
                    runsheet: getLabel('terms', 'runsheet', t),
                  })}
                </Typography>
              </Box>
            </RenderIfHasPermission>
          )}

          <RenderIfHasPermission name={ACL_OBX_RUNSHEET_DELETE}>
            <Box
              className={classes.questionBankActionsDelete}
              onClick={() => setOpenDeleteModal(true)}
            >
              <TrashIcon className={classes.questionBankActionsIconDelete} />
              <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
                {t('obx.runsheet.deleteRunsheet', { runsheet: getLabel('terms', 'runsheet', t) })}
              </Typography>
            </Box>
          </RenderIfHasPermission>
        </Box>
      </PopoverButton>
    </>
  );
};

// // Define propTypes for your component
HitsActions.propTypes = {
  handleOpenLocationModal: PropTypes.func,
  setOpenDeleteModal: PropTypes.func,
  setDuplicateRunsheetModal: PropTypes.func,
  handleOpenDuplicateRunsheetModal: PropTypes.func,
  setIsEditing: PropTypes.func,
  editAction: PropTypes.func,
};

export default HitsActions;
