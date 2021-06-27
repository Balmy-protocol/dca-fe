import { WETH, DAI, UNI } from './tokens';

const mockedPairs = [
  {
    token0: DAI.address,
    token1: WETH.address,
    id: '0x31ef52ea906d630dc48762e6877edf7665307603',
  },
  {
    token0: UNI.address,
    token1: DAI.address,
    id: '0x877caee117d6810ed8841419c9f7a950f6bb7c45',
  },
  {
    token0: UNI.address,
    token1: WETH.address,
    id: '0x360b79e59504c98f66c6eae105d11ffae352c673',
  },
];

export default mockedPairs;
