import React from 'react';
import styled from 'styled-components';
import { Grid } from 'ui-library';
import { Token } from '@types';
import { BigNumber } from 'ethers';
import AmountInput from './components/amount-input';
import FrequencySelector from './components/frequency-selector';
import TokenSelector from './components/token-selector';
import NetworkSelector from '@common/components/network-selector';
import { NETWORKS, SUPPORTED_NETWORKS_DCA } from '@constants';
import { compact, find, orderBy } from 'lodash';
import WalletSelector from '@common/components/wallet-selector';

export const StyledContentContainer = styled.div`
  background-color: #292929;
  padding: 16px;
  border-radius: 8px;
`;

interface AvailableSwapInterval {
  label: {
    singular: string;
    adverb: string;
  };
  value: BigNumber;
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

interface SwapFirstStepProps {
  startSelectingCoin: (token: Token) => void;
  cantFund: boolean | null;
  handleFrequencyChange: (newValue: string) => void;
  balance?: BigNumber;
  frequencies: AvailableSwapInterval[];
  fromValueUsdPrice: number;
  onChangeNetwork: (chainId: number) => void;
  handleFromValueChange: (newFromValue: string) => void;
}

const SwapFirstStep = ({
  startSelectingCoin,
  cantFund,
  balance,
  frequencies,
  handleFrequencyChange,
  fromValueUsdPrice,
  onChangeNetwork,
  handleFromValueChange,
}: SwapFirstStepProps) => {
  return (
    <Grid container rowSpacing={2}>
      <Grid item xs={12}>
        <StyledContentContainer>
          <WalletSelector />
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
        <StyledContentContainer>
          <AmountInput
            balance={balance}
            cantFund={cantFund}
            fromValueUsdPrice={fromValueUsdPrice}
            handleFromValueChange={handleFromValueChange}
          />
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <FrequencySelector frequencies={frequencies} handleFrequencyChange={handleFrequencyChange} />
        </StyledContentContainer>
      </Grid>
    </Grid>
  );
}

export default SwapFirstStep;
