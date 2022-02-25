import useWeb3Service from 'hooks/useWeb3Service';
import React from 'react';

interface AddressProps {
  address: string;
}

const Address = ({ address }: AddressProps) => {
  const web3Service = useWeb3Service();
  const [addressEns, setAddressEns] = React.useState<string | null>(null);
  const [hasSearchedForEns, setSearchedForEns] = React.useState(false);
  React.useEffect(() => {
    const fetchENS = async () => {
      setAddressEns(await web3Service.getEns(address));
      setSearchedForEns(true);
    };
    if (!addressEns && !hasSearchedForEns) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchENS();
    }
  }, [addressEns, hasSearchedForEns]);

  return <>{addressEns || address}</>;
};
export default Address;
