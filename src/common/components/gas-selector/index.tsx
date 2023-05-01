import React, { useState } from 'react';
import capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import { GasKeys, GAS_KEYS, GAS_LABELS_BY_KEY } from 'config/constants/aggregator';

const StyledTabsContainer = styled.div`
  ${({ theme }) => `
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    background: ${theme.palette.mode === 'light' ? '#eee' : 'rgba(255, 255, 255, 0.12)'};
    align-items: center;
    border-radius: 30px;
    position: relative;
  `}
`;

const StyledTabItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
`;

const StyledTabItem = styled(Button)<{ $isSelected: boolean }>`
  flex-grow: 1;
  padding: 5px 10px;
  min-width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  text-transform: initial;
  opacity: ${(props) => (props.$isSelected ? '1' : '0.7')};

  &:hover {
    background-color: transparent;
    opacity: 1;
  }
`;

const StyledTabIndicator = styled.div<{ width: number; left: number; height: number; top: number }>`
  ${({ theme, left, top, width, height }) => `
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    left: ${left + 2}px;
    top: ${top + 2}px;
    width: ${width - 10}px;
    height: ${height - 5}px;
    position: absolute;
    &:after {
      content: '';
      position: absolute;
      background-color: ${theme.palette.mode === 'light' ? '#fff' : '#3076F6'};
      border-radius: 20px;
      box-shadow: 0 4px 12px 0 rgb(0 0 0 / 16%);
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: ${width - 5}px;
    }
  `}
`;
interface GasSelectorProps {
  onChange: (key: GasKeys) => void;
  selected: GasKeys;
}

interface CustomCurrent {
  offsetWidth: number;
  offsetLeft: number;
  offsetTop: number;
  offsetHeight: number;
}

const GasSelector = ({ selected, onChange }: GasSelectorProps) => {
  const [selectedRef, setSelectedRef] = useState<CustomCurrent | null>(null);

  return (
    <StyledTabsContainer>
      <StyledTabItemsContainer>
        {GAS_KEYS.map((gasKey) => (
          <StyledTabItem
            ref={(newRef) => (selected === gasKey && setSelectedRef(newRef)) || null}
            disableRipple
            key={gasKey}
            color="inherit"
            $isSelected={selected === gasKey}
            onClick={() => onChange(gasKey)}
          >
            {capitalize(GAS_LABELS_BY_KEY[gasKey])}
          </StyledTabItem>
        ))}
      </StyledTabItemsContainer>
      {selectedRef && (
        <StyledTabIndicator
          width={selectedRef.offsetWidth}
          left={selectedRef.offsetLeft}
          top={selectedRef.offsetTop}
          height={selectedRef.offsetHeight}
        />
      )}
    </StyledTabsContainer>
  );
};

export default GasSelector;
