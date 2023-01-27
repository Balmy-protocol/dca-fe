import React from 'react';
import Button from 'common/button';
import { Token } from 'types';
import styled from 'styled-components';
import TokenIcon from 'common/token-icon';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormattedMessage } from 'react-intl';

interface TokenButtonProps {
  token?: Token | null;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const StyledButton = styled(Button)`
  border-radius: 50px;
  padding: 4px 8px;
  align-self: flex-start;
`;

const Swap = ({ token, onClick }: TokenButtonProps) => (
  <StyledButton
    size="large"
    color="transparent"
    variant="outlined"
    startIcon={<TokenIcon size="24px" token={token || undefined} />}
    endIcon={<KeyboardArrowDownIcon fontSize="small" />}
    onClick={onClick}
  >
    {token ? token.symbol : <FormattedMessage description="select" defaultMessage="Select" />}
  </StyledButton>
);
export default Swap;
