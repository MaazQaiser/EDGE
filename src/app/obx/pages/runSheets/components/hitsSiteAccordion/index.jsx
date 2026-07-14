import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { ReactComponent as ChevronUpIcon } from 'assets/svg/chevron-up.svg?react';
import PropTypes from 'prop-types';

const HitsSiteAccordion = ({ children, header, className, showAccordion, setShowAccordion }) => {
  return (
    <Accordion className={className} defaultExpanded={false} expanded={showAccordion}>
      <AccordionSummary
        expandIcon={<ChevronUpIcon style={{ cursor: 'pointer', pointerEvents: 'auto' }} />}
        onClick={() => setShowAccordion(!showAccordion)}
      >
        {header}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

HitsSiteAccordion.propTypes = {
  children: PropTypes.node,
  header: PropTypes.object,
  className: PropTypes.object,
  showAccordion: PropTypes.bool,
  setShowAccordion: PropTypes.func,
};

export default HitsSiteAccordion;
