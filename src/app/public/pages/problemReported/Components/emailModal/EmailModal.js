import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  // modal style
  emailButtons: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
    marginTop: '24px',
  },
  emailModal: {
    padding: '24px',

    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 780,
    backgroundColor: '#fff',
    border: '0px solid #000',
    boxShadow: 24,
    borderRadius: '12px',
  },
  marginBottomColum: {
    margin: '20px 0px',
  },
  headText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  subText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
}));
