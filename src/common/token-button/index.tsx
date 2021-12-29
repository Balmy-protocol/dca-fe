import React from 'react';
import Button from 'common/button';
import { Token } from 'types';
import styled from 'styled-components';
import TokenIcon from 'common/token-icon';
import CaretDown from 'assets/svg/atom/caret-down';

interface TokenButtonProps {
  token?: Token | null;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const StyledButton = styled(Button)`
  border-radius: 50px;
  padding: 7px 10px;
`;

const Swap = ({ token, onClick }: TokenButtonProps) => (
  <StyledButton
    size="large"
    color={token ? 'default' : 'secondary'}
    variant={token ? 'outlined' : 'contained'}
    startIcon={token && <TokenIcon size="24px" token={token} />}
    endIcon={<CaretDown size="10px" />}
    onClick={onClick}
  >
    {token ? token.symbol : 'Select a token'}
  </StyledButton>
);
export default Swap;
