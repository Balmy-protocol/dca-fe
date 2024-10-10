import React from 'react';
import isNaN from 'lodash/isNaN';
import { SetStateCallback } from '@types';
import { TextField, ContainerBox, OptionsButtons } from 'ui-library';
import { DEFAULT_AGGREGATOR_SETTINGS, SLIPPAGE_PREDEFINED_RANGES } from '@constants/aggregator';
import { defineMessage, useIntl } from 'react-intl';

interface SlippageInputProps {
  id: string;
  value: string;
  onChange: (newValue: string) => void | SetStateCallback<string>;
}

const inputRegex = RegExp(/^((100)|(\d{1,2}(\.\d{0,2})?))%?$/);

const SlippageInput = ({ id, onChange, value }: SlippageInputProps) => {
  const intl = useIntl();
  const [setByUser, setSetByUser] = React.useState(false);
  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[*+?^${}()|[\]\\]/g, '\\$&')) || !nextValue) {
      onChange(nextValue);
      setSetByUser(true);
    }
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    setSetByUser(false);
  };

  const handleBlur = () => {
    if (isNaN(parseFloat(value))) {
      onChange(DEFAULT_AGGREGATOR_SETTINGS.slippage.toString());
    }
  };

  const parsedOptions = SLIPPAGE_PREDEFINED_RANGES.map(({ value: optionValue }) => ({
    value: optionValue,
    text: `${optionValue}%`,
  }));

  return (
    <ContainerBox gap={4} flexWrap="nowrap">
      <TextField
        id={id}
        placeholder={intl.formatMessage(
          defineMessage({ description: 'slippageInputPlaceholder', defaultMessage: 'Custom' })
        )}
        onChange={(evt) => validator(evt.target.value.replace(/,/g, '.'))}
        value={setByUser ? value : ''}
        onBlur={handleBlur}
        InputProps={{
          endAdornment: '%',
        }}
      />
      <OptionsButtons options={parsedOptions} activeOption={value} setActiveOption={handleChange} />
    </ContainerBox>
  );
};
export default SlippageInput;
