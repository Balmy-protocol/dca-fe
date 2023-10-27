import React from 'react';
import styled from 'styled-components';
import Modal from '@common/components/modal';
import { Token, YieldOptions } from '@types';
import TokenPicker from '@common/components/token-picker';

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
  ignoreValues: string[];
  otherSelected?: Token | null;
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
  account?: string;
}

const DcaTokenPicker = ({
  shouldShow,
  isFrom,
  onClose,
  onChange,
  ignoreValues,
  otherSelected,
  yieldOptions,
  isLoadingYieldOptions,
  account,
}: TokenPickerProps) => (
  <Modal open={shouldShow} onClose={onClose} closeOnBackdrop maxWidth="sm" actions={[]} fullHeight keepMounted>
    <StyledOverlay>
      <TokenPicker
        isFrom={isFrom}
        onClose={onClose}
        onChange={onChange}
        ignoreValues={ignoreValues}
        otherSelected={otherSelected}
        yieldOptions={yieldOptions}
        isLoadingYieldOptions={isLoadingYieldOptions}
        isOpen={shouldShow}
        account={account}
      />
    </StyledOverlay>
  </Modal>
);

export default DcaTokenPicker;
