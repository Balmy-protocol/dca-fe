import isUndefined from 'lodash/isUndefined';
import React from 'react';

function usePrevious<T>(value: T, updateOnUndefined = true, attributeToCheck?: keyof T) {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    if (isUndefined(value) || (attributeToCheck && isUndefined(value[attributeToCheck]))) {
      if (updateOnUndefined) {
        ref.current = value;
      }
    } else {
      ref.current = value;
    }
  });
  return ref.current;
}

export default usePrevious;
