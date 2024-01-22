import useLabelService from './useLabelService';
import useServiceEvents from './useServiceEvents';
import LabelService, { LabelServiceData } from '@services/labelService';

function useStoredLabels() {
  const labelService = useLabelService();

  const storedLabels = useServiceEvents<LabelServiceData, LabelService>(labelService, 'labels');

  return storedLabels;
}

export default useStoredLabels;
