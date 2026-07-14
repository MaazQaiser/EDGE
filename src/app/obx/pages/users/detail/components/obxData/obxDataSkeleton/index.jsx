import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, Box, Skeleton, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import { useStyles } from './obxDataSkeleton.styles';

const ObxDataSkeleton = ({ isProfile }) => {
  const classes = useStyles();

  const renderSkeletonAccordion = (index) => (
    <Accordion key={index} className={classes.accordion} expanded={false} disabled>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.accordionSummary}>
        <Box className={classes.accordionHeader}>
          <Box className={classes.accordionTitle}>
            <Typography className={classes.accordionTitle}>
              <Skeleton variant="text" width={60} height={24} />
            </Typography>

            <Box>
              <Skeleton variant="rectangular" width={64} height={24} />
            </Box>

            <Typography>
              <Skeleton variant="text" width={40} height={20} />
            </Typography>

            <Typography>
              <Skeleton variant="text" width={100} height={20} />
            </Typography>
          </Box>

          <Box className={classes.accordionTitle}>
            <Typography>
              <Skeleton variant="text" width={70} height={20} />
            </Typography>
            <Typography>
              <Skeleton variant="text" width={140} height={20} />
            </Typography>

            {!isProfile && (
              <>
                <Typography>
                  <Skeleton variant="text" width={70} height={20} />
                </Typography>
                <Box className={classes.accordionChip}>
                  <Skeleton variant="rectangular" width={64} height={24} />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </AccordionSummary>
    </Accordion>
  );

  return (
    <Box className={classes.obxDataContainer}>
      {/* Added accordion loader skeletons */}
      {[1, 2, 3, 4].map((i) => renderSkeletonAccordion(i))}
    </Box>
  );
};

ObxDataSkeleton.propTypes = {
  isProfile: PropTypes.bool,
};

ObxDataSkeleton.defaultProps = {
  isProfile: false,
};

export default ObxDataSkeleton;
