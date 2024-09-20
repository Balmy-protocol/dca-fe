import useAccountService from '@hooks/useAccountService';
import useTrackEvent from '@hooks/useTrackEvent';
import useWallets from '@hooks/useWallets';
import React from 'react';
import { useIntl } from 'react-intl';
import { Chip, colors, ContainerBox, Select, Skeleton, Typography, WalletIcon } from 'ui-library';
import Address from '../address';
import { formatUsdAmount } from '@common/utils/currency';
import { useWalletUsdBalances } from '@state/balances/hooks';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useActiveWallet from '@hooks/useActiveWallet';
import { find, orderBy } from 'lodash';
import { Token, Wallet } from 'common-types';
import { formatWalletLabel } from '@common/utils/parsing';

type OptionWithKey = {
  key: string;
  wallet: Wallet;
  usdBalance?: number;
  isLoading: boolean;
};

const WalletItem = ({
  item: { wallet, usdBalance, isLoading },
  showSecondaryLabel,
}: {
  item: OptionWithKey;
  showSecondaryLabel?: boolean;
}) => {
  const intl = useIntl();
  const { address, label, ens } = wallet;
  const { primaryLabel, secondaryLabel } = formatWalletLabel(address, label, ens);
  return (
    <ContainerBox alignItems="center" justifyContent="space-between" key={wallet.address} flex={1} gap={3}>
      <ContainerBox alignItems="center" flex={1} gap={3}>
        <WalletIcon />
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
      {!!usdBalance && (
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={
            isLoading ? (
              <Skeleton animation="wave" variant="text" width="4ch" />
            ) : (
              <Typography variant="bodySemibold">${formatUsdAmount({ amount: usdBalance, intl })}</Typography>
            )
          }
        />
      )}
    </ContainerBox>
  );
};

interface FormWalletSelectorProps {
  tokensToFilter?: Token[];
}

const FormWalletSelector = ({ tokensToFilter }: FormWalletSelectorProps) => {
  const trackEvent = useTrackEvent();
  const accountService = useAccountService();
  const wallets = useWallets();
  const selectedNetwork = useSelectedNetwork();
  const { isLoading, usdBalances } = useWalletUsdBalances(selectedNetwork.chainId, tokensToFilter);
  const activeWallet = useActiveWallet();

  const selectedWallet = activeWallet?.address || find(wallets, { isAuth: true })?.address;

  const onClickWalletItem = (option: OptionWithKey) => {
    trackEvent('Form Wallet selector - Changed active wallet');
    void accountService.setActiveWallet(option.wallet.address);
  };

  const options = React.useMemo<OptionWithKey[]>(() => {
    const parsedOptions = wallets.map((wallet) => ({
      isLoading,
      key: wallet.address,
      wallet,
      usdBalance: usdBalances[wallet.address],
    }));
    return orderBy(parsedOptions, ['usdBalance'], ['desc']);
  }, [isLoading, wallets, usdBalances]);

  const selectedWalletOption = React.useMemo(
    () => options.find((option) => option.wallet.address === selectedWallet),
    [options, selectedWallet]
  );

  return (
    <Select
      disabledSearch
      options={options}
      RenderItem={({ item }) => <WalletItem item={item} showSecondaryLabel />}
      RenderSelectedValue={WalletItem}
      selectedItem={selectedWalletOption}
      onChange={onClickWalletItem}
      size="medium"
    />
  );
};

export default FormWalletSelector;
