import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as EmptyProposalIcon } from 'assets/svg/emptyProposal.svg?react';
import { useTranslation } from 'react-i18next';
const useStyles = makeStyles((theme) => ({
  notesBox: {
    '&.MuiBox-root': {
      textAlign: 'center',
      padding: '40px !important',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
  notesError: {
    '&.MuiTypography-root': {
      margin: '30px 0px 0px 0px',
    },
  },
  notesMessage: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary2}`,
      marginBottom: '14px',
    },
  },
}));

const RelevantEmptyState = () => {
  const { t } = useTranslation();
  const classes = useStyles(); // Move the 'classes' assignment inside the component
  return (
    <Box className={classes.notesBox}>
      <EmptyProposalIcon />
      <Typography variant="h2" className={classes.notesError}>
        {t('sales.deals.nofound')}
      </Typography>
      <Typography variant="body2" className={classes.notesMessage}>
        {t('sales.deals.nofoundText')}
      </Typography>
    </Box>
  );
};

export default RelevantEmptyState;
