import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '@state/hooks';
import useDebounce from '@hooks/useDebounce';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useTransactionService from '@hooks/useTransactionService';
import useWalletService from '@hooks/useWalletService';
import { updateBlockNumber } from './actions';

export default function Updater(): null {
  const walletService = useWalletService();
  const transactionService = useTransactionService();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  const [state, setState] = useState<{ blockNumber: number | null }>({
    blockNumber: null,
  });

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((oldState) => {
        if (typeof oldState.blockNumber !== 'number') return { blockNumber };
        return { blockNumber: Math.max(blockNumber, oldState.blockNumber) };
      });
    },
    [setState]
  );

  const blockNumberAsyncCallback = useCallback(
    async (blockNumber: Promise<number>) => {
      const block = await blockNumber;
      setState((oldState) => {
        if (typeof oldState.blockNumber !== 'number') return { blockNumber: block };
        return { blockNumber: Math.max(block, oldState.blockNumber) };
      });
    },
    [setState]
  );

  // attach/detach listeners
  useEffect(() => {
    if (!walletService.getAccount()) return undefined;

    setState({ blockNumber: null });

    const loadedAsSafeApp = transactionService.getLoadedAsSafeApp();

    transactionService
      .getBlockNumber()
      .then((block) => {
        if (loadedAsSafeApp) {
          return blockNumberAsyncCallback(Promise.resolve(block));
        }

        return blockNumberCallback(block);
      })
      .catch((error) => console.error('Failed to get block number for chainId', error));

    const interval = transactionService.onBlock(loadedAsSafeApp ? blockNumberAsyncCallback : blockNumberCallback);
    return () => {
      if (loadedAsSafeApp) {
        clearInterval(interval as number);
      } else {
        transactionService.removeOnBlock();
      }
    };
  }, [dispatch, walletService.getAccount(), blockNumberCallback]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (!debouncedState.blockNumber) return;
    dispatch(updateBlockNumber({ blockNumber: debouncedState.blockNumber, chainId: currentNetwork.chainId }));
  }, [dispatch, debouncedState.blockNumber]);

  return null;
}
