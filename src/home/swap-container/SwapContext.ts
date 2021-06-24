import * as React from 'react';
import { AvailablePairs } from 'types';

export type SetFromToState = React.Dispatch<React.SetStateAction<string>>;

export type SetFromToValueState = React.Dispatch<React.SetStateAction<string>>;

export type SwapContextValue = {
  from: string;
  fromValue: string;
  to: string;
  toValue: string;
  frequencyType: string;
  frequencyValue: string;
  setFrom: SetFromToState;
  setTo: SetFromToState;
  setToValue: SetFromToValueState;
  setFromValue: SetFromToValueState;
  setFrequencyType: SetFromToValueState;
  setFrequencyValue: SetFromToValueState;
  availablePairs: AvailablePairs;
};

const SwapContextDefaultValue: SwapContextValue = {
  from: '',
  to: '',
  fromValue: '',
  toValue: '',
  frequencyType: 'days',
  frequencyValue: '1',
  setFrequencyType: () => {},
  setFrequencyValue: () => {},
  setFrom: () => {},
  setTo: () => {},
  setToValue: () => {},
  setFromValue: () => {},
  availablePairs: [],
};

const SwapContext = React.createContext(SwapContextDefaultValue);

export default SwapContext;
