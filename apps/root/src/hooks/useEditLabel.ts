import React from 'react';
import useLabelService from './useLabelService';
import useStoredLabels from './useStoredLabels';

export default function useEditLabel() {
  const labelService = useLabelService();
  const storedLabels = useStoredLabels();
  const [isLoading, setIsLoading] = React.useState(false);

  const triggerUpdate = async (newLabelValue: string, labelAddress: string) => {
    try {
      setIsLoading(true);
      if (!newLabelValue) {
        await labelService.deleteLabel(labelAddress);
      } else if (!storedLabels[labelAddress]?.label) {
        await labelService.postLabels({ labels: [{ wallet: labelAddress, label: newLabelValue }] });
      } else if (storedLabels[labelAddress]?.label !== newLabelValue) {
        await labelService.editLabel(newLabelValue, labelAddress);
      }
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { triggerUpdate, isLoading };
}
