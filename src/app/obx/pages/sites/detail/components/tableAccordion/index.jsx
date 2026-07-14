import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { ReactComponent as ChevronUpIcon } from 'assets/svg/chevron-up.svg?react';
import PropTypes from 'prop-types';
import { useState } from 'react';

const TableAccordion = ({ children, header, accordionNo }) => {
  const [accordionOpen, setAccordionOpen] = useState(false);

  return (
    <Accordion defaultExpanded={accordionNo === 0 ? true : false}>
      <AccordionSummary
        expandIcon={
          <ChevronUpIcon
            style={{ cursor: 'pointer' }}
            onClick={() => setAccordionOpen(!accordionOpen)}
          />
        }
        sx={{ cursor: 'unset !important' }}
      >
        {header}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

TableAccordion.propTypes = {
  children: PropTypes.node,
  header: PropTypes.string,
  accordionNo: PropTypes.number,
};

export default TableAccordion;
