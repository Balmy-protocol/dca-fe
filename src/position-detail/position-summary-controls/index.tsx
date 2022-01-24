import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Link from '@material-ui/core/Link';
import CallMadeIcon from '@material-ui/icons/CallMade';
import { buildEtherscanTransaction } from 'utils/etherscan';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { FullPosition } from 'types';
import { BigNumber } from 'ethers';
import useWeb3Service from 'hooks/useWeb3Service';
import Grid from '@material-ui/core/Grid';
import { PROTOCOL_TOKEN_ADDRESS, WRAPPED_PROTOCOL_TOKEN } from 'mocks/tokens';
import WithdrawButton from './withdraw-button';

const PositionControlsContainer = styled.div`
  display: flex;
  align-self: flex-end;
`;

const StyledGrid = styled(Grid)`
  display: flex;
  justify-content: flex-end;
`;

const StyledButtonGroup = styled(ButtonGroup)`
  margin-left: 10px;
`;
interface PositionSummaryControlsProps {
  onWithdraw: (useProtocolToken: boolean) => void;
  onTerminate: () => void;
  onModifyRate: () => void;
  onTransfer: () => void;
  onViewNFT: () => void;
  onMigratePosition: () => void;
  pendingTransaction: string | null;
  position: FullPosition;
  shouldDisable?: boolean;
}

const PositionSummaryControls = ({
  onWithdraw,
  onTerminate,
  onModifyRate,
  onTransfer,
  pendingTransaction,
  position,
  onViewNFT,
  shouldDisable,
  onMigratePosition,
}: PositionSummaryControlsProps) => {
  const currentNetwork = useCurrentNetwork();
  const isPending = pendingTransaction !== null;
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();
  const wrappedProtocolToken = WRAPPED_PROTOCOL_TOKEN[currentNetwork.chainId](currentNetwork.chainId);

  if (!account || account.toLowerCase() !== position.user.toLowerCase()) return null;

  return (
    <PositionControlsContainer>
      <Grid container spacing={2}>
        {BigNumber.from(position.current.remainingSwaps).gt(BigNumber.from(0)) && (
          <StyledGrid item xs={12}>
            <Button variant="contained" color="primary" onClick={onMigratePosition}>
              <FormattedMessage description="migrate position" defaultMessage="Migrate position" />
            </Button>
          </StyledGrid>
        )}
        <StyledGrid item xs={12}>
          {isPending && (
            <Button variant="contained" color="pending" size="large">
              <Link
                href={buildEtherscanTransaction(pendingTransaction as string, currentNetwork.chainId)}
                target="_blank"
                rel="noreferrer"
                underline="none"
                color="inherit"
              >
                <Typography variant="body2" component="span">
                  <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
                </Typography>
                <CallMadeIcon style={{ fontSize: '1rem' }} />
              </Link>
            </Button>
          )}
          {!isPending && (
            <>
              {(position.to.address === PROTOCOL_TOKEN_ADDRESS ||
                position.to.address === wrappedProtocolToken.address) && (
                <WithdrawButton
                  position={position}
                  onClick={onWithdraw}
                  disabled={BigNumber.from(position.current.idleSwapped).lte(BigNumber.from(0)) || !!shouldDisable}
                />
              )}

              {position.to.address !== PROTOCOL_TOKEN_ADDRESS && position.to.address !== wrappedProtocolToken.address && (
                <Button
                  variant="contained"
                  color="white"
                  onClick={() => onWithdraw(false)}
                  disabled={BigNumber.from(position.current.idleSwapped).lte(BigNumber.from(0)) || !!shouldDisable}
                >
                  <FormattedMessage
                    description="withdraw swapped"
                    defaultMessage="Withdraw {to}"
                    values={{
                      to: position.to.symbol,
                    }}
                  />
                </Button>
              )}
              <StyledButtonGroup>
                <Button variant="contained" color="white" onClick={onViewNFT} disabled={shouldDisable}>
                  <FormattedMessage description="view nft" defaultMessage="View NFT" />
                </Button>
                ,
                <Button variant="contained" color="white" onClick={onModifyRate} disabled={shouldDisable}>
                  <FormattedMessage description="change rate" defaultMessage="Change duration and rate" />
                </Button>
                {/* <Button variant="contained" color="white" onClick={onTransfer}>
                  <FormattedMessage description="transferPosition" defaultMessage="Transfer position" />
                </Button> */}
                <Button variant="outlined" color="error" onClick={onTerminate} disabled={shouldDisable}>
                  <FormattedMessage description="terminate position" defaultMessage="Terminate position" />
                </Button>
              </StyledButtonGroup>
            </>
          )}
        </StyledGrid>
      </Grid>
    </PositionControlsContainer>
  );
};

export default PositionSummaryControls;
