import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import { DateTime } from 'luxon';
import { AvailablePair, Token, YieldOption, YieldOptions } from 'types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TokenInput from 'common/token-input';
import FrequencyInput from 'common/frequency-easy-input';
import {
  DEFAULT_MINIMUM_USD_DEPOSIT_FOR_YIELD,
  MINIMUM_USD_DEPOSIT_FOR_YIELD,
  ONE_WEEK,
  STRING_SWAP_INTERVALS,
  SWAP_INTERVALS_MAP,
} from 'config/constants';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from 'common/button';
import { BigNumber } from 'ethers';
import Switch from '@mui/material/Switch';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Collapse from '@mui/material/Collapse';
import YieldTokenSelector from 'common/yield-token-selector';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { formatCurrencyAmount, usdPriceToToken } from 'utils/currency';
import findIndex from 'lodash/findIndex';

const StyledGrid = styled(Grid)<{ $show: boolean }>`
  ${({ $show }) => !$show && 'position: absolute;width: auto;'};
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 89;
`;

const StyledContentContainer = styled.div`
  background-color: #292929;
  padding: 16px;
  border-radius: 8px;
`;

const StyledSummaryContainer = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
`;

const StyledInputContainer = styled.div`
  margin: 6px 0px;
  display: inline-flex;
`;

const StyledYieldTitleContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
`;

const StyledYieldContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

const StyledYieldHelpContainer = styled(Typography)`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

const StyledYieldHelpDescriptionContainer = styled.div`
  display: flex;
  padding: 10px;
  background-color: #212121;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
`;

const StyledYieldTokensContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const StyledNextSwapContainer = styled.div`
  display: flex;
  margin-top: 5px;
