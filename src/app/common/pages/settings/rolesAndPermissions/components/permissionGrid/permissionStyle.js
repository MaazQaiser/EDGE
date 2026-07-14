import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  moduleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    margin: '0 auto',
    width: '100%',
    overflow: 'auto',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 120px 120px 120px 120px',
    width: '100%',
  },
  headerCell: {
    '&.MuiTypography-root': {
      textAlign: 'center',
      color: theme.palette.textOnColor,
    },
  },
  moduleCell: {
    gap: '6px',
    '&.MuiTypography-root': {
      gap: '6px',
      textAlign: 'left',
      color: theme.palette.textOnColor,
    },
  },
  headerGrid: {
    position: 'sticky',
    top: '0px',
    zIndex: '100',
    height: '48px',
    padding: '12px 0px 12px 24px',
    alignItems: 'center',
    flexShrink: 0,
    alignSelf: 'stretch',
    background: theme.palette.surfaceBrand,
    // position: 'sticky',
    // top: '0',
    // zIndex: '1',
  },
  cell: {
    display: 'flex',
    padding: '13px 24px',
    alignItems: 'center',
    flex: '1 0 0',
    alignSelf: 'stretch',
    gap: '6px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '&:first-child': {
      borderLeft: `none`,
    },
    '&:last-child': {
      borderRight: `none`,
    },
    '& .custom-checkbox': {
      padding: '0px',
      '& svg': {
        width: '16px',
        height: '16px',
        borderRadius: '4px',
        fill: theme.palette.borderStrong1,
        background: theme.palette.surfaceWhite,
      },
      '&.Mui-checked': {
        '& svg': {
          fill: theme.palette.surfaceBrand,
        },
      },
    },
    '&.checkboxCell': {
      padding: '0px',
      justifyContent: 'center',
    },
  },
  subHeaderGrid: {
    background: theme.palette.surfaceGreySubtle,
  },
  moduleName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  sectionTitle: {
    '&.MuiTypography-root': {
      marginBottom: '16px',
    },
  },
  subPermissions: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '& .subModuleCell': {
      gap: '6px',
      borderBottom: `none`,
      borderTop: `none`,
    },
    '& .checkboxCell': {
      borderTop: `none`,
      borderBottom: `none`,
    },
    '& h6.MuiTypography-root': {
      marginLeft: '27px',
    },
  },
  subModuleCell: {
    gap: '6px',
  },
  parentCol: {
    '& svg': {
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPrimary,
      },
    },
  },
  subPermissionsCell: {
    display: 'flex',
    padding: '13px 24px',
    alignItems: 'center',
    flex: '1 0 0',
    alignSelf: 'stretch',
    borderLeft: `1px solid ${theme.palette.borderSubtle1}`,
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    '&:first-child': {
      borderLeft: `none`,
    },
    '&:last-child': {
      borderRight: `none`,
    },
    '& .custom-checkbox': {
      padding: '0px',
      '& svg': {
        width: '16px',
        height: '16px',
        borderRadius: '4px',
        fill: theme.palette.borderStrong1,
        background: theme.palette.surfaceWhite,
      },
      '&.Mui-checked': {
        '& svg': {
          fill: theme.palette.surfaceBrand,
        },
      },
    },
    '&.checkboxCell': {
      padding: '0px',
      justifyContent: 'center',
    },
  },
}));
