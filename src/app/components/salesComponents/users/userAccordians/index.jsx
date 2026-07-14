import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { getCount } from 'src/helper/utilityFunctions';

// import { openFile } from 'src/utils/files';
import DealsAccordianData from '../../companies/dealsAccordianData';
import { useStyles } from './accordian.js';

const BasicAccordion = ({ deals = [] }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Box className={classes.accordianWrapper}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h5">
            {`${t('commonText.deals')}`} • {getCount(deals?.length)}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {deals.length > 0 ? (
            deals.map((deal, i) => (
              <>
                <Typography variant="body2">{deal?.name}</Typography>
                <DealsAccordianData
                  key={i}
                  deal={deal?.description}
                  date={deal?.date}
                  amount={deal?.amount}
                  stage={deal?.stage}
                />
              </>
            ))
          ) : (
            <Typography variant="body2">{t('sales.users.noDealUsers')}</Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

BasicAccordion.propTypes = {
  deals: PropTypes.array,
  contacts: PropTypes.any, // You might want to replace 'any' with the specific PropTypes for your use case
  data: PropTypes.any, // Similarly, replace 'any' with the specific PropTypes for your use case
  setData: PropTypes.func,
  id: PropTypes.any, // Replace 'any' with the specific PropTypes for your use case
};

export default BasicAccordion;
