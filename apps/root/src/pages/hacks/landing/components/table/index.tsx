import { Chains, getAllChains } from '@balmy/sdk';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI } from '@common/utils/currency';
import { getGhTokenListLogoUrl } from '@constants';
import useWalletsHacksAllowance from '@hooks/hacks-landing/useWalletsHacksAllowance';
import { DisplayAllowance } from '@pages/hacks/types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import { BackgroundPaper, ContainerBox, LinearProgress, Typography } from 'ui-library';
import { SPACING } from 'ui-library/src/theme/constants';

const StyledBackgroundPaper = styled(BackgroundPaper)`
  gap: ${({ theme }) => theme.spacing(4)};
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
`;

const Bounce = keyframes`
  0%, 100% {
    bottom: 0;
  }
  50% {
    bottom: ${SPACING(4)};
  }
`;

const AnimatedItem = styled.div<{ delay: number; finished: boolean }>`
  animation-name: ${Bounce};
  animation-delay: ${({ delay }) => 200 * delay}ms;
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: ${({ finished }) => (finished ? 1 : 'infinite')};
  position: absolute;
  display: flex;
`;

const AnimatedItemParent = styled.div`
  position: relative;
  min-height: ${({ theme }) => theme.spacing(6)};
  width: ${({ theme }) => theme.spacing(6)};
`;

const HackLandingTableLoading = ({ allowances }: { allowances: DisplayAllowance }) => {
  const chainIds = React.useMemo(() => Object.keys(allowances).map(Number), [allowances]);

  const networks = React.useMemo(() => getAllChains().filter((chain) => chainIds.includes(chain.chainId)), [chainIds]);

  const mergedNetworks = React.useMemo(
    () => networks.map((network) => ({ ...allowances[network.chainId], network })),
    [networks, allowances]
  );

  const finished = React.useMemo(() => mergedNetworks.filter(({ isLoading }) => !isLoading).length, [mergedNetworks]);
  const loading = React.useMemo(() => mergedNetworks.filter(({ isLoading }) => isLoading).length, [mergedNetworks]);
  const total = finished + loading;

  console.log(mergedNetworks, finished, loading, total);
  return (
    <StyledBackgroundPaper>
      <ContainerBox alignItems="center" justifyContent="center" flexDirection="column" gap={4}>
        <ContainerBox alignItems="center" justifyContent="center" gap={5}>
          {mergedNetworks.map(({ network, isLoading }, index) => (
            <AnimatedItemParent key={network.chainId}>
              <AnimatedItem delay={index} finished={!isLoading}>
                <TokenIcon size={6} token={emptyTokenWithLogoURI(getGhTokenListLogoUrl(network.chainId, 'logo'))} />
              </AnimatedItem>
            </AnimatedItemParent>
          ))}
        </ContainerBox>
        <ContainerBox gap={2} flexDirection="column" alignItems="center" justifyContent="center">
          <Typography variant="h4">
            <FormattedMessage
              description="hacks-landing.table.loading"
              defaultMessage="Loading your approvals and allowances"
            />
          </Typography>
          <Typography variant="bodySmallBold">
            <FormattedMessage
              description="hacks-landing.table.loading.subtitle"
              defaultMessage="This could take up to a minute"
            />
          </Typography>
        </ContainerBox>
        <LinearProgress variant="determinate" value={(finished / total) * 100} sx={{ width: '100%' }} />
      </ContainerBox>
    </StyledBackgroundPaper>
  );
};
interface HackLandingsTableProps {}

const HackLandingTable = ({}: HackLandingsTableProps) => {
  const userAllowances = useWalletsHacksAllowance();

  const isLoading = React.useMemo(
    () => !!Object.values(userAllowances).find((allowance) => allowance.isLoading),
    [userAllowances]
  );

  if (true) {
    return <HackLandingTableLoading allowances={userAllowances} />;
  }

  return <StyledBackgroundPaper></StyledBackgroundPaper>;
};
export default HackLandingTable;
