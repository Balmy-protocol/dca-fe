import React from 'react';
import { ContainerBox, Grid, StyledContentContainer, TokenAmounUsdInput, Typography, colors } from 'ui-library';
import { AmountsOfToken, Token } from '@types';
import FrequencySelector from './components/frequency-selector';
import TokenSelector from './components/token-selector';
import NetworkSelector from '@common/components/network-selector';
import { NETWORKS, SUPPORTED_NETWORKS_DCA } from '@constants';
import { compact, find, isUndefined, orderBy } from 'lodash';
import WalletSelector from '@common/components/wallet-selector';
import { formatCurrencyAmount } from '@common/utils/currency';
import { useCreatePositionState } from '@state/create-position/hooks';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

interface AvailableSwapInterval {
  label: {
    singular: string;
    adverb: string;
  };
  value: bigint;
}

const networkList = compact(
  orderBy(
    SUPPORTED_NETWORKS_DCA.map((chainId) => {
      const foundNetwork = find(NETWORKS, { chainId });

      if (!foundNetwork) {
        return null;
      }
      return {
        ...(foundNetwork || {}),
      };
    }),
    ['testnet'],
    ['desc']
  )
);

export const StyledDcaInputLabel = styled(Typography).attrs({ variant: 'bodySmall' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2}
  `}
`;

interface SwapFirstStepProps {
  startSelectingCoin: (token: Token) => void;
  handleFrequencyChange: (newValue: string) => void;
  balance?: bigint;
  frequencies: AvailableSwapInterval[];
  onChangeNetwork: (chainId: number) => void;
  handleFromValueChange: (newFromValue: string) => void;
}

const SwapFirstStep = ({
  startSelectingCoin,
  balance,
  frequencies,
  handleFrequencyChange,
  onChangeNetwork,
  handleFromValueChange,
}: SwapFirstStepProps) => {
  const { from, fromValue } = useCreatePositionState();
  const [fetchedTokenPrice] = useRawUsdPrice(from);

  const balanceAmount: AmountsOfToken | undefined =
    (!isUndefined(balance) &&
      from && {
        amount: balance.toString(),
        amountInUnits: formatCurrencyAmount(balance, from),
      }) ||
    undefined;

  return (
    <Grid container rowSpacing={2}>
      <Grid item xs={12}>
        <StyledContentContainer>
          <WalletSelector options={{ setSelectionAsActive: true }} />
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <NetworkSelector disableSearch handleChangeCallback={onChangeNetwork} networkList={networkList} />
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <TokenSelector startSelectingCoin={startSelectingCoin} />
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" gap={3}>
          <StyledDcaInputLabel>
            <FormattedMessage
              description="howMuchToSell"
              defaultMessage="How much <b>{from}</b> are you planning to invest?"
              values={{ from: from?.symbol || '', b: (chunks) => <b>{chunks}</b> }}
            />
          </StyledDcaInputLabel>
          <TokenAmounUsdInput
            value={fromValue}
            token={from}
            tokenPrice={fetchedTokenPrice}
            disabled={!from}
            balance={balanceAmount}
            onChange={handleFromValueChange}
          />
        </ContainerBox>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <FrequencySelector frequencies={frequencies} handleFrequencyChange={handleFrequencyChange} />
        </StyledContentContainer>
      </Grid>
    </Grid>
  );
};

export default SwapFirstStep;
