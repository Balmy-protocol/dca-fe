import { formatUnits } from '@ethersproject/units';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';
import React from 'react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import styled from 'styled-components';
import { Token } from 'types';

const StyledPaper = styled.div`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 2px solid #a5aab5;
  background-color: #1b1b1c;
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

interface ProfitLossTooltipProps {
  label?: string;
  payload?: {
    value?: ValueType;
    name?: NameType;
    dataKey?: string | number;
    payload?: {
      profitLoss: string;
      tokenAPrice: BigNumber;
      tokenBPrice: BigNumber;
      summedRate: BigNumber;
      summedBougth: BigNumber;
    };
  }[];
  tokenA: Token;
  tokenB: Token;
}

const ProfitLossTooltip = (props: ProfitLossTooltipProps) => {
  const { payload, label, tokenA, tokenB } = props;

  const firstPayload = payload && payload[0];

  if (!firstPayload || !firstPayload.payload) {
    return null;
  }

  const { profitLoss, tokenAPrice, tokenBPrice, summedRate, summedBougth } = firstPayload?.payload;

  return (
    <StyledPaper>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body1">TokenA: {tokenA.symbol}</Typography>
      <Typography variant="body1">TokenB: {tokenB.symbol}</Typography>
      <Typography variant="body1">Profit/loss: %{profitLoss}</Typography>
      <Typography variant="body1">Profit/loss: %{profitLoss}</Typography>
      <Typography variant="body1">TokenAPrice: {tokenAPrice.toString()}</Typography>
      <Typography variant="body1">TokenBPrice: {tokenBPrice.toString()}</Typography>
      <Typography variant="body1">SummedRate: {formatUnits(summedRate, tokenA.decimals)}</Typography>
      <Typography variant="body1">SummedBougth: {formatUnits(summedBougth, tokenB.decimals)}</Typography>
    </StyledPaper>
  );
};

export default React.memo(ProfitLossTooltip);
