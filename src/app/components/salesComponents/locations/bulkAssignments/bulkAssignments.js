import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  bulkTopWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: '16px',
    alignItems: 'baseline',
  },
  bulkChipsWrapper: {
    display: 'flex',
    gap: '12px',
  },
  BulkAssignWraper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },
  bulkChips: {
    color: `${theme.palette.textSecondary1} !important`,
    fontSize: '14px !important',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
    borderRadius: '48px !important',
    background: theme.palette.surfaceGreySubtle,
    padding: '7px 10px !important',
  },
  conditionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: '1 1',
    overflow: 'auto',
  },
  radioOption: {
    '&.MuiFormControl-root': {
      margin: '16px 0px 24px 0px',
      minWidth: '200px',
      marginRight: '0px !important',
    },
    '& .MuiFormControlLabel-label': {
      color: theme.palette.textPrimary,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '500',
      lineHeight: '20px',
      minWidth: '200px',
      marginRight: '0px !important',
    },
  },
  radioWrapper: {
    gap: '53px',
  },
  conditionMessage: {
    borderRadius: '8px',
    background: theme.palette.surfaceBrandSubtle,
    padding: '10px 24px',
    color: theme.palette.textBrand,
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '24px',
    letterSpacing: '0.05px',
  },
  dropHigh: {
    height: '42px',
  },
  secondDropdown: {
    marginTop: '30px',
  },
  divide: {
    '&.MuiDivider-root': {
      marginTop: '24px',
      marginBottom: '24px',
    },
  },
  checkBoxWrapper: {
    marginTop: '24px',
  },
  inineField: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    '& .MuiFormLabel-root': {
      marginBottom: '0',
      marginLeft: '8px',
    },
    '& .MuiButtonBase-root': {
      padding: '0',
    },
  },
}));
