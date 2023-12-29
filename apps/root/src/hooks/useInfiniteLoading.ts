import React from 'react';

function useInfiniteLoading(fetchMoreElements: () => Promise<void>) {
  const lastElementRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          void fetchMoreElements();
        }
      });
    });

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }

    return () => {
      if (lastElementRef.current) {
        observer.unobserve(lastElementRef.current);
      }
    };
  }, [lastElementRef]);

  return lastElementRef;
}

export default useInfiniteLoading;
