import React from 'react';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Typography,
  Collapse,
  ArrowDropDownIcon,
  ArrowDropUpIcon,
  BackgroundPaper,
  ContainerBox,
  ForegroundPaper,
  colors,
} from 'ui-library';
import { useCreatePositionState } from '@state/create-position/hooks';
import { useAppDispatch } from '@state/hooks';
import useAnalytics from '@hooks/useAnalytics';
import { setFromYield, setToYield } from '@state/create-position/actions';
import { YieldOption, YieldOptions } from '@types';
import YieldTokenSelector from '@common/components/yield-token-selector';
import { DEFAULT_MINIMUM_USD_RATE_FOR_YIELD, MINIMUM_USD_RATE_FOR_YIELD, STRING_SWAP_INTERVALS } from '@constants';
import { formatCurrencyAmount, usdPriceToToken } from '@common/utils/currency';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { StyledDcaInputLabel } from '../../../step1';

const StyledYieldContainer = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { space } }) => `
  padding: ${space.s05};
  display: flex;
  flex-direction: column;
  gap: ${space.s04};
`}
`;

const StyledSubTitleValues = styled(Typography).attrs({ variant: 'bodySmallBold' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].accentPrimary}
`}
`;

const StyledYieldHelpContainer = styled(ContainerBox).attrs({ gap: 1, alignItems: 'center' })`
  cursor: pointer;
`;

const StyledYieldHelpDescriptionContainer = styled(ForegroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { space } }) => `
  padding: ${space.s05};
  display: flex;
`}
`;

type Props = {
  fromCanHaveYield: boolean;
  toCanHaveYield: boolean;
  isLoadingYieldOptions: boolean;
  yieldOptions: YieldOptions;
  rateUsdPrice: number;
  usdPrice?: bigint;
};

