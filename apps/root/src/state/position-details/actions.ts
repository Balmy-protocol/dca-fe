import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '@state/createAppAsyncThunk';
import { PositionVersions, PositionWithHistory, TransactionDetails } from '@types';

export const setPosition = createAction<PositionWithHistory | undefined>('positionDetails/setPosition');

export const setFromPrice = createAction<bigint | undefined>('positionDetails/setFromPrice');

export const setToPrice = createAction<bigint | undefined>('positionDetails/setToPrice');

export const updatePosition = createAction<TransactionDetails>('positionDetails/updatePosition');

export const fetchPositionAndTokenPrices = createAppAsyncThunk<
  PositionWithHistory,
  { positionId: number; chainId: number; version: PositionVersions }
>(
  'positionDetails/fetchPositionAndTokenPrices',
  async ({ positionId, chainId, version }, { dispatch, extra: { web3Service } }) => {
    const positionService = web3Service.getPositionService();
    const priceService = web3Service.getPriceService();

    const position = await positionService.getPosition({ positionId, chainId, version });

    dispatch(setPosition(position));

    const prices = await priceService.getUsdHistoricPrice([position.from, position.to], undefined, chainId);

    const fromPrice = prices[position.from.address];
    const toPrice = prices[position.to.address];

    dispatch(setFromPrice(fromPrice));
    dispatch(setToPrice(toPrice));

    return position;
  }
);
