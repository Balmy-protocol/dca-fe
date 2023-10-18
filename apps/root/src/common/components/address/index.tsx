import useStoredLabels from '@hooks/useStoredLabels';
import useWalletService from '@hooks/useWalletService';
import React from 'react';

interface AddressProps {
  address: string;
  trimAddress?: boolean;
  trimSize?: number;
}

const Address = ({ address, trimAddress, trimSize }: AddressProps) => {
  const walletService = useWalletService();
  const storedLabels = useStoredLabels();
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

  return (
    <>
      {addressEns ||
        storedLabels[address] ||
        (trimAddress ? `${address.slice(0, trimSize || 6)}...${address.slice(-(trimSize || 6))}` : address)}
    </>
  );
};
export default Address;
