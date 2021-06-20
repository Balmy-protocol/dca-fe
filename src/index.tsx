import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import EnMessages from 'config/lang/en_US.json';
import WalletContext, { WalletContextDefaultValue, Web3ModalState, TokenList, Token } from 'common/wallet-context';
import { setUpWeb3Modal } from 'utils/web3modal';
import axios from 'axios';
import MainApp from './frame';

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
  const [web3Modal, setWeb3Modal] = React.useState<Web3ModalState>(null);
  const [tokenList, setTokenList] = React.useState<TokenList>({});
  const [account, setAccount] = React.useState('');
  const [isLoadingWeb3, setIsLoadingWeb3] = React.useState(true);
  const [isLoadingTokens, setIsLoadingTokens] = React.useState(true);

  React.useEffect(() => {
    async function setWeb3ModalEffect() {
      setWeb3Modal(await setUpWeb3Modal(setWeb3Wallet, setAccount));
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

    if (!web3Modal) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setWeb3ModalEffect();
    }

    if (!Object.keys(tokenList).length) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setTokenListEffect();
    }
  }, [web3Modal, tokenList]);

  const isLoading = isLoadingTokens || isLoadingWeb3;

  return (
    <WalletContext.Provider
      value={{
        web3Wallet,
        setWeb3Wallet,
        web3Modal,
        account,
        setAccount,
        tokenList,
        graphPricesClient: WalletContextDefaultValue.graphPricesClient,
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
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
