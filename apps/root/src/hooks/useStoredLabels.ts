import React from 'react';
import useLabelService from './useLabelService';
import useServiceEvents from './useServiceEvents';
import LabelService, { LabelServiceData } from '@services/labelService';

function useStoredLabels() {
  const labelService = useLabelService();

  const storedLabels = useServiceEvents<LabelServiceData, LabelService, 'getLabels'>(labelService, 'getLabels');

  return React.useMemo(() => storedLabels, [storedLabels]);
}

export default useStoredLabels;
