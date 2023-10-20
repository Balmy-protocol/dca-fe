import React from 'react';
import { AccountLabels } from '@types';
import useLabelService from './useLabelService';

function useLabelHandler(address: string, storedLabels: AccountLabels) {
  const labelService = useLabelService();
  const [newLabelValue, setNewLabelValue] = React.useState<string>('');
  const [isFocus, setIsFocus] = React.useState<boolean>(false);

  const handleBlur = async () => {
    setIsFocus(false);
    if (!newLabelValue) {
      await labelService.deleteLabel(address);
    } else if (storedLabels[address]) {
      await labelService.editLabel(newLabelValue, address);
    } else {
      await labelService.postLabels({ [address]: newLabelValue });
    }
  };

  const handleFocus = () => {
    setIsFocus(true);
    setNewLabelValue(storedLabels[address] || '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewLabelValue(e.target.value);
  };

  return {
    newLabelValue,
    handleBlur,
    handleFocus,
    handleChange,
    isFocus,
  };
}

export default useLabelHandler;
