import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  noteWrapper: {
    gap: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  addNoteButton: {
    '&.MuiButtonBase-root': {
      padding: '16px !important',
      borderRadius: '8px',
      border: ' 1px solid  #E6E6E7',
      background: 'rgba(245, 245, 246, 0.50)',
      color: '#146DFF',
      height: '44px',
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '24px',
      '&:hover': {
        color: '#146DFF',
      },
    },
  },
  activityCards: {
    gap: '0',
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notesTextCol: {
    flexBasis: '80%',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'flex-start',
  },
  noteheader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cals: {
    marginRight: '16px',
  },
  notesDetails: {
    '& ul, & ol': {
      paddingLeft: '21px',
      color: theme.palette.textSecondary3,
      fontSize: '14px',
    },
    '& p': {
      color: theme.palette.textSecondary3,
      fontSize: '14px',
    },
  },
  descriptionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      paddingLeft: '0px !important',
    },
  },
  activityDetails: {
    textAlign: 'left',
  },
  notesBtns: {
    textAlign: 'right',
    display: 'flex',
    alignItems: 'baseline',
    gap: '20px',
    '& button.MuiButtonBase-root': {
      padding: '0px',
    },
  },
  deleteBtn: {
    '&.MuiButtonBase-root': {
      color: `${theme.palette.textAlert} !important`,
    },
  },

  seeMore: {
    cursor: 'pointer',
    color: theme.palette.textBrand,
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
  },
  notesTime: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  emptyNotes: {
    display: 'flex',
  },
}));
