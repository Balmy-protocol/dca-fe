import React from 'react';
import Address from '@common/components/address';
import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import styled from 'styled-components';
import { ContainerBox, Typography, colors } from 'ui-library';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { FormattedMessage, useIntl } from 'react-intl';
import { GraphDataItem } from '../..';
import { TransactionEventTypes } from 'common-types';

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

interface TooltipProps {
  payload?: {
    value?: ValueType;
    name?: NameType;
    dataKey?: string | number;
    payload?: GraphDataItem;
  }[];
}

const GraphTooltip = (props: TooltipProps) => {
  const { payload } = props;
  const intl = useIntl();

  const firstPayload = payload && payload[0];

  if (!firstPayload || !firstPayload.payload) {
    return null;
  }

  const actions = firstPayload.payload.actions;

  return (
    <StyledTooltipContainer>
      {actions.length === 0 ? (
        <ContainerBox flexDirection="column" gap={1}>
          <Typography variant="bodySmallRegular">
            ${formatUsdAmount({ intl, amount: firstPayload.payload.price })}
          </Typography>
          <Typography variant="bodySmallRegular">{firstPayload.payload.name}</Typography>
        </ContainerBox>
      ) : (
        actions.map(({ user, value, type, date }, key) => (
          <ContainerBox gap={1} flexDirection="column" key={`${key}-${date}`}>
            <ContainerBox justifyContent="space-between" gap={3}>
              <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
                {type === TransactionEventTypes.SWAP ? (
                  <FormattedMessage
                    description="token-profile-historical-prices.tooltip.swapped"
                    defaultMessage="Swapped:"
                  />
                ) : (
                  <FormattedMessage
                    description="token-profile-historical-prices.tooltip.transfered"
                    defaultMessage="Transfered:"
                  />
                )}
              </Typography>
              <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
                <Address address={user} trimAddress />
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
        ))
      )}
    </StyledTooltipContainer>
  );
};

export default GraphTooltip;
