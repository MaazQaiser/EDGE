import PropTypes from 'prop-types';
import Schedules from 'src/app/obx/pages/schedules';

const Schedule = ({ data, className }) => {
  return <Schedules className={className} officerId={data?.id} />;
};

Schedule.propTypes = {
  data: PropTypes.object,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};
export default Schedule;
