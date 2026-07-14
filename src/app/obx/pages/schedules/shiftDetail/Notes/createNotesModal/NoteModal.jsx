import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';

import { useStyles } from './createNotesModal';

export const notesCharacterLimit = 1000;

export const NoteModal = ({
  open,
  handleCloseModal,
  className,
  icon,
  title,
  description,
  noteValue,
  errorMessage,
  handleChangeNoteValue,
  cancelBtnText,
  handleCancelBtn,
  saveBtnText,
  handleSaveBtn,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [isLoading, _setIsLoading] = useState(false);
  const [disableSaveBtn, setDisableSaveBtn] = useState(false);

  const onClickCancel = () => {
    handleCancelBtn();
  };

  const onClickSubmit = async () => {
    setDisableSaveBtn(true);
    await handleSaveBtn();
    setDisableSaveBtn(false);
  };

  return (
    <>
      {isLoading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className={`${classes.notesModalContainer} ${className}`}
      >
        <Box className={classes.popStyle}>
          {icon && icon}
          <Typography variant="h4" id="modal-modal-title">
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" id="modal-modal-title">
              {description}
            </Typography>
          )}
          <Box className={classes.saleCK}>
            <TextField
              multiline
              rows={5}
              placeholder={t('sales.companies.rictTextPlaceholder')}
              value={noteValue}
              onChange={handleChangeNoteValue}
              className={classes.createNotesField}
            />
            <Typography variant="overline" className={classes.countNumber}>
              {`${noteValue?.length || 0} / ${notesCharacterLimit} `}
              {t('sales.companies.characters')}
            </Typography>
          </Box>
          {errorMessage && <Typography className={classes.errorMessage}>{errorMessage}</Typography>}
          <Divider className={classes.dividerGap} />
          <Box className={classes.sideFooter}>
            <Stack direction="row" justifyContent="end" spacing={2}>
              <Button onClick={onClickCancel} variant="secondaryGrey">
                {cancelBtnText || t('links.cancel')}
              </Button>
              <Button variant="primary" onClick={onClickSubmit} disabled={disableSaveBtn}>
                {saveBtnText || t('links.save')}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default NoteModal;

NoteModal.propTypes = {
  open: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  noteValue: PropTypes.string,
  errorMessage: PropTypes.string,
  handleChangeNoteValue: PropTypes.func,
  cancelBtnText: PropTypes.string,
  handleCancelBtn: PropTypes.func,
  saveBtnText: PropTypes.string,
  handleSaveBtn: PropTypes.func,
};
