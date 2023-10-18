import React from 'react';
import useLabelService from './useLabelService';
import { AccountLabels } from '@types';
import { isEqual } from 'lodash';

function useStoredLabels() {
  const labelService = useLabelService();
  const [storedLabels, setStoredLabels] = React.useState<AccountLabels>(labelService.getStoredLabels());

  const prevLabelsRef = React.useRef<AccountLabels>(storedLabels);

  React.useEffect(() => {
    const currentLabels = labelService.getStoredLabels();
    if (!isEqual(prevLabelsRef.current, currentLabels)) {
      setStoredLabels(currentLabels);
      prevLabelsRef.current = currentLabels;
    }
  }, [labelService]);

  return storedLabels;
}

export default useStoredLabels;
