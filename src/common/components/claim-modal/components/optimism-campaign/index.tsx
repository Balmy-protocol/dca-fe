import React from 'react';
import styled from 'styled-components';
import find from 'lodash/find';
import TokenIcon from '@common/components/token-icon';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { formatCurrencyAmount } from '@common/utils/currency';
import { Campaign, NetworkStruct, OptimismTypeData, TransactionTypes } from '@types';
import { DateTime } from 'luxon';
import Typography from '@mui/material/Typography';
import ArrowRight from '@assets/svg/atom/arrow-right';
import Button from '@common/components/button';
import { FormattedMessage } from 'react-intl';
import Chip from '@mui/material/Chip';
import useTrackEvent from '@hooks/useTrackEvent';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import useTransactionModal from '@hooks/useTransactionModal';
import {
  useCampaignHasConfirmedTransaction,
  useCampaignHasPendingTransaction,
  useTransactionAdder,
} from '@state/transactions/hooks';
import useCampaignService from '@hooks/useCampaignService';
import { shouldTrackError } from '@common/utils/errors';
import useWalletService from '@hooks/useWalletService';
import useErrorService from '@hooks/useErrorService';
import CircularProgress from '@mui/material/CircularProgress';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { useAppDispatch } from '@state/hooks';
import useWeb3Service from '@hooks/useWeb3Service';
import { NETWORKS } from '@constants';
import { setNetwork } from '@state/config/actions';

const StyledContent = styled.div`
  background-color: #333333;
  border-radius: 4px;
  padding: 14px;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
`;

const StyledArrowRight = styled(ArrowRight)`
  margin-left: 5px;
`;

const StyledCampaignSection = styled.div<{ alignStart?: boolean }>`
  display: flex;
  align-items: ${({ alignStart }) => (alignStart && 'flex-start') || 'center'};
  justify-content: space-between;
`;

const StyledTokensContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StyledAmountContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;

const StyledBoostsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ClaimedContainer = styled(Typography)`
  display: flex;
  gap: 5px;
  align-items: center;
`;

const StyledCheckCircleOutlineIcon = styled(CheckCircleOutlineIcon)`
  color: rgb(17 147 34);
`;

const StyledSummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px;
`;

const StyledTypography = styled(Typography)`
  display: flex;
  gap: 5px;
  align-items: center;
