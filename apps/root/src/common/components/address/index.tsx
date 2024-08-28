import React from 'react';
import useStoredLabels from '@hooks/useStoredLabels';
import { trimAddress } from '@common/utils/parsing';
import { ContentCopyIcon, Tooltip, Zoom, useSnackbar, copyTextToClipboard } from 'ui-library';
import { Address as ViemAddress } from 'viem';
import styled from 'styled-components';
import { defineMessage, useIntl } from 'react-intl';
import EditLabelInput from '../edit-label-input';
import useEnsService from '@hooks/useEnsService';
import useStoredEnsNames from '@hooks/useStoredEnsNames';
import { isUndefined } from 'lodash';

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
}

const Address = ({
  address,
  trimAddress: shouldTrimAddress,
  trimSize,
  editable,
  disableLabelEdition,
  showDetailsOnHover,
}: AddressProps) => {
  const storedLabels = useStoredLabels();
  const ensService = useEnsService();
  const storedEnsNames = useStoredEnsNames();
  const snackbar = useSnackbar();
  const intl = useIntl();
  const [hovered, setHovered] = React.useState(false);
  const [newLabel, setNewLabel] = React.useState('');

  const addressEnsName = storedEnsNames[address.toLowerCase() as ViemAddress];

  React.useEffect(() => {
    const fetchENS = async () => {
      await ensService.fetchEns(address as ViemAddress);
    };
    if (!storedLabels[address] && isUndefined(addressEnsName)) {
      void fetchENS();
    }
  }, [addressEnsName, address, storedLabels]);

  const displayAddress =
    storedLabels[address]?.label || addressEnsName || (shouldTrimAddress ? trimAddress(address, trimSize) : address);

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
