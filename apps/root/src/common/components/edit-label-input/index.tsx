import useEditLabel from '@hooks/useEditLabel';
import useStoredLabels from '@hooks/useStoredLabels';
import { SetStateCallback } from 'common-types';
import React from 'react';
import { TextField, TextFieldProps } from 'ui-library';

type EditLabelInputProps = TextFieldProps & {
  labelAddress: string;
  newLabelValue: string;
  setNewLabelValue: SetStateCallback<string>;
  disableLabelEdition?: () => void;
};

const EditLabelInput = ({
  labelAddress,
  newLabelValue,
  setNewLabelValue,
  disableLabelEdition,
  ...inputProps
}: EditLabelInputProps) => {
  const storedLabels = useStoredLabels();
  const [isFocus, setIsFocus] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { triggerUpdate } = useEditLabel();

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBlur = async () => {
    setIsFocus(false);
    await triggerUpdate(newLabelValue, labelAddress);
    if (disableLabelEdition) {
      disableLabelEdition();
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
      inputRef={inputRef}
    />
  );
};

export default EditLabelInput;