`;

interface SwapSecondStepProps {
  from: Token | null;
  to: Token | null;
  fromValue: string;
  handleFromValueChange: (newValue: string) => void;
  rate: string;
  handleRateValueChange: (newValue: string) => void;
  frequencyType: BigNumber;
  frequencyValue: string;
  fromCanHaveYield: boolean;
  handleFrequencyChange: (newValue: string) => void;
  buttonToShow: React.ReactNode;
  show: boolean;
  onBack: () => void;
  fromValueUsdPrice: number;
  rateUsdPrice: number;
  usdPrice?: BigNumber;
  yieldEnabled: boolean;
  setYieldEnabled: (newValue: boolean) => void;
  yieldOptions: YieldOptions;
  isLoadingYieldOptions: boolean;
  fromYield: YieldOption | null | undefined;
  toYield: YieldOption | null | undefined;
  setFromYield: (newYield: null | YieldOption) => void;
  setToYield: (newYield: null | YieldOption) => void;
  existingPair?: AvailablePair;
}

const SwapSecondStep = React.forwardRef<HTMLDivElement, SwapSecondStepProps>((props, ref) => {
  const {
    from,
    to,
    fromValue,
    handleFromValueChange,
    rate,
    handleRateValueChange,
    frequencyType,
    frequencyValue,
    handleFrequencyChange,
    buttonToShow,
    show,
    onBack,
    fromValueUsdPrice,
    rateUsdPrice,
    yieldEnabled,
    setYieldEnabled,
    yieldOptions,
    isLoadingYieldOptions,
    fromYield,
    toYield,
    setFromYield,
    setToYield,
    fromCanHaveYield,
    usdPrice,
    existingPair,
  } = props;

  const [isHelpExpanded, setHelpExpanded] = React.useState(false);

  const currentNetwork = useCurrentNetwork();

  const isAtLeastAWeek = !!frequencyValue && BigNumber.from(frequencyValue).mul(frequencyType).gte(ONE_WEEK);

  const minimumTokensNeeded = usdPriceToToken(
    from,
    MINIMUM_USD_DEPOSIT_FOR_YIELD[currentNetwork.chainId] || DEFAULT_MINIMUM_USD_DEPOSIT_FOR_YIELD,
    usdPrice
  );

  const freqIndex = findIndex(SWAP_INTERVALS_MAP, { value: frequencyType });

  const nextSwapAvailableAt = existingPair?.nextSwapAvailableAt[freqIndex];

  return (
    <StyledGrid $show={show} container rowSpacing={2} ref={ref}>
      <Grid item xs={12}>
        <Button variant="text" color="default" onClick={onBack}>
          <Typography variant="h6" component="div" style={{ display: 'flex', alignItems: 'center' }}>
            <ArrowBackIcon fontSize="inherit" />{' '}
            <FormattedMessage description="backToSwap" defaultMessage="Back to create position" />
          </Typography>
        </Button>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          <StyledSummaryContainer>
            <Typography variant="body1" component="span">
              <FormattedMessage description="invest detail" defaultMessage="You'll invest" />
            </Typography>
            <StyledInputContainer>
              <TokenInput
                id="from-minimal-value"
                value={fromValue || '0'}
                onChange={handleFromValueChange}
                withBalance={false}
                token={from}
                isMinimal
                maxWidth="210px"
                usdValue={fromValueUsdPrice.toFixed(2)}
              />
            </StyledInputContainer>
          </StyledSummaryContainer>
          <StyledSummaryContainer>
            <Typography variant="body1" component="span">
              <FormattedMessage description="rate detail" defaultMessage="We'll swap" />
            </Typography>
            <StyledInputContainer>
              <TokenInput
                id="rate-value"
                value={rate}
                onChange={handleRateValueChange}
                withBalance={false}
                token={from}
                isMinimal
                usdValue={rateUsdPrice.toFixed(2)}
              />
            </StyledInputContainer>
            {yieldEnabled && fromCanHaveYield && fromYield !== null && (
              <Typography variant="body1" component="span">
                <FormattedMessage description="yield detail" defaultMessage="+ yield" />
              </Typography>
            )}
            <Typography variant="body1" component="span">
              <FormattedMessage
                description="rate detail"
                defaultMessage="{frequency} for you for"
                values={{
                  frequency:
                    STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].every,
                }}
              />
            </Typography>
            <StyledInputContainer>
              <FrequencyInput id="frequency-value" value={frequencyValue} onChange={handleFrequencyChange} isMinimal />
            </StyledInputContainer>
            {STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS].subject}
          </StyledSummaryContainer>
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          {/* yield */}
          <StyledYieldContainer>
            <StyledYieldTitleContainer>
              <Typography variant="body1">
                <FormattedMessage description="yieldTitle" defaultMessage="Generate yield" />
              </Typography>
              <Switch
                checked={yieldEnabled}
                onChange={() => setYieldEnabled(!yieldEnabled)}
                name="yieldEnabled"
                color="primary"
              />
            </StyledYieldTitleContainer>
            {yieldEnabled && (
              <StyledYieldTokensContainer>
                <YieldTokenSelector
                  token={from}
                  yieldOptions={yieldOptions}
                  isLoading={isLoadingYieldOptions}
                  setYieldOption={setFromYield}
                  yieldSelected={fromYield}
                />
                <YieldTokenSelector
                  token={to}
                  yieldOptions={yieldOptions}
                  isLoading={isLoadingYieldOptions}
                  setYieldOption={setToYield}
                  yieldSelected={toYield}
                />
              </StyledYieldTokensContainer>
            )}
            {!yieldEnabled &&
              from &&
              !!fromValueUsdPrice &&
              fromValueUsdPrice <
                (MINIMUM_USD_DEPOSIT_FOR_YIELD[currentNetwork.chainId] || DEFAULT_MINIMUM_USD_DEPOSIT_FOR_YIELD) && (
                <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                  <FormattedMessage
                    description="disabledByUsdValue"
                    // eslint-disable-next-line no-template-curly-in-string
                    defaultMessage="You have to invest at least ${minimum} USD ({minToken} {symbol}) to enable this option."
                    values={{
                      minimum:
                        MINIMUM_USD_DEPOSIT_FOR_YIELD[currentNetwork.chainId] || DEFAULT_MINIMUM_USD_DEPOSIT_FOR_YIELD,
                      minToken: formatCurrencyAmount(minimumTokensNeeded, from, 3, 3),
                      symbol: from.symbol,
                    }}
                  />
                </Typography>
              )}
            {!yieldEnabled &&
              from &&
              !!fromValueUsdPrice &&
              fromValueUsdPrice >=
                (MINIMUM_USD_DEPOSIT_FOR_YIELD[currentNetwork.chainId] || DEFAULT_MINIMUM_USD_DEPOSIT_FOR_YIELD) &&
              !isAtLeastAWeek && (
                <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                  <FormattedMessage
                    description="disabledByUsdValue"
                    defaultMessage="You have to set your position to run for at least 1 week to enable this option."
                  />
                </Typography>
              )}
            <StyledYieldHelpContainer variant="body1" onClick={() => setHelpExpanded(!isHelpExpanded)}>
              <HelpOutlineOutlinedIcon fontSize="inherit" color="primary" />
              <FormattedMessage description="howItWorks" defaultMessage="How it works" />
              {isHelpExpanded ? <ArrowDropUpIcon fontSize="inherit" /> : <ArrowDropDownIcon fontSize="inherit" />}
            </StyledYieldHelpContainer>
            <Collapse in={isHelpExpanded}>
              <StyledYieldHelpDescriptionContainer>
                <Typography variant="body2">
                  <FormattedMessage
                    description="howItWorksDescription"
                    defaultMessage="Funds will be deposited into your selected platform to generate yield while they wait to be swapped or withdrawn. The safety of the funds will be up to the selected platform, so please do your own research to perform an educated risk/reward assessment."
                  />
                </Typography>
              </StyledYieldHelpDescriptionContainer>
            </Collapse>
          </StyledYieldContainer>
        </StyledContentContainer>
      </Grid>
      <Grid item xs={12}>
        <StyledContentContainer>
          {buttonToShow}
          {!!nextSwapAvailableAt && (
            <StyledNextSwapContainer>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage
                  description="nextSwapCreate"
                  defaultMessage="Next swap for this pair will be executed {nextSwapAvailableAt}."
                  values={{ nextSwapAvailableAt: DateTime.fromSeconds(nextSwapAvailableAt).toRelative() }}
                />
              </Typography>
            </StyledNextSwapContainer>
          )}
        </StyledContentContainer>
      </Grid>
    </StyledGrid>
  );
});

export default SwapSecondStep;
