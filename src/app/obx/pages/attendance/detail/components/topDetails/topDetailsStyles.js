import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((_theme) => ({
  sitessubheader: {
    position: 'sticky',
    backgroundColor: '#f5f5f6',
    left: 0,
    zIndex: 9,
    borderBottom: '1px solid #e6e6e7',
  },
  headrdetail: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
  },
  avatarsection: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  avatarimage: {
    width: '51px',
    height: '51px',
    '& >img': {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
    },
  },
  siteName: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: '32px',
    },
  },
  address: {
    '&.MuiTypography-root': {
      color: '#86868b',
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '16px',
    },
  },
  rightcontent: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  rightdetail: {
    display: 'flex',
    flexDirection: 'column',
  },
  id: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '16px',
    },
  },
  textLabel: {
    '&.MuiTypography-root': {
      color: '#86868b',
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '18px',
    },
  },
  idText: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '16px',
    },
  },
  textdetail: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
    },
  },
  Status: {
    display: 'flex',
    gap: '5px',
    borderRadius: '16px',
    backgroundColor: '#fef3f2',
    color: '#fa4949',
    fontSize: '12px',
    padding: '0px 8px 0px 8px',
    fontWeight: 500,
    lineHeight: '18px',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
