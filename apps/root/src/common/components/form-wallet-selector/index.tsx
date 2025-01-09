import useAccountService from '@hooks/useAccountService';
import useAnalytics from '@hooks/useAnalytics';
import useWallets from '@hooks/useWallets';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, colors, ContainerBox, Select, Typography, WalletIcon } from 'ui-library';
import Address from '../address';
import { AllWalletsBalances, useUsdBalances } from '@state/balances/hooks';
import useActiveWallet from '@hooks/useActiveWallet';
import { find, orderBy } from 'lodash';
import { ChainId, Token, Wallet } from 'common-types';
import { formatWalletLabel } from '@common/utils/parsing';
import { BalanceUsdChip } from '../token-selector/token-items';
import useOpenConnectModal from '@hooks/useOpenConnectModal';
import { WalletActionType } from '@services/accountService';

type OptionWithKey = {
  key: string;
  wallet: Wallet;
  usdBalance?: number;
  isLoading: boolean;
  chipDescription?: string;
};

const WalletItem = ({
  item: { wallet, usdBalance, isLoading },
  showSecondaryLabel,
  chipDescription,
}: {
  item: OptionWithKey;
  showSecondaryLabel?: boolean;
  chipDescription?: string;
}) => {
  const intl = useIntl();
  const { address, label, ens } = wallet;
  const { primaryLabel, secondaryLabel } = formatWalletLabel(address, label, ens);
  return (
    <ContainerBox alignItems="center" justifyContent="space-between" key={wallet.address} flex={1} gap={3}>
      <ContainerBox alignItems="center" flex={1} gap={3}>
        <WalletIcon sx={({ palette: { mode } }) => ({ color: colors[mode].typography.typo3 })} />
        {showSecondaryLabel ? (
          <ContainerBox flexDirection="column" gap={0.5}>
            <Typography variant="bodyBold" lineHeight={1}>
              {primaryLabel}
            </Typography>
            <Typography variant="labelRegular">{secondaryLabel}</Typography>
          </ContainerBox>
        ) : (
          <Typography variant="bodySemibold" color={({ palette }) => colors[palette.mode].typography.typo1}>
            <Address address={wallet.address} trimAddress />
          </Typography>
        )}
      </ContainerBox>
      <BalanceUsdChip isLoading={isLoading} balanceUsd={usdBalance || 0} intl={intl} description={chipDescription} />
    </ContainerBox>
  );
};

interface FormWalletSelectorProps {
  filter?: { chainId: ChainId; tokens: Token[] };
  chipDescription?: string;
  overrideUsdBalances?: AllWalletsBalances;
}

const FormWalletSelector = ({ filter, chipDescription, overrideUsdBalances }: FormWalletSelectorProps) => {
  const { trackEvent } = useAnalytics();
  const accountService = useAccountService();
  const wallets = useWallets();
  const { isLoading, usdBalances } = useUsdBalances(filter);
  const activeWallet = useActiveWallet();
  const intl = useIntl();
  const openConnectModal = useOpenConnectModal();

  const selectedWallet = activeWallet?.address || find(wallets, { isAuth: true })?.address;

  const onClickWalletItem = (option: OptionWithKey) => {
    trackEvent('Form Wallet selector - Changed active wallet');
    void accountService.setActiveWallet(option.wallet.address);
  };

  const options = React.useMemo<OptionWithKey[]>(() => {
    const usdBalancesToUse = overrideUsdBalances || usdBalances;

    const parsedOptions = wallets.map((wallet) => ({
      isLoading,
      key: wallet.address,
      wallet,
      usdBalance: usdBalancesToUse[wallet.address],
    }));
    return orderBy(parsedOptions, ['usdBalance'], ['desc']);
  }, [isLoading, wallets, usdBalances, overrideUsdBalances]);

  const selectedWalletOption = React.useMemo(
    () => options.find((option) => option.wallet.address === selectedWallet),
    [options, selectedWallet]
  );

  const connectWalletButton = (
    <Button
      maxWidth="100%"
      size="large"
      variant="text"
      fullWidth
      onClick={() => openConnectModal(WalletActionType.connect)}
    >
      <FormattedMessage description="connect wallet" defaultMessage="Connect wallet" />
    </Button>
  );

  return (
    <Select
      disabledSearch
      options={options}
      RenderItem={({ item }) => <WalletItem item={item} showSecondaryLabel />}
      RenderSelectedValue={({ item }) => <WalletItem item={item} chipDescription={chipDescription} />}
      selectedItem={selectedWalletOption}
      onChange={onClickWalletItem}
      size="medium"
      placeholder={intl.formatMessage({
        defaultMessage: 'Connect your wallet',
        description: 'connectYourWallet',
      })}
      emptyOption={connectWalletButton}
    />
  );
};

export default FormWalletSelector;
