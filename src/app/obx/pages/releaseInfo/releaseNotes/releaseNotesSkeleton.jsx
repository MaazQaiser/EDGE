import { Box, Skeleton } from '@mui/material';
import React from 'react';

import { useStyles } from './styles';

const RELEASE_NOTES_PAGE_SIZE = 10;
const LOAD_MORE_SKELETON_COUNT = 3;

export const ReleaseNoteCardSkeleton = () => {
  const classes = useStyles();
  return (
    <Box className={classes.releaseCard}>
      <Box className={classes.releaseHeader}>
        <Box className={classes.releaseHeaderContent}>
          <Skeleton variant="text" width={120} height={32} />
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '4px' }} />
        </Box>
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
      <Skeleton variant="text" width={180} height={20} sx={{ marginBottom: '12px' }} />
      <Skeleton variant="text" width="100%" height={18} />
      <Skeleton variant="text" width="85%" height={18} />
      <Skeleton variant="text" width="90%" height={18} />
    </Box>
  );
};

const ReleaseNotesSkeleton = () => {
  const classes = useStyles();

  return (
    <Box className={classes.releaseNotesContainer}>
      {Array.from({ length: RELEASE_NOTES_PAGE_SIZE }, (_, i) => i + 1).map((index) => (
        <ReleaseNoteCardSkeleton key={index} />
      ))}
    </Box>
  );
};

export default ReleaseNotesSkeleton;
export { LOAD_MORE_SKELETON_COUNT };
