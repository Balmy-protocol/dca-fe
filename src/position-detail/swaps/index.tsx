import React from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { useQuery } from '@apollo/client';
import useDCAGraphql from 'hooks/useDCAGraphql';
import { useParams } from 'react-router-dom';
import { FullPosition, GetPairSwapsData, PairSwaps } from 'types';
import getPairSwaps from 'graphql/getPairSwaps.graphql';
import some from 'lodash/some';
import { DateTime } from 'luxon';
import { formatCurrencyAmount } from 'utils/currency';
import { parseUnits } from '@ethersproject/units';
import PositionTimeline from './components/timeline';

const StyledHistoryItem = styled(Grid)`
  margin: 10px 0px;
`;

const StyledCard = styled(Card)`
  padding: 10px 20px;
`;

interface PositionSwapsProps {
  position: FullPosition;
  swaps: PairSwaps[];
}

const PositionSwaps = ({ position, swaps }: PositionSwapsProps) => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <PositionTimeline position={position} swaps={swaps} />
      </Grid>
    </Grid>
  );
};
export default PositionSwaps;
