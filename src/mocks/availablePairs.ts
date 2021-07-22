import { WETH, DAI, UNI, USDC, YFI } from './tokens';

const mockedPairs = [
  {
    tokenA: DAI.address,
    tokenB: WETH.address,
    id: '0x31ef52ea906d630dc48762e6877edf7665307603',
  },
  {
    tokenA: UNI.address,
    tokenB: DAI.address,
    id: '0x877caee117d6810ed8841419c9f7a950f6bb7c45',
  },
  {
    tokenA: UNI.address,
    tokenB: WETH.address,
    id: '0x360b79e59504c98f66c6eae105d11ffae352c673',
  },
  {
    tokenA: USDC.address,
    tokenB: YFI.address,
    id: '0x3edbadb0e6f7d54f73b7ff163111979b65dd7102',
  },
];

export default mockedPairs;
