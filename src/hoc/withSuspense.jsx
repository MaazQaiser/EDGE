import PropTypes from 'prop-types';
import { forwardRef, Suspense } from 'react';

import TopProgressBar from '../app/components/common/top-progress-bar/TopProgressBar';

// Get the display name of wrapped component for easier debugging in DevTools.
function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

// Define and export the HOC.
function withSuspense(WrappedComponent, LoadingElement = <TopProgressBar show={true} />) {
  // Container component for the wrapped component.
  function WithSuspense(props) {
    const { forwardedRef, ...rest } = props;

    return (
      <Suspense fallback={LoadingElement}>
        <WrappedComponent ref={forwardedRef} {...rest} />
      </Suspense>
    );
  }

  WithSuspense.propTypes = {
    forwardedRef: PropTypes.object,
  };

  // Render function for setting the passed `ref` to the wrapped component.
  function forwardRefRenderFunction(props, ref) {
    return <WithSuspense {...props} forwardedRef={ref} />;
  }

  // Give this HOC a more helpful display name in DevTools.
  forwardRefRenderFunction.displayName = `ForwardRef(WithSuspense(${getDisplayName(
    WrappedComponent,
  )}))`;

  // Forward the `ref` to the wrapped component.
  return forwardRef(forwardRefRenderFunction);
}
export default withSuspense;
