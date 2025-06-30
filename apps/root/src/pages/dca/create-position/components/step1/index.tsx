import React from 'react';
import { ContainerBox, DividerBorder1, Grid, TokenAmounUsdInput, Typography, colors } from 'ui-library';
import { AvailablePair, Token, YieldOptions } from '@types';
import FrequencySelector from './components/frequency-selector';
import TokenSelector from './components/token-selector';
import NetworkSelector from '@common/components/network-selector';
import {
  NETWORKS,
  POSSIBLE_ACTIONS,
  SUPPORTED_NETWORKS_DCA,
  WHALE_MODE_FREQUENCIES,
  shouldEnableFrequency,
} from '@constants';
import { compact, find, orderBy } from 'lodash';
import { parseUsdPrice } from '@common/utils/currency';
import { useCreatePositionState } from '@state/create-position/hooks';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import YieldSelector from '../step2/components/yield-selector';
import DcaButton from '../dca-button';
import NextSwapAvailable from '../next-swap-available';
import { parseUnits } from 'viem';
import { useTokenBalance } from '@state/balances/hooks';
import useActiveWallet from '@hooks/useActiveWallet';
import useAvailableSwapIntervals from '@hooks/useAvailableSwapIntervals';
import FormWalletSelector from '@common/components/form-wallet-selector';
import { Chains } from '@balmy/sdk';

