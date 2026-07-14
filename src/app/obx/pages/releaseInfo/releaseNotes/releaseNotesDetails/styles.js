import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    height: '100%',
  },
  layoutContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    height: '100%',
  },
  sidebar: {
    width: '222px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    [theme.breakpoints.down(786)]: {
      width: '100%',
      borderRight: 'none',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 20px',
    cursor: 'pointer',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&:hover': {
      backgroundColor: theme.palette.surfaceWhite,
    },
    '& svg': {
      width: '16px',
      height: '16px',
      color: theme.palette.textPrimary,
    },
  },
  backText: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '500',
      color: theme.palette.textPrimary,
    },
  },
  sidebarScrollable: {
    flex: 1,
    overflowY: 'auto',
  },
  sidebarTabs: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    width: '100%',
    '& .MuiTabs-indicator': {
      left: 0,
      right: 'auto',
      width: '3px',
      backgroundColor: theme.palette.textPrimary,
    },
    '& .MuiTabs-flexContainer': {
      flexDirection: 'column',
    },
    '& .MuiTab-root': {
      minHeight: '48px',
      textTransform: 'none',
      fontSize: '14px',
      fontWeight: '400',
      color: theme.palette.textPrimary,
      padding: '24px 32px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '0',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      textAlign: 'left',
      transition: 'background-color 0.2s ease, color 0.2s ease',
      '&.Mui-selected': {
        backgroundColor: theme.palette.textPrimary,
        color: '#FFFFFF',
      },
      '&:hover': {
        backgroundColor: theme.palette.textPrimary,
        color: '#FFFFFF',
      },
    },
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: theme.palette.surfaceWhite,
  },
  contentHeader: {
    padding: '32px 0 16px 0 ',
    width: '100%',
    maxWidth: '80%',
    margin: '0 auto',
    [theme.breakpoints.down(786)]: {
      padding: '20px 16px',
    },
  },
  versionTitle: {
    '&.MuiTypography-root': {
      fontSize: '24px',
      fontWeight: '600',
      color: theme.palette.textPrimary,
      marginBottom: '16px',
    },
  },
  releaseDate: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary1,
      marginBottom: '16px',
      fontWeight: '700',
    },
  },
  releaseDateText: {
    fontWeight: '400',
  },
  scopeNote: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary1,
      lineHeight: '20px',
    },
  },
  contentSeparator: {
    border: 'none',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,

    width: '100%',
    maxWidth: '100%',
  },
  contentBody: {
    flex: 1,
    overflowY: 'auto',
    width: '100%',
    maxWidth: '80%',
    margin: '0 auto',
  },
  tabContent: {
    padding: '16px 0 32px 0 ',
    [theme.breakpoints.down(786)]: {
      padding: '20px 16px',
    },
  },
  section: {
    marginBottom: '32px',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  sectionTitle: {
    '&.MuiTypography-root': {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.palette.textPrimary,
      marginBottom: '8px',
    },
  },
  sectionText: {
    color: theme.palette.textSecondary1,

    '& ol, & ul': {
      paddingLeft: '16px',
      marginBottom: '8px',
    },
    '& ol': {
      listStyle: 'decimal',
    },
    '& ul': {
      listStyle: 'disc',
    },
  },
  emptyText: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary1,
      textAlign: 'center',
      padding: '40px 0',
    },
  },
  emptyContentCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    width: '100%',
  },
  loadMoreSkeletonWrapper: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  loadMoreSkeletonItem: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '12px 24px',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  loadMoreSkeletonText: {
    '&.MuiSkeleton-root': {
      flex: '0 0 100%',
      maxWidth: '100%',
    },
  },
  // Skeleton loading state – mirrors main layout structure
  skeletonSidebarTabs: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    width: '100%',
  },
  skeletonTabItem: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '48px',
    padding: '24px 32px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  skeletonTabBar: {
    '&.MuiSkeleton-root': {
      borderRadius: '4px',
      height: '20px',
    },
  },
  skeletonVersionTitle: {
    '&.MuiSkeleton-root': {
      borderRadius: '6px',
      height: '32px',
      marginBottom: '16px',
    },
  },
  skeletonReleaseDate: {
    '&.MuiSkeleton-root': {
      borderRadius: '4px',
      height: '20px',
    },
  },
  skeletonContentLine: {
    '&.MuiSkeleton-root': {
      borderRadius: '4px',
      height: '30px',
      marginBottom: '12px',
    },
  },
}));
