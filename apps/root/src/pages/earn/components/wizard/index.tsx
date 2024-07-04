import React from 'react';
import TokenIcon from '@common/components/token-icon';
import { SkeletonTokenSelectorItem, TokenSelectorItem, TokenSelectorOption } from '@common/components/token-selector';
import { getIsSameOrTokenEquivalent, toToken } from '@common/utils/currency';
import useAllStrategies from '@hooks/earn/useAllStrategies';
import { useStrategiesParameters } from '@hooks/earn/useStrategiesParameters';
import useMergedTokensBalances from '@hooks/useMergedTokensBalances';
import TokenIconMultichain from '@pages/home/components/token-icon-multichain';
import { capitalize } from 'lodash';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import styled, { useTheme } from 'styled-components';
import {
  ForegroundPaper,
  DonutShape,
  Typography,
  colors,
  ContainerBox,
  Select,
  MoneysIcon,
  Money4Icon,
  CoinStar,
} from 'ui-library';
import { parseUnits } from 'viem';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import SuggestedStrategies from './components/suggested-strategies';
import { ALL_WALLETS } from '@common/components/wallet-selector';

const StyledContainer = styled(ForegroundPaper).attrs({ elevation: 0 })`
  ${({ theme: { palette, spacing } }) => `
    display: flex;
    flex-direction: column;
    background: ${palette.gradient.earnWizard};
    padding: ${spacing(5)};
  `}
`;

const StyledInnerContainer = styled(ContainerBox).attrs({
  justifyContent: 'center',
  alignItems: 'center',
  gap: 3,
  fullWidth: true,
})`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(5)} 0;
    border: 1px solid ${colors[palette.mode].earnWizard.border};
    border-radius: ${spacing(3)};
  `}
`;

const StyledTitle = styled(Typography).attrs({ variant: 'h5Bold' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo2};
  `}
`;

type RewardSelectorOption = TokenSelectorOption;

type AssetSelectorOption = TokenSelectorOption & {
  chainsWithBalance: number[];
};

const onRenderValue = (defaultText: string, option?: RewardSelectorOption | AssetSelectorOption) => (
  <Typography variant="h5Bold" color="primary">
    {option ? option.token.symbol : defaultText}
  </Typography>
);

const EarnWizard = () => {
  const { spacing } = useTheme();
  const intl = useIntl();
  const { mergedBalances, isLoadingAllBalances } = useMergedTokensBalances(ALL_WALLETS);
  const { hasFetchedAllStrategies } = useAllStrategies();
  const currentBreakpoint = useCurrentBreakpoint();

  const isLoading = isLoadingAllBalances || !hasFetchedAllStrategies;

  const { assets, rewards } = useStrategiesParameters();
  const [selectedAsset, setSelectedAsset] = React.useState<AssetSelectorOption | undefined>();
  const [selectedReward, setSelectedReward] = React.useState<RewardSelectorOption | undefined>();

  const assetOptions = React.useMemo<AssetSelectorOption[]>(
    () =>
      assets.map((asset) => {
        const balanceItem = mergedBalances.find((item) =>
          item.tokens.some((balanceToken) => getIsSameOrTokenEquivalent(balanceToken.token, asset))
        );
        return {
          key: asset.address,
          token: {
            ...asset,
            icon: balanceItem ? (
              <TokenIconMultichain balanceTokens={balanceItem.tokens} />
            ) : (
              <TokenIcon size={7} token={asset} />
            ),
          },
          balance: balanceItem ? parseUnits(balanceItem.totalBalanceInUnits, asset.decimals) : undefined,
          balanceUsd: balanceItem
            ? parseUnits((balanceItem.totalBalanceUsd || 0).toString(), asset.decimals + 18)
            : undefined,
          chainsWithBalance: balanceItem ? balanceItem.tokens.map((token) => token.token.chainId) : [],
        };
      }),
    [assets, mergedBalances]
  );

  const rewardOptions = React.useMemo<RewardSelectorOption[]>(() => {
    return rewards.map((reward) => ({
      key: reward.address,
      token: { ...reward, icon: <TokenIcon size={7} token={reward} /> },
      chainsWithBalance: [],
    }));
  }, [rewards]);

  const handleAssetChange = (asset: AssetSelectorOption) => {
    setSelectedAsset(asset);
  };

  const handleRewardChange = (reward: RewardSelectorOption) => {
    setSelectedReward(reward);
  };

  const firstDropdownText = intl.formatMessage(
    defineMessage({
      defaultMessage: 'money',
      description: 'earn.wizard.title-first-button',
    })
  );

  const secondDropdownText = intl.formatMessage(
    defineMessage({
      defaultMessage: 'yields',
      description: 'earn.wizard.title-second-button',
    })
  );

  const isDownLg = currentBreakpoint === 'xs' || currentBreakpoint === 'sm' || currentBreakpoint === 'md';

  return (
    <ContainerBox flexDirection="column" gap={10}>
      <StyledContainer>
        <StyledInnerContainer>
          <StyledTitle>
            <FormattedMessage description="earn.wizard.title-first-part" defaultMessage="I have" />
          </StyledTitle>

          <ContainerBox>
            <Select
              id="select-wizard-asset"
              options={assetOptions}
              RenderItem={TokenSelectorItem}
              selectedItem={selectedAsset}
              SkeletonItem={SkeletonTokenSelectorItem}
              onChange={handleAssetChange}
              disabledSearch
              limitHeight
              variant="standard"
              staticOption={{
                token: {
                  ...toToken({
                    name: capitalize(firstDropdownText),
                    symbol: intl.formatMessage(
                      defineMessage({
                        defaultMessage: 'All wallets',
                        description: 'earn.wizard.first-part.all-wallets',
                      })
                    ),
                    decimals: 18,
                  }),
                  icon: <MoneysIcon />,
                },
                key: 'money-static',
              }}
              customRenderValue={(option) => onRenderValue(firstDropdownText, option)}
              isLoading={isLoading}
            />
          </ContainerBox>
          <StyledTitle>
            <FormattedMessage description="earn.wizard.title-second-part" defaultMessage="and I want to generate" />
          </StyledTitle>
          <ContainerBox>
            <Select
              id="select-wizard-reward"
              options={rewardOptions}
              RenderItem={TokenSelectorItem}
              selectedItem={selectedReward}
              SkeletonItem={SkeletonTokenSelectorItem}
              onChange={handleRewardChange}
              disabledSearch
              limitHeight
              variant="standard"
              staticOption={{
                token: {
                  ...toToken({
                    name: capitalize(secondDropdownText),
                  }),
                  icon: <Money4Icon />,
                },
                key: 'yields-static',
              }}
              customRenderValue={(option) => onRenderValue(secondDropdownText, option)}
              isLoading={isLoading}
            />
          </ContainerBox>
        </StyledInnerContainer>
        {!isDownLg && (
          <ContainerBox style={{ position: 'relative' }} justifyContent="end" alignItems="end">
            <div style={{ position: 'absolute' }}>
              <DonutShape top={spacing(10)} />
            </div>
            <div style={{ position: 'absolute' }}>
              <CoinStar right={spacing(30)} />
            </div>
          </ContainerBox>
        )}
      </StyledContainer>
      {selectedAsset && selectedReward && (
        <SuggestedStrategies
          selectedAsset={{
            token: selectedAsset.token,
            chainsWithBalance: selectedAsset.chainsWithBalance,
          }}
          selectedReward={{
            token: selectedReward.token,
          }}
        />
      )}
    </ContainerBox>
  );
};

export default EarnWizard;
