import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import MainApp from './frame';

type AppProps = {
  messages: any;
  locale: string;
};

function loadLocaleData(locale: string) {
  switch (locale) {
    default:
      return import('config/lang/en_US.json');
  }
}

const App: React.FunctionComponent<AppProps> = ({ locale, messages }: AppProps) => {
  return (
    <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
      <MainApp />
    </IntlProvider>
  );
};

async function bootstrapApplication(locale: string) {
  const messages = await loadLocaleData(locale);
  ReactDOM.render(<App locale={locale} messages={messages} />, document.getElementById('root'));
}
