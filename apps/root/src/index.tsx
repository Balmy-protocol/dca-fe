import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Client, configureChains } from 'wagmi';
import EnMessages from '@lang/en_US.json';
import EsMessages from '@lang/es.json';
import WalletContext from '@common/components/wallet-context';
import Web3Service from '@services/web3Service';
import DCASubgraphs from '@common/utils/dcaSubgraphApolloClient';
import { Provider } from 'react-redux';
import store from '@state';
import { axiosClient } from '@state/axios';
import { Settings } from 'luxon';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import LanguageContext from '@common/components/language-context';
import { SupportedLanguages } from '@constants/lang';
import { getChainIdFromUrl } from '@common/utils/urlParser';
import MainApp from './frame';
import { PrivyWagmiConnector } from '@privy-io/wagmi-connector';
import useAccountService from '@hooks/useAccountService';
import useLabelService from '@hooks/useLabelService';

type AppProps = {
  locale: SupportedLanguages;
  web3Service: Web3Service;
  config: {
    wagmiClient: Client;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chains: any[];
  };
};

function loadLocaleData(locale: SupportedLanguages) {
  switch (locale) {
    case 'es':
      return EsMessages;
    default:
      return EnMessages;
  }
}

const WalletsUpdater = () => {
  const { user, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const accountService = useAccountService();
  const labelService = useLabelService();

  React.useEffect(() => {
    const initializeUserData = async () => {
      const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
      const embeddedWalletIsReady = !!embeddedWallet;

      if (user && wallets.length && authenticated && ready && embeddedWalletIsReady) {
        try {
          await accountService.setUser(user, wallets);
          await labelService.initializeLabelsAndContacts();
        } catch (error) {
          console.error(error);
        }
      }
    };

    void initializeUserData();
  }, [authenticated, wallets, ready]);
  return <></>;
};

const App: React.FunctionComponent<AppProps> = ({ locale, web3Service, config: { wagmiClient, chains } }: AppProps) => {
  const [account, setAccount] = React.useState('');
  const [selectedLocale, setSelectedLocale] = React.useState(locale || SupportedLanguages.english);

  React.useEffect(() => web3Service.setSetAccountFallback(setAccount), [web3Service]);

  const chainId = getChainIdFromUrl();

  return (
    <LanguageContext.Provider
      value={{
        language: selectedLocale,
        onChangeLanguage: (newLocale: SupportedLanguages) => {
          setSelectedLocale(newLocale);
          Settings.defaultLocale = newLocale;
        },
      }}
    >
      <WalletContext.Provider
        value={{
          web3Service,
          account,
          axiosClient,
        }}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        <IntlProvider locale={selectedLocale} defaultLocale="en" messages={loadLocaleData(selectedLocale)}>
          <Provider store={store}>
            <PrivyProvider
              appId={process.env.PUBLIC_PRIVY_APP_ID!}
              config={{
                loginMethods: ['email', 'google', 'twitter', 'discord', 'apple', 'wallet'],
                appearance: {
                  theme: 'dark',
                  accentColor: '#676FFF',
                  logo: 'https://your-logo-url',
                },
                embeddedWallets: {
                  createOnLogin: 'all-users',
                },
              }}
            >
              <PrivyWagmiConnector wagmiChainsConfig={wagmiClient as unknown as ReturnType<typeof configureChains>}>
                <RainbowKitProvider chains={chains} initialChain={chainId} theme={darkTheme()}>
                  <MainApp />
                  <WalletsUpdater />
                </RainbowKitProvider>
              </PrivyWagmiConnector>
            </PrivyProvider>
          </Provider>
        </IntlProvider>
      </WalletContext.Provider>
    </LanguageContext.Provider>
  );
};

function bootstrapApplication(locale: SupportedLanguages) {
  const container = document.getElementById('root');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = createRoot(container!);

  const web3Service = new Web3Service(DCASubgraphs);

  const config = web3Service.setUpModal();
  root.render(
    <React.StrictMode>
      <App locale={locale} web3Service={web3Service} config={config} />
    </React.StrictMode>
  );
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrapApplication(SupportedLanguages.english);

if (module.hot) {
  module.hot.accept();
}
