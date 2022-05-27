import isUndefined from 'lodash/isUndefined';
import React from 'react';

function usePrevious<T>(value: T, updateOnUndefined = true) {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    if (isUndefined(value)) {
      if(updateOnUndefined) {
        ref.current = value;
      }
    } else {
      ref.current = value;
    }
  });
  return ref.current;
}

export default usePrevious;
