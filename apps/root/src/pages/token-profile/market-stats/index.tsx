import React from 'react';
import { useThemeMode } from '@state/config/hooks';
import { Token } from 'common-types';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BackgroundPaper, colors, ContainerBox, Skeleton, Typography } from 'ui-library';
import usePriceService from '@hooks/usePriceService';
import { TokenPercentageChanges } from '@services/priceService';
import TokenHistoricalPrices from '../historical-prices';

const StyledMarketStatsContainer = styled(BackgroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    display: flex;
    flex-direction: column;
    padding: ${spacing(6)};
    gap: ${spacing(10)};
    height: 100%;
    min-height: ${spacing(75)};
    `}
`;

interface MarketStatsProps {
  token: Token;
}

const getPercentageColor = (value: number, mode: ReturnType<typeof useThemeMode>) => {
  if (value > 0) {
    return colors[mode].semantic.success.darker;
  } else if (value < 0) {
    return colors[mode].semantic.error.darker;
  } else {
    return colors[mode].typography.typo3;
  }
};

const MarketStats = ({ token }: MarketStatsProps) => {
  const mode = useThemeMode();
  const priceService = usePriceService();
  const [isLoadingPercentages, setIsLoadingPercentages] = React.useState(false);
  const [percentages, setPercentages] = React.useState<TokenPercentageChanges | undefined>();

  React.useEffect(() => {
    const getVariations = async () => {
      setIsLoadingPercentages(true);
      const fetchedPercentages = await priceService.getTokenPercentageChanges({ token });
      setPercentages(fetchedPercentages);
      setIsLoadingPercentages(false);
    };

    void getVariations();
  }, []);

  const percentageList = React.useMemo(
    () => [
      {
        label: <FormattedMessage description="token-profile.one-day" defaultMessage="1 Day" />,
        value: percentages?.dayAgo,
      },
      {
        label: <FormattedMessage description="token-profile.one-week" defaultMessage="1 Week" />,
        value: percentages?.weekAgo,
      },
      {
        label: <FormattedMessage description="token-profile.one-month" defaultMessage="1 Month" />,
        value: percentages?.monthAgo,
      },
      {
        label: <FormattedMessage description="token-profile.one-year" defaultMessage="1 Year" />,
        value: percentages?.yearAgo,
      },
    ],
    [percentages]
  );

  return (
    <StyledMarketStatsContainer>
      <ContainerBox flexDirection="column" gap={3}>
        <Typography variant="h6Bold" color={colors[mode].typography.typo1}>
          <FormattedMessage description="token-profile.market-stats" defaultMessage="Market Stats" />
        </Typography>
        <ContainerBox gap={6}>
          {percentageList.map(({ label, value }, index) => (
            <ContainerBox key={index} flexDirection="column" gap={1}>
              <Typography variant="bodySmallRegular">{label}</Typography>
              {value ? (
                <Typography variant="bodyBold" color={getPercentageColor(Number(value), mode)}>
                  {`${Number(value) > 0 ? '+' : ''}${value}%`}
                </Typography>
              ) : (
                <Typography variant="bodyBold">{isLoadingPercentages ? <Skeleton variant="text" /> : '-'}</Typography>
              )}
            </ContainerBox>
          ))}
        </ContainerBox>
      </ContainerBox>
      <TokenHistoricalPrices token={token} />
    </StyledMarketStatsContainer>
  );
};

export default MarketStats;
