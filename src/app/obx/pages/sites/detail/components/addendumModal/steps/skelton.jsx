import { Box, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  skeltonContainer: {
    padding: '24px 24px 0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  paymentSkelton: {
    padding: '24px 24px 0 24px',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    width: '100%',
  },
}));

export function ServicesSkelton() {
  const classes = useStyles();
  return (
    <Box className={classes.skeltonContainer}>
      <Skeleton
        variant="rectangular"
        height={20}
        sx={{ borderRadius: '8px !important', maxWidth: '30%' }}
      />
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '100%' }}
      />
      <Skeleton
        variant="rectangular"
        height={40}
        sx={{ borderRadius: '8px !important', maxWidth: '30%' }}
      />
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />
      <Skeleton
        variant="rectangular"
        height={40}
        sx={{ borderRadius: '8px !important', maxWidth: '30%' }}
      />
      <Skeleton
        variant="rectangular"
        height={350}
        sx={{ borderRadius: '8px !important', maxWidth: '100%' }}
      />
      <Skeleton
        variant="rectangular"
        height={350}
        sx={{ borderRadius: '8px !important', maxWidth: '100%' }}
      />
    </Box>
  );
}

export function DeviceSkelton() {
  const classes = useStyles();
  return (
    <Box className={classes.skeltonContainer}>
      <Skeleton
        variant="rectangular"
        height={20}
        sx={{ borderRadius: '8px !important', maxWidth: '30%' }}
      />
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />
      <Skeleton
        variant="rectangular"
        height={20}
        sx={{ borderRadius: '8px !important', maxWidth: '30%' }}
      />
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />
      <Skeleton
        variant="rectangular"
        height={20}
        sx={{ borderRadius: '8px !important', maxWidth: '30%' }}
      />
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />
    </Box>
  );
}
export function OnDemandSkelton() {
  const classes = useStyles();
  return (
    <Box className={classes.skeltonContainer}>
      <Skeleton
        variant="text"
        height={20}
        sx={{ borderRadius: '8px !important', maxWidth: '40%' }}
      />
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />{' '}
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />{' '}
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />
      <Skeleton
        variant="text"
        height={20}
        sx={{ borderRadius: '8px !important', maxWidth: '40%' }}
      />
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />{' '}
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />{' '}
      <Skeleton
        variant="rectangular"
        height={50}
        sx={{ borderRadius: '8px !important', maxWidth: '50%' }}
      />
    </Box>
  );
}
export function PaymentSkelton() {
  const classes = useStyles();
  return (
    <Box className={classes.paymentSkelton}>
      <Skeleton
        variant="rectangular"
        height={20}
        sx={{ borderRadius: '8px !important', maxWidth: '130px', width: '100%' }}
      />
      <Skeleton
        variant="rectangular"
        height={30}
        sx={{ borderRadius: '8px !important', maxWidth: '60%', width: '100%' }}
      />
    </Box>
  );
}
