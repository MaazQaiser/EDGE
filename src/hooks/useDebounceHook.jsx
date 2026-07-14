import { useState } from 'react';

const useDebounceHook = (callback, delay = 400) => {
  const [timeoutId, setTimeoutId] = useState(null);

  const debounceFunction = (args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const id = setTimeout(() => {
      callback.apply(null, args);
    }, delay);

    setTimeoutId(id);
  };

  return (...args) => {
    debounceFunction(args);
  };
};

export default useDebounceHook;
