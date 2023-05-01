import useWalletService from '@hooks/useWalletService';
import React from 'react';

interface AddressProps {
  address: string;
  trimAddress?: boolean;
}

const Address = ({ address, trimAddress }: AddressProps) => {
  const walletService = useWalletService();
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

  return <>{addressEns || (trimAddress ? `${address.slice(0, 6)}...${address.slice(-6)}` : address)}</>;
};
export default Address;
