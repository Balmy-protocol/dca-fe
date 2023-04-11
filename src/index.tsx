import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Client, WagmiConfig } from 'wagmi';
import EnMessages from 'config/lang/en_US.json';
import EsMessages from 'config/lang/es.json';
import WalletContext from 'common/wallet-context';
import Web3Service from 'services/web3Service';
import DCASubgraphs from 'utils/dcaSubgraphApolloClient';
import UNISubgraphs from 'utils/graphPricesApolloClient';
import { Provider } from 'react-redux';
import store, { axiosClient } from 'state';
import { Theme } from '@mui/material/styles';
import { Settings } from 'luxon';
import LanguageContext from 'common/language-context';
import { SupportedLanguages } from 'config/constants/lang';
import { getChainIdFromUrl } from 'utils/urlParser';
import MainApp from './frame';
// import './index.css';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

type AppProps = {
  locale: SupportedLanguages;
};

function loadLocaleData(locale: SupportedLanguages) {
  switch (locale) {
    case 'es':
      return EsMessages;
    default:
      return EnMessages;
  }
}

const App: React.FunctionComponent<AppProps> = ({ locale }: AppProps) => {
  const [account, setAccount] = React.useState('');
  const [{ wagmiClient, chains }, setConfig] = React.useState<{
    wagmiClient: Nullable<Client>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chains: Nullable<any[]>;
  }>({ wagmiClient: null, chains: null });
  const [web3Service] = React.useState(new Web3Service(DCASubgraphs, UNISubgraphs, setAccount));
  const [isLoadingWeb3, setIsLoadingWeb3] = React.useState(true);
  const [setUpModalError, setSetUpModalError] = React.useState<Error | null>(null);
  const [selectedLocale, setSelectedLocale] = React.useState(locale || SupportedLanguages.english);

  React.useEffect(() => {
    async function setWeb3ModalEffect() {
      try {
        const setUpResponse = await web3Service.setUpModal();
        setConfig(setUpResponse);
      } catch (e) {
        setSetUpModalError(e);
      }
      setIsLoadingWeb3(false);
    }

    if (!web3Service.getModal()) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setWeb3ModalEffect();
    }
  }, [web3Service]);

  const isLoading = isLoadingWeb3;

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
            {!isLoading && wagmiClient && chains && (
              <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider chains={chains} initialChain={chainId} theme={darkTheme()}>
                  <MainApp isLoading={isLoading} initializationError={setUpModalError} />
                </RainbowKitProvider>
              </WagmiConfig>
            )}
          </Provider>
        </IntlProvider>
      </WalletContext.Provider>
    </LanguageContext.Provider>
  );
};

function bootstrapApplication(locale: SupportedLanguages) {
  const messages = loadLocaleData(locale);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ReactDOM.render(<App locale={locale} messages={messages} />, document.getElementById('root'));
}

bootstrapApplication(SupportedLanguages.english);

if (module.hot) {
  module.hot.accept();
}