const YieldSelector = ({
  usdPrice,
  fromCanHaveYield,
  toCanHaveYield,
  yieldOptions,
  isLoadingYieldOptions,
  rateUsdPrice,
}: Props) => {
  const { from, to, fromYield, toYield, frequencyType, frequencyValue, userHasChangedYieldOption } =
    useCreatePositionState();
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();
  const selectedNetwork = useSelectedNetwork();
  const intl = useIntl();
  const [isHelpExpanded, setHelpExpanded] = React.useState(false);
  const minimumTokensNeeded = usdPriceToToken(
    from,
    MINIMUM_USD_RATE_FOR_YIELD[selectedNetwork.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_YIELD,
    usdPrice
  );

  const hasMinimumForYield =
    !!from &&
    (fromCanHaveYield || toCanHaveYield) &&
    !!rateUsdPrice &&
    rateUsdPrice >= (MINIMUM_USD_RATE_FOR_YIELD[selectedNetwork.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_YIELD);

  const onSetFromYield = (newYield: YieldOption | null, updateByUser = true) => {
    if (newYield) {
      const { apy, name, token, tokenAddress } = newYield;
      dispatch(setFromYield({ option: { apy, name, token, tokenAddress }, manualUpdate: updateByUser }));
    } else {
      dispatch(setFromYield({ option: null, manualUpdate: updateByUser }));
    }
    if (updateByUser) {
      trackEvent('DCA - Set yield from', {});
    }
  };
  const onSetToYield = (newYield: YieldOption | null, updateByUser = true) => {
    if (newYield) {
      const { apy, name, token, tokenAddress } = newYield;
      dispatch(setToYield({ option: { apy, name, token, tokenAddress }, manualUpdate: updateByUser }));
    } else {
      dispatch(setToYield({ option: null, manualUpdate: updateByUser }));
    }
    if (updateByUser) {
      trackEvent('DCA - Set yield from', {});
    }
  };

  return (
    <StyledYieldContainer>
      <ContainerBox flexDirection="column" gap={1}>
        <Typography variant="bodySmallBold">
          <FormattedMessage description="yieldTitle" defaultMessage="Generate yield" />
        </Typography>
        {!fromCanHaveYield && !toCanHaveYield ? (
          <Typography variant="bodySmallRegular">
            <FormattedMessage
              description="disabledByNoOption"
              defaultMessage="None of the tokens you have selected support yield platforms."
            />
          </Typography>
        ) : from &&
          !hasMinimumForYield &&
          ((fromYield === null && toYield === null && !userHasChangedYieldOption) ||
            fromYield !== null ||
            toYield !== null) ? (
          <StyledDcaInputLabel>
            <FormattedMessage
              description="disabledByUsdSubTitle"
              defaultMessage="Invest at least {minimumValues} to generate yields."
              values={{
                minimumValues: (
                  <StyledSubTitleValues>
                    <FormattedMessage
                      description="disabledByUsdValues"
                      defaultMessage="${minTotal} ({minTotalToken} {symbol}) / ${minFreq} ({minFreqToken} {symbol}) per {frequency}"
                      values={{
                        minTotal:
                          (MINIMUM_USD_RATE_FOR_YIELD[selectedNetwork.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_YIELD) *
                          +frequencyValue,
                        minTotalToken: formatCurrencyAmount({
                          amount: minimumTokensNeeded * BigInt(frequencyValue),
                          token: from,
                          sigFigs: 3,
                          maxDecimals: 3,
                          intl,
                        }),
                        minFreq:
                          MINIMUM_USD_RATE_FOR_YIELD[selectedNetwork.chainId] || DEFAULT_MINIMUM_USD_RATE_FOR_YIELD,
                        minFreqToken: formatCurrencyAmount({
                          amount: minimumTokensNeeded,
                          token: from,
                          sigFigs: 3,
                          maxDecimals: 3,
                          intl,
                        }),
                        symbol: from.symbol,
                        frequency: intl.formatMessage(
                          STRING_SWAP_INTERVALS[frequencyType.toString() as keyof typeof STRING_SWAP_INTERVALS]
                            .singularSubject
                        ),
                      }}
                    />
                  </StyledSubTitleValues>
                ),
              }}
            />
          </StyledDcaInputLabel>
        ) : (
          <StyledDcaInputLabel>
            <FormattedMessage description="yieldSubitle" defaultMessage="Select the platforms to generate yields" />
          </StyledDcaInputLabel>
        )}
      </ContainerBox>
      <ContainerBox gap={16}>
        <YieldTokenSelector
          token={from}
          yieldOptions={yieldOptions}
          isLoading={isLoadingYieldOptions}
          setYieldOption={onSetFromYield}
          yieldSelected={fromYield}
          hasMinimumForYield={hasMinimumForYield}
        />
        <YieldTokenSelector
          token={to}
          yieldOptions={yieldOptions}
          isLoading={isLoadingYieldOptions}
          setYieldOption={onSetToYield}
          yieldSelected={toYield}
          hasMinimumForYield={hasMinimumForYield}
        />
      </ContainerBox>
      <StyledYieldHelpContainer onClick={() => setHelpExpanded(!isHelpExpanded)}>
        <StyledDcaInputLabel>
          <FormattedMessage description="howItWorks" defaultMessage="How it works / Risks" />
        </StyledDcaInputLabel>
        {isHelpExpanded ? <ArrowDropUpIcon fontSize="inherit" /> : <ArrowDropDownIcon fontSize="inherit" />}
      </StyledYieldHelpContainer>
      <Collapse in={isHelpExpanded} unmountOnExit>
        <StyledYieldHelpDescriptionContainer>
          <StyledDcaInputLabel>
            <FormattedMessage
              description="howItWorksDescription"
              defaultMessage="Funds will be deposited into your selected platform to generate yield while they wait to be swapped or withdrawn. The safety of the funds will be up to the selected platform, so please do your own research to perform an educated risk/reward assessment."
            />
          </StyledDcaInputLabel>
        </StyledYieldHelpDescriptionContainer>
      </Collapse>
    </StyledYieldContainer>
  );
};

export default YieldSelector;
