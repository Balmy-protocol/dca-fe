import { ForegroundPaper, Typography } from 'ui-library';
import capitalize from 'lodash/capitalize';
import React from 'react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import styled from 'styled-components';
import { Token } from '@types';
import { formatUsdAmount } from '@common/utils/currency';
import { useIntl } from 'react-intl';

const StyledPaper = styled(ForegroundPaper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
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
    value?: ValueType;
    name?: NameType;
    dataKey?: string | number;
  }[];
  tokenA: GraphToken;
  tokenB: GraphToken;
}

const GraphTooltip = (props: GraphTooltipProps) => {
  const { payload, label, tokenA, tokenB } = props;
  const intl = useIntl();

  const tokenFrom = tokenA.isBaseToken ? tokenB : tokenA;
  const tokenTo = tokenA.isBaseToken ? tokenA : tokenB;

  return (
    <StyledPaper variant="outlined">
      <Typography variant="bodySmallRegular">{capitalize(label)}</Typography>
      {payload?.map(({ value, dataKey }, index) => (
        <Typography variant="bodyRegular" key={`${dataKey}-${index}`}>
          {dataKey}: 1 {tokenFrom.symbol} = {tokenTo.isBaseToken ? '$' : ''}
          {tokenTo.isBaseToken ? formatUsdAmount({ amount: value?.toString(), intl }) : value}{' '}
          {tokenTo.isBaseToken ? 'USD' : tokenB.symbol}
        </Typography>
      ))}
    </StyledPaper>
  );
};

export default React.memo(GraphTooltip);
