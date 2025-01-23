import { useStrategiesParameters } from '@hooks/earn/useStrategiesParameters';
import React from 'react';
import styled from 'styled-components';
import {
  ContainerBox,
  Money4Icon,
  Money2Icon,
  Select,
  Typography,
  colors,
  SvgIconProps,
  InfoCircleIcon,
} from 'ui-library';
import { AssetSelectorOption, RewardSelectorOption } from '../..';
import { useThemeMode } from '@state/config/hooks';
import useMergedTokensBalances from '@hooks/useMergedTokensBalances';
import { ALL_WALLETS } from '@common/components/wallet-selector/types';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { findTokenAnyMatch, getIsSameOrTokenEquivalent, parseExponentialNumberToString } from '@common/utils/currency';
import { parseUnits } from 'viem';
import { SkeletonTokenSelectorItem } from '@common/components/token-selector';
import { TokenSelectorItem } from '@common/components/token-selector/token-items';
import { capitalize } from 'lodash';
import { useParams } from 'react-router-dom';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import useHasFetchedAllStrategies from '@hooks/earn/useHasFetchedAllStrategies';
import { SUPPORTED_NETWORKS_EARN } from '@constants';

const StyledWizardBaseContainer = styled(ContainerBox).attrs({
  alignItems: 'center',
  gap: 3,
  flexWrap: 'wrap',
})`
  ${({ theme: { spacing, breakpoints } }) => `
    ${breakpoints.down('lg')} {
      gap: ${spacing(2)};
    }
`}
`;

const StyledSelectionContainer = styled(StyledWizardBaseContainer).attrs({
  justifyContent: 'center',
  fullWidth: true,
})`
  ${({ theme: { space, breakpoints } }) => `
    padding: ${space.s03} 0;
    ${breakpoints.down('md')} {
      justify-content: start;
      }
    `}
`;

const StyledTitle = styled(Typography).attrs({ variant: 'h3Bold' })``;

const RenderSelectedValue = ({ item }: { item: RewardSelectorOption | AssetSelectorOption }) => (
  <Typography variant="h3Bold" color={({ palette }) => ({ color: colors[palette.mode].accentPrimary })}>
    {item.token.symbol}
  </Typography>
);

const HeaderItem = ({
  props: { label, secondaryLabel, Icon },
}: {
  props: { label: string; secondaryLabel?: string; Icon: React.ComponentType<SvgIconProps> };
}) => {
  const mode = useThemeMode();
  return (
    <ContainerBox gap={3} alignItems="center">
      <Icon fontSize="large" />
      <ContainerBox flexDirection="column" gap={0.5}>
        <Typography variant="bodySmallBold" color={colors[mode].typography.typo2}>
          {label}
        </Typography>
        <Typography variant="labelRegular">{secondaryLabel}</Typography>
      </ContainerBox>
    </ContainerBox>
  );
};

const FooterItem = () => {
  return (
    <ContainerBox gap={1} alignItems="center">
      <InfoCircleIcon fontSize="large" sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
      <Typography variant="labelSemiBold">
        <FormattedMessage
          defaultMessage="We display only the chains we currently support"
          description="earn.wizard.asset-options.footer"
        />
      </Typography>
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
  const { mergedBalances, isLoadingAllBalances } = useMergedTokensBalances({
    selectedWalletOption: ALL_WALLETS,
    supportedNetworks: SUPPORTED_NETWORKS_EARN,
  });
  const hasFetchedAllStrategies = useHasFetchedAllStrategies();
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
      assets
        .map((asset) => {
          const balanceItem = mergedBalances.find((item) =>
            item.tokens.some((balanceToken) => getIsSameOrTokenEquivalent(balanceToken.token, asset))
          );
          return {
            key: asset.address,
            token: asset,
            balance: balanceItem ? parseUnits(balanceItem.totalBalanceInUnits, asset.decimals) : undefined,
            balanceUsd: balanceItem
              ? parseUnits(parseExponentialNumberToString(balanceItem.totalBalanceUsd || 0), asset.decimals + 18)
              : undefined,
            chainsWithBalance: balanceItem ? balanceItem.tokens.map((token) => token.token.chainId) : [],
          };
        })
        .sort((a, b) => {
          const aBalance = Number(a.balanceUsd);
          const bBalance = Number(b.balanceUsd);
          const aHasBalance = !isNaN(aBalance) && aBalance > 0;
          const bHasBalance = !isNaN(bBalance) && bBalance > 0;

          if (aHasBalance && !bHasBalance) return -1;
          if (!aHasBalance && bHasBalance) return 1;
          if (aHasBalance && bHasBalance) return bBalance - aBalance;
          return 0;
        }),
    [assets, mergedBalances]
  );

  const rewardOptions = React.useMemo<RewardSelectorOption[]>(
    () => [
      ...assetOptions,
      ...rewards.map((reward) => ({
        key: reward.address,
        token: reward,
        chainsWithBalance: [],
      })),
    ],
    [rewards, assetOptions]
  );

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
      <StyledWizardBaseContainer>
        <StyledTitle>
          <FormattedMessage description="earn.wizard.title-first-part" defaultMessage="I have" />
        </StyledTitle>
        <ContainerBox>
          <Select
            id="select-wizard-asset"
            options={assetOptions}
            RenderItem={TokenSelectorItem}
            RenderSelectedValue={RenderSelectedValue}
            selectedItem={selectedAsset}
            SkeletonItem={SkeletonTokenSelectorItem}
            onChange={handleAssetChange}
            disabledSearch
            limitHeight
            variant="standard"
            Header={{
              component: HeaderItem,
              props: {
                label: capitalize(firstDropdownText),
                Icon: Money2Icon,
              },
            }}
            Footer={{
              component: FooterItem,
            }}
            isLoading={isLoading}
            placeholder={firstDropdownText}
            placeholderProps={{
              variant: 'h3Bold',
              color: 'primary',
            }}
          />
        </ContainerBox>
      </StyledWizardBaseContainer>
      <StyledWizardBaseContainer>
        <StyledTitle>
          <FormattedMessage description="earn.wizard.title-second-part" defaultMessage="and I want to generate" />
        </StyledTitle>
        <ContainerBox>
          <Select
            id="select-wizard-reward"
            options={rewardOptions}
            RenderItem={TokenSelectorItem}
            RenderSelectedValue={RenderSelectedValue}
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
            Footer={{
              component: FooterItem,
            }}
            isLoading={isLoading}
            placeholder={secondDropdownText}
            placeholderProps={{
              variant: 'h3Bold',
              color: 'primary',
            }}
          />
        </ContainerBox>
      </StyledWizardBaseContainer>
    </StyledSelectionContainer>
  );
};
