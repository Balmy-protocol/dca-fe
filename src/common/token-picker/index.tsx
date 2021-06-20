import React, { CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
import AutoSizer from 'react-virtualized-auto-sizer';
import Slide from '@material-ui/core/Slide';
import { TokenList } from 'common/wallet-context';

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
`;

interface RowData {
  tokenList: TokenList;
  tokenKeys: string[];
}

interface RowProps {
  index: number;
  style: CSSProperties;
  data: RowData;
}

interface TokenPickerProps {
  shouldShow: boolean;
  tokenList: TokenList;
}

const Row = ({ index, style, data: { tokenList, tokenKeys } }: RowProps) => (
  <div style={style}>{tokenList[tokenKeys[index]].symbol.toUpperCase()}</div>
);

const TokenPicker = ({ shouldShow, tokenList }: TokenPickerProps) => {
  const tokenKeys = Object.keys(tokenList);

  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay>
        <AutoSizer>
          {({ height, width }) => (
            <List height={height} itemCount={1000} itemSize={35} width={width} itemData={{ tokenList, tokenKeys }}>
              {Row}
            </List>
          )}
        </AutoSizer>
      </StyledOverlay>
    </Slide>
  );
};

export default TokenPicker;
