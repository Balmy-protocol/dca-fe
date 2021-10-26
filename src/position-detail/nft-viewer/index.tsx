import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
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
      const tokenNFT = await web3Service.getTokenNFT(position.dcaId, position.pair.id);
      setNFTData(tokenNFT);
    };
    fetchNFTData();
  }, [position]);

  return (
    <Grid container justify="center">
      {nftData && <img src={nftData.image} />}
    </Grid>
  );
};
export default NftViewer;
