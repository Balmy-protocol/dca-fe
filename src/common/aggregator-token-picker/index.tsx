import React from 'react';
import styled from 'styled-components';
import TokenPicker from 'common/token-picker';
import Modal from 'common/modal';
import { Token, YieldOptions } from 'types';

type SetFromToState = React.Dispatch<React.SetStateAction<Token>>;

const StyledOverlay = styled.div`
  background-color: #1b1b1c;
  display: flex;
  align-self: stretch;
  flex: 1;
  text-align: start;
`;

interface TokenPickerProps {
  shouldShow: boolean;
  availableFrom?: string[];
  onChange: SetFromToState;
  onClose: () => void;
  isFrom: boolean;
  usedTokens: string[];
  ignoreValues: string[];
  otherSelected?: Token | null;
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
  onAddToken?: (token: Token) => void;
}

const AggregatorTokenPicker = ({
  shouldShow,
  isFrom,
  availableFrom = [],
  onClose,
  onChange,
  ignoreValues,
  usedTokens,
  otherSelected,
  yieldOptions,
  isLoadingYieldOptions,
  onAddToken,
}: TokenPickerProps) => (
  <Modal open={shouldShow} onClose={onClose} maxWidth="sm" actions={[]} fullHeight>
    <StyledOverlay>
      <TokenPicker
        isFrom={isFrom}
        availableFrom={availableFrom}
        onClose={onClose}
        onChange={onChange}
        ignoreValues={ignoreValues}
        usedTokens={usedTokens}
        otherSelected={otherSelected}
        yieldOptions={yieldOptions}
        isLoadingYieldOptions={isLoadingYieldOptions}
        onAddToken={onAddToken}
        isAggregator
        showWrappedAndProtocol
      />
    </StyledOverlay>
  </Modal>
);

export default AggregatorTokenPicker;
