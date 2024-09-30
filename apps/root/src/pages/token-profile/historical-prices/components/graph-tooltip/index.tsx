import React from 'react';
import Address from '@common/components/address';
import { formatUsdAmount } from '@common/utils/currency';
import styled from 'styled-components';
import { ContainerBox, Typography, colors } from 'ui-library';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { FormattedMessage, useIntl } from 'react-intl';
import { GraphDataItem, TokenGraphPermittedEvents } from '../..';
import { Token, TransactionEventIncomingTypes, TransactionEventTypes } from 'common-types';
import {
  getTransactionPriceColor,
  getTransactionTitle,
  getTransactionUsdValue,
  getTransactionValue,
} from '@common/utils/transaction-history';
import { Address as ViemAddress } from 'viem';
import ComposedTokenIcon from '@common/components/composed-token-icon';

const StyledTooltipContainer = styled(ContainerBox).attrs({ flexDirection: 'column' })`
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

const StyledTokenAmountContainer = styled(ContainerBox).attrs({ gap: 2, alignItems: 'center' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(1)} 0;
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

const StyledTooltipElement = styled(ContainerBox).attrs({ fullWidth: true, justifyContent: 'space-between', gap: 6 })<{
  $showBorder: boolean;
}>`
  ${({ theme: { palette, spacing }, $showBorder }) => `
    border-bottom: ${$showBorder ? `1px solid ${colors[palette.mode].border.border2}` : ''};
    padding: ${spacing(1)} ${spacing(2)};
  `}
`;

type FormattedEventData = {
  tokens: Token[];
  userAddress: ViemAddress;
};

const formatEventData = (event: TokenGraphPermittedEvents): FormattedEventData => {
  switch (event.type) {
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      return {
        tokens: [event.data.token],
        userAddress:
          event.data.tokenFlow === TransactionEventIncomingTypes.OUTGOING ? event.tx.initiatedBy : event.data.to,
      };
    case TransactionEventTypes.SWAP:
      return {
        tokens: [event.data.tokenIn, event.data.tokenOut],
        userAddress: event.tx.initiatedBy,
      };
  }
};

const GraphTooltip = ({ payload }: TooltipProps) => {
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
        actions.slice(0, 5).map(({ tx, date }, key, self) => (
          <StyledTooltipElement key={`${key}-${date}`} $showBorder={key !== self.length - 1 || actions.length > 5}>
            <StyledTokenAmountContainer>
              <ComposedTokenIcon tokens={formatEventData(tx).tokens} size={6} />
              <ContainerBox gap={0.5}>
                <Typography variant="labelRegular" color={getTransactionPriceColor(tx)}>
                  {getTransactionValue(tx, intl)}
                </Typography>
                <Typography variant="labelRegular">{`($${getTransactionUsdValue(tx, intl)})`}</Typography>
              </ContainerBox>
            </StyledTokenAmountContainer>
            <ContainerBox flexDirection="column" alignItems="end">
              <Typography variant="labelRegular" color={({ palette }) => colors[palette.mode].typography.typo4}>
                <Address address={formatEventData(tx).userAddress} trimAddress />
              </Typography>
              <Typography variant="labelRegular">{intl.formatMessage(getTransactionTitle(tx))}</Typography>
            </ContainerBox>
          </StyledTooltipElement>
        ))
      )}
      {actions.length > 5 && (
        <Typography
          paddingTop={({ spacing }) => spacing(2)}
          variant="labelRegular"
          color={({ palette }) => colors[palette.mode].typography.typo4}
        >
          <FormattedMessage
            defaultMessage="See your complete history below"
            id="token-profile.historical-prices.graph-tooltip.see-complete-history"
          />
        </Typography>
      )}
    </StyledTooltipContainer>
  );
};

export default GraphTooltip;
