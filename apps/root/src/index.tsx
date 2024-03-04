// import './wdyr';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Config, WagmiConfig } from 'wagmi';
import { Address } from 'viem';
import EnMessages from '@lang/en_US.json';
import EsMessages from '@lang/es.json';
import WalletContext from '@common/components/wallet-context';
import Web3Service from '@services/web3Service';
import { Provider } from 'react-redux';
import createStore, { StoreType } from '@state';
import { axiosClient } from '@state/axios';
import { Settings } from 'luxon';
import LanguageContext from '@common/components/language-context';
import { SupportedLanguages } from '@constants/lang';
import { getChainIdFromUrl } from '@common/utils/urlParser';
import MainApp from './frame';

type AppProps = {
  locale: SupportedLanguages;
  web3Service: Web3Service;
  config: {
    wagmiClient: Config;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chains: any[];
  };
  store: StoreType;
};

function loadLocaleData(locale: SupportedLanguages) {
  switch (locale) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    case 'es':
      return EsMessages;
    default:
      return EnMessages;
  }
}

const App: React.FunctionComponent<AppProps> = ({
  locale,
  web3Service,
  config: { wagmiClient, chains },
  store,
}: AppProps) => {
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
          account: account as Address,
          axiosClient,
        }}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        <IntlProvider locale={selectedLocale} defaultLocale="en" messages={loadLocaleData(selectedLocale)}>
          <Provider store={store}>
            <WagmiConfig config={wagmiClient}>
              <RainbowKitProvider chains={chains} initialChain={chainId} theme={darkTheme()}>
                <MainApp />
              </RainbowKitProvider>
            </WagmiConfig>
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

  const web3Service = new Web3Service();
  const store = createStore(web3Service);

  const config = web3Service.setUpModal();
  root.render(
    <React.StrictMode>
      <App locale={locale} web3Service={web3Service} config={config} store={store} />
    </React.StrictMode>
  );
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrapApplication(SupportedLanguages.english);

if (module.hot) {
  module.hot.accept();
}
