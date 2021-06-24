import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import EnMessages from 'config/lang/en_US.json';
import WalletContext, { WalletContextDefaultValue } from 'common/wallet-context';
import { Token, TokenList } from 'types';
import axios from 'axios';
import MainApp from './frame';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import Web3Service from 'services/web3Service';

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
  const [web3Service, setWeb3Service] = React.useState(new Web3Service(setAccount));
  const [tokenList, setTokenList] = React.useState<TokenList>({});
  const [isLoadingWeb3, setIsLoadingWeb3] = React.useState(true);
  const [isLoadingTokens, setIsLoadingTokens] = React.useState(true);

  React.useEffect(() => {
    async function setWeb3ModalEffect() {
      await web3Service.setUpModal();
      setIsLoadingWeb3(false);
    }

    async function setTokenListEffect() {
      const geckoTokens = await axios.get<{ tokens: Token[] }>('https://tokens.coingecko.com/uniswap/all.json');

      const reducedTokens = geckoTokens.data.tokens.reduce(
        (acc, token) => ({ ...acc, [token.address]: { ...token } }),
        {}
      );
      setTokenList(reducedTokens);
      setIsLoadingTokens(false);
    }

    if (!web3Service.getModal()) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setWeb3ModalEffect();
    }

    if (!Object.keys(tokenList).length) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setTokenListEffect();
    }
  }, [web3Service, tokenList]);

  const isLoading = isLoadingTokens || isLoadingWeb3;

  return (
    <WalletContext.Provider
      value={{
        web3Service,
        tokenList,
        account,
        graphPricesClient: WalletContextDefaultValue.graphPricesClient,
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
        <MuiThemeProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <MainApp isLoading={isLoading} />
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
