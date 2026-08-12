import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  drawerRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '22px 32px 18px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  headerTextWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  heading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  subheading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontSize: '13px',
    },
  },
  closeButton: {
    marginTop: '8px',
    '& svg': {
      width: '14px',
      height: '14px',
    },
  },

  // Scrollable body
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '18px 24px',
    display: 'flex',
    flexDirection: 'column',
  },
  divider: {
    '&.MuiDivider-root': {
      marginTop: '14px',
      marginBottom: '16px',
      borderColor: theme.palette.borderSubtle1,
    },
  },
  breakdownSection: {
    marginTop: '14px',
  },
  breakdownDivider: {
    '&.MuiDivider-root': {
      marginTop: '14px',
      marginLeft: '-24px',
      marginRight: '-24px',
      borderColor: theme.palette.borderSubtle1,
    },
  },

  // Date section
  sectionLabel: {
    '&.MuiTypography-root': {
      fontSize: '13px',
      fontWeight: 600,
      lineHeight: 1.5,
      color: `${theme.palette.textSecondary3} !important`,
      marginBottom: '14px',
    },
  },
  datePickerWrapper: {
    width: '100%',
    // Make the range picker fill the parent width
    '& .MuiStack-root': {
      width: '100%',
    },
    '& .MuiStack-root > div': {
      width: '100%',
    },
    '& .MuiFormControl-root': {
      width: '100%',
    },
    '& .MuiTextField-root': {
      width: '100%',
    },
    // Input height + vertical centering of value and calendar icon
    '& .MuiInputBase-root': {
      height: '40px !important',
      alignItems: 'center',
    },
    // Selected dates font size
    '& .MuiInputBase-input': {
      fontSize: '14px !important',
      color: `${theme.palette.textPrimary} !important`,
    },
    // Calendar icon size (override the component's 20px)
    '& .MuiButtonBase-root svg, & .MuiInputAdornment-root svg': {
      width: '15px !important',
      height: '15px !important',
    },
  },
  jobsCount: {
    '&.MuiTypography-root': {
      fontSize: '13px',
      color: theme.palette.textSecondary3,
      marginTop: '10px',
    },
  },
  jobsCountStrong: {
    fontWeight: 600,
    color: theme.palette.textPrimary,
  },
  jobsCountSkeleton: {
    '&.MuiSkeleton-root': {
      width: '180px',
      height: '18px',
      borderRadius: '4px',
      transform: 'none',
      marginTop: '10px',
    },
  },

  // Quantities summary
  needTitle: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary1} !important`,
      marginBottom: '10px',
    },
  },
  noFilters: {
    '&.MuiTypography-root': {
      fontSize: '13px',
      color: theme.palette.textSecondary3,
    },
  },
  quantitiesRow: {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '0px',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  quantityBox: {
    flex: '0 0 156px',
    width: '156px',
    minWidth: '156px',
    boxSizing: 'border-box',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    '&:last-child': {
      borderRight: 'none',
    },
  },
  quantityName: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary} !important`,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  quantityValue: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textBrand} !important`,
    },
  },
  quantityNameSkeleton: {
    '&.MuiSkeleton-root': {
      width: '70px',
      height: '14px',
      borderRadius: '4px',
      transform: 'none',
    },
  },
  quantityValueSkeleton: {
    '&.MuiSkeleton-root': {
      width: '30px',
      height: '16px',
      borderRadius: '4px',
      transform: 'none',
    },
  },

  // Detail breakdown
  breakdownToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    userSelect: 'none',
    width: 'fit-content',
  },
  breakdownToggleText: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 600,
      color: `${theme.palette.textBrand} !important`,
    },
  },
  breakdownCaret: {
    color: theme.palette.textBrand,
    transition: 'transform 0.2s ease',
    fontSize: '16px',
  },
  breakdownCaretOpen: {
    transform: 'rotate(180deg)',
  },
  breakdownToggleSkeleton: {
    '&.MuiSkeleton-root': {
      width: '140px',
      height: '20px',
      borderRadius: '4px',
      transform: 'none',
    },
  },

  // Detail table
  breakdownTable: {
    marginTop: '12px',
    marginLeft: '-24px',
    marginRight: '-24px',
    // Cancel the body's 18px bottom padding so the table sits flush at the bottom
    marginBottom: '-18px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  columnsHeader: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.6fr 2fr',
    gap: '12px',
    padding: '10px 32px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  columnHeading: {
    '&.MuiTypography-root': {
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      lineHeight: 1.5,
      color: `${theme.palette.textSecondary3} !important`,
    },
  },
  dateGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 32px',
    background: theme.palette.surfaceGreyLight,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  dateGroupTitle: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.4px',
      color: theme.palette.textPrimary,
    },
  },
  dateGroupCount: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      color: theme.palette.textSecondary3,
    },
  },
  detailRow: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.6fr 2fr',
    gap: '12px',
    alignItems: 'center',
    padding: '10px 32px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  productPill: {
    display: 'inline-flex',
    alignItems: 'center',
    width: 'fit-content',
    padding: '3px 9px',
    borderRadius: '5px',
    fontSize: '12px',
    fontWeight: 500,
    color: theme.palette.textBrand,
    backgroundColor: theme.palette.surfaceBrandSubtle,
    border: `1px solid ${theme.palette.borderBrand}`,
    whiteSpace: 'nowrap',
  },
  rowQty: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: 700,
      color: theme.palette.textPrimary,
    },
  },
  rowJob: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      color: theme.palette.textSecondary1,
      fontWeight: 400,
    },
  },

  // Footer
  footer: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '16px 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  viewPdfButton: {
    '&.MuiButton-root': {
      height: '40px',
      borderRadius: '8px',
      minWidth: '125px',
      fontSize: '14px',
      textTransform: 'none',
      boxShadow: 'none',
    },
  },
}));
