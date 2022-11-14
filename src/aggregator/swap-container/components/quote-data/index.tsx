import * as React from 'react';
import styled from 'styled-components';
import { SwapOption, Token } from 'types';
import Typography from '@mui/material/Typography';
import { formatCurrencyAmount } from 'utils/currency';
import { FormattedMessage } from 'react-intl';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { NETWORKS } from 'config';
import find from 'lodash/find';
import { capitalizeFirstLetter } from 'utils/parsing';

const StyledQuoteDataContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  background: rgba(216, 216, 216, 0.1);
  box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.5);
  gap: 16px;
`;

const StyledQuoteDataItem = styled.div`
  display: flex;
  justify-content: space-between;
`;

interface QuoteDataProps {
  quote: SwapOption | null;
  to: Token | null;
}

const QuoteData = ({ quote, to }: QuoteDataProps) => {
  const network = useCurrentNetwork();

  const networkName = React.useMemo(() => {
    const supportedNetwork = find(NETWORKS, { chainId: network.chainId });
    return (supportedNetwork && supportedNetwork.name) || capitalizeFirstLetter(network.name);
  }, [network]);

  return (
    <StyledQuoteDataContainer>
      <StyledQuoteDataItem>
        <Typography variant="body2" color="inherit">
          <FormattedMessage description="quoteDataSelectedRoute" defaultMessage="Selected route:" />
        </Typography>
        <Typography variant="body2" color="inherit">
          {quote?.swapper.id || '-'}
        </Typography>
      </StyledQuoteDataItem>
      <StyledQuoteDataItem>
        <Typography variant="body2" color="inherit">
          <FormattedMessage
            description="quoteDataFee"
            defaultMessage="{network} fee:"
            values={{ network: networkName }}
          />
        </Typography>
        <Typography variant="body2">
          {quote?.gas.estimatedCostInUSD ? `$${quote.gas.estimatedCostInUSD}` : '-'}
        </Typography>
      </StyledQuoteDataItem>
      <StyledQuoteDataItem>
        <Typography variant="body2" color="inherit">
          <FormattedMessage description="quoteDataRate" defaultMessage="Minimum recieved:" />
        </Typography>
        <Typography variant="body2" color="inherit">
          {quote?.minBuyAmount.amount && to
            ? `${formatCurrencyAmount(quote.minBuyAmount.amount, to, 4)} ${to.symbol}`
            : '-'}
        </Typography>
      </StyledQuoteDataItem>
    </StyledQuoteDataContainer>
  );
};

export default QuoteData;
