import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '@state/hooks';
import useDebounce from '@hooks/useDebounce';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useTransactionService from '@hooks/useTransactionService';
import { updateBlockNumber } from './actions';
import useActiveWallet from '@hooks/useActiveWallet';
import { NETWORKS } from '@constants';

export default function Updater(): null {
  const activeWallet = useActiveWallet();
  const transactionService = useTransactionService();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  const [state, setState] = useState<{ blockNumber: number | null }>({
    blockNumber: null,
  });

  const blockNumberCallback = useCallback(
    (blockNumber: bigint) => {
      setState((oldState) => {
        if (typeof oldState.blockNumber !== 'number') return { blockNumber: Number(blockNumber) };
        return { blockNumber: Math.max(Number(blockNumber), oldState.blockNumber) };
      });
    },
    [setState]
  );

  const blockNumberAsyncCallback = useCallback(
    async (blockNumber: Promise<bigint>) => {
      const block = await blockNumber;
      setState((oldState) => {
        if (typeof oldState.blockNumber !== 'number') return { blockNumber: Number(block) };
        return { blockNumber: Math.max(Number(block), oldState.blockNumber) };
      });
    },
    [setState]
  );

  // attach/detach listeners
  useEffect(() => {
    if (!activeWallet?.address) return undefined;

    setState({ blockNumber: null });

    // TODO: remove once viem migration is done
    const chainId = NETWORKS.polygon.chainId;

    const loadedAsSafeApp = transactionService.getLoadedAsSafeApp();

    transactionService
      .getBlockNumber(chainId)
      .then((block) => {
        if (loadedAsSafeApp) {
          return blockNumberAsyncCallback(Promise.resolve(block));
        }

        return blockNumberCallback(block);
      })
      .catch((error) => console.error('Failed to get block number for chainId', error));

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const interval = transactionService.onBlock(
      chainId,
      loadedAsSafeApp ? blockNumberAsyncCallback : blockNumberCallback
    );
    return () => {
      if (loadedAsSafeApp) {
        clearInterval(interval as number);
      } else {
        void transactionService.removeOnBlock(chainId);
      }
    };
  }, [dispatch, activeWallet?.address, blockNumberCallback]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (!debouncedState.blockNumber) return;
    dispatch(updateBlockNumber({ blockNumber: debouncedState.blockNumber, chainId: currentNetwork.chainId }));
  }, [dispatch, debouncedState.blockNumber]);

  return null;
}
