// import './wdyr';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { Config } from 'wagmi';
import EnMessages from '@lang/en.json';
import EsMessages from '@lang/es.json';
import TrMessages from '@lang/tr.json';
import WalletContext from '@common/components/wallet-context';
import Web3Service from '@services/web3Service';
import { Provider } from 'react-redux';
import createStore, { StoreType } from '@state';
import { axiosClient } from '@state/axios';
import { Settings } from 'luxon';
import LanguageContext from '@common/components/language-context';
import { SupportedLanguages } from '@constants/lang';
import MainApp from './frame';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

type AppProps = {
  locale: SupportedLanguages;
  web3Service: Web3Service;
  config: {
    wagmiClient: Config;
  };
  store: StoreType;
};

function loadLocaleData(locale: SupportedLanguages) {
  switch (locale) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    case SupportedLanguages.spanish:
      return EsMessages;
    case SupportedLanguages.english:
      return EnMessages;
    case SupportedLanguages.turkish:
      return TrMessages;
    default:
      return EnMessages;
  }
}

const App: React.FunctionComponent<AppProps> = ({ locale, web3Service, config, store }: AppProps) => {
  const [selectedLocale, setSelectedLocale] = React.useState(locale || SupportedLanguages.english);

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
          axiosClient,
        }}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        <IntlProvider locale={selectedLocale} defaultLocale="en" messages={loadLocaleData(selectedLocale)}>
          <Provider store={store}>
            <MainApp config={config} />
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

// Register the service worker for PWA support
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // When a new version is available, show a notification or update UI
    const waitingServiceWorker = registration.waiting;

    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener('statechange', (event) => {
        // @ts-expect-error - event.target might not have state property
        if (event.target?.state === 'activated') {
          window.location.reload();
        }
      });
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  },
  onSuccess: (registration) => {
    console.log('Service Worker registered successfully:', registration);
  },
});

if (module.hot) {
  module.hot.accept();
}
