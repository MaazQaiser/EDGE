import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  indicatorMainWrapper: {
    cursor: 'inherit',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    overflow: 'hidden',
  },

  indicatorBar: {
    borderRadius: '5px',
    height: '14px',
    width: '2px',
  },

  dutyType: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'inline-block',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
}));
