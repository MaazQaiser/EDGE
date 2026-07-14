import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    maxWidth: '992px',
    width: '100%',
    backgroundColor: `${theme.palette.surfaceWhite}`,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    position: 'absolute',
    left: '50%',
    top: '50%',
    padding: '24px',
    borderRadius: '12px',
    transform: 'translate(-50%,-50%)',
    '& .MuiSvgIcon-root': {
      width: '60px',
      height: '60px',
      marginLeft: '-5px',
    },
  },

  headWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',

    '& svg': {
      '& path': {
        fill: theme.palette.textPrimary,
      },
    },
  },

  closetext: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
    },
  },

  cardContent: {
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto',
    borderRadius: '8px',
    background: theme.palette.surfaceGreySubtle,
    textAlign: 'center',
    padding: '24px',
  },

  profileImageUploaded: {
    '&.MuiAvatar-root': {
      width: '100px',
      height: '100px',
      borderRadius: '12px',
      marginTop: '16px',
    },
  },

  uploadedImageFlex: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },

  previewTemplateUploaded: {
    cursor: 'pointer',
  },
}));
