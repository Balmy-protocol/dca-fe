import React from 'react';
import { ContainerBox, Divider, Grid, TokenAmounUsdInput, Typography, colors } from 'ui-library';
import { AmountsOfToken, AvailablePair, Token, YieldOptions } from '@types';
import FrequencySelector from './components/frequency-selector';
import TokenSelector from './components/token-selector';
import NetworkSelector from '@common/components/network-selector';
import { NETWORKS, POSSIBLE_ACTIONS, SUPPORTED_NETWORKS_DCA } from '@constants';
import { compact, find, isUndefined, orderBy } from 'lodash';
import { formatCurrencyAmount } from '@common/utils/currency';
import { useCreatePositionState } from '@state/create-position/hooks';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import YieldSelector from '../step2/components/yield-selector';
import DcaButton from '../dca-button';
import NextSwapAvailable from '../next-swap-available';

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
  fromCanHaveYield: boolean;
  toCanHaveYield: boolean;
  fromValueUsdPrice: number;
  rateUsdPrice: number;
  usdPrice?: bigint;
  yieldEnabled: boolean;
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
  onButtonClick: (actionToDo: keyof typeof POSSIBLE_ACTIONS, amount?: bigint) => void;
  cantFund: boolean;
  isApproved: boolean;
  isLoadingUsdPrice: boolean;
  allowanceErrors?: string;
  existingPair?: AvailablePair;
}

const SwapFirstStep = ({
  startSelectingCoin,
  balance,
  frequencies,
  handleFrequencyChange,
  onChangeNetwork,
  handleFromValueChange,
  fromValueUsdPrice,
  rateUsdPrice,
  yieldEnabled,
  yieldOptions,
  isLoadingYieldOptions,
  fromCanHaveYield,
  usdPrice,
  toCanHaveYield,
  onButtonClick,
  cantFund,
  isApproved,
  isLoadingUsdPrice,
  allowanceErrors,
  existingPair,
}: SwapFirstStepProps) => {
  const { from, fromValue, frequencyValue } = useCreatePositionState();
  const [fetchedTokenPrice] = useRawUsdPrice(from);
  const [hasSetPeriodAmount, setHasSetPeriodAmount] = React.useState(false);

  const balanceAmount: AmountsOfToken | undefined =
    (!isUndefined(balance) &&
      from && {
        amount: balance.toString(),
        amountInUnits: formatCurrencyAmount(balance, from),
      }) ||
    undefined;

  const onFrequencyChange = (newValue: string) => {
    handleFrequencyChange(newValue);
    setHasSetPeriodAmount(newValue !== '' && Number(fromValue) !== 0);
  };

  const onAmountChange = (newValue: string) => {
    handleFromValueChange(newValue);
    setHasSetPeriodAmount(newValue !== '' && frequencyValue !== '');
  };

  return (
    <Grid container rowSpacing={8}>
      <Grid item xs={12}>
        <NetworkSelector disableSearch handleChangeCallback={onChangeNetwork} networkList={networkList} />
      </Grid>
      <Grid item xs={12}>
        <TokenSelector startSelectingCoin={startSelectingCoin} />
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
            onChange={onAmountChange}
          />
        </ContainerBox>
      </Grid>
      <Grid item xs={12}>
        <FrequencySelector frequencies={frequencies} handleFrequencyChange={onFrequencyChange} />
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <YieldSelector
          usdPrice={usdPrice}
          yieldEnabled={yieldEnabled}
          fromCanHaveYield={fromCanHaveYield}
          toCanHaveYield={toCanHaveYield}
          yieldOptions={yieldOptions}
          isLoadingYieldOptions={isLoadingYieldOptions}
          rateUsdPrice={rateUsdPrice}
        />
      </Grid>
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" gap={6} alignItems="center">
          <DcaButton
            onClick={onButtonClick}
            cantFund={cantFund}
            usdPrice={usdPrice}
            shouldEnableYield={yieldEnabled}
            isApproved={isApproved}
            allowanceErrors={allowanceErrors}
            balance={balance}
            fromCanHaveYield={fromCanHaveYield}
            toCanHaveYield={toCanHaveYield}
            isLoadingUsdPrice={isLoadingUsdPrice}
            rateUsdPrice={rateUsdPrice}
            fromValueUsdPrice={fromValueUsdPrice}
            hasSetPeriodAmount={hasSetPeriodAmount}
          />
          <NextSwapAvailable existingPair={existingPair} yieldEnabled={yieldEnabled} />
        </ContainerBox>
      </Grid>
    </Grid>
  );
};

export default SwapFirstStep;
