import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    maxWidth: '500px',
    width: '100%',
    backgroundColor: `${theme.palette.surfaceWhite}`,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    position: 'absolute',
    left: '50%',
    top: '50%',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderRadius: '12px',
    transform: 'translate(-50%,-50%)',
  },
  chipWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '6px',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '& .MuiChip-root': {
      '& svg': {
        '& path': {
          fill: theme.palette.textBrand,
        },
        margin: '0px',
      },
    },
  },
  inlineButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
      height: '36px',
    },
  },
  closetext: {
    '&.MuiTypography-root': {
      marginTop: '4px',
      color: `${theme.palette.textSecondary3}`,
    },
  },
  headText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
      marginBottom: '8px',
    },
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    '& .MuiFormLabel-root': {
      marginBottom: '0px',
    },
    '& .selectInnerWrapper': {
      backgroundColor: theme.palette.surfaceWhite,
      height: 'auto',
    },

    '& .leadSelectPlaceHolder': {
      '&.MuiTypography-root': {
        color: theme.palette.textPlaceholder,
      },
    },
  },
  radioOption: {
    '& .MuiFormControl-root': {
      width: '100%',
    },
    '& .MuiFormGroup-root': {
      display: 'flex',
      flexDirection: 'row',
      gap: '20px',
    },
    '& span.MuiTypography-root': {
      fontSize: '14px',
    },
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      marginLeft: '0px',
    },
    '& label.MuiFormControlLabel-root': {
      marginRight: '0px',
    },

    '& .MuiButtonBase-root': {
      paddingBottom: '0px ',
      marginRight: '0px',
      paddingTop: '0px',
      paddingRight: '4px',
    },
  },

  skeletonDropdown: {
    '&.MuiSkeleton-root': {
      width: '100%',
      height: '44px',
      transform: 'none',
      borderRadius: '8px !important',
    },
  },
}));
