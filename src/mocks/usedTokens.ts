import { UNI, YFI } from './tokens';

const mockedUsedTokens = {
  data: {
    tokens: [
      {
        tokenInfo: {
          address: UNI(1).address,
        },
      },
      {
        tokenInfo: {
          address: YFI(1).address,
        },
      },
    ],
  },
};

export default mockedUsedTokens;
