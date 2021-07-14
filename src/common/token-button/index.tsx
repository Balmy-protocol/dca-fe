import React from 'react';
import Button from 'common/button';
import { Token } from 'types';
import styled from 'styled-components';
import TokenIcon from 'common/token-icon';
import CaretDown from 'assets/svg/atom/caret-down';

interface TokenButtonProps {
  token?: Token;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const StyledButton = styled(Button)`
  background-color: #ffffff;
  border-radius: 50px;
  padding: 7px 10px;
`;

const Swap = ({ token, onClick }: TokenButtonProps) => {
  return (
    <StyledButton
      size="large"
      color="default"
      variant="outlined"
      startIcon={<TokenIcon size="24px" token={token} />}
      endIcon={<CaretDown size="10px" />}
      onClick={onClick}
    >
      {token?.symbol}
    </StyledButton>
  );
};
export default Swap;
