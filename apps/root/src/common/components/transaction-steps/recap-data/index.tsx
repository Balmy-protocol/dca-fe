import { DisplayStrategy, Token, TransactionApplicationIdentifier } from 'common-types';
import DcaRecapData from '@pages/dca/create-position/components/dca-recap-data';
import SwapRecapData from '@pages/aggregator/swap-container/components/swap-recap-data';
import EarnDepositRecapData from '@pages/strategy-guardian-detail/strategy-management/deposit/recap-data';
import EarnWithdrawRecapData from '@pages/strategy-guardian-detail/strategy-management/withdraw/recap-data';
import React from 'react';

const RECAP_DATA_MAP: Record<
  TransactionApplicationIdentifier,
  ((props: RecapDataProps) => JSX.Element | null) | undefined
> = {
  [TransactionApplicationIdentifier.DCA]: DcaRecapData,
  [TransactionApplicationIdentifier.SWAP]: SwapRecapData,
  [TransactionApplicationIdentifier.TRANSFER]: undefined,
  [TransactionApplicationIdentifier.EARN_CREATE]: EarnDepositRecapData,
  [TransactionApplicationIdentifier.EARN_INCREASE]: EarnDepositRecapData,
  [TransactionApplicationIdentifier.EARN_WITHDRAW]: EarnWithdrawRecapData,
};

export interface EarnDepositRecapDataProps {
  strategy?: DisplayStrategy;
  assetAmount?: string;
}

export interface EarnWithdrawRecapDataProps {
  strategy?: DisplayStrategy;
  withdraw?: {
    amount: bigint;
    token: Token;
  }[];
}

export type RecapDataProps = EarnDepositRecapDataProps | EarnWithdrawRecapDataProps;

const RecapData = ({
  applicationIdentifier,
  ...rest
}: RecapDataProps & {
  applicationIdentifier: TransactionApplicationIdentifier;
}) => {
  const RecapDataComponent = RECAP_DATA_MAP[applicationIdentifier];
  return RecapDataComponent ? <RecapDataComponent {...rest} /> : null;
};

export default RecapData;
