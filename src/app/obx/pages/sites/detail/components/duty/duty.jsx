import PropTypes from 'prop-types';
import Schedules from 'src/app/obx/pages/schedules';

const Duty = ({ siteData, className }) => {
  return <Schedules className={className} selectedSite={siteData} />;
};

Duty.propTypes = {
  siteData: PropTypes.object,
  className: PropTypes.string,
};

export default Duty;
