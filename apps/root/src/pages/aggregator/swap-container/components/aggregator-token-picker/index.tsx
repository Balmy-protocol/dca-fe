import React from 'react';
import styled from 'styled-components';
import TokenPicker from '@common/components/token-picker';
import Modal from '@common/components/modal';
import { Token } from '@types';

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
  onChange: SetFromToState;
  onClose: () => void;
  isFrom: boolean;
  isLoadingYieldOptions: boolean;
  onAddToken?: (token: Token) => void;
  account?: string;
}

const AggregatorTokenPicker = ({
  shouldShow,
  isFrom,
  onClose,
  onChange,
  isLoadingYieldOptions,
  onAddToken,
  account,
}: TokenPickerProps) => (
  <Modal open={shouldShow} onClose={onClose} closeOnBackdrop maxWidth="sm" actions={[]} fullHeight keepMounted>
    <StyledOverlay>
      <TokenPicker
        isOpen={shouldShow}
        isFrom={isFrom}
        onClose={onClose}
        onChange={onChange}
        isLoadingYieldOptions={isLoadingYieldOptions}
        onAddToken={onAddToken}
        account={account}
        isAggregator
        showWrappedAndProtocol
      />
    </StyledOverlay>
  </Modal>
);

// AggregatorTokenPicker.whyDidYouRender = true;
export default React.memo(AggregatorTokenPicker);
// export default AggregatorTokenPicker;
