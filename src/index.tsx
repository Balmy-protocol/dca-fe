import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import EnMessages from 'config/lang/en_US.json';
import WalletContext, { WalletContextDefaultValue } from 'common/wallet-context';
import { Token, TokenList, AvailablePairs } from 'types';
import axios, { AxiosResponse } from 'axios';
import MainApp from './frame';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import Web3Service from 'services/web3Service';
import TransactionModalProvider from 'common/transaction-modal';
import { ApolloProvider } from '@apollo/client';
import DCASubgraph from 'utils/dcaSubgraphApolloClient';
import { Provider } from 'react-redux';
import store from 'state';
import TransactionUpdater from 'state/transactions/transactionUpdater';
import BlockNumberUpdater from 'state/block-number/blockNumberUpdater';
import { SnackbarProvider } from 'notistack';

const theme = createMuiTheme();

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
  const [account, setAccount] = React.useState('');
  const [web3Service, setWeb3Service] = React.useState(
    new Web3Service(setAccount, WalletContextDefaultValue.DCASubgraph, WalletContextDefaultValue.graphPricesClient)
  );
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
        graphPricesClient: WalletContextDefaultValue.graphPricesClient,
        DCASubgraph: WalletContextDefaultValue.DCASubgraph,
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
        <MuiThemeProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <ApolloProvider client={DCASubgraph}>
              <Provider store={store}>
                <SnackbarProvider>
                  <TransactionModalProvider>
                    {!isLoading && (
                      <>
                        <TransactionUpdater />
                        <BlockNumberUpdater />
                      </>
                    )}
                    <MainApp isLoading={isLoading} />
                  </TransactionModalProvider>
                </SnackbarProvider>
              </Provider>
            </ApolloProvider>
          </ThemeProvider>
        </MuiThemeProvider>
      </IntlProvider>
    </WalletContext.Provider>
  );
};

function bootstrapApplication(locale: string) {
  const messages = loadLocaleData(locale);
  ReactDOM.render(<App locale={locale} messages={messages} />, document.getElementById('root'));
}

bootstrapApplication('en');
