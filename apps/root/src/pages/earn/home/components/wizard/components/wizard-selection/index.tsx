import useAllStrategies from '@hooks/earn/useAllStrategies';
import { useStrategiesParameters } from '@hooks/earn/useStrategiesParameters';
import React from 'react';
import styled from 'styled-components';
import { ContainerBox, Money4Icon, MoneysIcon, Select, Typography, colors } from 'ui-library';
import { AssetSelectorOption, RewardSelectorOption } from '../..';
import { useThemeMode } from '@state/config/hooks';
import useMergedTokensBalances from '@hooks/useMergedTokensBalances';
import { ALL_WALLETS } from '@common/components/wallet-selector';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { findTokenAnyMatch, getIsSameOrTokenEquivalent } from '@common/utils/currency';
import { parseUnits } from 'viem';
import { SkeletonTokenSelectorItem, TokenSelectorItem } from '@common/components/token-selector';
import { capitalize } from 'lodash';
import { useParams } from 'react-router-dom';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';

const StyledSelectionContainer = styled(ContainerBox).attrs({
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

const RenderWizardItem = ({
  item,
  isRenderValue,
}: {
  item: RewardSelectorOption | AssetSelectorOption;
  isRenderValue?: boolean;
}) => {
  if (isRenderValue) {
    return (
      <Typography variant="h5Bold" color="primary">
        {item.token.symbol}
      </Typography>
    );
  }

  return <TokenSelectorItem item={item} />;
};

const HeaderItem = ({
  props: { label, secondaryLabel, Icon },
}: {
  props: { label: string; secondaryLabel?: string; Icon: React.ComponentType };
}) => {
  const mode = useThemeMode();
  return (
    <ContainerBox gap={3} alignItems="center">
      <Icon />
      <ContainerBox flexDirection="column" gap={0.5}>
        <Typography variant="bodySmallBold" color={colors[mode].typography.typo2}>
          {label}
        </Typography>
        <Typography variant="bodySmallLabel" color={colors[mode].typography.typo3}>
          {secondaryLabel}
        </Typography>
      </ContainerBox>
    </ContainerBox>
  );
};

interface WizardSelectionProps {
  selectedAsset?: AssetSelectorOption;
  selectedReward?: RewardSelectorOption;
  setSelectedAsset: (asset: AssetSelectorOption) => void;
  setSelectedReward: (reward: RewardSelectorOption) => void;
}

export const WizardSelection = ({
  selectedAsset,
  selectedReward,
  setSelectedAsset,
  setSelectedReward,
}: WizardSelectionProps) => {
  const intl = useIntl();
  const { mergedBalances, isLoadingAllBalances } = useMergedTokensBalances(ALL_WALLETS);
  const { hasFetchedAllStrategies } = useAllStrategies();
  const { assetTokenId, rewardTokenId } = useParams<{
    assetTokenId?: string;
    rewardTokenId?: string;
  }>();
  const replaceHistory = useReplaceHistory();
  const { assets, rewards } = useStrategiesParameters(StrategiesTableVariants.ALL_STRATEGIES);

  const isLoading = isLoadingAllBalances || !hasFetchedAllStrategies;

  React.useEffect(() => {
    if (!selectedAsset) {
      const assetParamToken = findTokenAnyMatch(assets, assetTokenId);

      if (assetParamToken) {
        setSelectedAsset({
          key: assetParamToken.address,
          token: assetParamToken,
          chainsWithBalance: [],
        });
      }
    }

    if (!selectedReward) {
      const rewardParamToken = findTokenAnyMatch(rewards, rewardTokenId);
      if (rewardParamToken) {
        setSelectedReward({
          key: rewardParamToken.address,
          token: rewardParamToken,
        });
      }
    }
  }, [assetTokenId, assets, rewardTokenId, rewards]);

  const assetOptions = React.useMemo<AssetSelectorOption[]>(
    () =>
      assets.map((asset) => {
        const balanceItem = mergedBalances.find((item) =>
          item.tokens.some((balanceToken) => getIsSameOrTokenEquivalent(balanceToken.token, asset))
        );
        return {
          key: asset.address,
          token: asset,
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
      token: reward,
      chainsWithBalance: [],
    }));
  }, [rewards]);

  const handleAssetChange = (asset: AssetSelectorOption) => {
    setSelectedAsset(asset);
    const assetId = `${asset.token.chainId}-${asset.token.address}`;
    const rewardId = selectedReward ? `${selectedReward.token.chainId}-${selectedReward.token.address}` : '';
    replaceHistory(`/earn/${assetId}/${rewardId ?? ''}`);
  };

  const handleRewardChange = (reward: RewardSelectorOption) => {
    setSelectedReward(reward);
    const assetId = selectedAsset ? `${selectedAsset.token.chainId}-${selectedAsset.token.address}` : '';
    if (!assetId) return;
    const rewardId = `${reward.token.chainId}-${reward.token.address}`;
    replaceHistory(`/earn/${assetId}/${rewardId}`);
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

  return (
    <StyledSelectionContainer>
      <StyledTitle>
        <FormattedMessage description="earn.wizard.title-first-part" defaultMessage="I have" />
      </StyledTitle>
      <ContainerBox>
        <Select
          id="select-wizard-asset"
          options={assetOptions}
          RenderItem={RenderWizardItem}
          selectedItem={selectedAsset}
          SkeletonItem={SkeletonTokenSelectorItem}
          onChange={handleAssetChange}
          disabledSearch
          limitHeight
          variant="standard"
          Header={{
            component: HeaderItem,
            props: {
              label: intl.formatMessage(
                defineMessage({
                  defaultMessage: 'All wallets',
                  description: 'earn.wizard.first-part.all-wallets',
                })
              ),
              Icon: MoneysIcon,
              secondaryLabel: capitalize(firstDropdownText),
            },
          }}
          isLoading={isLoading}
          placeholder={firstDropdownText}
          placeholderProps={{
            variant: 'h5Bold',
            color: 'primary',
          }}
        />
      </ContainerBox>
      <StyledTitle>
        <FormattedMessage description="earn.wizard.title-second-part" defaultMessage="and I want to generate" />
      </StyledTitle>
      <ContainerBox>
        <Select
          id="select-wizard-reward"
          options={rewardOptions}
          RenderItem={RenderWizardItem}
          selectedItem={selectedReward}
          SkeletonItem={SkeletonTokenSelectorItem}
          onChange={handleRewardChange}
          disabledSearch
          limitHeight
          variant="standard"
          Header={{
            component: HeaderItem,
            props: {
              label: capitalize(secondDropdownText),
              Icon: Money4Icon,
            },
          }}
          isLoading={isLoading}
          placeholder={secondDropdownText}
          placeholderProps={{
            variant: 'h5Bold',
            color: 'primary',
          }}
        />
      </ContainerBox>
    </StyledSelectionContainer>
  );
};
