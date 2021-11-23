import React from 'react';
import Grid from '@material-ui/core/Grid';
import useWeb3Service from 'hooks/useWeb3Service';
import { FullPosition, NFTData } from 'types';

interface NftViewerProps {
  position: FullPosition;
}

const NftViewer = ({ position }: NftViewerProps) => {
  const [nftData, setNFTData] = React.useState<NFTData | null>(null);
  const web3Service = useWeb3Service();

  React.useEffect(() => {
    const fetchNFTData = async () => {
      const tokenNFT = await web3Service.getTokenNFT(position.id);
      setNFTData(tokenNFT);
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchNFTData();
  }, [position]);

  return (
    <Grid container justify="center">
      {nftData && <img src={nftData.image} alt="nft" />}
    </Grid>
  );
};
export default NftViewer;
