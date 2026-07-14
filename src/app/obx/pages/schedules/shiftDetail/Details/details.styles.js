import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  dutyDetailGI: {
    marginBottom: '16px',
  },

  dutyDetailCheckpoints: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },

  // dutyDetailTabs: {
  //   padding: '24px ',
  // },

  dutyDetailGITitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      paddingBottom: '8px',
      // borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      marginBottom: '4px',
    },
  },
  dutyDetailGITitleAlert: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
      padding: '8px 12px',
      border: `1px solid ${theme.palette.borderAlert}`,
      background: theme.palette.surfaceAlertSubtle,
      borderRadius: '5px',
    },
  },
  dutyDetailGIList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    margin: '16px 0',
  },

  dutyDetailGIListItem: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dutyDetailGIListItemTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      textTransform: 'capitalize',
    },
  },

  dutyDetailGIListItemText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },

  dutyDetailCheckpoint: {
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },

  dutyDetailCheckpointImage: {
    display: 'block',
    width: '28px',
    height: '28px',
    objectFit: 'cover',
    objectPosition: 'center',
  },

  dutyDetailCheckpointDetail: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  dutyDetailCheckpointTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },

  dutyDetailCheckpointText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      textTransform: 'capitalize',
    },
  },

  dutyDetailGIListPerson: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  dutyDetailGIListAvatar: {
    border: `2px solid ${theme.palette.borderSubtle1}`,

    '&.MuiAvatar-root': {
      width: '28px',
      height: '28px',
    },
  },

  dutyDetailInstructions: {
    marginTop: '16px',
  },

  dutyDetailInstructionsContent: {
    marginTop: '16px',
  },

  dutyDetailInstructionsTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
    },
  },

  instructionContent: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    color: theme.palette.textSecondary2,
    marginTop: '16px',
    '& ul': {
      marginLeft: '16px',
    },

    '& ol': {
      marginLeft: '16px',
    },
  },

  dutyDetailInstructionsList: {
    '&.MuiList-root': {
      padding: 0,
      marginTop: '16px',
      listStyleType: 'disc',
      marginLeft: '24px',

      '& .MuiListItem-root': {
        display: 'list-item',
        padding: 0,
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '18px',
        color: theme.palette.textSecondary2,
      },
    },
  },

  detailsSkeletonWrapper: {
    padding: '16px',
  },

  detailsSkeletonTitle: {
    marginBottom: '24px',
    '& .MuiSkeleton-root': {
      height: '32px',
      width: '50%',
    },
  },

  detailsSkeletonContent: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '16px',

    '& .MuiSkeleton-root': {
      height: '32px',
      width: '35%',
    },
  },

  detailsSkeletonCard: {
    '& .MuiSkeleton-root': {
      height: '120px',
      borderRadius: '8px !important',
      marginTop: '8px',
    },
  },

  reassignedShift: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },

  reassignedShiftDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  reassignedShiftTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  reassignedShiftText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  reassignedShiftAvatar: {
    '&.MuiAvatar-root': {
      width: '32px',
      height: '32px',
    },
  },

  autoCheckout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    height: '36px',
    padding: '8px 12px',
    marginBottom: '16px',
    maxWidth: '100%',
  },
  autoLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
}));
