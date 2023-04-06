import * as React from 'react';
import find from 'lodash/find';
import Button from 'common/button';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { FullPosition, YieldOptions } from 'types';
import {
  TOKEN_BLACKLIST,
  NETWORKS,
  OLD_VERSIONS,
  VERSIONS_ALLOWED_MODIFY,
  shouldEnableFrequency,
} from 'config/constants';
import { BigNumber } from 'ethers';
import { buildEtherscanTransaction } from 'utils/etherscan';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from '@mui/material/Link';
import useWalletService from 'hooks/useWalletService';
import useSupportsSigning from 'hooks/useSupportsSigning';
import { fullPositionToMappedPosition } from 'utils/parsing';
import useWeb3Service from 'hooks/useWeb3Service';
import useTokenList from 'hooks/useTokenList';
import useConnectedNetwork from 'hooks/useConnectedNetwork';

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
  onReusePosition: () => void;
  disabled: boolean;
  yieldOptions: YieldOptions;
  onMigrateYield: () => void;
  onSuggestMigrateYield: () => void;
}

const PositionDataControls = ({
  position,
  onMigrateYield,
  onReusePosition,
  disabled,
  yieldOptions,
  pendingTransaction,
  onSuggestMigrateYield,
}: PositionDataControlsProps) => {
  const { remainingSwaps, chainId } = fullPositionToMappedPosition(position);
  const [hasSignSupport] = useSupportsSigning();
  const [network] = useConnectedNetwork();
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();
  const tokenList = useTokenList();

  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);

  const isOnNetwork = network?.chainId === positionNetwork.chainId;
  const walletService = useWalletService();
  const isPending = !!pendingTransaction;

  const onChangeNetwork = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    walletService.changeNetwork(chainId);
  };

  const isOwner = account && account.toLowerCase() === position.user.toLowerCase();

  if (!isOwner || position.status === 'TERMINATED') return null;

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
            sx={{ display: 'flex', alignItems: 'center' }}
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

  const fromIsSupportedInNewVersion = !!tokenList[position.from.address];
  const toIsSupportedInNewVersion = !!tokenList[position.to.address];
  const fromSupportsYield = find(yieldOptions, { enabledTokens: [position.from.address] });
  const fromHasYield = !!position.from.underlyingTokens.length;
  const toHasYield = !!position.to.underlyingTokens.length;
  const toSupportsYield = find(yieldOptions, { enabledTokens: [position.to.address] });

  const shouldMigrateToYield =
    !!(fromSupportsYield || toSupportsYield) && fromIsSupportedInNewVersion && toIsSupportedInNewVersion;

  const shouldShowMigrate = hasSignSupport && shouldMigrateToYield && remainingSwaps.gt(BigNumber.from(0));

  const isOldVersion = OLD_VERSIONS.includes(position.version);

  const allowsModify = VERSIONS_ALLOWED_MODIFY.includes(position.version);

  const disabledIncrease =
    disabled ||
    TOKEN_BLACKLIST.includes(position.from.address) ||
    TOKEN_BLACKLIST.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '') ||
    TOKEN_BLACKLIST.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '') ||
    !shouldEnableFrequency(
      position.swapInterval.interval,
      position.from.address,
      position.to.address,
      position.chainId
    );

  return (
    <StyledCallToActionContainer>
      {!isOldVersion && (
        <StyledCardFooterButton
          variant="contained"
          color="secondary"
          onClick={onReusePosition}
          disabled={disabledIncrease}
          fullWidth
        >
          <Typography variant="body2">
            <FormattedMessage description="addFunds" defaultMessage="Add funds" />
          </Typography>
        </StyledCardFooterButton>
      )}
      {isOldVersion && shouldShowMigrate && (
        <StyledCardFooterButton
          variant="contained"
          color="migrate"
          onClick={onMigrateYield}
          fullWidth
          disabled={disabled}
        >
          <Typography variant="body2">
            <FormattedMessage description="startEarningYield" defaultMessage="Start generating yield" />
          </Typography>
        </StyledCardFooterButton>
      )}
      {isOldVersion && shouldMigrateToYield && allowsModify && remainingSwaps.lte(BigNumber.from(0)) && (
        <StyledCardFooterButton
          variant="contained"
          color="secondary"
          onClick={onSuggestMigrateYield}
          fullWidth
          disabled={disabledIncrease}
        >
          <Typography variant="body2">
            <FormattedMessage description="addFunds" defaultMessage="Add funds" />
          </Typography>
        </StyledCardFooterButton>
      )}
      {isOldVersion && !shouldMigrateToYield && allowsModify && (
        <StyledCardFooterButton
          variant="contained"
          color="secondary"
          onClick={onReusePosition}
          fullWidth
          disabled={disabledIncrease}
        >
          <Typography variant="body2">
            <FormattedMessage description="addFunds" defaultMessage="Add funds" />
          </Typography>
        </StyledCardFooterButton>
      )}
      {isOldVersion && shouldMigrateToYield && !allowsModify && (
        <StyledCardFooterButton
          variant="contained"
          color="migrate"
          onClick={onMigrateYield}
          fullWidth
          disabled={disabled}
        >
          <Typography variant="body2">
            <FormattedMessage description="startEarningYield" defaultMessage="Start generating yield" />
          </Typography>
        </StyledCardFooterButton>
      )}
    </StyledCallToActionContainer>
  );
};
export default PositionDataControls;
