import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  locationTD: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },

  locationName: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  locationNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },

  error: {
    fontSize: 11,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
    position: 'absolute',
    top: '-25px',
  },
}));
