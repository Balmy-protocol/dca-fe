import React from 'react';
import useStoredLabels from '@hooks/useStoredLabels';
import useLabelHandler from '@hooks/useLabelHandler';
import { trimAddress } from '@common/utils/parsing';
import useWalletService from '@hooks/useWalletService';
import { Box, ContentCopyIcon, TextField, Tooltip } from 'ui-library';
import { Address as ViemAddress } from 'viem';
import { copyTextToClipboard } from '@common/utils/clipboard';
import styled from 'styled-components';

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
  onEnableEdit?: (enable: boolean) => void;
  showDetailsOnHover?: boolean;
}

const Address = ({
  address,
  trimAddress: shouldTrimAddress,
  trimSize,
  editable,
  onEnableEdit,
  showDetailsOnHover,
}: AddressProps) => {
  const walletService = useWalletService();
  const storedLabels = useStoredLabels();
  const [hovered, setHovered] = React.useState(false);
  const { newLabelValue, handleBlur, handleFocus, handleChange, isFocus } = useLabelHandler(
    address,
    storedLabels,
    onEnableEdit
  );
  const [addressEns, setAddressEns] = React.useState<string | null>(null);
  const [hasSearchedForEns, setSearchedForEns] = React.useState(false);
  React.useEffect(() => {
    const fetchENS = async () => {
      setAddressEns(await walletService.getEns(address as ViemAddress));
      setSearchedForEns(true);
    };
    if (!addressEns && !hasSearchedForEns) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchENS();
    }
  }, [addressEns, hasSearchedForEns]);

  const displayAddress =
    storedLabels[address] || addressEns || (shouldTrimAddress ? trimAddress(address, trimSize) : address);

  const displayContent = showDetailsOnHover ? (
    <StyledHoverableContainer onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Tooltip title={address} placement="top">
        <Box>{hovered ? trimAddress(address, trimSize) : displayAddress}</Box>
      </Tooltip>
      {hovered && (
        <ContentCopyIcon
          onClick={() => copyTextToClipboard(address)}
          cursor="pointer"
          sx={{ position: 'absolute', ml: 24 }}
        />
      )}
    </StyledHoverableContainer>
  ) : (
    displayAddress
  );

  return (
    <>
      {editable ? (
        <TextField
          fullWidth
          variant="standard"
          InputProps={{ disableUnderline: true }}
          value={isFocus ? newLabelValue : displayAddress}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
      ) : (
        displayContent
      )}
    </>
  );
};
export default Address;
