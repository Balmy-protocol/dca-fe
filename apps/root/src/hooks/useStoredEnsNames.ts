import EnsService, { EnsServiceData } from '@services/ensService';
import useEnsService from './useEnsService';
import useServiceEvents from './useServiceEvents';

function useStoredEnsNames() {
  const ensService = useEnsService();

  const storedEnsNames = useServiceEvents<EnsServiceData, EnsService, 'getEnsNames'>(ensService, 'getEnsNames');

  return storedEnsNames;
}

export default useStoredEnsNames;
