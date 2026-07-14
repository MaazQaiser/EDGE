import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
const InfiniteScrollCustom = ({ lastElement, getMoreData, body }) => {
  const observer = useRef(null);

  useEffect(() => {
    const currentElement = lastElement;
    if (observer.current) observer.current.disconnect();

    observer.current = new window.IntersectionObserver((entry) => {
      const first = entry[0];
      if (first.isIntersecting) {
        getMoreData();
      }
    });

    const { current: currentObserver } = observer;

    if (currentElement) currentObserver.observe(currentElement);

    return () => currentObserver.disconnect();
  }, [lastElement]);

  return (
    /**
     * Need to move this body to the parent element.
     * if we did so we need to handle the lastElement state.
     */
    <>{body()}</>
  );
};

InfiniteScrollCustom.propTypes = {
  lastElement: PropTypes.any,
  getMoreData: PropTypes.func,
  body: PropTypes.func,
};

export default InfiniteScrollCustom;
