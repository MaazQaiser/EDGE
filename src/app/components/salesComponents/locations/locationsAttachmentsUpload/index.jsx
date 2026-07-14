import { Box, Paper, Typography } from '@mui/material';
import Upload from 'assets/images/upload-icon.svg';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { useStyles } from './locationsAttachmentsUpload';

const AttachmentsUpload = ({ fileUploadHandler, acceptAttachment }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.formBoxImage}>
      <Paper className={classes.paperWrapper}>
        <Box className={classes.inputFileWrapper}>
          <img src={Upload} />
          <Box className={classes.uploadBtn}>
            <Typography variant="subtitle2" className={classes.boldText}>
              {t('sales.locations.attachmentClickToUpload')}
            </Typography>
            <Typography variant="body2" className={classes.dragText}>
              <input
                type="file"
                accept={acceptAttachment}
                onChange={fileUploadHandler}
                id="file-input"
                className={classes.customFileInput}
              />
              {t('sales.locations.attachmentDND')}
            </Typography>
          </Box>
          <Typography variant="body3" className={classes.dragTextBelow}>
            {t('sales.locations.attachmentAttachmentSize')}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

AttachmentsUpload.propTypes = {
  fileUploadHandler: PropTypes.func,
  acceptAttachment: PropTypes.object,
};

export default AttachmentsUpload;
