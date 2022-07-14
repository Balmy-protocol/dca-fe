import React from 'react';
import Grid from '@mui/material/Grid';
import { FullPosition, NFTData } from 'types';
import usePositionService from 'hooks/usePositionService';
import { fullPositionToMappedPosition } from 'utils/parsing';

interface NftViewerProps {
  position: FullPosition;
}

const NftViewer = ({ position }: NftViewerProps) => {
  const [nftData, setNFTData] = React.useState<NFTData | null>(null);
  const positionService = usePositionService();

  React.useEffect(() => {
    const fetchNFTData = async () => {
      const tokenNFT = await positionService.getTokenNFT(fullPositionToMappedPosition(position));
      setNFTData(tokenNFT);
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchNFTData();
  }, [position]);

  return (
    <Grid container justifyContent="center">
      {nftData && <img src={nftData.image} alt="nft" />}
    </Grid>
  );
};
export default NftViewer;
