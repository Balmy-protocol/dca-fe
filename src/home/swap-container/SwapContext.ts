import * as React from 'react';
import { AvailablePairs } from 'types';
import { BigNumber } from 'ethers';
import { DAY_IN_SECONDS } from 'utils/parsing';
import { WETH, DAI } from 'mocks/tokens';
import { SetStateCallback } from 'types';

export type SwapContextValue = {
  from: string;
  fromValue: string;
  to: string;
  frequencyType: BigNumber;
  frequencyValue: string;
  setFrom: SetStateCallback<string>;
  setTo: SetStateCallback<string>;
  toggleFromTo: () => void;
  setFromValue: SetStateCallback<string>;
  setFrequencyType: SetStateCallback<BigNumber>;
  setFrequencyValue: SetStateCallback<string>;
};

const SwapContextDefaultValue: SwapContextValue = {
  from: WETH.address,
  to: DAI.address,
  fromValue: '',
  frequencyType: DAY_IN_SECONDS,
  frequencyValue: '1',
  setFrequencyType: () => {},
  setFrequencyValue: () => {},
  toggleFromTo: () => {},
  setFrom: () => {},
  setTo: () => {},
  setFromValue: () => {},
};

const SwapContext = React.createContext(SwapContextDefaultValue);

export default SwapContext;
