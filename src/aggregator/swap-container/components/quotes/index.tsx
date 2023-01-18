import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import EmptyRoutes from 'assets/svg/emptyRoutes';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { SwapSortOptions } from 'config/constants/aggregator';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { withStyles } from '@mui/styles';
import Chip from '@mui/material/Chip';
import styled from 'styled-components';
import { SwapOption, Token } from 'types';
import SwapQuote from '../quote';
import QuoteRefresher from '../quote-refresher';
import QuoteSorter from '../quote-sorter';

const StatusChip = withStyles(() => ({
  colorSuccess: {
    background: 'rgba(33, 150, 83, 0.1)',
    color: '#219653',
  },
  colorError: {
    background: 'rgba(235, 87, 87, 0.1)',
    color: '#EB5757',
  },
}))(Chip);

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
`;

interface SwapQuotesProps {
  quotes: SwapOption[];
  isLoading: boolean;
  from: Token | null;
  to: Token | null;
  selectedRoute: SwapOption | null;
  setRoute: (newRoute: SwapOption) => void;
  setSorting: (newSort: string) => void;
  sorting: SwapSortOptions;
  fetchOptions: () => void;
  refreshQuotes: boolean;
  isBuyOrder: boolean;
  bestQuote?: SwapOption;
  swapOptionsError?: string;
}

const SwapQuotes = ({
  quotes,
  isLoading,
  from,
  to,
  selectedRoute,
  setRoute,
  setSorting,
  sorting,
  fetchOptions,
  refreshQuotes,
  isBuyOrder,
  bestQuote,
  swapOptionsError,
}: SwapQuotesProps) => {
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
            <EmptyRoutes size="100px" />
            <Typography variant="h6">
              <FormattedMessage
                description="meanFinanceMetaAggregator"
                defaultMessage="Introducing Mean Finance Meta Aggregator"
              />
            </Typography>
            <StyledChipsContainer>
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
                label={<FormattedMessage description="descGasEstimation" defaultMessage="Gas estimation" />}
                color="primary"
                variant="outlined"
                size="small"
                icon={<CheckCircleOutlineOutlinedIcon />}
              />
            </StyledChipsContainer>
            <Typography variant="body1" sx={{ textAlign: 'center', padding: '0px 20px' }}>
              <FormattedMessage
                description="meanFinanceMetaAggregatorDescription"
                defaultMessage="We look for the best prices among most of Defi Dex's and Dex Aggregators, so you can always get the best execution price for your trades"
              />
            </Typography>
          </StyledCenteredWrapper>
        </StyledPaper>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper variant="outlined" $column $align={!isLoading}>
      <StyledTitleContainer>
        <QuoteSorter isLoading={isLoading} setQuoteSorting={setSorting} sorting={sorting} isBuyOrder={isBuyOrder} />
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
            setRoute={setRoute}
            from={from}
            to={to}
            isSelected={quote.swapper.name === selectedRoute?.swapper.name}
            quote={quote}
            key={`${from?.symbol || ''}-${to?.symbol || ''}-${quote.swapper.name}`}
            isBuyOrder={isBuyOrder}
            bestQuote={bestQuote}
            sorting={sorting}
            disabled={!refreshQuotes}
          />
        ))}
    </StyledPaper>
  );
};
export default SwapQuotes;
