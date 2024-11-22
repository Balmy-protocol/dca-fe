import styled from 'styled-components';

const RainCoinsUrl = 'url("https://ipfs.io/ipfs/QmaMVMdDRoUJsYBJaPs6E9y7MkobGM2p64PBXwb1HTRgFr")';

const RainCoinsContainer = styled.div<{ height?: string; width?: string }>`
  height: ${({ height = '150px' }) => height};
  width: ${({ width = '150px' }) => width};
  background-image: ${RainCoinsUrl};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

export default RainCoinsContainer;
