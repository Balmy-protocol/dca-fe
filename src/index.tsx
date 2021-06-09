import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import MainApp from './frame';
import EnMessages from 'config/lang/en_US.json';
import { Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';
// import your favorite web3 convenience library here
let web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');

function getLibrary(provider: any) {
  return new Web3(provider); // this will vary according to whether you use e.g. ethers or web3.js
}

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
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
        <MainApp />
      </IntlProvider>
    </Web3ReactProvider>
  );
};

async function bootstrapApplication(locale: string) {
  const messages = await loadLocaleData(locale);
  ReactDOM.render(<App locale={locale} messages={messages} />, document.getElementById('root'));
}

bootstrapApplication('en');
