import React from 'react';
import styled from 'styled-components';
import SplitButton from 'common/split-button';
import { FormattedMessage } from 'react-intl';
import { Token, YieldOption } from 'types';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import useWeb3Service from 'hooks/useWeb3Service';
import { BigNumber } from 'ethers';
import { useHasPendingApproval } from 'state/transactions/hooks';
import { formatCurrencyAmount } from 'utils/currency';

interface AllowanceSplitButtonProps {
  disabled?: boolean;
  onMaxApprove: () => void;
  onApproveExact: (amount: BigNumber) => void;
  token: Token | null;
  amount: BigNumber | null;
  tokenYield: YieldOption | null | undefined;
}

const StyledTooltip = styled(Tooltip)`
  margin-bottom: 2px;
  margin-left: 5px;
`;

export const AllowanceTooltip = (props: { symbol: string }) => {
  const { symbol } = props;
  return (
    <StyledTooltip
      title={
        <FormattedMessage
          description="Allowance Tooltip"
          defaultMessage="You must give the Mean Finance smart contracts permission to use your {symbol}"
          values={{
            symbol,
          }}
        />
      }
      arrow
      placement="top"
    >
      <HelpOutlineIcon fontSize="small" />
    </StyledTooltip>
  );
};

const AllowanceSplitButton = (props: AllowanceSplitButtonProps) => {
  const { disabled, onMaxApprove, onApproveExact, token, amount, tokenYield } = props;
  const web3Service = useWeb3Service();
  const hasPendingApproval = useHasPendingApproval(token, web3Service.getAccount(), !!tokenYield?.tokenAddress);
  const symbol = token?.symbol || '';
  return (
    <SplitButton
      onClick={() => onMaxApprove()}
      text={
        <>
          {hasPendingApproval ? (
            <FormattedMessage
              description="waiting for approval"
              defaultMessage="Waiting for your {symbol} to be approved"
              values={{
                symbol,
              }}
            />
          ) : (
            <FormattedMessage
              description="Allow us to use your coin (home max)"
              defaultMessage="Approve Max {symbol}"
              values={{
                symbol,
              }}
            />
          )}
          <AllowanceTooltip symbol={symbol} />
        </>
      }
      disabled={disabled}
      variant="contained"
      color="primary"
      options={[
        {
          text: (
            <FormattedMessage
              description="Allow us to use your coin (home exact)"
              defaultMessage="Approve {amount} {symbol}"
              values={{ symbol, amount: token && amount ? formatCurrencyAmount(amount, token, 4) : '' }}
            />
          ),
          disabled: disabled || !amount,
          onClick: () => amount && onApproveExact(amount),
        },
      ]}
      size="large"
      fullWidth
      block
    />
  );
};

export default AllowanceSplitButton;
