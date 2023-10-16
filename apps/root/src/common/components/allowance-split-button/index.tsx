import React from 'react';
import styled from 'styled-components';
import SplitButton from '@common/components/split-button';
import { CustomButtonProps } from '@common/components/button';
import { AllowanceType, Token, YieldOption } from '@types';
import { FormattedMessage } from 'react-intl';
import useWeb3Service from '@hooks/useWeb3Service';
import { Tooltip, HelpOutlineIcon } from 'ui-library';
import { BigNumber } from 'ethers';
import { formatCurrencyAmount } from '@common/utils/currency';
import { useHasPendingApproval } from '@state/transactions/hooks';

interface AllowanceSplitButtonProps {
  disabled?: boolean;
  onMaxApprove: () => void;
  onApproveExact: (amount: BigNumber) => void;
  token: Token | null;
  amount: BigNumber | null;
  tokenYield: YieldOption | null | undefined;
  target?: string;
  color?: CustomButtonProps['color'];
  defaultApproval?: AllowanceType;
  tooltipText?: string;
  hideTooltip?: boolean;
}

const StyledTooltip = styled(Tooltip)`
  margin-bottom: 2px;
  margin-left: 5px;
`;

export const AllowanceTooltip = (props: { symbol: string; target?: string; message?: string }) => {
  const { symbol, target, message } = props;
  return (
    <StyledTooltip
      title={
        message || (
          <FormattedMessage
            description="Allowance Tooltip"
            defaultMessage="You must give the {target} smart contracts permission to use your {symbol}"
            values={{
              symbol,
              target: target || 'Mean Finance',
            }}
          />
        )
      }
      arrow
      placement="top"
    >
      <HelpOutlineIcon fontSize="small" />
    </StyledTooltip>
  );
};

const AllowanceSplitButton = (props: AllowanceSplitButtonProps) => {
  const {
    disabled,
    onMaxApprove,
    onApproveExact,
    token,
    tokenYield,
    amount,
    color: passedColor,
    target,
    defaultApproval,
    tooltipText,
    hideTooltip,
  } = props;
  const color = passedColor || 'primary';
  const web3Service = useWeb3Service();
  const hasPendingApproval = useHasPendingApproval(token, web3Service.getAccount(), !!tokenYield?.tokenAddress);
  const symbol = token?.symbol || '';

  const defaultAction =
    defaultApproval === AllowanceType.specific && amount ? () => onApproveExact(amount) : () => onMaxApprove();
  const secondaryAction =
    defaultApproval === AllowanceType.specific && amount
      ? () => onMaxApprove()
      : () => amount && onApproveExact(amount);

  const infiniteText = (
    <FormattedMessage
      description="Allow us to use your coin (modal max)"
      defaultMessage="Authorize Max {symbol}"
      values={{
        symbol,
      }}
    />
  );

  const specificText = (
    <FormattedMessage
      description="Allow us to use your coin (home exact)"
      defaultMessage="Authorize {amount} {symbol}"
      values={{ symbol, amount: token && amount ? formatCurrencyAmount(amount, token, 4) : '' }}
    />
  );

  const defaultText = defaultApproval === AllowanceType.specific ? specificText : infiniteText;
  const secondaryText = defaultApproval === AllowanceType.specific ? infiniteText : specificText;

  return (
    <SplitButton
      onClick={defaultAction}
      text={
        <>
          {hasPendingApproval ? (
            <FormattedMessage
              description="waiting for approval"
              defaultMessage="Waiting for your {symbol} to be authorized"
              values={{
                symbol,
              }}
            />
          ) : (
            defaultText
          )}
          {!hasPendingApproval && !hideTooltip && (
            <AllowanceTooltip message={tooltipText} target={target} symbol={symbol} />
          )}
        </>
      }
      disabled={disabled}
      variant="contained"
      color={color}
      options={[
        {
          text: secondaryText,
          disabled: disabled || !amount,
          onClick: secondaryAction,
        },
      ]}
      size="large"
      fullWidth
      block
    />
  );
};

export default AllowanceSplitButton;
