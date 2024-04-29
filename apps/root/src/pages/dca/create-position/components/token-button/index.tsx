import React from 'react';
import { Token } from '@types';
import styled from 'styled-components';
import TokenIcon from '@common/components/token-icon';
import { KeyboardArrowDownIcon, Button } from 'ui-library';
import { FormattedMessage } from 'react-intl';

interface TokenButtonProps {
  token?: Token | null;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const StyledButton = styled(Button)`
  border-radius: 50px;
  padding: 4px 8px;
  align-self: flex-start;

  .MuiButton-endIcon {
    margin: 0;
  }
  .MuiButton-startIcon {
    margin: 0;
    margin-right: 4px;
  }
`;

const Swap = ({ token, onClick }: TokenButtonProps) => (
  <StyledButton
    size="large"
    variant="outlined"
    startIcon={<TokenIcon size={6} token={token || undefined} />}
    endIcon={<KeyboardArrowDownIcon fontSize="small" />}
    onClick={onClick}
  >
    {token ? token.symbol : <FormattedMessage description="select" defaultMessage="Select" />}
  </StyledButton>
);
export default Swap;
