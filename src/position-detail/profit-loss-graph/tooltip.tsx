import { parseUnits } from '@ethersproject/units';
import Typography from '@mui/material/Typography';
import React from 'react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import styled from 'styled-components';
import { Token } from 'types';
import { formatCurrencyAmount } from 'utils/currency';

const StyledPaper = styled.div`
  padding: 16px;
  position: relative;
  overflow: visible;
  border-radius: 20px;
  border: 2px solid #a5aab5;
  background-color: #1b1b1c;
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

  const { swappedIfLumpSum, swappedIfDCA } = firstPayload?.payload;

  return (
    <StyledPaper>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body1">
        DCA: {formatCurrencyAmount(parseUnits(swappedIfDCA.toString(), tokenTo.decimals), tokenTo)} {tokenTo.symbol}
      </Typography>
      <Typography variant="body1">
        Lump sum: {formatCurrencyAmount(parseUnits(swappedIfLumpSum.toString(), tokenTo.decimals), tokenTo)}{' '}
        {tokenTo.symbol}
      </Typography>
    </StyledPaper>
  );
};

export default React.memo(ProfitLossTooltip);
