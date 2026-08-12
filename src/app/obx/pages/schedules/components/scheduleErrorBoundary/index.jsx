import { Box, Button, Typography } from '@mui/material';
import debug from 'debug';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { ReactComponent as NoShiftIcon } from 'src/assets/images/no-shift.svg';

const log = debug('signel:error:app:schedules:ScheduleErrorBoundary');

/**
 * Scoped boundary for the schedule calendar and its drawers.
 *
 * Only the app-level boundary existed before, so a single bad payload in a
 * drawer (a non-array missed-visits response, for one) blanked the entire
 * application and forced a reload. Failing inside this subtree keeps the app
 * shell, navigation and tenant chrome alive, and `resetKey` clears the error
 * when the user changes tab / view / week so recovery does not need a refresh.
 */
class ScheduleErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error, errorInfo) {
    log(error?.message);
    log(errorInfo?.componentStack);
  }

  handleRetry() {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  }

  render() {
    const { children, t } = this.props;

    if (!this.state.hasError) return children;

    return (
      <Box
        role="alert"
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <NoShiftIcon style={{ width: 96, height: 96 }} />
        <Typography variant="h2">{t('obx.schedules.calendar.loadError.title')}</Typography>
        <Typography variant="body2" sx={{ maxWidth: 420 }}>
          {t('obx.schedules.calendar.loadError.description')}
        </Typography>
        <Button variant="primary" onClick={this.handleRetry} sx={{ marginTop: '8px' }}>
          {t('obx.schedules.calendar.loadError.retry')}
        </Button>
      </Box>
    );
  }
}

ScheduleErrorBoundary.propTypes = {
  children: PropTypes.node,
  /** Changing this value clears a captured error (tab / view / week change). */
  resetKey: PropTypes.any,
  onRetry: PropTypes.func,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(ScheduleErrorBoundary);
