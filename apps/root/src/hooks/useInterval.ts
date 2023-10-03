import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
const useInterval = (callback: Function, delay?: number | null) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const savedCallback = useRef<Function>(() => {});

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (delay !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const interval = setInterval(() => savedCallback.current(), delay || 0);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [delay]);
};

export default useInterval;
