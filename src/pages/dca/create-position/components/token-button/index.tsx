import React from 'react';
import Button from '@common/components/button';
import { Token } from '@types';
import styled from 'styled-components';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormattedMessage } from 'react-intl';
import ComposedTokenIcon from '@common/components/minimal-composed-token-icon';
import { toToken } from '@common/utils/currency';
import { getGhTokenListLogoUrl } from '@constants';

interface TokenButtonProps {
  token?: Token | null;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  showChain?: boolean;
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

const Swap = ({ token, onClick, showChain }: TokenButtonProps) => (
  <StyledButton
    size="large"
    color="transparent"
    variant="outlined"
    startIcon={
      <ComposedTokenIcon
        size="24px"
        tokenBottom={token || undefined}
        tokenTop={
          showChain
            ? toToken({
                chainId: token?.chainId,
                logoURI: getGhTokenListLogoUrl(token?.chainId || 10, 'logo'),
              })
            : undefined
        }
      />
    }
    endIcon={<KeyboardArrowDownIcon fontSize="small" />}
    onClick={onClick}
  >
    {token ? token.symbol : <FormattedMessage description="select" defaultMessage="Select" />}
  </StyledButton>
);
export default Swap;
