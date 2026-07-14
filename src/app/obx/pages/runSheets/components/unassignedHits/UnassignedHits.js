import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    display: 'flex',
    overflow: 'auto',
    flex: '1 1',
  },
  leftSide: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    // justifyContent: 'space-between',
    transition: 'width 0.3s',
    width: (props) => (props.expanded ? '0' : '50%'),
    overflow: 'hidden',
  },
  innerUpperWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  rightSide: {
    transition: 'width 0.3s',
    overflow: 'auto',
    width: (props) => (props.expanded ? '100%' : '50%'),
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: `1px solid ${theme.palette.borderSubtle1}`,
    justifyContent: 'space-between',
  },
  iconRotate: {
    transition: 'transform 0.3s',
    transform: (props) => (props.expanded ? 'rotate(0deg)' : 'rotate(180deg)'),
  },
  mapArea: {
    backgroundColor: '#f9f5ed',
    width: '100%',
    height: '100%',
  },
  bottomArea: {
    backgroundColor: theme.palette.surfaceWhite,
    padding: '8px',
    width: '100%',
    borderRadius: '5px 5px 0px 0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    rowGap: '10px',
    flexWrap: 'wrap',
    '& .MuiButtonBase-root': {
      color: theme.palette.textPrimary,
      pointerEvents: 'none',
      padding: '0px',
      height: 'auto',
      minWidth: 'auto',
    },
  },
  toggleButton: {
    '&.MuiButtonBase-root': {
      position: 'absolute',
      top: '100px',
      left: '22px',
      gap: '8px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '12px',
      borderRadius: '5px',
      color: theme.palette.textPrimary,
      minWidth: 'auto',
      '&:hover': {
        backgroundColor: theme.palette.surfaceWhite,
        color: theme.palette.textPrimary,
        minWidth: 'auto',
      },
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
  },
  hitStates: {
    boxShadow: '8px 8px 20px 0px #0000000D',
    padding: '17px 40px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
  },
  stateColums: {
    '& .MuiTypography-body3': {
      color: theme.palette.textSecondary3,
    },
    '& .MuiTypography-body2': {
      color: theme.palette.textPrimary,
    },
  },
  editTime: {
    '& svg': {
      width: '12px',
      height: '12px',
      cursor: 'pointer',
    },
  },
  TopBox: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px 24px',
  },
  buttonsAndText: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  topButoons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  editText: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    '& svg': {
      width: '14px',
      height: '14px',
      cursor: 'pointer',
    },
  },
  hamburgerButton: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  searchbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popButton: {
    '& .MuiButtonBase-root': {
      border: `1px solid ${theme.palette.borderStrong1}`,
      borderRadius: '8px',
    },
  },
  editButton: {
    '&.MuiButtonBase-root': {
      minWidth: '100%',
      background: theme.palette.surfaceGreySubtle,
      borderColor: theme.palette.borderSubtle1,
      color: theme.palette.textPrimary,
      justifyContent: 'space-between',
      fontSize: '12px',
      height: '40px',
      padding: '8px 12px',
      boxShadow: 'none',
      '&:hover , &:focus , &:active': {
        background: theme.palette.surfaceGreySubtle,
        borderColor: theme.palette.borderSubtle1,
        color: theme.palette.textPrimary,
        boxShadow: 'none',
      },
    },
  },
  editButtonInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& img': {
      width: '24px',
      height: '24px',
      borderRadius: '60px',
    },
  },
  locationButtons: {
    padding: '24px 32px 0px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '24px 24px 0px 24px',
    },
  },
  hitsListinng: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    flex: '1 1',
    padding: '16px 32px 6px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0px 24px 6px 24px',
    },
  },
  accordionWrapper: {
    padding: '0 32px 0 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px 0 24px',
    },
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    flex: '1 1',
    marginTop: '16px',
  },
  bottomSticky: {
    backgroundColor: theme.palette.surfaceWhite,
    padding: '8px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '8px 24px',
    },
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  contractNameFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    paddingLeft: '4px',
  },
  inputField: {
    '& .MuiInputBase-root': {
      height: '36px',
      minWidth: '100%',
    },
  },
  editIcons: {
    '&.MuiButtonBase-root': {
      padding: '0',
      minWidth: 'unset',
      border: '0',
      minHeight: 'auto',
      height: 'auto',
      '&:hover': {
        border: '0',
        background: 'transparent',
      },
      '& svg': {
        width: '14px',
        height: '14px',
        cursor: 'pointer',
      },
    },
  },
  stepperHeadding: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  serviceEditIcon: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      minWidth: 'unset',
      border: '0',
      minHeight: 'auto',
      height: 'auto',
      '&:hover': {
        border: '0',
        background: 'transparent',
      },
    },

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
}));
