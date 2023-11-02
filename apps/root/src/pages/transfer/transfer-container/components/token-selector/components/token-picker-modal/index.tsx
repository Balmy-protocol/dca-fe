import React from 'react';
import styled from 'styled-components';
import TokenPicker from '@common/components/token-picker';
import Modal from '@common/components/modal';
import { Token } from '@types';

const StyledOverlay = styled.div`
  background-color: #1b1b1c;
  display: flex;
  align-self: stretch;
  flex: 1;
  text-align: start;
`;

interface TokenPickerModalProps {
  shouldShow: boolean;
  onChange: React.Dispatch<React.SetStateAction<Token>>;
  onClose: () => void;
  isFrom: boolean;
  isLoadingYieldOptions: boolean;
  onAddToken?: (token: Token) => void;
  account?: string;
}

const TokenPickerModal = ({
  shouldShow,
  isFrom,
  onClose,
  onChange,
  isLoadingYieldOptions,
  onAddToken,
  account,
}: TokenPickerModalProps) => (
  <Modal open={shouldShow} onClose={onClose} closeOnBackdrop maxWidth="sm" fullHeight keepMounted>
    <StyledOverlay>
      <TokenPicker
        isOpen={shouldShow}
        isFrom={isFrom}
        onClose={onClose}
        onChange={onChange}
        isLoadingYieldOptions={isLoadingYieldOptions}
        onAddToken={onAddToken}
        account={account}
        showWrappedAndProtocol
        isAggregator
      />
    </StyledOverlay>
  </Modal>
);

export default TokenPickerModal;
