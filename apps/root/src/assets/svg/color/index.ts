import AAVE from './aave.svg';
import ARBITRUM from './arbitrum.svg';
import BEEFY from './beefy.svg';
import AVAX from './avax.svg';
import BNB from './bnb.svg';
import CHECK from './check.svg';
import CLOCK from './clock.svg';
import DAI from './dai.svg';
import ETH from './eth.svg';
import EULER from './euler.svg';
import VENUS from './venus.svg';
import EXACTLY from './exactly.svg';
import FAILED from './failed.svg';
import FTM from './ftm.svg';
import GAS from './gas.svg';
import HT from './ht.svg';
import MATIC from './matic.svg';
import OPTIMISM from './optimism.svg';
import SONNE from './sonne.svg';
import YEARN from './yfi.svg';
import AGAVE from './agave.svg';
import MOONWELL from './moonwell.svg';
import MORPHO from './morpho.svg';
import COMPOUND from './compound.svg';
import { ETH_CHAINS, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';

const ethTokens = ETH_CHAINS.reduce<Record<string, typeof ETH>>((acc, chainId) => {
  // eslint-disable-next-line no-param-reassign
  acc[`${chainId}-${PROTOCOL_TOKEN_ADDRESS}`] = ETH;
  return acc;
}, {});

const manifest = {
  // TOKENS
  ...ethTokens,
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': AAVE,
  AAVE,
  ARBITRUM,
  CHECK,
  CLOCK,
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': ETH,
  '137-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': MATIC,
  '80001-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': MATIC,
  '56-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': BNB,
  '250-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': FTM,
  '43114-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': AVAX,
  '128-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': HT,
  '100-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': DAI,
  EULER,
  EXACTLY,
  FAILED,
  GAS,
  OPTIMISM,
  SONNE,
  YEARN,
  BEEFY,
  VENUS,
  AGAVE,
  MOONWELL,
  MORPHO,
  COMPOUND,
};

export default manifest;
