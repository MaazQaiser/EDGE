import PropTypes from 'prop-types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const DescriptionAIContext = createContext({
  selections: {},
  setSelection: () => {},
});

export const DescriptionAIProvider = ({ children, resetKey, selectionsRef }) => {
  const [selections, setSelections] = useState({});

  const setSelection = useCallback((questionId, mode) => {
    setSelections((prev) => ({ ...prev, [String(questionId)]: mode }));
  }, []);

  useEffect(() => {
    if (selectionsRef) {
      selectionsRef.current = {};
    }
    setSelections({});
  }, [resetKey, selectionsRef]);

  useEffect(() => {
    if (selectionsRef) {
      selectionsRef.current = selections;
    }
  }, [selections, selectionsRef]);

  const value = useMemo(() => ({ selections, setSelection }), [selections, setSelection]);

  return <DescriptionAIContext.Provider value={value}>{children}</DescriptionAIContext.Provider>;
};

DescriptionAIProvider.propTypes = {
  children: PropTypes.node,
  resetKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectionsRef: PropTypes.shape({ current: PropTypes.object }),
};

export const useDescriptionAI = () => useContext(DescriptionAIContext);
