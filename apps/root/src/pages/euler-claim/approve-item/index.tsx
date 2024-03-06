import React from 'react';
import { EULER_CLAIM_MIGRATORS_ADDRESSES } from '@constants';
import { useHasPendingApproval, useTransactionAdder } from '@state/transactions/hooks';
import styled from 'styled-components';
import { Token, TransactionTypes } from '@types';

import { Typography, CheckCircleIcon, Button } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import useTrackEvent from '@hooks/useTrackEvent';
import useTransactionModal from '@hooks/useTransactionModal';
import useWalletService from '@hooks/useWalletService';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import useActiveWallet from '@hooks/useActiveWallet';

const StyledApproveItem = styled.div`
  display: flex;
`;

interface ApproveItemProps {
  token: Token;
  allowance: bigint;
  value: bigint;
}

const ApproveItem = ({ token, allowance, value }: ApproveItemProps) => {
  const activeWallet = useActiveWallet();
  const hasPendingApproval = useHasPendingApproval(
    token,
    activeWallet?.address,
    false,
    EULER_CLAIM_MIGRATORS_ADDRESSES[token.address]
  );
  const isApproved = allowance >= value;
  const trackEvent = useTrackEvent();
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const walletService = useWalletService();
  const addTransaction = useTransactionAdder();
  const errorService = useErrorService();

  const handleApproveToken = async () => {
    const { symbol } = token;

    try {
      setModalLoading({
        content: (
          <Typography variant="body">
            <FormattedMessage
              description="eulerClaim approving token"
              defaultMessage="Allowing {symbol} to be claimed"
              values={{ symbol: symbol || '' }}
            />
          </Typography>
        ),
      });
      trackEvent('Euler claim - Approve token submitting');
      const result = await walletService.approveSpecificToken(
        token,
        EULER_CLAIM_MIGRATORS_ADDRESSES[token.address],
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        activeWallet?.address!
      );
      trackEvent('Euler claim - Approve token submitted');

      addTransaction(result, {
        type: TransactionTypes.approveToken,
        typeData: {
          token,
          addressFor: EULER_CLAIM_MIGRATORS_ADDRESSES[token.address],
        },
      });

      setModalClosed({ content: '' });
    } catch (e) {
      if (shouldTrackError(e as Error)) {
        trackEvent('Euler claim - Approve token error', {
          token: token.address,
        });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error approving euler claim', JSON.stringify(e), {
          target: EULER_CLAIM_MIGRATORS_ADDRESSES[token.address],
          token: token.address,
        });
      }

      setModalError({
        content: 'Error approving token',
        error: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          code: e.code,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          message: e.message,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          data: e.data,
          extraData: {
            target: EULER_CLAIM_MIGRATORS_ADDRESSES[token.address],
            token: token.address,
          },
        },
      });
    }
  };

  return (
    <StyledApproveItem>
      {isApproved ? (
        <Typography variant="body" sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <CheckCircleIcon fontSize="inherit" />
          <FormattedMessage
            description="eulerClaimApproveItemSuccess"
            defaultMessage="{token} is now ready to be claimed"
            values={{ token: token.symbol }}
          />
        </Typography>
      ) : (
        <Button variant="contained" onClick={handleApproveToken} disabled={hasPendingApproval}>
          {hasPendingApproval ? (
            <FormattedMessage
              description="eulerClaimApproveItemPending"
              defaultMessage="Waiting for the approval of {token} to be confirmed"
              values={{ token: token.symbol }}
            />
          ) : (
            <FormattedMessage
              description="eulerClaimApproveItemApprove"
              defaultMessage="Allow {token} to be claimed"
              values={{ token: token.symbol }}
            />
          )}
        </Button>
      )}
    </StyledApproveItem>
  );
};

export default ApproveItem;
