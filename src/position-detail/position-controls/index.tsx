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

const PositionControlsContainer = styled.div`
  display: flex;
  align-self: flex-end;
`;

interface PositionControlsProps {
  onWithdraw: () => void;
  onTerminate: () => void;
  onModifyRate: () => void;
  pendingTransaction: string | null;
}

const PositionControls = ({ onWithdraw, onTerminate, onModifyRate, pendingTransaction }: PositionControlsProps) => {
  const currentNetwork = useCurrentNetwork();
  const isPending = pendingTransaction !== null;

  return (
    <PositionControlsContainer>
      <ButtonGroup>
        {isPending ? (
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
        ) : (
          [
            <Button variant="contained" color="white" onClick={onWithdraw}>
              <FormattedMessage description="withdraw swapped" defaultMessage="Withdraw swapped" />
            </Button>,
            <Button variant="contained" color="white" onClick={onModifyRate}>
              <FormattedMessage description="change rate" defaultMessage="Change duration and rate" />
            </Button>,
            <Button variant="contained" color="error" onClick={onTerminate}>
              <FormattedMessage description="terminate position" defaultMessage="Terminate position" />
            </Button>,
          ]
        )}
      </ButtonGroup>
    </PositionControlsContainer>
  );
};

export default PositionControls;
