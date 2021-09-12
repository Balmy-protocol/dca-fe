import { NETWORKS } from 'config/constants';
import { WETH, DAI, UNI, YFI } from './tokens';

const mockedPairs = [
  {
    tokenA: DAI(NETWORKS.mainnet.chainId).address,
    tokenB: WETH(NETWORKS.mainnet.chainId).address,
    id: '0x31ef52ea906d630dc48762e6877edf7665307603',
  },
  {
    tokenA: UNI(NETWORKS.mainnet.chainId).address,
    tokenB: DAI(NETWORKS.mainnet.chainId).address,
    id: '0x877caee117d6810ed8841419c9f7a950f6bb7c45',
  },
  {
    tokenA: UNI(NETWORKS.mainnet.chainId).address,
    tokenB: WETH(NETWORKS.mainnet.chainId).address,
    id: '0x360b79e59504c98f66c6eae105d11ffae352c673',
  },
];

export default mockedPairs;
