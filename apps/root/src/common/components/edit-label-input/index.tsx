import useLabelService from '@hooks/useLabelService';
import useStoredLabels from '@hooks/useStoredLabels';
import { SetStateCallback } from 'common-types';
import React from 'react';
import { TextField, TextFieldProps } from 'ui-library';

type EditLabelInputProps = TextFieldProps & {
  labelAddress: string;
  newLabelValue: string;
  setNewLabelValue: SetStateCallback<string>;
  finishLabelEdition?: () => void;
};

const EditLabelInput = ({
  labelAddress,
  newLabelValue,
  setNewLabelValue,
  finishLabelEdition,
  ...inputProps
}: EditLabelInputProps) => {
  const labelService = useLabelService();
  const storedLabels = useStoredLabels();
  const [isFocus, setIsFocus] = React.useState(false);

  const handleBlur = async () => {
    setIsFocus(false);
    if (!newLabelValue) {
      await labelService.deleteLabel(labelAddress);
    } else if (!storedLabels[labelAddress]?.label) {
      await labelService.postLabels({ [labelAddress]: { label: newLabelValue } });
    } else if (storedLabels[labelAddress]?.label !== newLabelValue) {
      await labelService.editLabel(newLabelValue, labelAddress);
    }

    if (finishLabelEdition) {
      finishLabelEdition();
    }
  };

  const handleFocus = () => {
    setIsFocus(true);
    setNewLabelValue(storedLabels[labelAddress]?.label ?? '');
  };

  return (
    <TextField
      {...inputProps}
      value={isFocus ? newLabelValue : storedLabels[labelAddress]?.label ?? ''}
      onChange={(e) => setNewLabelValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
};

export default EditLabelInput;
