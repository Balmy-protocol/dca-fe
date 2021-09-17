import React from 'react';
import find from 'lodash/find';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import useWeb3Service from 'hooks/useWeb3Service';
import { makeStyles } from '@material-ui/core/styles';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { NETWORKS, SUPPORTED_NETWORKS } from 'config/constants';
import { capitalizeFirstLetter } from 'utils/parsing';

const useStyles = makeStyles({
  paper: {
    borderRadius: 20,
  },
});

const StyledPaper = styled(Paper)`
  padding: 30px;
`;

const StyledWalletInformationContainer = styled(Card)`
  padding: 10px;
  margin-bottom: 10px;
`;

const StyledCloseButton = styled(IconButton)`
  position: absolute;
  right: 0px;
  top: -5px;
  color: #9e9e9e;
`;

const StyledNetworkItemContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledSupportedNetworksContainer = styled.div`
  margin-top: 10px;
`;

interface NetworkMenuProps {
  open: boolean;
  onClose: () => void;
}

const NetworkMenu = ({ open, onClose }: NetworkMenuProps) => {
  const web3Service = useWeb3Service();
  const classes = useStyles();
  const currentNetwork = useCurrentNetwork();

  return (
    <Dialog open={open} fullWidth maxWidth="sm" classes={{ paper: classes.paper }}>
      <StyledPaper>
        <StyledCloseButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </StyledCloseButton>
        <Typography variant="h4">
          <FormattedMessage description="supportedNetworks" defaultMessage="Our supported networks" />
        </Typography>
        <StyledSupportedNetworksContainer>
          {SUPPORTED_NETWORKS.map((chainId) => (
            <StyledWalletInformationContainer variant="outlined">
              <StyledNetworkItemContainer>
                <Typography variant="body1">{(find(NETWORKS, { chainId }) || { name: '' }).name}</Typography>
                {currentNetwork.chainId !== chainId && (
                  <Button variant="outlined" size="small" onClick={() => web3Service.changeNetwork(chainId)}>
                    <FormattedMessage description="switch" defaultMessage="Switch to network" />
                  </Button>
                )}
              </StyledNetworkItemContainer>
            </StyledWalletInformationContainer>
          ))}
        </StyledSupportedNetworksContainer>
      </StyledPaper>
    </Dialog>
  );
};

export default NetworkMenu;
