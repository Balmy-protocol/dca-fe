import { getAllChains } from '@balmy/sdk';
import { chainToViemNetwork } from '@common/utils/parsing';
import { UNSUPPORTED_WAGMI_CHAIN } from '@constants';
import { ripioWallet, bitkeepWallet } from '@constants/custom-wallets';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { find } from 'lodash';
import { Transport, http, Chain } from 'viem';
import {
  injectedWallet,
  rainbowWallet,
  metaMaskWallet,
  walletConnectWallet,
  trustWallet,
  argentWallet,
  safeWallet,
  ledgerWallet,
  braveWallet,
  okxWallet,
  zerionWallet,
  coreWallet,
  frameWallet,
  rabbyWallet,
} from '@rainbow-me/rainbowkit/wallets';

import {
  mainnet,
  polygon,
  bsc,
  avalanche,
  arbitrum,
  optimism,
  celo,
  gnosis,
  klaytn,
  aurora,
  cronos,
  okc,
  harmonyOne,
  boba,
  moonriver,
  moonbeam,
  evmos,
  canto,
} from 'wagmi/chains';
// See: https://github.com/wevm/wagmi/issues/3157 & https://github.com/coinbase/coinbase-wallet-sdk/issues/1012
// Rainbowkit implementation: https://github.com/rainbow-me/rainbowkit/blob/d8c64ee4baf865d3452a6b92e0525c123f680ec1/packages/rainbowkit/src/wallets/walletConnectors/coinbaseWallet/coinbaseWallet.ts
// Wagmi implementation: https://github.com/wevm/wagmi/blob/main/packages/connectors/src/coinbaseWallet.ts

// Here we initialize our own coinbaseWallet rainbowWallet, so that we can construct it using the v3 which does not have automatic window.location.reload() on disconnect
// Since we can't disconnect we cannot open the rainbowkit modal.
// V3 allows disconnecting without refreshing the page, it's going to get deprecated soon, but it would imply a major change so we should be good by now
import { coinbaseWallet } from '@common/utils/provider-info';

export default function getWagmiConfig() {
  const sdkChains = getAllChains();

  const addedNetworks: Chain[] = [];

  UNSUPPORTED_WAGMI_CHAIN.forEach((chainId) => {
    const found = find(sdkChains, { chainId });
    if (found) {
      addedNetworks.push(chainToViemNetwork(found));
    }
  });

  const wagmiChains: [Chain, ...Chain[]] = [
    mainnet,
    polygon,
    bsc,
    avalanche,
    arbitrum,
    optimism,
    celo,
    gnosis,
    klaytn,
    aurora,
    cronos,
    okc,
    harmonyOne,
    boba,
    moonriver,
    moonbeam,
    evmos,
    canto,
    ...addedNetworks,
  ];

  const transports = wagmiChains.reduce<Record<[Chain, ...Chain[]][number]['id'], Transport>>((acc, chain) => {
    // eslint-disable-next-line no-param-reassign
    acc[chain.id] = http();
    return acc;
  }, {});

  const wagmiClient = getDefaultConfig({
    chains: wagmiChains,
    wallets: [
      {
        groupName: 'Popular',
        wallets: [
          rabbyWallet,
          frameWallet,
          zerionWallet,
          coinbaseWallet,
          metaMaskWallet,
          walletConnectWallet,
          okxWallet,
          rainbowWallet,
          braveWallet,
          injectedWallet,
        ],
      },
      {
        groupName: 'More',
        wallets: [coreWallet, trustWallet, ripioWallet, argentWallet, safeWallet, ledgerWallet, bitkeepWallet],
      },
    ],
    transports,
    projectId: process.env.WC_PROJECT_ID as string,
    appName: 'Balmy',
  });

  return wagmiClient;
}
