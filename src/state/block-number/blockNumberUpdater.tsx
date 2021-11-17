import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from 'state/hooks';
import useDebounce from 'hooks/useDebounce';
import useWeb3Service from 'hooks/useWeb3Service';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { updateBlockNumber } from './actions';

export default function Updater(): null {
  const web3Service = useWeb3Service();
  const dispatch = useAppDispatch();
  const currentNetwork = useCurrentNetwork();

  const [state, setState] = useState<{ blockNumber: number | null }>({
    blockNumber: null,
  });

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (typeof state.blockNumber !== 'number') return { blockNumber };
        return { blockNumber: Math.max(blockNumber, state.blockNumber) };
      });
    },
    [setState]
  );

  // attach/detach listeners
  useEffect(() => {
    if (!web3Service.getAccount()) return undefined;

    setState({ blockNumber: null });

    web3Service
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch((error: any) => console.error('Failed to get block number for chainId', error));

    web3Service.onBlock(blockNumberCallback);
    return () => {
      web3Service.removeOnBlock();
    };
  }, [dispatch, web3Service.getAccount(), blockNumberCallback]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (!debouncedState.blockNumber) return;
    dispatch(updateBlockNumber({ blockNumber: debouncedState.blockNumber, chainId: currentNetwork.chainId }));
  }, [dispatch, debouncedState.blockNumber]);

  return null;
}
