import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import useSdkBalances from '@hooks/useSdkBalances';
import { DAI, EULER_4626_ADDRESSES, EULER_4626_TOKENS, USDC, WETH } from '@pages/euler-claim/constants';
import useCurrentPositions from '@hooks/useCurrentPositions';
import usePositionService from '@hooks/usePositionService';
import useAccount from '@hooks/useAccount';
import Button from '@common/components/button';
import usePrevious from '@hooks/usePrevious';
import { COMPANION_ADDRESS, EULER_CLAIM_MIGRATORS_ADDRESSES, NETWORKS } from '@constants';
import { BigNumber } from 'ethers';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import AffectedPositions from '@pages/euler-claim/affected-positions';
import ClaimChecklist from '@pages/euler-claim/checklist';
import useClaimRates from '@pages/euler-claim/hooks/useClaimRates';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ClaimWithBalance } from '@pages/euler-claim/types';
import useRawUsdPrices from '@hooks/useUsdRawPrices';
import useSdkAllowances from '@hooks/useSdkAllowances';
import usePastPositions from '@hooks/usePastPositions';
import TerminatedAffectedPositions from '@pages/euler-claim/terminated-affected-positions';
import { Permission } from '@types';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledTitle = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const EulerClaimFrame = ({ isLoading: isLoadingNetwork }: { isLoading: boolean }) => {
  const positionService = usePositionService();
  const [hasLoadedPositions, setHasLoadedPositions] = React.useState(positionService.getHasFetchedCurrentPositions());
  const account = useAccount();
  const [isLoadingPositions, setIsLoadingPositions] = React.useState(false);
  const prevAccount = usePrevious(account);
  const currentPositions = useCurrentPositions();
  const pastPositions = usePastPositions();
  const [balances, isLoadingBalances] = useSdkBalances(EULER_4626_TOKENS);
  const [allowances, isLoadingAllowances] = useSdkAllowances(EULER_CLAIM_MIGRATORS_ADDRESSES, NETWORKS.mainnet.chainId);

  React.useEffect(() => {
    const fetchPositions = async () => {
      await Promise.all([positionService.fetchCurrentPositions(), positionService.fetchPastPositions()]);
      setHasLoadedPositions(true);
      setIsLoadingPositions(false);
    };

    if (!isLoadingPositions && (!hasLoadedPositions || account !== prevAccount)) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchPositions();
      setIsLoadingPositions(true);
    }
  }, [account, prevAccount]);

  const affectedPositions = React.useMemo(
    () =>
      currentPositions.filter(
        (position) =>
          (position.from.underlyingTokens[0] &&
            EULER_4626_ADDRESSES.includes(position.from.underlyingTokens[0].address) &&
            position.remainingLiquidity.gt(BigNumber.from(0))) ||
          (position.to.underlyingTokens[0] &&
            EULER_4626_ADDRESSES.includes(position.to.underlyingTokens[0].address) &&
            position.toWithdraw.gt(BigNumber.from(0)))
      ),
    [currentPositions]
  );
  const affectedPastPositions = React.useMemo(
    () =>
      pastPositions.filter(
        (position) =>
          (position.from.underlyingTokens[0] &&
            EULER_4626_ADDRESSES.includes(position.from.underlyingTokens[0].address)) ||
          (position.to.underlyingTokens[0] && EULER_4626_ADDRESSES.includes(position.to.underlyingTokens[0].address))
      ),
    [pastPositions]
  );

  const mainnetBalances = (balances && balances[NETWORKS.mainnet.chainId]) || {};

  const finalBalances = React.useMemo(() => {
    const memodBalances: Record<string, BigNumber> = {};

    affectedPositions.forEach((position) => {
      const underlyingFrom = position.from.underlyingTokens[0];
      if (
        underlyingFrom &&
        EULER_4626_ADDRESSES.includes(underlyingFrom.address) &&
        position.remainingLiquidity.gt(BigNumber.from(0))
      ) {
        if (memodBalances[underlyingFrom.address]) {
          memodBalances[underlyingFrom.address] = memodBalances[underlyingFrom.address].add(
            position.remainingLiquidity
          );
        } else {
          memodBalances[underlyingFrom.address] = position.remainingLiquidity;
        }
      }

      const underlyingTo = position.to.underlyingTokens[0];
      if (
        underlyingTo &&
        EULER_4626_ADDRESSES.includes(underlyingTo.address) &&
        position.toWithdraw.gt(BigNumber.from(0))
      ) {
        if (memodBalances[underlyingTo.address]) {
          memodBalances[underlyingTo.address] = memodBalances[underlyingTo.address].add(position.toWithdraw);
        } else {
          memodBalances[underlyingTo.address] = position.toWithdraw;
        }
      }
    });

    Object.keys(mainnetBalances).forEach((tokenAddress) => {
      if (mainnetBalances[tokenAddress].lte(BigNumber.from(0))) {
        return;
      }

      if (memodBalances[tokenAddress]) {
        memodBalances[tokenAddress] = memodBalances[tokenAddress].add(mainnetBalances[tokenAddress]);
      } else {
        memodBalances[tokenAddress] = mainnetBalances[tokenAddress];
      }
    });

    return memodBalances;
  }, [mainnetBalances, affectedPositions]);

  const [claimRates, isLoadingClaimRates] = useClaimRates(Object.keys(finalBalances));

  const [rawPrices, isLoadingPrices] = useRawUsdPrices([USDC, DAI, WETH]);

  const hydratedBalances = React.useMemo(
    () =>
      Object.keys(finalBalances).reduce<ClaimWithBalance>(
        (acc, tokenKey) => ({
          ...acc,
          [tokenKey]: {
            balance: finalBalances[tokenKey],
            wethToClaim:
              (claimRates &&
                claimRates[tokenKey] &&
                finalBalances[tokenKey].mul(claimRates[tokenKey].wethPerToken).div(BigNumber.from(10).pow(18))) ||
              BigNumber.from(0),
            daiToClaim:
              (claimRates &&
                claimRates[tokenKey] &&
                finalBalances[tokenKey].mul(claimRates[tokenKey].daiPerToken).div(BigNumber.from(10).pow(18))) ||
              BigNumber.from(0),
            usdcToClaim:
              (claimRates &&
                claimRates[tokenKey] &&
                finalBalances[tokenKey].mul(claimRates[tokenKey].usdcPerToken).div(BigNumber.from(10).pow(18))) ||
              BigNumber.from(0),
          },
        }),
        {}
      ),
    [claimRates, finalBalances]
  );

  const positionsWithCompanionNotApproved = React.useMemo(
    () =>
      affectedPositions.filter((position) => {
        const companionPermissions = position.permissions?.filter(
          (permissionData) =>
            permissionData.operator.toLowerCase() ===
            COMPANION_ADDRESS[position.version][position.chainId].toLowerCase()
        )[0];

        return !companionPermissions || !companionPermissions.permissions.includes(Permission.TERMINATE);
      }),
    [affectedPositions]
  );

  const needsToTerminatePositions = !!affectedPositions.length;

  const needsToApproveCompanion = needsToTerminatePositions && !!positionsWithCompanionNotApproved.length;

  const needsToClaim = React.useMemo(
    () => !!Object.keys(mainnetBalances).filter((tokenKey) => mainnetBalances[tokenKey].gt(BigNumber.from(0))).length,
    [mainnetBalances]
  );

  const isLoading =
    isLoadingPrices ||
    isLoadingClaimRates ||
    isLoadingPositions ||
    isLoadingNetwork ||
    (!balances && isLoadingBalances) ||
    (!allowances && isLoadingAllowances);

  const hasAnythingToClaim =
    needsToTerminatePositions || needsToClaim || isLoadingBalances || affectedPastPositions.length;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} style={{ display: 'flex' }}>
        <StyledContainer>
          <StyledTitle>
            <Typography variant="h4">
              <FormattedMessage description="eulerClaim title" defaultMessage="Claim Euler redemption" />
            </Typography>
            <Typography variant="body1">
              <FormattedMessage
                description="eulerClaim description"
                defaultMessage="If you had positions generating yield on Euler you were affected by the hack on their protocol. Below you'll be able to follow the steps to claim compensation for your lost funds"
              />
            </Typography>
          </StyledTitle>
        </StyledContainer>
      </Grid>
      {isLoading ? (
        <Grid item xs={12} style={{ display: 'flex' }}>
          <CenteredLoadingIndicator size={70} />
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Grid container>
            {!hasAnythingToClaim ? (
              <>
                {account && (
                  <Grid item xs={12} style={{ display: 'flex' }}>
                    <StyledTitle>
                      <Typography variant="h6">
                        <FormattedMessage
                          description="eulerClaimNoClaim title"
                          defaultMessage="You are all caught up! You have nothing to claim."
                        />
                      </Typography>
                    </StyledTitle>
                  </Grid>
                )}
                {!account && (
                  <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <Button variant="contained" color="secondary" onClick={openConnectModal}>
                          <FormattedMessage
                            description="eulerClaimNoClaim NoWallet"
                            defaultMessage="Connect your wallet to start the process"
                          />
                        </Button>
                      )}
                    </ConnectButton.Custom>
                  </Grid>
                )}
              </>
            ) : (
              <>
                {needsToTerminatePositions && (
                  <Grid item xs={12} style={{ display: 'flex' }}>
                    <AffectedPositions positions={affectedPositions} />
                  </Grid>
                )}
                {!needsToTerminatePositions && affectedPastPositions.length && (
                  <Grid item xs={12} style={{ display: 'flex' }}>
                    <TerminatedAffectedPositions />
                  </Grid>
                )}
                <Grid item xs={12} style={{ display: 'flex' }}>
                  <ClaimChecklist
                    positions={affectedPositions}
                    needsToApproveCompanion={needsToApproveCompanion}
                    needsToClaim={needsToClaim}
                    needsToTerminatePositions={needsToTerminatePositions}
                    hydratedBalances={hydratedBalances}
                    rawPrices={rawPrices}
                    allowances={allowances}
                    isLoadingBalances={isLoadingBalances}
                    isLoadingAllowances={isLoadingAllowances}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};
export default EulerClaimFrame;
