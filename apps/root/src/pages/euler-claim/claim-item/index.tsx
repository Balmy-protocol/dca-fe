import React from 'react';
import { EULER_CLAIM_MIGRATORS_ADDRESSES } from '@constants';
import { useTransactionAdder } from '@state/transactions/hooks';
import styled from 'styled-components';
import { EulerClaimContract, Token, TransactionTypes } from '@types';
import { Contract } from 'ethers';
import { Typography, Card, CardContent, CardActions, Button } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import useTrackEvent from '@hooks/useTrackEvent';
import useTransactionModal from '@hooks/useTransactionModal';
import { Interface } from 'ethers/lib/utils';
import { shouldTrackError } from '@common/utils/errors';
import useErrorService from '@hooks/useErrorService';
import { ClaimWithBalance } from '@pages/euler-claim/types';
import EULERMIGRATORABI from '@abis/EulerMigrator.json';
import useProviderService from '@hooks/useProviderService';
import { formatCurrencyAmount, parseUsdPrice } from '@common/utils/currency';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import CustomChip from '@common/components/custom-chip';
import { DAI, WETH, USDC } from '@pages/euler-claim/constants';
import useHasPendingClaim from '@pages/euler-claim/hooks/useHasPendingClaim';
import useActiveWallet from '@hooks/useActiveWallet';

const StyledCard = styled(Card)`
  border-radius: 10px;
  overflow: visible;
`;

const StyledClaimable = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

interface ClaimItemProps {
  token: Token;
  balance: ClaimWithBalance[keyof ClaimWithBalance];
  signature: string;
  prices: Record<string, bigint> | undefined;
}

const ClaimItem = ({ token, balance, signature, prices }: ClaimItemProps) => {
  const trackEvent = useTrackEvent();
  const [, setModalLoading, setModalError, setModalClosed] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const providerService = useProviderService();
  const errorService = useErrorService();
  const activeWallet = useActiveWallet();
  const hasPendingClaim = useHasPendingClaim(token, activeWallet?.address || '');

  const handleClaimTokens = async () => {
    const { symbol } = token;

    if (!activeWallet?.address) {
      return null;
    }

    try {
      setModalLoading({
        content: (
          <Typography variant="body">
            <FormattedMessage
              description="eulerClaim claming token"
              defaultMessage="Claiming all due for {symbol}"
              values={{ symbol: symbol || '' }}
            />
          </Typography>
        ),
      });
      trackEvent('Euler claim - Claim token submitting');
      const signer = await providerService.getSigner(activeWallet.address);
      const MigratorInterface = new Interface(EULERMIGRATORABI);
      const MigratorInstance = new Contract(
        EULER_CLAIM_MIGRATORS_ADDRESSES[token.address as keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES],
        MigratorInterface,
        signer
      ) as EulerClaimContract;

      const result = await MigratorInstance.migrate(balance.balance, signature);
      trackEvent('Euler claim - Claim token submitted');

      addTransaction(result, {
        type: TransactionTypes.eulerClaimClaimFromMigrator,
        typeData: {
          token,
          id: result.hash,
        },
      });

      setModalClosed({ content: '' });
    } catch (e) {
      if (shouldTrackError(e as Error)) {
        trackEvent('Euler claim - Claim token error', {
          token: token.address,
        });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error claiming euler claim', JSON.stringify(e), {
          target: EULER_CLAIM_MIGRATORS_ADDRESSES[token.address as keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES],
          token: token.address,
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      setModalError({ content: 'Error claiming token', error: { code: e.code, message: e.message, data: e.data } });
    }
  };

  return (
    <StyledCard variant="outlined">
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
        <Typography variant="h5">
          <FormattedMessage
            description="eulerClaimClaimItemBalance"
            defaultMessage="Balance: {balance} {token}"
            values={{ token: token.symbol, balance: formatCurrencyAmount(balance.balance, token) }}
          />
        </Typography>
        <Typography variant="body">
          <FormattedMessage description="eulerClaimClaimItemAbleToClaim" defaultMessage="You will be able to claim:" />
        </Typography>
        <StyledClaimable>
          <CustomChip
            extraText={
              prices &&
              prices[DAI.address] &&
              `(${parseUsdPrice(DAI, balance.daiToClaim, prices[DAI.address]).toFixed(2)} USD)`
            }
            icon={<ComposedTokenIcon isInChip size="20px" tokenBottom={DAI} />}
          >
            <Typography variant="body">{formatCurrencyAmount(balance.daiToClaim, DAI, 4)}</Typography>
          </CustomChip>
          <CustomChip
            extraText={
              prices &&
              prices[WETH.address] &&
              `(${parseUsdPrice(DAI, balance.wethToClaim, prices[WETH.address]).toFixed(2)} USD)`
            }
            icon={<ComposedTokenIcon isInChip size="20px" tokenBottom={WETH} />}
          >
            <Typography variant="body">{formatCurrencyAmount(balance.wethToClaim, WETH, 4)}</Typography>
          </CustomChip>
          <CustomChip
            extraText={
              prices &&
              prices[USDC.address] &&
              `(${parseUsdPrice(USDC, balance.usdcToClaim, prices[USDC.address]).toFixed(2)} USD)`
            }
            icon={<ComposedTokenIcon isInChip size="20px" tokenBottom={USDC} />}
          >
            <Typography variant="body">{formatCurrencyAmount(balance.usdcToClaim, USDC, 4)}</Typography>
          </CustomChip>
        </StyledClaimable>
      </CardContent>
      <CardActions>
        <Button fullWidth variant="contained" color="secondary" onClick={handleClaimTokens} disabled={hasPendingClaim}>
          {hasPendingClaim ? (
            <FormattedMessage
              description="eulerClaimClaimItemPending"
              defaultMessage="Waiting for the claim of {token} to be confirmed"
              values={{ token: token.symbol }}
            />
          ) : (
            <FormattedMessage
              description="eulerClaimClaimItemClaim"
              defaultMessage="Claim all due for {token}"
              values={{ token: token.symbol }}
            />
          )}
        </Button>
      </CardActions>
    </StyledCard>
  );
};

export default ClaimItem;
