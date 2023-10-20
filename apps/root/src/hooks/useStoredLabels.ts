import useLabelService from './useLabelService';

function useStoredLabels() {
  const labelService = useLabelService();
  return labelService.getStoredLabels();
}

export default useStoredLabels;
