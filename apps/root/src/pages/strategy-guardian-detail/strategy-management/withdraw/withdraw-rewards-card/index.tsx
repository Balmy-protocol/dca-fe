import ComposedTokenIcon from '@common/components/composed-token-icon';
import NetWorthNumber from '@common/components/networth-number';
import { getProtocolToken } from '@common/mocks/tokens';
import { isSameToken } from '@common/utils/currency';
import useActiveWallet from '@hooks/useActiveWallet';
import useContractService from '@hooks/useContractService';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { setWithdrawAmount, setWithdrawRewards } from '@state/earn-management/actions';
import { useAppDispatch } from '@state/hooks';
import { DisplayStrategy, EarnPermission, NetworkStruct, WithdrawType } from 'common-types';
import isNil from 'lodash/isNil';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { colors, ContainerBox, Typography } from 'ui-library';
import WithdrawRewardsCardCTAButton from './cta-button';
import { setNetwork } from '@state/config/actions';
import useAnalytics from '@hooks/useAnalytics';
import useWalletService from '@hooks/useWalletService';
import { find } from 'lodash';
import { NETWORKS } from '@constants';

interface WithdrawRewardsCardProps {
  strategy?: DisplayStrategy;
  onWithdraw: (assetWithdrawType: WithdrawType) => void;
  onHandleProceed: (assetWithdrawType: WithdrawType) => void;
}

const StyledWithdrawRewardsCardContainer = styled(ContainerBox).attrs({
  justifyContent: 'space-between',
  alignItems: 'center',
})`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    padding: ${spacing(3)} ${spacing(4)};
    border-radius: ${spacing(2)};
    background-color: ${colors[mode].background.primary}
  `}
`;

const WithdrawRewardsCard = ({ strategy, onWithdraw, onHandleProceed }: WithdrawRewardsCardProps) => {
  const activeWallet = useActiveWallet();
  const contractService = useContractService();
  const dispatch = useAppDispatch();
  const actualCurrentNetwork = useCurrentNetwork();
  const { trackEvent } = useAnalytics();
  const walletService = useWalletService();

  const rewards = React.useMemo(() => {
    const userPositions = strategy?.userPositions;

    const userPosition = userPositions?.find((position) => position.owner === activeWallet?.address);

    if (!strategy?.asset) {
      return undefined;
    }

    return userPosition?.balances.filter(
      (balance) => !isSameToken(balance.token, strategy?.asset) && balance.amount.amount > 0
    );
  }, [strategy?.userPositions, activeWallet?.address, strategy?.asset]);

  const totalRewards = rewards?.reduce((acc, balance) => acc + Number(balance.amount.amountInUSD), 0);

  if (!strategy || isNil(rewards) || isNil(totalRewards) || Number(totalRewards.toFixed(2)) === 0) return null;

  const protocolToken = getProtocolToken(strategy.farm.chainId);
  const companionAddress = contractService.getEarnCompanionAddress(strategy.network.chainId);
  const userPosition = strategy.userPositions?.find((position) => position.owner === activeWallet?.address);
  const companionHasPermission =
    strategy &&
    userPosition &&
    companionAddress &&
    userPosition.permissions[companionAddress]?.includes(EarnPermission.WITHDRAW);

  const requireCompanionSignature =
    protocolToken?.address === strategy?.asset.address && !companionHasPermission && !!companionAddress;

  const handleWithdraw = () => {
    dispatch(setWithdrawAmount('0'));
    dispatch(setWithdrawRewards(true));
    if (requireCompanionSignature) {
      onHandleProceed(WithdrawType.IMMEDIATE);
    } else {
      onWithdraw(WithdrawType.IMMEDIATE);
    }
  };

  const isOnCorrectNetwork = actualCurrentNetwork.chainId === strategy?.network.chainId;

  const onChangeNetwork = (chainId?: number) => {
    if (!chainId) return;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId, activeWallet?.address, () => {
      const networkToSet = find(NETWORKS, { chainId });
      dispatch(setNetwork(networkToSet as NetworkStruct));
    });
    trackEvent('Earn Vault Withdraw - Change network button');
  };
  return (
    <StyledWithdrawRewardsCardContainer>
      <ContainerBox flexDirection="column" gap={1}>
        <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
          <FormattedMessage
            defaultMessage="Rewards in this wallet"
            description="earn.strategy-management.withdraw.withdraw-rewards-card.title"
          />
        </Typography>
        <ContainerBox alignItems="center" gap={2}>
          <ComposedTokenIcon tokens={rewards.map((balance) => balance.token)} size={6} marginRight={3} />
          <NetWorthNumber value={totalRewards} variant="bodyRegular" withAnimation isFiat />
        </ContainerBox>
      </ContainerBox>
      <WithdrawRewardsCardCTAButton
        requireCompanionSignature={requireCompanionSignature}
        handleWithdraw={handleWithdraw}
        isOnCorrectNetwork={isOnCorrectNetwork}
        onChangeNetwork={onChangeNetwork}
        network={strategy.network}
        activeWallet={activeWallet}
      />
    </StyledWithdrawRewardsCardContainer>
  );
};

export default WithdrawRewardsCard;
