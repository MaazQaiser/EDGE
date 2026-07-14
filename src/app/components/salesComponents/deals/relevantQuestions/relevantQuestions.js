import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    position: 'relative',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  pointColm: {
    backgroundColor: `${theme.palette.surfaceGreySubtle}`,
    flex: '0 0 60px',
    justifyContent: 'center',
  },
  pointHeading: {
    padding: '24px 10px',
  },
  wrapClass: {
    display: 'flex',
    alignItems: 'center',
  },
  radioOption: {
    '&.MuiFormControl-root': {
      width: '100%',
    },
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      marginLeft: '0px',
    },
    '& .MuiFormControlLabel-root': {
      '&:not(:last-child)': {
        marginBottom: '18px',
      },
    },
    '& .MuiButtonBase-root': {
      paddingBottom: '0px ',
      marginRight: '0px',
      paddingTop: '0px',
    },
  },
  fieldWrapper: {
    width: '100%',
  },
  relvantWrap: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: '1 1',
    overflow: 'auto',
  },
  QuestionInnerBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },
  questionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },
  updateQuestion: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px 0px 0px 0px',
    display: 'flex',
    justifyContent: 'flex-end',
    '&. MuiButtonBase-root': {
      padding: '8px 14px !important',
    },
  },
  button: {
    padding: '8px 14px !important',
  },
  questionHeaderMain: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },
  radioOptionGrid: {
    display: 'grid !important',
    gridTemplateColumns: '1fr !important',
    '& .MuiButtonBase-root': {
      padding: '0px 8px !important',
    },
  },
  InnerColRow: {
    padding: '16px 0px 16px 24px',
    flex: '0 0 90%',
  },
  headingColm: {
    marginBottom: '16px',
    '& h6.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  dropdownCommonSection: {
    width: '420px',
  },
}));
