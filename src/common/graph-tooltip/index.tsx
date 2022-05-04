import Typography from '@mui/material/Typography';
import React from 'react';
import styled from 'styled-components';
import { Token } from 'types';

const StyledPaper = styled.div`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  border: 2px solid #A5AAB5;
  background-color: #1B1B1C;
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

interface TokenWithBase extends Token {
  isBaseToken: boolean;
}

type GraphToken = TokenWithBase;

interface GraphTooltipProps {
  label?: string;
  payload?: {
    value: string;
    name: string;
    dataKey: string;
  }[];
  tokenA: GraphToken;
  tokenB: GraphToken;
}

const GraphTooltip = (props: GraphTooltipProps) => {
  const { payload, label, tokenA, tokenB } = props;

  // const filteredPoints = payload?.filter(point => point.name !== 'uniswap')
  // if (!filteredPoints?.length) {
  //   return null;
  // }

  return (
    <StyledPaper>
      <Typography variant="body2">
        {label}
      </Typography>
      { payload?.map(({ value, dataKey }) => (
          <Typography variant="body1">
            {dataKey}: 1 {tokenA.isBaseToken ? tokenB.symbol : tokenA.symbol} = {tokenA.isBaseToken ? '$' : ''}{value} {tokenA.isBaseToken ? '' : tokenB.symbol}
          </Typography>
        ))
      }
    </StyledPaper>
  );
}

export default React.memo(GraphTooltip);
