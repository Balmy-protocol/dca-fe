import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import MainApp from './frame';
import EnMessages from 'config/lang/en_US.json';

type web3WalletState = null | {};

type WalletProviderValue = {
  web3Wallet: web3WalletState;
  setWeb3Wallet: React.Dispatch<React.SetStateAction<null>>;
};

const WalletProviderDefaultValue: WalletProviderValue = {
  web3Wallet: null,
  setWeb3Wallet: () => {},
};

const WalletProvider = React.createContext(WalletProviderDefaultValue);

type AppProps = {
  messages: any;
  locale: string;
};

function loadLocaleData(locale: string) {
  switch (locale) {
    default:
      return EnMessages;
  }
}

const App: React.FunctionComponent<AppProps> = ({ locale, messages }: AppProps) => {
  const [web3Wallet, setWeb3Wallet] = React.useState(null);

  return (
    <WalletProvider.Provider
      value={{
        web3Wallet,
        setWeb3Wallet,
      }}
    >
      <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
        <MainApp />
      </IntlProvider>
    </WalletProvider.Provider>
  );
};

async function bootstrapApplication(locale: string) {
  const messages = await loadLocaleData(locale);
  ReactDOM.render(<App locale={locale} messages={messages} />, document.getElementById('root'));
}

bootstrapApplication('en');
