import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import useWeb3Service from 'hooks/useWeb3Service';
import { checkedTransaction, finalizeTransaction } from './actions';
import { useBlockNumber } from 'state/block-number/hooks';
import { updateBlockNumber } from 'state/block-number/actions';

interface TxInterface {
  addedTime: number;
  receipt?: Record<string, any>;
  lastCheckedBlockNumber?: number;
}

export function shouldCheck(lastBlockNumber: number, tx: TxInterface): boolean {
  if (tx.receipt) return false;
  if (!tx.lastCheckedBlockNumber) return true;
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
  if (blocksSinceCheck < 1) return false;
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60;
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9;
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2;
  } else {
    // otherwise every block
    return true;
  }
}

export default function Updater(): null {
  const web3Service = useWeb3Service();

  const lastBlockNumber = useBlockNumber();

  const dispatch = useAppDispatch();
  const state = useAppSelector((state: any) => state.transactions);

  const transactions = useMemo(() => state || {}, [state]);

  const getReceipt = useCallback(
    (hash: string) => {
      if (!web3Service.getAccount()) throw new Error('No library or chainId');
      return web3Service.getTransactionReceipt(hash).then((receipt: any) => {
        if (receipt === null) {
          console.debug('Retrying for hash', hash);
          throw new Error(`Unable to fetch ${hash}`);
        }
        return receipt;
      });
    },
    [web3Service]
  );

  useEffect(() => {
    if (!web3Service.getAccount() || !lastBlockNumber) return;

    Object.keys(transactions)
      .filter((hash) => shouldCheck(lastBlockNumber, transactions[hash]))
      .map((hash) => {
        const promise = getReceipt(hash);
        promise
          .then((receipt: any) => {
            if (receipt) {
              dispatch(
                finalizeTransaction({
                  hash,
                  receipt: {
                    blockHash: receipt.blockHash,
                    blockNumber: receipt.blockNumber,
                    contractAddress: receipt.contractAddress,
                    from: receipt.from,
                    status: receipt.status,
                    to: receipt.to,
                    transactionHash: receipt.transactionHash,
                    transactionIndex: receipt.transactionIndex,
                  },
                })
              );

              // web3Service.addTransactionResponse(transactions);
              // the receipt was fetched before the block, fast forward to that block to trigger balance updates
              if (receipt.blockNumber > lastBlockNumber) {
                dispatch(updateBlockNumber({ blockNumber: receipt.blockNumber }));
              }
            } else {
              dispatch(checkedTransaction({ hash, blockNumber: lastBlockNumber }));
            }
          })
          .catch((error: any) => {
            if (!error.isCancelledError) {
              console.error(`Failed to check transaction hash: ${hash}`, error);
            }
          });
      });
  }, [web3Service.getAccount(), transactions, lastBlockNumber, dispatch, getReceipt]);

  return null;
}
