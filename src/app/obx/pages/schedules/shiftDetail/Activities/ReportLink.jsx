import { Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// import { Link } from 'react-router-dom';
// import { HO_TEMPLATE_PREVIEW, OBX_REPORTS } from 'src/app/router/constant/ROUTE';
import { useStyles } from './activities.styles';

const ReportLink = ({ onClick }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Button
      // to={reportId ? `${OBX_REPORTS}/${reportId}` : `${HO_TEMPLATE_PREVIEW}/${templateId}`}
      // target={'_blank'}

      className={classes.dutyDetailReportsLink}
      type={'button'}
      onClick={onClick}
    >
      {t('obx.schedules.dutyDetail.activities.viewReport')}
    </Button>
  );
};

ReportLink.propTypes = {
  templateId: PropTypes.number,
  reportId: PropTypes.number,
  onClick: PropTypes.func,
};

export default ReportLink;
