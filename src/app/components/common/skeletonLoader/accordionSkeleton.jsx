import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Skeleton } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

export const useStyles = makeStyles((theme) => ({
  accordionCollapseContainer: {
    pointerEvents: 'none',
    '& .MuiAccordion-root': {
      '&:nth-child(1).MuiPaper-root': {
        borderBottom: 'none',
      },
    },
    '& .MuiPaper-root ': {
      boxShadow: 'none',
      padding: '0',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      margin: '0 !important',

      '&.MuiAccordion-rounded': {
        borderRadius: '0',
      },

      '&.Mui-expanded': {
        borderBottom: 'none',
        margin: '0',
      },

      '& .MuiCollapse-root': {
        '& .MuiAccordionDetails-root': {
          padding: '0',
        },
      },

      '& .MuiAccordionSummary-root': {
        flexDirection: 'row-reverse',
        gap: '10px',
        minHeight: 'auto',
        padding: '16px 24px',

        '& .MuiAccordionSummary-expandIconWrapper': {
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: theme.palette.surfaceGreySubtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },

        '& .MuiAccordionSummary-content': {
          justifyContent: 'space-between',
          gap: '10px',
          margin: 0,
          alignItems: 'center',
        },
      },
    },

    '& .MuiPaper-root:before': {
      height: 0,
    },
  },

  accordianSkeletonWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
  },

  accordianSkeletonLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  accordianStyles: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
}));

/**
 * @description Pie skeleton loader for all piechart used components
 * @param {String} className => Pass the class to overwrite the styles from parent component
 * @returns
 */

const AccordionSkeleton = ({ noOfRows = 1, accordionSkeletonHeader, children, pills }) => {
  const classes = useStyles();

  function numberToArray(number) {
    // Check if the input is a valid number
    if (typeof number !== 'number' || isNaN(number) || number < 0) {
      console.error('Please provide a valid non-negative number.');
      return;
    }

    // Create an array with length equal to the number
    const resultArray = Array.from({ length: number }, (_, index) => index);

    return resultArray;
  }

  const resultArray = numberToArray(noOfRows);

  return (
    <Box className={classes.accordionCollapseContainer}>
      {resultArray.map((el, index) => {
        return (
          <Accordion key={index} defaultExpanded={index === 0 ? true : false}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
              className={classes.accordianStyles}
            >
              {accordionSkeletonHeader ? (
                <Box className={classes.accordianSkeletonWrapper}>
                  <Box className={classes.accordianSkeletonLeft}>
                    <Skeleton variant="text" width={100} />
                    {pills && (
                      <>
                        <Skeleton variant="rounded" width={50} height={20} />
                        <Skeleton variant="rounded" width={20} height={20} />
                      </>
                    )}
                  </Box>
                  <Box className={classes.accordianSkeletonRight}>
                    <Skeleton variant="text" width={150} />
                  </Box>
                </Box>
              ) : (
                <Box className={classes.accordianSkeletonWrapper}>
                  <Skeleton variant="text" width={400} />
                  <Skeleton variant="rounded" width={150} />
                </Box>
              )}
            </AccordionSummary>
            <AccordionDetails className={classes.accodianDetails}>{children}</AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

AccordionSkeleton.defaultProps = {};

AccordionSkeleton.propTypes = {
  className: PropTypes.object,
  noOfRows: PropTypes.number,
  accordionSkeletonHeader: PropTypes.bool,
  children: PropTypes.node.isRequired,
  pills: PropTypes.bool,
};
export default AccordionSkeleton;
