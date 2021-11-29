import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import EnMessages from 'config/lang/en_US.json';
import WalletContext from 'common/wallet-context';
import axios from 'axios';
import Web3Service from 'services/web3Service';
import { ApolloProvider } from '@apollo/client';
import DCASubgraph from 'utils/dcaSubgraphApolloClient';
import { Provider } from 'react-redux';
import store from 'state';
import { SnackbarProvider } from 'notistack';
import { setupCache } from 'axios-cache-adapter';
import MainApp from './frame';

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

// Create `axios-cache-adapter` instance
const cache = setupCache({
  maxAge: 15 * 60 * 1000,
});

// Create `axios` instance passing the newly created `cache.adapter`
const axiosClient = axios.create({
  adapter: cache.adapter,
});

const App: React.FunctionComponent<AppProps> = ({ locale, messages }: AppProps) => {
  const [account, setAccount] = React.useState('');
  const [web3Service] = React.useState(new Web3Service(setAccount));
  const [isLoadingWeb3, setIsLoadingWeb3] = React.useState(true);

  React.useEffect(() => {
    async function setWeb3ModalEffect() {
      await web3Service.setUpModal();
      setIsLoadingWeb3(false);
    }

    if (!web3Service.getModal()) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setWeb3ModalEffect();
    }
  }, [web3Service]);

  const isLoading = isLoadingWeb3;

  return (
    <WalletContext.Provider
      value={{
        web3Service,
        account,
        graphPricesClient: web3Service.getUNIGraphqlClient().getClient(),
        DCASubgraph: web3Service.getDCAGraphqlClient().getClient(),
        axiosClient,
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
        <ApolloProvider client={DCASubgraph}>
          <Provider store={store}>
            <SnackbarProvider>
              <MainApp isLoading={isLoading} />
            </SnackbarProvider>
          </Provider>
        </ApolloProvider>
      </IntlProvider>
    </WalletContext.Provider>
  );
};

function bootstrapApplication(locale: string) {
  const messages = loadLocaleData(locale);
  ReactDOM.render(<App locale={locale} messages={messages} />, document.getElementById('root'));
}

bootstrapApplication('en');