`;

interface ClaimItemProps {
  campaign: Campaign<OptimismTypeData>;
}

const ClaimItem = ({ campaign }: ClaimItemProps) => {
  const trackEvent = useTrackEvent();
  const [, setModalLoading, setModalError, setModalClose] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const campaignService = useCampaignService();
  const walletService = useWalletService();
  const errorService = useErrorService();
  const isPedingClaim = useCampaignHasPendingTransaction(campaign.id);
  const hasConfirmedClaim = useCampaignHasConfirmedTransaction(campaign.id);
  const currentNetwork = useCurrentNetwork();
  const web3Service = useWeb3Service();
  const dispatch = useAppDispatch();

  const isOnCorrectNetwork = currentNetwork.chainId === campaign.chainId;

  const foundNetwork = find(NETWORKS, { chainId: campaign.chainId });

  const handleChangeNetwork = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(campaign.chainId, () => {
      const networkToSet = find(NETWORKS, { chainId: campaign.chainId });
      dispatch(setNetwork(networkToSet as NetworkStruct));
      if (networkToSet) {
        web3Service.setNetwork(networkToSet?.chainId);
      }
    });
    trackEvent('Aggregator - Change displayed network');
  };

  const onClaim = async () => {
    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="optimismCampaignClaim loading"
              defaultMessage="Claiming {op} OP"
              values={{ op: formatCurrencyAmount(campaign.tokens[0].balance, campaign.tokens[0]) }}
            />
          </Typography>
        ),
      });
      trackEvent('Campaigns - Claim optimism campaign submitting');

      const result = await campaignService.claim(campaign);
      trackEvent('Campaigns - Claim optimism campaign submitted');

      addTransaction(result, {
        type: TransactionTypes.claimCampaign,
        typeData: {
          id: campaign.id,
          name: campaign.title,
        },
      });
      setModalClose({});
    } catch (e) {
      // User rejecting transaction
      if (shouldTrackError(e)) {
        trackEvent('Campaigns - Claim optimism campaign error');
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error claiming optimism campaign position', JSON.stringify(e), {
          account: walletService.getAccount(),
        });
      }
      setModalError({
        content: <FormattedMessage description="modalErrorOptimismCampaignClaim" defaultMessage="Error claiming OP" />,
        /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const boosts = campaign.typeData.positions.reduce<('beta' | 'vulnerable' | 'optimistic')[]>((acc, position) => {
    const newAcc = [...acc];

    if (position.version === 'beta') {
      newAcc.push('beta');
    }

    if (position.version === 'vulnerable') {
      newAcc.push('vulnerable');
    }

    if (position.to === '0x4200000000000000000000000000000000000042') {
      newAcc.push('optimistic');
    }

    return newAcc;
  }, []);
  return (
    <StyledContent>
      <StyledCampaignSection>
        <Typography variant="h6">{campaign.title}</Typography>

        {campaign.expiresOn && (
          <Typography
            variant="body2"
            color="rgba(255, 255, 255, 0.5)"
            sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <HelpOutlineOutlinedIcon fontSize="inherit" />
            <FormattedMessage
              description="claimModal expires"
              defaultMessage="Expires on {date}"
              values={{
                date: DateTime.fromSeconds(Number(campaign.expiresOn)).toLocaleString(DateTime.DATE_MED),
              }}
            />
          </Typography>
        )}
        {!campaign.expiresOn && (
          <Typography
            variant="body2"
            color="rgba(255, 255, 255, 0.5)"
            sx={{ display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <HelpOutlineOutlinedIcon fontSize="inherit" />
            <FormattedMessage description="claimModal doesNotExpire" defaultMessage="Does not expire" />
          </Typography>
        )}
      </StyledCampaignSection>
      <StyledCampaignSection>
        <StyledSummaryContainer>
          <StyledTokensContainer>
            <TokenIcon token={campaign.tokens[0]} />
            <StyledAmountContainer>
              <Typography variant="body1">
                {formatCurrencyAmount(campaign.tokens[0].balance, campaign.tokens[0])} {campaign.tokens[0].symbol}
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                ${campaign.tokens[0].balanceUSD.toFixed(2)}
              </Typography>
            </StyledAmountContainer>
          </StyledTokensContainer>
          <StyledBoostsContainer>
            {boosts.includes('beta') && (
              <Chip
                label={<FormattedMessage description="claimModal optimismBeta" defaultMessage="Beta user" />}
                size="small"
                color="success"
                variant="filled"
              />
            )}
            {boosts.includes('vulnerable') && (
              <Chip
                label={<FormattedMessage description="claimModal optimismVuln" defaultMessage="Early user" />}
                size="small"
                color="info"
                variant="filled"
              />
            )}
            {boosts.includes('optimistic') && (
              <Chip
                label={<FormattedMessage description="claimModal optimismOptimistic" defaultMessage="Optimistic" />}
                size="small"
                color="error"
                variant="filled"
              />
            )}
          </StyledBoostsContainer>
        </StyledSummaryContainer>
        {!campaign.claimed && isPedingClaim && (
          <Button
            variant="text"
            color="secondary"
            sx={{ gap: '5px', alignSelf: 'flex-end' }}
            onClick={onClaim}
            disabled={isPedingClaim}
          >
            <StyledTypography variant="body1">
              <FormattedMessage description="claimModal claimWaiting" defaultMessage="Waiting for confirmation" />
              <CircularProgress size={20} />
            </StyledTypography>
          </Button>
        )}
        {!campaign.claimed && isOnCorrectNetwork && !isPedingClaim && (
          <Button variant="text" color="secondary" sx={{ gap: '5px', alignSelf: 'flex-end' }} onClick={onClaim}>
            <StyledTypography variant="body1">
              <FormattedMessage description="claimModal claim" defaultMessage="Claim" />
              <StyledArrowRight size="inherit" fill="inherit" />
            </StyledTypography>
          </Button>
        )}
        {!campaign.claimed && !isOnCorrectNetwork && !isPedingClaim && (
          <Button
            variant="contained"
            color="secondary"
            sx={{ gap: '5px', alignSelf: 'flex-end' }}
            onClick={handleChangeNetwork}
          >
            <StyledTypography variant="body1">
              <FormattedMessage
                description="claimModal changeNetwork"
                defaultMessage="Change network to {network}"
                values={{ network: foundNetwork?.name || '' }}
              />
            </StyledTypography>
          </Button>
        )}
        {(campaign.claimed || hasConfirmedClaim) && (
          <ClaimedContainer variant="body1" color="rgb(17 147 34)" sx={{ alignSelf: 'flex-end' }}>
            <FormattedMessage description="claimModal claimed" defaultMessage="Already claimed" />
            <StyledCheckCircleOutlineIcon fontSize="inherit" />
          </ClaimedContainer>
        )}
      </StyledCampaignSection>
    </StyledContent>
  );
};

export default ClaimItem;
