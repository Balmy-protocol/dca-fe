import React from 'react';
import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';

interface TradingViewWidgetProps {
  from: string;
  to: string;
  client: ApolloClient<NormalizedCacheObject>;
}

const tradingViewOptions = {
  width: '100%',
  height: '100%',
  symbol: `BINANCE:ETHDAI`,
  interval: 'D',
  timezone: 'Etc/UTC',
  theme: 'light',
  style: '1',
  locale: 'en',
  toolbar_bg: '#f1f3f6',
  enable_publishing: false,
  hide_top_toolbar: true,
  save_image: false,
  container_id: 'tradingview_3e38d',
};

const TradingViewWidget = ({ from, to }: TradingViewWidgetProps) => {
  React.useEffect(() => {
    tradingViewOptions.symbol = `BITFINEX:${from}${to}`;
    if (from && to) {
      console.log('going to render it with', from, to);
      new (window as any).TradingView.widget(tradingViewOptions);
    } else {
      console.log('not gonna render it');
    }
  }, [from, to]);

  return (
    <div style={{ height: '300px' }}>
      <div className="tradingview-widget-container" style={{ height: '300px' }}>
        <div id="tradingview_3e38d" style={{ height: '300px' }}></div>
      </div>
    </div>
  );
};

export default TradingViewWidget;

// export default class TradingViewWidget extends React.PureComponent<TradingViewWidgetProps> {
//   _ref: React.RefObject<HTMLDivElement>;

//   constructor(props: TradingViewWidgetProps) {
//       super(props);
//       this._ref = React.createRef();
//   }

//   componentDidMount() {
//     const tradingViewOptions = {
//       // "autozise": true,
//       "width": '100%',
//       "height": '100%',
//       // "symbol": `BINANCE:${this.props.from}${this.props.to}`,
//       "symbol": `BINANCE:ETHDAI`,
//       "interval": "D",
//       "timezone": "Etc/UTC",
//       "theme": "light",
//       "style": "1",
//       "locale": "en",
//       "toolbar_bg": "#f1f3f6",
//       "enable_publishing": false,
//       "hide_top_toolbar": true,
//       "save_image": false,
//       "container_id": "tradingview_3e38d"
//     }

//     debugger;
//     new (window as any).TradingView.widget(tradingViewOptions);
//   }

//   render() {
//     return(
//       <div style={{ height: '300px' }}>
//         <div className="tradingview-widget-container" style={{ height: '300px' }} ref={this._ref}>
//           <div id="tradingview_3e38d" style={{ height: '300px' }} ></div>
//         </div>
//       </div>
//     );
//   }
// }

// <!-- TradingView Widget BEGIN -->
// <div class="tradingview-widget-container">
//   <div id="tradingview_cedc8"></div>
//   <div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/ETHDAI/?exchange=BINANCE" rel="noopener" target="_blank"><span class="blue-text">ETHDAI Chart</span></a> by TradingView</div>
//   <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
//   <script type="text/javascript">
//   new TradingView.widget(
//   {
//   "width": 980,
//   "height": 610,
//   "symbol": "BINANCE:ETHDAI",
//   "timezone": "Etc/UTC",
//   "theme": "light",
//   "style": "1",
//   "locale": "en",
//   "toolbar_bg": "#f1f3f6",
//   "enable_publishing": false,
//   "hide_top_toolbar": true,
//   "hide_legend": true,
//   "range": "5D",
//   "save_image": false,
//   "container_id": "tradingview_cedc8"
// }
//   );
//   </script>
// </div>
// <!-- TradingView Widget END -->
