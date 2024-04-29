import { Typography } from 'ui-library';

import React from 'react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import styled from 'styled-components';
import { Token } from '@types';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import { capitalizeFirstLetter } from '@common/utils/parsing';
import { useIntl } from 'react-intl';

const StyledPaper = styled.div`
  padding: 16px;
  position: relative;
  overflow: visible;
  border-radius: 20px;
  border: 2px solid;
  display: flex;
  gap: 10px;
  flex-direction: column;
  z-index: 99;
`;

interface ProfitLossTooltipProps {
  label?: string;
  payload?: {
    value?: ValueType;
    name?: NameType;
    dataKey?: string | number;
    payload?: {
      swappedIfLumpSum: number;
      swappedIfDCA: number;
      rawSwappedIfLumpSum: bigint;
      rawSwappedIfDCA: bigint;
      percentage: number;
    };
  }[];
  tokenTo: Token;
}

const ProfitLossTooltip = (props: ProfitLossTooltipProps) => {
  const { payload, label, tokenTo } = props;
  const intl = useIntl();

  const firstPayload = payload && payload[0];

  if (!firstPayload || !firstPayload.payload) {
    return null;
  }

  const { rawSwappedIfLumpSum, rawSwappedIfDCA, percentage } = firstPayload?.payload;

  return (
    <StyledPaper>
      <Typography variant="bodySmallRegular">{capitalizeFirstLetter(label || '')}</Typography>
      <Typography variant="bodyRegular">
        {percentage > 0 ? 'Profit' : 'Loss'}: {formatUsdAmount({ amount: percentage, intl })}%
      </Typography>
      <Typography variant="bodyRegular">
        DCA: {formatCurrencyAmount({ amount: rawSwappedIfDCA, token: tokenTo, intl })} {tokenTo.symbol}
      </Typography>
      <Typography variant="bodyRegular">
        Lump sum: {formatCurrencyAmount({ amount: rawSwappedIfLumpSum, token: tokenTo, intl })} {tokenTo.symbol}
      </Typography>
    </StyledPaper>
  );
};

export default React.memo(ProfitLossTooltip);
