import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  rolesTopWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    justifyContent: 'space-between',
  },
  rolesMian: {
    display: 'flex',
    gap: '20px',
    width: '100%',
  },
  rolesLeftBar: {
    backgroundColor: 'transparent',
    borderRadius: '6px',
    display: 'flex',
    gap: '12px',
    minWidth: '157px',
    flexDirection: 'column',
    alignContent: 'space-between',
    boxShadow: 'none',
    flexBasis: '225px',
    '& .MuiButtonBase-root': {
      textAlign: 'left',
      justifyContent: 'flex-start',
      color: `${theme.palette.textPlaceholder}`,
      '&.MuiButton-primary': {
        color: `${theme.palette.textOnColor}`,
      },
    },
  },
  rolesRightBar: {
    flex: '1 0 auto',
  },
  zoneCustomText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
    },
  },
  zoneDetailText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
    },
  },
  rightButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  rolesButtonsBar: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '21px',
  },
  statesButtons: {
    height: '37px',
    borderRadius: '8px !important',
    padding: '1px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& button.MuiButtonBase-root': {
      border: '0px !important',
      padding: '4px 16px !important',
      minWidth: '112px',
    },
    '& .Mui-selected': {
      borderRadius: '6px !important',
      backgroundColor: `${theme.palette.textBrand} !important`,
      color: 'white !important',
      '& .MuiBox-root': {
        borderRadius: '6px',

        background: `${theme.palette.surfaceBrandSubtle} !important`,
        color: `${theme.palette.textBrand} !important`,
      },
    },
  },
  moudlesRoles: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    maxHeight: 'calc(100vh - 292px)',
  },
  rolesBottombar: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    bottom: '0',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '12px 32px 0px 32px',
    marginTop: '24px',
    width: '100%',
    left: '0px',
  },
  rolesValueButton: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  rolesButton: {
    display: 'inline-block',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
}));
