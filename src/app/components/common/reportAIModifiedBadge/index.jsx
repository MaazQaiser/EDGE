import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    borderRadius: 16,
    padding: '2px 10px',
    flexShrink: 0,
  },
  needsReview: {
    color: theme.palette?.warning?.main || '#e67e00',
    backgroundColor: 'rgba(230, 126, 0, 0.12)',
    border: '1px solid rgba(230, 126, 0, 0.35)',
  },
  needsReviewIcon: {
    width: 14,
    height: 14,
    flexShrink: 0,
  },
  aiRefined: {
    color: '#fff',
    background: 'linear-gradient(90deg, #2d7ff9 0%, #7c3aed 100%)',
    border: 'none',
  },
  aiRefinedIcon: {
    width: 14,
    height: 14,
    flexShrink: 0,
  },
}));

/** Report row / shift row: `isAIModified === true` shows AI Refined; otherwise Needs review. */
const ReportAIModifiedBadge = ({ isAIModified }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const refined = isAIModified === true;

  if (refined) {
    return (
      <Box
        className={`${classes.base} ${classes.aiRefined}`}
        component="span"
        data-testid="report-ai-refined-badge"
        title={t('obx.shiftReports.aiBadge.aiRefined')}
      >
        <AutoAwesomeIcon className={classes.aiRefinedIcon} fontSize="inherit" />
        {t('obx.shiftReports.aiBadge.aiRefined')}
      </Box>
    );
  }

  return (
    <Box
      className={`${classes.base} ${classes.needsReview}`}
      component="span"
      data-testid="report-needs-review-badge"
      title={t('obx.shiftReports.aiBadge.needsReview')}
    >
      <ErrorOutlineIcon className={classes.needsReviewIcon} fontSize="inherit" />
      {t('obx.shiftReports.aiBadge.needsReview')}
    </Box>
  );
};

ReportAIModifiedBadge.propTypes = {
  isAIModified: PropTypes.bool,
};

export default ReportAIModifiedBadge;
