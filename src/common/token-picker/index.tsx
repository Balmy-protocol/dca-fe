import React, { CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import styled from 'styled-components';
import AutoSizer from 'react-virtualized-auto-sizer';
import Slide from '@material-ui/core/Slide';
import { TokenList } from 'common/wallet-context';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { useJupiterListItemStyles } from '@mui-treasury/styles/listItem/jupiter';
import InputBase from '@material-ui/core/InputBase';
import Search from '@material-ui/icons/Search';
import { useSearchInputStyles } from '@mui-treasury/styles/input/search';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import TokenIcon from 'common/token-icon';

type SetFromToState = React.Dispatch<React.SetStateAction<string>>;

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: white;
  padding: 20px;
  display: flex;
`;

interface RowData {
  tokenList: TokenList;
  tokenKeys: string[];
  onClick: SetFromToState;
}

interface RowProps {
  index: number;
  style: CSSProperties;
  data: RowData;
}

interface TokenPickerProps {
  shouldShow: boolean;
  tokenList: TokenList;
  selected: string;
  onChange: SetFromToState;
  onClose: () => void;
  isFrom: boolean;
}

const Row = ({ index, style, data: { onClick, tokenList, tokenKeys } }: RowProps) => {
  const classes = useJupiterListItemStyles();

  return (
    <ListItem classes={classes} button onClick={() => onClick(tokenKeys[index])} style={style}>
      <ListItemIcon>
        <TokenIcon token={tokenList[tokenKeys[index]]} />
      </ListItemIcon>
      <ListItemText disableTypography>
        <span>
          <Typography variant="body1" component="span">
            {tokenList[tokenKeys[index]].name}
          </Typography>
          <Typography variant="subtitle1" component="span">
            {` - `}
          </Typography>
          <Typography variant="subtitle2" component="span">
            {tokenList[tokenKeys[index]].symbol}
          </Typography>
        </span>
      </ListItemText>
    </ListItem>
  );
};

const TokenPicker = ({ shouldShow, tokenList, isFrom, onClose, onChange }: TokenPickerProps) => {
  const [search, setSearch] = React.useState('');
  const tokenKeys = React.useMemo(() => Object.keys(tokenList), [tokenList]);
  const inputStyles = useSearchInputStyles();

  const handleItemSelected = (item: string) => {
    onChange(item);
    onClose();
  };

  const memoizedTokenKeys = React.useMemo(
    () =>
      tokenKeys.filter(
        (el) =>
          tokenList[el].name.toLowerCase().includes(search.toLowerCase()) ||
          tokenList[el].symbol.toLowerCase().includes(search.toLowerCase())
      ),
    [tokenKeys, search]
  );

  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay>
        <IconButton
          aria-label="close"
          size="small"
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px' }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
        <Grid container spacing={1} direction="column" style={{ flexWrap: 'nowrap' }}>
          <Grid item xs={12} style={{ flexBasis: 'auto' }}>
            <Typography variant="h6">
              {isFrom ? (
                <FormattedMessage description="You pay" defaultMessage="You pay" />
              ) : (
                <FormattedMessage description="You get" defaultMessage="You get" />
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ flexBasis: 'auto' }}>
            <InputBase
              classes={inputStyles}
              placeholder={'Search...'}
              startAdornment={<Search />}
              fullWidth
              onChange={(evt) => setSearch(evt.currentTarget.value)}
            />
          </Grid>
          <Grid item xs={12} style={{ flexGrow: 1 }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  itemCount={memoizedTokenKeys.length}
                  itemSize={35}
                  width={width}
                  itemData={{ onClick: handleItemSelected, tokenList, tokenKeys: memoizedTokenKeys }}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          </Grid>
        </Grid>
      </StyledOverlay>
    </Slide>
  );
};

export default TokenPicker;
