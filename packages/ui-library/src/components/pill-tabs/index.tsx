import React, { useEffect, useState } from 'react';
import { BigIntish } from '@balmy/sdk';
import isUndefined from 'lodash/isUndefined';
import { ContainerBox } from '../container-box';
import { Button } from '../button';
import styled from 'styled-components';
import { colors } from '../../theme';

interface PillTabsProps {
  options: {
    key: BigIntish;
    label: string;
  }[];
  // Usefull for controlled components
  onChange?: (key: BigIntish) => void;
  // Makes the component controlled
  selected?: BigIntish;
  disabled?: boolean;
}

const PillTab = styled(Button).attrs({
  variant: 'outlined',
  size: 'small',
  color: 'info',
})<{ selected: boolean }>`
  ${({
    selected,
    theme: {
      palette: { mode },
    },
  }) =>
    selected &&
    `
    background-color: ${colors[mode].background.secondary};
    border: 1.5px solid ${colors[mode].border.border1};
    color: ${colors[mode].accent.primary};
  `}
`;

const PillTabs = ({ options, onChange, selected, disabled }: PillTabsProps) => {
  const [uncontrolledSelection, setUncontrolledSelection] = useState<BigIntish | undefined>(options[0]?.key);

  useEffect(() => {
    if (isUndefined(uncontrolledSelection) && !isUndefined(options[0])) {
      setUncontrolledSelection(options[0].key);
    }
  }, [options]);

  const onSelect = (key: BigIntish) => {
    if (onChange) {
      onChange(key);
    }

    setUncontrolledSelection(key);
  };

  const selection = isUndefined(selected) ? uncontrolledSelection : selected;

  return (
    <ContainerBox gap={2}>
      {options.map(({ key, label }) => (
        <PillTab key={key.toString()} onClick={() => onSelect(key)} disabled={disabled} selected={key === selection}>
          {label}
        </PillTab>
      ))}
    </ContainerBox>
  );
};

export { PillTabs, type PillTabsProps };
