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
  coinbaseWallet,
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
  fantom,
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
  polygonZkEvm,
} from 'wagmi/chains';

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
    fantom,
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
    polygonZkEvm,
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
          metaMaskWallet,
          walletConnectWallet,
          okxWallet,
          rainbowWallet,
          coinbaseWallet,
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
