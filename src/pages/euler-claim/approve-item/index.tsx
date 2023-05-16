import React from 'react';
import { EULER_CLAIM_MIGRATORS_ADDRESSES } from '@constants';
import Button from '@common/components/button';
import useWeb3Service from '@hooks/useWeb3Service';
import { useHasPendingApproval, useTransactionAdder } from '@state/transactions/hooks';
import styled from 'styled-components';
import { Token, TransactionTypes } from '@types';
import { BigNumber } from 'ethers';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { FormattedMessage } from 'react-intl';
import useTrackEvent from '@hooks/useTrackEvent';
import useTransactionModal from '@hooks/useTransactionModal';
import useWalletService from '@hooks/useWalletService';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';

const StyledApproveItem = styled.div`
  display: flex;
`;

interface ApproveItemProps {
  token: Token;
  allowance: BigNumber;
  value: BigNumber;
}

const ApproveItem = ({ token, allowance, value }: ApproveItemProps) => {
  const web3Service = useWeb3Service();
  const hasPendingApproval = useHasPendingApproval(
    token,
    web3Service.getAccount(),
    false,
    EULER_CLAIM_MIGRATORS_ADDRESSES[token.address as keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES]
  );
  const isApproved = allowance.gte(value);
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
          <Typography variant="body1">
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
        EULER_CLAIM_MIGRATORS_ADDRESSES[token.address as keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES]
      );
      trackEvent('Euler claim - Approve token submitted');

      addTransaction(result, {
        type: TransactionTypes.approveToken,
        typeData: {
          token,
          addressFor: EULER_CLAIM_MIGRATORS_ADDRESSES[token.address as keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES],
        },
      });

      setModalClosed({ content: '' });
    } catch (e) {
      if (shouldTrackError(e)) {
        trackEvent('Euler claim - Approve token error', {
          token: token.address,
        });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error approving euler claim', JSON.stringify(e), {
          target: EULER_CLAIM_MIGRATORS_ADDRESSES[token.address as keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES],
          token: token.address,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'Error approving token', error: { code: e.code, message: e.message, data: e.data } });
    }
  };

  return (
    <StyledApproveItem>
      {isApproved ? (
        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <CheckCircleIcon fontSize="inherit" />
          <FormattedMessage
            description="eulerClaimApproveItemSuccess"
            defaultMessage="{token} is now ready to be claimed"
            values={{ token: token.symbol }}
          />
        </Typography>
      ) : (
        <Button variant="contained" color="secondary" onClick={handleApproveToken} disabled={hasPendingApproval}>
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
