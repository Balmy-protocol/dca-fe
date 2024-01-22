import useLabelService from './useLabelService';

function useStoredLabels() {
  const labelService = useLabelService();
  return labelService.labels;
}

export default useStoredLabels;
