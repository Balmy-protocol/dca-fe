import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'ui-library';
import { TIMEOUT_KEYS, TimeoutKey, TIMEOUT_LABELS_BY_KEY } from '@constants/aggregator';
import { useIntl } from 'react-intl';

const StyledTabsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  border-radius: 30px;
  position: relative;
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
    opacity: 1;
  }
`;

const StyledTabIndicator = styled.div<{ width: number; left: number; height: number; top: number }>`
  ${({ left, top, width, height }) => `
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    left: ${left + 2}px;
    top: ${top + 2}px;
    width: ${width - 10}px;
    height: ${height - 5}px;
    position: absolute;
    &:after {
      content: '';
      position: absolute;
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
  onChange: (key: TimeoutKey) => void;
  selected: TimeoutKey;
}

interface CustomCurrent {
  offsetWidth: number;
  offsetLeft: number;
  offsetTop: number;
  offsetHeight: number;
}

const TimeoutSelector = ({ selected, onChange }: GasSelectorProps) => {
  const [selectedRef, setSelectedRef] = useState<CustomCurrent | null>(null);
  const intl = useIntl();

  return (
    <StyledTabsContainer>
      <StyledTabItemsContainer>
        {TIMEOUT_KEYS.map((timeoutKey) => (
          <StyledTabItem
            ref={(newRef) => (selected === timeoutKey && setSelectedRef(newRef)) || null}
            disableRipple
            key={timeoutKey}
            color="inherit"
            $isSelected={selected === timeoutKey}
            onClick={() => onChange(timeoutKey)}
          >
            {intl.formatMessage(TIMEOUT_LABELS_BY_KEY[timeoutKey])}
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

export default TimeoutSelector;
