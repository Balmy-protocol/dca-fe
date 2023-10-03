import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Client, WagmiConfig } from 'wagmi';
import EnMessages from '@lang/en_US.json';
import EsMessages from '@lang/es.json';
import WalletContext from '@common/components/wallet-context';
import Web3Service from '@services/web3Service';
import DCASubgraphs from '@common/utils/dcaSubgraphApolloClient';
import { Provider } from 'react-redux';
import store, { axiosClient } from '@state';
import { Settings } from 'luxon';
import LanguageContext from '@common/components/language-context';
import { SupportedLanguages } from '@constants/lang';
import { getChainIdFromUrl } from '@common/utils/urlParser';
import MainApp from './frame';

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

const App: React.FunctionComponent<AppProps> = ({ locale, web3Service, config: { wagmiClient, chains } }: AppProps) => {
  const [account, setAccount] = React.useState(web3Service.getAccount());
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
            <WagmiConfig client={wagmiClient}>
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
