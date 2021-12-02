import React, { useState } from 'react';
import capitalize from 'lodash/capitalize';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import { SetStateCallback } from 'types';
import Button from '@material-ui/core/Button';

interface SelectOption {
  value: BigNumber;
  label: {
    plural: string;
    adverb: string;
  };
}

type SelectOptionsType = SelectOption[];

const StyledTabsContainer = styled.div`
  ${({ theme }) => `
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    background: ${theme.palette.type === 'light' ? '#eee' : 'rgba(255, 255, 255, 0.12)'};
    align-items: center;
    padding: 5px;
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

const StyledTabItem = styled(Button)<{ isSelected: boolean }>`
  flex-grow: 1;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  text-transform: initial;
  opacity: ${(props) => (props.isSelected ? '1' : '0.7')};

  &:hover {
    background-color: transparent;
    opacity: 1;
  }
`;

const StyledTabIndicator = styled.div<{ width: number; left: number; height: number; top: number }>`
  ${({ theme, left, top, width, height }) => `
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    left: ${left + 3}px;
    top: ${top + 3}px;
    width: ${width}px;
    height: ${height}px;
    position: absolute;
    &:after {
      content: '';
      position: absolute;
      background-color: ${theme.palette.type === 'light' ? '#fff' : 'rgba(255, 255, 255, 0.12)'};
      border-radius: 20px;
      box-shadow: 0 4px 12px 0 rgb(0 0 0 / 16%);
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: ${width}px;
    }
  `}
`;
interface MinimalSelectProps {
  options: SelectOptionsType;
  onChange: SetStateCallback<BigNumber>;
  selected: BigNumber;
}

interface CustomCurrent {
  offsetWidth: number;
  offsetLeft: number;
  offsetTop: number;
  offsetHeight: number;
}

const MinimalSelect = ({ options, selected, onChange }: MinimalSelectProps) => {
  const [selectedRef, setSelectedRef] = useState<CustomCurrent | null>(null);

  return (
    <StyledTabsContainer>
      <StyledTabItemsContainer>
        {options.map((frequencyTypeOption: SelectOption) => (
          <StyledTabItem
            ref={(newRef) => (selected.eq(frequencyTypeOption.value) && setSelectedRef(newRef)) || null}
            disableRipple
            color="inherit"
            isSelected={selected.eq(frequencyTypeOption.value)}
            onClick={() => onChange(frequencyTypeOption.value)}
          >
            {capitalize(frequencyTypeOption.label.adverb)}
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

export default MinimalSelect;
