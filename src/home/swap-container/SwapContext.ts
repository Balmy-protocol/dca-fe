import * as React from 'react';

export type setFromToState = React.Dispatch<React.SetStateAction<String>>;

export type setFromToValueState = React.Dispatch<React.SetStateAction<number>>;

export type SwapContextValue = {
  from: string;
  fromValue: number;
  to: string;
  toValue: number;
  setFrom: setFromToState;
  setTo: setFromToState;
  setToValue: setFromToValueState;
  setFromValue: setFromToValueState;
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
