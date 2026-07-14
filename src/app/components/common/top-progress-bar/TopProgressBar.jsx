import PropTypes from 'prop-types';
import TopBarProgressIndicator from 'react-topbar-progress-indicator';

TopBarProgressIndicator.config({
  barColors: {
    0: '#002737',
    '1.0': '#002737',
  },
});

export default function TopProgressBar({ show }) {
  return show ? <TopBarProgressIndicator /> : null;
}
TopProgressBar.propTypes = {
  show: PropTypes.bool.isRequired,
};
