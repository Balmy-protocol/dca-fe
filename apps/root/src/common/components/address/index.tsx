import React from 'react';
import useStoredLabels from '@hooks/useStoredLabels';
import { trimAddress } from '@common/utils/parsing';
import useWalletService from '@hooks/useWalletService';
import { ContentCopyIcon, Tooltip, Zoom, useSnackbar, copyTextToClipboard } from 'ui-library';
import { Address as ViemAddress } from 'viem';
import styled from 'styled-components';
import { NETWORKS } from '@constants';
import { defineMessage, useIntl } from 'react-intl';
import EditLabelInput from '../edit-label-input';
import useWallets from '@hooks/useWallets';

const StyledHoverableContainer = styled.div`
  ${({ theme: { spacing } }) => `
  display: flex;
  align-items: center;
  gap: ${spacing(1)};
  position: relative;
  padding-right: ${spacing(5)};
`}
`;

interface AddressProps {
  address: string;
  trimAddress?: boolean;
  trimSize?: number;
  editable?: boolean;
  disableLabelEdition?: () => void;
  showDetailsOnHover?: boolean;
  ens?: string | null;
}

const Address = ({
  address,
  trimAddress: shouldTrimAddress,
  trimSize,
  editable,
  disableLabelEdition,
  showDetailsOnHover,
}: AddressProps) => {
  const walletService = useWalletService();
  const storedLabels = useStoredLabels();
  const snackbar = useSnackbar();
  const intl = useIntl();
  const [hovered, setHovered] = React.useState(false);
  const [newLabel, setNewLabel] = React.useState('');
  const [addressEns, setAddressEns] = React.useState<string | null>(null);
  const isUserWallet = useWallets().some((wallet) => wallet.address === address.toLowerCase());
  const [hasSearchedForEns, setSearchedForEns] = React.useState(isUserWallet);

  React.useEffect(() => {
    const fetchENS = async () => {
      setAddressEns(await walletService.getEns(address as ViemAddress, NETWORKS.mainnet.chainId));
      setSearchedForEns(true);
    };
    if (!addressEns && !hasSearchedForEns && !storedLabels[address]) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchENS();
    }
  }, [addressEns, hasSearchedForEns, address, storedLabels]);

  const displayAddress =
    storedLabels[address]?.label || addressEns || (shouldTrimAddress ? trimAddress(address, trimSize) : address);

  const onCopyAddress = React.useCallback(() => {
    copyTextToClipboard(address);
    snackbar.enqueueSnackbar(
      intl.formatMessage(
        defineMessage({ description: 'copiedSuccesfully', defaultMessage: 'Address copied to clipboard' })
      ),
      {
        variant: 'success',
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        },
        TransitionComponent: Zoom,
      }
    );
  }, [address]);

  const displayContent = showDetailsOnHover ? (
    <StyledHoverableContainer onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Tooltip title={address} placement="top" arrow>
        <div>{hovered ? trimAddress(address, trimSize) : displayAddress}</div>
      </Tooltip>
      {hovered && <ContentCopyIcon onClick={onCopyAddress} cursor="pointer" />}
    </StyledHoverableContainer>
  ) : (
    displayAddress
  );

  return (
    <>
      {editable ? (
        <EditLabelInput
          fullWidth
          variant="standard"
          labelAddress={address}
          newLabelValue={newLabel}
          setNewLabelValue={setNewLabel}
          disableLabelEdition={disableLabelEdition}
        />
      ) : (
        displayContent
      )}
    </>
  );
};
export default Address;
