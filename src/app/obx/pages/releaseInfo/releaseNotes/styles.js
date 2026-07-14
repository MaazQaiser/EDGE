import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  releaseNotesContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  releaseCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '32px',
    backgroundColor: theme.palette.surfaceWhite,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    cursor: 'pointer',
    '&:nth-of-type(3n)': {
      borderRight: 'none',
    },
    '&:hover $hoverIcon': {
      opacity: 1,
      visibility: 'visible',
    },
  },
  detailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingLeft: '0',
  },
  detailItem: {
    '&.MuiBox-root': {
      fontSize: '13px',
      color: theme.palette.textSecondary1,
    },
    '& ul': {
      paddingLeft: '16px !important',
    },
    '& ol': {
      paddingLeft: '16px !important',
    },
    '& h1': {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.palette.textPrimary,
      lineHeight: '24px',
    },
    '& h2': {
      fontSize: '16px',
      fontWeight: '600',
      color: theme.palette.textPrimary,
      lineHeight: '24px',
    },
  },
  detailItemOneLine: {
    '&.MuiBox-root': {
      fontSize: '13px',
      color: theme.palette.textSecondary1,
      lineHeight: '18px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
    },
  },
  releaseHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
  },
  releaseHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusChip: {
    '&.MuiChip-root': {
      backgroundColor: theme.palette.surfaceGreySubtle,
      color: theme.palette.textSecondary1,
      fontSize: '12px',
      fontWeight: '500',
      height: '24px',
    },
  },
  releaseDate: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textPrimary,
      lineHeight: '20px',
      fontWeight: '700',
      marginBottom: '12px',
    },
  },
  releaseDateValue: {
    marginLeft: '4px',
    fontWeight: '400',
    color: theme.palette.textPrimary,
  },
  releaseDescription: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary1,
      lineHeight: '20px',
    },
  },
  hoverIcon: {
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.2s ease, visibility 0.2s ease',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  editIcon: {
    '& svg': {
      width: '16px',
      height: '16px',
      color: theme.palette.textPrimary,
    },
  },
}));
