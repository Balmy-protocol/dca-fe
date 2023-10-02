import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@common/components/button';
import EmptyRoutes from '@assets/svg/emptyRoutes';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { withStyles } from 'tss-react/mui';
import { SourceMetadata } from '@mean-finance/sdk/dist/services/quotes/types';
import compact from 'lodash/compact';
import Chip from '@mui/material/Chip';
import styled from 'styled-components';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI } from '@common/utils/currency';
import useSdkDexes from '@hooks/useSdkSources';
import { SwapOption } from '@types';
import { useAggregatorState } from '@state/aggregator/hooks';
import SwapQuote from '../quote';
import QuoteRefresher from '../quote-refresher';
import QuoteSorter from '../quote-sorter';

const StatusChip = withStyles(Chip, () => ({
  colorSuccess: {
    background: 'rgba(33, 150, 83, 0.1)',
    color: '#219653',
  },
  colorError: {
    background: 'rgba(235, 87, 87, 0.1)',
    color: '#EB5757',
  },
}));

const StyledPaper = styled(Paper)<{ $column?: boolean; $align?: boolean }>`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
  display: flex;
  gap: 24px;
  flex-direction: ${({ $column }) => ($column ? 'column' : 'row')};
  ${({ $align }) => ($align ? 'align-self: flex-start;' : '')}
`;

const StyledTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledCenteredWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
`;

const StyledChipsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-direction: column;
`;

const StyledChipsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

interface SourceMetadataWithId extends SourceMetadata {
  id: string;
}

interface SwapQuotesProps {
  quotes: SwapOption[];
  isLoading: boolean;
  fetchOptions: () => void;
  refreshQuotes: boolean;
  bestQuote?: SwapOption;
  swapOptionsError?: string;
}

const SwapQuotes = ({
  quotes,
  isLoading,
  fetchOptions,
  refreshQuotes,
  bestQuote,
  swapOptionsError,
}: SwapQuotesProps) => {
  const { from, to, selectedRoute } = useAggregatorState();
  const dexes = useSdkDexes();
  const dexesKeys = Object.keys(dexes);
  const mappedDexes = dexesKeys.reduce<SourceMetadataWithId[][]>((acc, dexKey, index) => {
    const newAcc = [...acc];

    if (index % 3 === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nextDex =
        dexes[dexesKeys[index + 1]] && dexesKeys[index + 1]
          ? {
              ...dexes[dexesKeys[index + 1]],
              id: dexesKeys[index + 1],
            }
          : null;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nextDexThird =
        dexes[dexesKeys[index + 2]] && dexesKeys[index + 2]
          ? {
              ...dexes[dexesKeys[index + 2]],
              id: dexesKeys[index + 2],
            }
          : null;

      const group = compact([
        {
          ...dexes[dexKey],
          id: dexKey,
        },
        nextDex,
        nextDexThird,
      ]);

      newAcc.push(group);
    }

    return newAcc;
  }, []);

  if (!quotes.length && !isLoading && !!swapOptionsError) {
    return (
      <StyledPaper variant="outlined" $column>
        <StyledPaper variant="outlined">
          <StyledCenteredWrapper>
            <ErrorOutlineIcon fontSize="large" />
            <Typography variant="h6">
              <FormattedMessage
                description="All routes failed"
                defaultMessage="We could not fetch a route for your swap"
              />
            </Typography>
            <Button variant="contained" color="secondary" onClick={fetchOptions}>
              <FormattedMessage description="All routes failed action" defaultMessage="Try to get a route again" />
            </Button>
          </StyledCenteredWrapper>
        </StyledPaper>
      </StyledPaper>
    );
  }

  if (!quotes.length && !isLoading) {
    return (
      <StyledPaper variant="outlined" $column>
        <StyledPaper variant="outlined">
          <StyledCenteredWrapper>
            <EmptyRoutes size="150px" />
            <Typography variant="h5">
              <FormattedMessage
                description="meanFinanceMetaAggregator"
                defaultMessage="Introducing Mean Finance's Meta Aggregator"
              />
            </Typography>
            <StyledChipsContainer>
              <StyledChipsGroup>
                <StatusChip
                  label={<FormattedMessage description="descNoFee" defaultMessage="No extra fees" />}
                  color="primary"
                  variant="outlined"
                  size="small"
                  icon={<CheckCircleOutlineOutlinedIcon />}
                />
                <StatusChip
                  label={<FormattedMessage description="descBestPrice" defaultMessage="Best price always" />}
                  color="primary"
                  variant="outlined"
                  size="small"
                  icon={<CheckCircleOutlineOutlinedIcon />}
                />
                <StatusChip
                  label={<FormattedMessage description="descBuyOrders" defaultMessage="Buy orders" />}
                  color="primary"
                  variant="outlined"
                  size="small"
                  icon={<CheckCircleOutlineOutlinedIcon />}
                />
              </StyledChipsGroup>
              <StyledChipsGroup>
                <StatusChip
                  label={
                    <FormattedMessage description="descTransactionSimulation" defaultMessage="Transaction simulation" />
                  }
                  color="primary"
                  variant="outlined"
                  size="small"
                  icon={<CheckCircleOutlineOutlinedIcon />}
                />
                <StatusChip
                  label={<FormattedMessage description="descSwapAndTransfer" defaultMessage="Swap and transfer" />}
                  color="primary"
                  variant="outlined"
                  size="small"
                  icon={<CheckCircleOutlineOutlinedIcon />}
                />
              </StyledChipsGroup>
            </StyledChipsContainer>
            <Typography variant="body1" sx={{ textAlign: 'center', padding: '0px 20px' }}>
              <FormattedMessage
                description="meanFinanceMetaAggregatorDescription"
                defaultMessage="We find the best prices across all of DeFi so you don't have to. You can now make sure you are getting the best deal possible"
              />
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', padding: '0px 20px' }}>
              <FormattedMessage description="meanFinanceMetaAggregatorSupporting" defaultMessage="Supporting:" />
            </Typography>
            <StyledChipsContainer>
              {mappedDexes.map((dexGroup, index) => (
                <StyledChipsGroup key={index}>
                  {dexGroup.map((dex) => (
                    <StatusChip
                      label={dex.name}
                      color="secondary"
                      variant="outlined"
                      size="small"
                      icon={<TokenIcon isInChip size="18px" token={emptyTokenWithLogoURI(dex.logoURI)} />}
                      key={dex.id}
                    />
                  ))}
                </StyledChipsGroup>
              ))}
            </StyledChipsContainer>
          </StyledCenteredWrapper>
        </StyledPaper>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper variant="outlined" $column $align={!isLoading}>
      <StyledTitleContainer>
        <QuoteSorter isLoading={isLoading} />
        <QuoteRefresher isLoading={isLoading} refreshQuotes={fetchOptions} disableRefreshQuotes={!refreshQuotes} />
      </StyledTitleContainer>
      {isLoading && (
        <StyledCenteredWrapper>
          <CenteredLoadingIndicator size={40} noFlex />
          <FormattedMessage description="loadingBestRoute" defaultMessage="Fetching the best route for you" />
        </StyledCenteredWrapper>
      )}
      {!isLoading &&
        quotes.map((quote) => (
          <SwapQuote
            isSelected={quote.swapper.name === selectedRoute?.swapper.name}
            quote={quote}
            key={`${from?.symbol || ''}-${to?.symbol || ''}-${quote.swapper.name}`}
            bestQuote={bestQuote}
            disabled={!refreshQuotes}
          />
        ))}
    </StyledPaper>
  );
};
export default SwapQuotes;
