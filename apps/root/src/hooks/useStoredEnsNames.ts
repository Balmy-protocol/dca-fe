import useServiceEvents from './useServiceEvents';
import useLabelService from './useLabelService';
import LabelService, { LabelServiceData } from '@services/labelService';

function useStoredEnsNames() {
  const labelService = useLabelService();

  const storedEnsNames = useServiceEvents<LabelServiceData, LabelService, 'getEnsNames'>(labelService, 'getEnsNames');

  return storedEnsNames;
}

export default useStoredEnsNames;
