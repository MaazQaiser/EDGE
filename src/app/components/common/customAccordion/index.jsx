import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from './customAccordionStyle';
const CustomAccordion = ({
  summary,
  defaultExpanded = false,
  disabled = false,
  onChange,
  expandIcon = <ExpandMoreIcon />,
  children,
}) => {
  const classes = useStyles();
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disabled={disabled}
      onChange={onChange}
      className={classes.primaryAccordion}
    >
      <AccordionSummary expandIcon={expandIcon} aria-controls="panel-content" id="panel-header">
        {summary}
      </AccordionSummary>
      <AccordionDetails className={classes.accordionDetails}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default CustomAccordion;
CustomAccordion.propTypes = {
  summary: PropTypes.node.isRequired,
  defaultExpanded: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  expandIcon: PropTypes.node,
  children: PropTypes.node.isRequired,
};
