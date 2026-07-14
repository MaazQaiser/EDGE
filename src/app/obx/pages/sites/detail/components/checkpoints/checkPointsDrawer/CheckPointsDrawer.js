import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainBoxForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    height: '100%',
  },
  headerWrap: {
    padding: '24px 24px 20px 24px',
    '& > div': {
      marginBottom: '0px',
    },
  },
  contentBox: {
    padding: '0px 24px 20px 24px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    height: '100%',
  },
  btnBox: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingTop: '24px',
    paddingBottom: '24px',
    alignItems: 'center',
    gap: '12px',
    margin: '0px 24px',
  },
  headerTitlle: {
    marginBottom: '20px',
  },
  zoneCustomText: {
    '&.MuiTypography-root': {
      fontWeight: 700,
      color: theme.palette.textSecondary1,
    },
  },
  zoneDetailText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  Icon: {
    marginBottom: '18px',
  },
  error: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
      fontSize: 14,
      lineHeight: '20px',
      fontWeight: 400,
      margin: 0,
      marginTop: '6px',
    },
  },
  brandbtn: {
    width: 'fit-content',
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
    },
    '& svg': {
      '& path': {
        stroke: theme.palette.surfaceBrand,
      },
    },
  },
}));
