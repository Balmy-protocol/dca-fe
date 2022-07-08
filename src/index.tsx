import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import EnMessages from 'config/lang/en_US.json';
import WalletContext from 'common/wallet-context';
import Web3Service from 'services/web3Service';
import DCASubgraphs from 'utils/dcaSubgraphApolloClient';
import UNISubgraphs from 'utils/graphPricesApolloClient';
import { Provider } from 'react-redux';
import store, { axiosClient } from 'state';
import { Theme } from '@mui/material/styles';
import MainApp from './frame';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

type AppProps = {
  messages: Record<string, string>;
  locale: string;
};

function loadLocaleData(locale: string) {
  switch (locale) {
    default:
      return EnMessages;
  }
}

const App: React.FunctionComponent<AppProps> = ({ locale, messages }: AppProps) => {
  const [account, setAccount] = React.useState('');
  const [web3Service] = React.useState(new Web3Service(DCASubgraphs, UNISubgraphs, setAccount));
  const [isLoadingWeb3, setIsLoadingWeb3] = React.useState(true);
  const {
    config: { network },
  } = store.getState();

  React.useEffect(() => {
    async function setWeb3ModalEffect() {
      await web3Service.setUpModal(network?.chainId);
      setIsLoadingWeb3(false);
    }

    if (!web3Service.getModal()) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setWeb3ModalEffect();
    }
  }, [web3Service, network]);

  const isLoading = isLoadingWeb3;

  return (
    <WalletContext.Provider
      value={{
        web3Service,
        account,
        axiosClient,
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
        <Provider store={store}>
          <MainApp isLoading={isLoading} />
        </Provider>
      </IntlProvider>
    </WalletContext.Provider>
  );
};

function bootstrapApplication(locale: string) {
  const messages = loadLocaleData(locale);
  ReactDOM.render(<App locale={locale} messages={messages} />, document.getElementById('root'));
}

bootstrapApplication('en');

if (module.hot) {
  module.hot.accept();
}
