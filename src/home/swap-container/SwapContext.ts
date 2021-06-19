import * as React from 'react';

export type SetFromToState = React.Dispatch<React.SetStateAction<string>>;

export type SetFromToValueState = React.Dispatch<React.SetStateAction<number>>;

export type SwapContextValue = {
  from: string;
  fromValue: number;
  to: string;
  toValue: number;
  setFrom: SetFromToState;
  setTo: SetFromToState;
  setToValue: SetFromToValueState;
  setFromValue: SetFromToValueState;
};

const SwapContextDefaultValue: SwapContextValue = {
  from: '',
  to: '',
  fromValue: 0,
  toValue: 0,
  setFrom: () => {},
  setTo: () => {},
  setToValue: () => {},
  setFromValue: () => {},
};

const SwapContext = React.createContext(SwapContextDefaultValue);

export default SwapContext;
