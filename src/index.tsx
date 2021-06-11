import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import MainApp from './frame';
import EnMessages from 'config/lang/en_US.json';
import WalletContext, { web3ModalState } from 'common/wallet-context';
import { setUpWeb3Modal } from 'utils/web3modal';

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
  const [web3Modal, setWeb3Modal] = React.useState<web3ModalState>(null);
  const [account, setAccount] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function setWeb3ModalEffect() {
      setWeb3Modal(await setUpWeb3Modal(setWeb3Wallet, setAccount));
      setIsLoading(false);
    }

    if (!web3Modal) {
      setWeb3ModalEffect();
    }
  }, [web3Modal]);

  return (
    <WalletContext.Provider
      value={{
        web3Wallet,
        setWeb3Wallet,
        web3Modal,
        account,
        setAccount,
      }}
    >
      <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
        <MainApp isLoading={isLoading} />
      </IntlProvider>
    </WalletContext.Provider>
  );
};

function bootstrapApplication(locale: string) {
  const messages = loadLocaleData(locale);
  ReactDOM.render(<App locale={locale} messages={messages} />, document.getElementById('root'));
}

bootstrapApplication('en');
