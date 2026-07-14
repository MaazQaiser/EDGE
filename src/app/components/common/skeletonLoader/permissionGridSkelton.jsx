import { Box, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles(() => ({
  moduleWrapper: {
    width: '100%',
    marginTop: '16px',
  },
  moduleHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '16px',
  },
  gridItem: {
    marginBottom: '16px',
    borderRadius: '8px',
  },
}));

const PermissionGridSkelton = () => {
  const classes = useStyles();

  return (
    <Box className={classes.moduleWrapper}>
      <Box className={classes.moduleHeader}>
        <Skeleton
          animation="wave"
          variant="text"
          width={100}
          height={40}
          sx={{ borderRadius: '8px !important' }}
        />
        <Skeleton
          animation="wave"
          variant="rectangular"
          width={100}
          height={40}
          sx={{ borderRadius: '8px !important' }}
        />
      </Box>
      <Box className={`${classes.gridContainer} ${classes.headerGrid}`}>
        {['create', 'view', 'update', 'delete'].map((type) => (
          <Skeleton
            key={type}
            animation="wave"
            variant="rectangular"
            width={'100%'}
            height={50}
            className={classes.gridItem}
            sx={{ borderRadius: '8px !important' }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PermissionGridSkelton;