const networkList = compact(
  orderBy(
    SUPPORTED_NETWORKS_DCA.map((chainId) => {
      const foundNetwork = find(NETWORKS, { chainId });

      if (chainId === Chains.ROOTSTOCK.chainId) {
        return null;
      }
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

export const StyledDcaInputLabel = styled(Typography).attrs({ variant: 'bodySmallRegular' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2}
  `}
`;

interface SwapFirstStepProps {
  startSelectingCoin: (token: Token) => void;
  handleFrequencyChange: (newValue: string) => void;
  onChangeNetwork: (chainId: number) => void;
  handleFromValueChange: (newFromValue: string) => void;
  fromCanHaveYield: boolean;
  toCanHaveYield: boolean;
  rateUsdPrice: number;
  usdPrice?: bigint;
  yieldEnabled: boolean;
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
  onButtonClick: (actionToDo: keyof typeof POSSIBLE_ACTIONS, amount?: bigint) => void;
  isApproved: boolean;
  isLoadingUsdPrice: boolean;
  allowanceErrors?: string;
  existingPair?: AvailablePair;
  currentNetwork: { chainId: number; name: string };
}

const SwapFirstStep = ({
  startSelectingCoin,
  handleFrequencyChange,
  onChangeNetwork,
  handleFromValueChange,
  rateUsdPrice,
  yieldEnabled,
  yieldOptions,
  isLoadingYieldOptions,
  fromCanHaveYield,
  usdPrice,
  toCanHaveYield,
  onButtonClick,
  isApproved,
  isLoadingUsdPrice,
  allowanceErrors,
  existingPair,
  currentNetwork,
}: SwapFirstStepProps) => {
  const { from, fromValue, to, frequencyValue } = useCreatePositionState();
  const activeWallet = useActiveWallet();
  const { balance, isLoading: isLoadingBalance } = useTokenBalance({
    token: from,
    walletAddress: activeWallet?.address,
    shouldAutoFetch: true,
  });
  const posibleAvailableSwapIntervals = useAvailableSwapIntervals(currentNetwork.chainId);
  const availableSwapIntervals = posibleAvailableSwapIntervals.filter((swapInterval) =>
    shouldEnableFrequency(swapInterval.value.toString(), from?.address, to?.address, currentNetwork.chainId)
  );
  const [hasSetPeriodAmount, setHasSetPeriodAmount] = React.useState(false);

  const filteredFrequencies = availableSwapIntervals.filter(
    (frequency) =>
      !(WHALE_MODE_FREQUENCIES[currentNetwork.chainId] || WHALE_MODE_FREQUENCIES[NETWORKS.optimism.chainId]).includes(
        frequency.value.toString()
      )
  );

  const cantFund = !!from && !!fromValue && !!balance && parseUnits(fromValue, from.decimals) > BigInt(balance.amount);

  const fromValueUsdPrice = parseUsdPrice(
    from,
    (fromValue !== '' && parseUnits(fromValue, from?.decimals || 18)) || null,
    usdPrice
  );

  const onFrequencyChange = (newValue: string) => {
    handleFrequencyChange(newValue);
    setHasSetPeriodAmount(newValue !== '' && Number(fromValue) !== 0);
  };

  const onAmountChange = (newValue: string) => {
    handleFromValueChange(newValue);
    setHasSetPeriodAmount(newValue !== '' && frequencyValue !== '');
  };

  return (
    <Grid container rowSpacing={6}>
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" gap={3}>
          <ContainerBox gap={1} flexDirection="column">
            <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo4}>
              <FormattedMessage description="dca.form.wallet-selector.title" defaultMessage="Wallet" />
            </Typography>
            <FormWalletSelector />
          </ContainerBox>
          <ContainerBox gap={1} flexDirection="column">
            <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo4}>
              <FormattedMessage description="dca.form.network-selector.title" defaultMessage="Network" />
            </Typography>
            <NetworkSelector disableSearch handleChangeCallback={onChangeNetwork} networkList={networkList} />
          </ContainerBox>
        </ContainerBox>
      </Grid>
      <Grid item xs={12}>
        <TokenSelector
          startSelectingCoin={startSelectingCoin}
          fromBalance={balance}
          isLoadingFromBalance={isLoadingBalance}
        />
      </Grid>
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" gap={3}>
          <Typography variant="bodySmallSemibold" color={({ palette }) => colors[palette.mode].typography.typo4}>
            <FormattedMessage
              description="howMuchToSell"
              defaultMessage="How much <b>{from}</b> are you planning to invest?"
              values={{ from: from?.symbol || '', b: (chunks) => <b>{chunks}</b> }}
            />
          </Typography>
          <TokenAmounUsdInput
            value={fromValue}
            token={from}
            tokenPrice={usdPrice}
            disabled={!from}
            balance={balance}
            onChange={onAmountChange}
          />
        </ContainerBox>
      </Grid>
      <Grid item xs={12}>
        <FrequencySelector frequencies={filteredFrequencies} handleFrequencyChange={onFrequencyChange} />
      </Grid>
      {!!fromValue && !!frequencyValue && (
        <>
          <Grid item xs={12}>
            <DividerBorder1 />
          </Grid>
          <Grid item xs={12}>
            <YieldSelector
              usdPrice={usdPrice}
              fromCanHaveYield={fromCanHaveYield}
              toCanHaveYield={toCanHaveYield}
              yieldOptions={yieldOptions}
              isLoadingYieldOptions={isLoadingYieldOptions}
              rateUsdPrice={rateUsdPrice}
            />
          </Grid>
        </>
      )}
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" gap={6} alignItems="center">
          <NextSwapAvailable existingPair={existingPair} yieldEnabled={yieldEnabled} />
          <DcaButton
            onClick={onButtonClick}
            cantFund={cantFund}
            usdPrice={usdPrice}
            shouldEnableYield={yieldEnabled}
            isApproved={isApproved}
            allowanceErrors={allowanceErrors}
            balance={(balance && BigInt(balance.amount)) || undefined}
            fromCanHaveYield={fromCanHaveYield}
            toCanHaveYield={toCanHaveYield}
            isLoadingUsdPrice={isLoadingUsdPrice}
            rateUsdPrice={rateUsdPrice}
            fromValueUsdPrice={fromValueUsdPrice}
            hasSetPeriodAmount={hasSetPeriodAmount}
          />
        </ContainerBox>
      </Grid>
    </Grid>
  );
};

export default SwapFirstStep;
