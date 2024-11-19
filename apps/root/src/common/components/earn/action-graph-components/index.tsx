import { AmountsOfToken, Token, EarnPosition, EarnPositionActionType } from 'common-types';
import React from 'react';
import styled from 'styled-components';
import { colors, ContainerBox, Typography } from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import Address from '@common/components/address';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import TokenIcon from '@common/components/token-icon';

const PERMITTED_ACTIONS = [
  EarnPositionActionType.INCREASED,
  EarnPositionActionType.WITHDREW,
  EarnPositionActionType.CREATED,
];

function findClosestTimestamp(timestamps: number[], targetTimestamp: number): number {
  return timestamps.reduce((prev, curr) => {
    return Math.abs(curr - targetTimestamp) < Math.abs(prev - targetTimestamp) ? curr : prev;
  }, 0);
}

type DataItemAction = {
  type: EarnPositionActionType.INCREASED | EarnPositionActionType.WITHDREW;
  value: {
    token: Token;
    amount: AmountsOfToken;
  };
  user: EarnPosition['owner'];
  timestamp: number;
};

interface DotProps<T extends { actions: DataItemAction[]; mode: 'light' | 'dark' }> {
  payload?: T;
  cx: number;
  cy: number;
}

const StyledTooltipContainer = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 2 })`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    padding: ${spacing(3)};
    background-color: ${colors[mode].background.emphasis};
    border: 1px solid ${colors[mode].border.border1};
    box-shadow: ${colors[mode].dropShadow.dropShadow200};
    border-radius: ${spacing(2)};
  `}
`;

interface TooltipProps<T extends { actions: DataItemAction[] }> {
  payload?: {
    value?: ValueType;
    name?: NameType;
    dataKey?: string | number;
    payload?: T;
  }[];
}

const GraphTooltip = <T extends { actions: DataItemAction[] }>(props: TooltipProps<T>) => {
  const { payload } = props;
  const intl = useIntl();

  const firstPayload = payload && payload[0];

  if (!firstPayload || !firstPayload.payload) {
    return null;
  }

  const actions = firstPayload.payload.actions;

  if (actions.length === 0) return null;

  return (
    <StyledTooltipContainer>
      {actions.map(({ user, value, type, timestamp }, key) => (
        <ContainerBox gap={1} flexDirection="column" key={`${key}-${timestamp}`}>
          <ContainerBox justifyContent="space-between" gap={3}>
            <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
              {type === EarnPositionActionType.INCREASED ? (
                <FormattedMessage
                  description="earn.strategy-guardian-detail.vault-data.historical-rate.tooltip.deposited"
                  defaultMessage="Deposited:"
                />
              ) : (
                <FormattedMessage
                  description="earn.strategy-guardian-detail.vault-data.historical-rate.tooltip.withdrew"
                  defaultMessage="Withdrew:"
                />
              )}
            </Typography>
            <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
              <Address address={user} />
            </Typography>
          </ContainerBox>
          <ContainerBox alignItems="center" gap={1}>
            <TokenIcon token={value.token} size={5} />
            <Typography variant="bodySmallBold" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
              {formatCurrencyAmount({ amount: value.amount.amount, token: value.token, intl })}
            </Typography>
            <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
              (${formatUsdAmount({ intl, amount: value.amount.amountInUSD })})
            </Typography>
          </ContainerBox>
        </ContainerBox>
      ))}
    </StyledTooltipContainer>
  );
};

const CustomDot = <T extends { actions: DataItemAction[]; mode: 'light' | 'dark' }>(props: DotProps<T>) => {
  const { cx, cy, payload } = props;

  if (!payload?.actions.length) return <></>;

  if (payload?.actions[0].type === EarnPositionActionType.INCREASED) {
    return (
      <svg x={cx - 9} y={cy - 9.5} width={18} height={19} viewBox="0 0 18 19">
        <rect y="0.316406" width="18" height="18" rx="9" fill="#EFEAF6" />
        <path
          d="M9 17.3789C4.5525 17.3789 0.9375 13.7639 0.9375 9.31641C0.9375 4.86891 4.5525 1.25391 9 1.25391C13.4475 1.25391 17.0625 4.86891 17.0625 9.31641C17.0625 13.7639 13.4475 17.3789 9 17.3789ZM9 2.37891C5.175 2.37891 2.0625 5.49141 2.0625 9.31641C2.0625 13.1414 5.175 16.2539 9 16.2539C12.825 16.2539 15.9375 13.1414 15.9375 9.31641C15.9375 5.49141 12.825 2.37891 9 2.37891Z"
          fill={colors[payload.mode].semantic.success.darker}
        />
        <path
          d="M12 9.87891H6C5.6925 9.87891 5.4375 9.62391 5.4375 9.31641C5.4375 9.00891 5.6925 8.75391 6 8.75391H12C12.3075 8.75391 12.5625 9.00891 12.5625 9.31641C12.5625 9.62391 12.3075 9.87891 12 9.87891Z"
          fill={colors[payload.mode].semantic.success.darker}
        />
        <path
          d="M9 12.8789C8.6925 12.8789 8.4375 12.6239 8.4375 12.3164V6.31641C8.4375 6.00891 8.6925 5.75391 9 5.75391C9.3075 5.75391 9.5625 6.00891 9.5625 6.31641V12.3164C9.5625 12.6239 9.3075 12.8789 9 12.8789Z"
          fill={colors[payload.mode].semantic.success.darker}
        />
      </svg>
    );
  }

  return (
    <svg x={cx - 9} y={cy - 9.5} width={18} height={19} viewBox="0 0 18 19">
      <rect y="0.0898438" width="18" height="18" rx="9" fill="#EFEAF6" />
      <path
        d="M8.93945 17.1523C4.49945 17.1523 0.876953 13.5373 0.876953 9.08984C0.876953 4.64234 4.49945 1.02734 8.93945 1.02734C13.3795 1.02734 17.002 4.64234 17.002 9.08984C17.002 13.5373 13.387 17.1523 8.93945 17.1523ZM8.93945 2.15234C5.11445 2.15234 2.00195 5.26484 2.00195 9.08984C2.00195 12.9148 5.11445 16.0273 8.93945 16.0273C12.7645 16.0273 15.877 12.9148 15.877 9.08984C15.877 5.26484 12.7645 2.15234 8.93945 2.15234Z"
        fill={colors[payload.mode].semantic.error.darker}
      />
      <path
        d="M11.9395 9.65234H5.93945C5.63195 9.65234 5.37695 9.39734 5.37695 9.08984C5.37695 8.78234 5.63195 8.52734 5.93945 8.52734H11.9395C12.247 8.52734 12.502 8.78234 12.502 9.08984C12.502 9.39734 12.2545 9.65234 11.9395 9.65234Z"
        fill={colors[payload.mode].semantic.error.darker}
      />
    </svg>
  );
};

export { GraphTooltip, CustomDot, type DataItemAction, PERMITTED_ACTIONS, findClosestTimestamp };