import * as React from 'react';
import find from 'lodash/find';
import Button from 'common/button';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { FullPosition, YieldOptions } from 'types';
import { NETWORKS, OLD_VERSIONS } from 'config/constants';
import { BigNumber } from 'ethers';
import { buildEtherscanTransaction } from 'utils/etherscan';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from '@mui/material/Link';
import { getWrappedProtocolToken } from 'mocks/tokens';
import useWalletService from 'hooks/useWalletService';
import useSupportsSigning from 'hooks/useSupportsSigning';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { fullPositionToMappedPosition } from 'utils/parsing';
import useWeb3Service from 'hooks/useWeb3Service';

const StyledCardFooterButton = styled(Button)``;

const StyledCallToActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
`;

interface PositionDataControlsProps {
  position: FullPosition;
  pendingTransaction: string | null;
  onWithdraw: (useProtocolToken: boolean) => void;
  onReusePosition: () => void;
  disabled: boolean;
  yieldOptions: YieldOptions;
}

const PositionDataControls = ({
  position,
  onWithdraw,
  onReusePosition,
  disabled,
  yieldOptions,
  pendingTransaction,
}: PositionDataControlsProps) => {
  const { remainingSwaps, toWithdraw, chainId } = fullPositionToMappedPosition(position);
  const [hasSignSupport] = useSupportsSigning();
  const network = useCurrentNetwork();
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();

  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const isOnNetwork = network.chainId === positionNetwork.chainId;
  const walletService = useWalletService();
  const isPending = !!pendingTransaction;
  const wrappedProtocolToken = getWrappedProtocolToken(positionNetwork.chainId);

  const onChangeNetwork = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId);
  };

  const isOwner = account && account.toLowerCase() === position.user.toLowerCase();

  if (!isOwner) return null;

  if (isPending) {
    return (
      <StyledCallToActionContainer>
        <StyledCardFooterButton variant="contained" color="pending" fullWidth>
          <Link
            href={buildEtherscanTransaction(pendingTransaction, positionNetwork.chainId)}
            target="_blank"
            rel="noreferrer"
            underline="none"
            color="inherit"
          >
            <Typography variant="body2" component="span">
              <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
            </Typography>
            <OpenInNewIcon style={{ fontSize: '1rem' }} />
          </Link>
        </StyledCardFooterButton>
      </StyledCallToActionContainer>
    );
  }

  if (!isOnNetwork) {
    return (
      <StyledCallToActionContainer>
        <StyledCardFooterButton variant="contained" color="secondary" onClick={onChangeNetwork} fullWidth>
          <Typography variant="body2">
            <FormattedMessage
              description="incorrect network"
              defaultMessage="Switch to {network}"
              values={{ network: positionNetwork.name }}
            />
          </Typography>
        </StyledCardFooterButton>
      </StyledCallToActionContainer>
    );
  }

  const fromSupportsYield = find(yieldOptions, { enabledTokens: [position.from.address] });
  const toSupportsYield = find(yieldOptions, { enabledTokens: [position.to.address] });

  const shouldShowMigrate = hasSignSupport && remainingSwaps.gt(BigNumber.from(0));

  const shouldMigrateToYield = fromSupportsYield || toSupportsYield;

  const isOldVersion = OLD_VERSIONS.includes(position.version);

  return (
    <StyledCallToActionContainer>
      {!isOldVersion && (
        <StyledCardFooterButton
          variant="contained"
          color="secondary"
          onClick={onReusePosition}
          disabled={disabled}
          fullWidth
        >
          <Typography variant="body2">
            <FormattedMessage description="addFunds" defaultMessage="Add funds" />
          </Typography>
        </StyledCardFooterButton>
      )}
    </StyledCallToActionContainer>
  );
};
export default PositionDataControls;
