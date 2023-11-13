import React from 'react';
import styled from 'styled-components';
import TokenPicker from '@common/components/token-picker-modal/components/token-picker';
import Modal from '@common/components/modal';
import { Token, YieldOptions } from '@types';

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
  modalTitle: React.ReactNode;
  isLoadingYieldOptions: boolean;
  onAddToken?: (token: Token) => void;
  ignoreValues?: string[];
  otherSelected?: Token | null;
  yieldOptions?: YieldOptions;
  account?: string;
  showWrappedAndProtocol?: boolean;
  allowAllTokens?: boolean;
  allowCustomTokens?: boolean;
}

const TokenPickerModal = ({
  shouldShow,
  modalTitle,
  onClose,
  onChange,
  yieldOptions,
  isLoadingYieldOptions,
  onAddToken,
  account,
  ignoreValues,
  otherSelected,
  showWrappedAndProtocol,
  allowAllTokens,
  allowCustomTokens,
}: TokenPickerModalProps) => (
  <Modal open={shouldShow} onClose={onClose} closeOnBackdrop maxWidth="sm" fullHeight keepMounted>
    <StyledOverlay>
      <TokenPicker
        isOpen={shouldShow}
        modalTitle={modalTitle}
        onClose={onClose}
        onChange={onChange}
        yieldOptions={yieldOptions}
        isLoadingYieldOptions={isLoadingYieldOptions}
        onAddToken={onAddToken}
        account={account}
        showWrappedAndProtocol={showWrappedAndProtocol}
        ignoreValues={ignoreValues}
        otherSelected={otherSelected}
        allowAllTokens={allowAllTokens}
        allowCustomTokens={allowCustomTokens}
      />
    </StyledOverlay>
  </Modal>
);

export default TokenPickerModal;
