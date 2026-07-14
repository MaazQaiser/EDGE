import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siderBarBox: {
    padding: '32px',
    height: '100vh',
  },
  boxInner: {
    '&.MuiStack-root': {
      height: '100%',
    },
  },
  sideHeader: {
    display: 'block',
    height: '100%',
  },
  fieldWrapper: {
    marginBottom: '24px',
    '& .placeHolderColor': {
      color: `${theme.palette.textPlaceholderField}`,
    },
  },

  moreFilter: {
    '&.MuiButtonBase-root': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '0px',
      color: '#262527',
      textTransform: 'capitalize',
      marginBottom: '18px',
    },
    '& svg': {
      width: '10px',
      height: '10px',
      marginLeft: '8px',
    },
  },
  placeHolderColor: {
    fontSize: '16px !important',
    fontWeight: '400 !important',
  },
  dropdownWrap: {
    height: '45px !important',
  },
  conditionMessage: {
    borderRadius: '8px',
    background: `${theme.palette.surfaceBrandSubtle}`,
    padding: '10px 24px',
    '&.MuiTypography-root': {
      color: `${theme.palette.textBrand}`,
    },
  },
  locationForm: {
    height: 'calc(100% - 160px)',
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'column',
  },
  appliedFilters: {
    display: 'flex',
    gap: '16px',
    '& .MuiTypography-root': {
      padding: '10px 0px',
      color: `${theme.palette.textPrimary}`,
    },
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '24px',
    marginBottom: '24px',
  },
  filterNames: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '& .MuiTypography-root': {
      padding: '7px 10px',
      color: `${theme.palette.textSecondary1}`,
      background: `${theme.palette.surfaceGreySubtle}`,
      borderRadius: '48px',
    },
  },
}));
