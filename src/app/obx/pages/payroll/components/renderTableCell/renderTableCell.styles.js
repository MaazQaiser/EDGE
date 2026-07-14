import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  employeeNameClass: {
    display: 'flex',
    gap: '8px',
    textTransform: 'capitalize',
    '& .MuiButtonBase-root.MuiButton-root': {
      padding: '0',
      height: 'auto',
      minWidth: 'auto',

      '& .MuiButton-startIcon': {
        marginRight: 0,
        marginLeft: 0,
      },
    },
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0',
      height: 'auto',
      minWidth: 'auto',

      '& .MuiButton-startIcon': {
        marginRight: 0,
        marginLeft: 0,
      },
    },
  },
  repateNotes: {
    marginBottom: '16px',
    position: 'relative',
    paddingLeft: '12px',

    '&:last-child': {
      marginBottom: 0,
    },

    '&::before': {
      content: '""',
      position: 'absolute',
      width: '5px',
      height: '5px',
      borderRadius: '160px',
      backgroundColor: theme.palette.surfaceBrand,
      left: '0px',
      top: '8px',
    },
  },
  notesSubHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },
  notesArea: {
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },
  adhocPayrollChip: {
    '&.MuiChip-root': {
      backgroundColor: '#F4EDFD',
      color: '#9747FF',
    },
  },
  hoursNewField: {
    '& .MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontSize: '14px',
    },
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  hourValueBox: {
    '&.MuiTypography-root': {
      color: '#444446',
      gap: '4px',
      fontSize: '14px',
      borderRadius: '8px',
      fontWeight: '500',
      lineHeight: '20px',
      zIndex: '0',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
  },
}));
