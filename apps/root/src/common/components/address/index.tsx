import React from 'react';
import useStoredLabels from '@hooks/useStoredLabels';
import useLabelHandler from '@hooks/useLabelHandler';
import useWalletService from '@hooks/useWalletService';
import { TextField } from 'ui-library';

interface AddressProps {
  address: string;
  trimAddress?: boolean;
  trimSize?: number;
  editable?: boolean;
}

const Address = ({ address, trimAddress, trimSize, editable }: AddressProps) => {
  const walletService = useWalletService();
  const storedLabels = useStoredLabels();
  const { newLabelValue, handleBlur, handleFocus, handleChange, isFocus } = useLabelHandler(address, storedLabels);
  const [addressEns, setAddressEns] = React.useState<string | null>(null);
  const [hasSearchedForEns, setSearchedForEns] = React.useState(false);
  React.useEffect(() => {
    const fetchENS = async () => {
      setAddressEns(await walletService.getEns(address));
      setSearchedForEns(true);
    };
    if (!addressEns && !hasSearchedForEns) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchENS();
    }
  }, [addressEns, hasSearchedForEns]);

  const displayContent =
    storedLabels[address] ||
    addressEns ||
    (trimAddress ? `${address.slice(0, trimSize || 6)}...${address.slice(-(trimSize || 6))}` : address);

  return (
    <>
      {editable ? (
        <TextField
          fullWidth
          variant="standard"
          InputProps={{ disableUnderline: true }}
          value={isFocus ? newLabelValue : displayContent}
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
