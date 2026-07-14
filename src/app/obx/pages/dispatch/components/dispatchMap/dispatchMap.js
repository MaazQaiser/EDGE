import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  noMap: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(9px)',
    zIndex: '99',
  },
  noMapInner: {
    maxWidth: '383px',
    margin: '0 auto',
    width: '100%',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: '0px',
    right: '0px',
    background: theme.palette.surfaceWhite,
    padding: '20px 16px',
    display: 'flex',
    gap: '16px',
    flexDirection: 'column',
    textAlign: 'center',
    alignItems: 'center',
  },
  mainToolTipBoxRunsheet: {
    width: '303px',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '0',
    borderRadius: '8px',
  },

  nameWrapper: {
    display: 'flex',
    gap: '7px',
    textAlign: 'center',
    alignItems: 'center',
  },
  dateWrraper: {
    display: 'flex',
    gap: '2px',
    textAlign: 'center',
    alignItems: 'center',
  },
  iconWrraper: {
    display: 'grid',
    gridTemplateColumns: '1fr 12fr ',
    alignItems: 'flex-start',
  },
  nameWrapperMain: {
    display: 'flex',
    gap: '7px',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gotoNextIcon: {
    cursor: 'pointer',
    '& svg': {
      '& g': {
        '& path': {
          stroke: '#262527',
        },
      },
    },
  },
  mainToolTipBoxs: {
    width: '260px',
    height: 'auto',
    maxHeight: '140px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
    overflow: 'auto',
  },
  contactInformationName: {
    '&.MuiTypography-root': {
      wordBreak: 'break-word',
      marginBottom: '4px',
      color: theme.palette.textPrimary,
    },
  },
  addressName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      display: 'flex',
      gap: '4px',
      alignItems: 'flex-start',
    },
  },
  hitWrapper: {
    display: 'flex',
    flexDirection: 'column',
    background: '#f5f5f6',
    width: 'auto',
    padding: ' 6px',
    borderRadius: '4px',
    marginBottom: '4px',
  },
  hitWrapperMain: {
    gap: '4px',
  },
  hitTime: {
    '&.MuiTypography-root': {
      whiteSpace: 'nowrap',
      color: '#444446',
    },
  },
  roomImageTool: {
    width: '100%',
    height: '96px',
    borderRadius: '6px',
    marginBottom: '4px',
    backgroundSize: 'cover',
    // width: '248px',
  },
}));
