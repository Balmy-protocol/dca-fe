import { Typography } from 'ui-library';

import React from 'react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import styled from 'styled-components';
import { Token } from '@types';
import { formatCurrencyAmount } from '@common/utils/currency';
import { capitalizeFirstLetter } from '@common/utils/parsing';

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

  const firstPayload = payload && payload[0];

  if (!firstPayload || !firstPayload.payload) {
    return null;
  }

  const { rawSwappedIfLumpSum, rawSwappedIfDCA, percentage } = firstPayload?.payload;

  return (
    <StyledPaper>
      <Typography variant="bodySmall">{capitalizeFirstLetter(label || '')}</Typography>
      <Typography variant="body">
        {percentage > 0 ? 'Profit' : 'Loss'}: {percentage.toFixed(2)}%
      </Typography>
      <Typography variant="body">
        DCA: {formatCurrencyAmount(rawSwappedIfDCA, tokenTo)} {tokenTo.symbol}
      </Typography>
      <Typography variant="body">
        Lump sum: {formatCurrencyAmount(rawSwappedIfLumpSum, tokenTo)} {tokenTo.symbol}
      </Typography>
    </StyledPaper>
  );
};

export default React.memo(ProfitLossTooltip);
