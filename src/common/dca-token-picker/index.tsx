import React from 'react';
import styled from 'styled-components';
import Slide from '@mui/material/Slide';
import { Token, YieldOptions } from 'types';
import TokenPicker from 'common/token-picker';

type SetFromToState = React.Dispatch<React.SetStateAction<Token>>;

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: #1b1b1c;
  padding: 24px;
  display: flex;
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
}

const DcaTokenPicker = ({
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
}: TokenPickerProps) => (
  <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
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
      />
    </StyledOverlay>
  </Slide>
);

export default DcaTokenPicker;
