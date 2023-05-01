import React from 'react';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { useSavedAggregatorTokenLists, useSavedTokenLists, useTokensLists } from 'state/token-lists/hooks';
import { useAppDispatch } from 'hooks/state';
import { enableAggregatorTokenList, enableTokenList } from 'state/token-lists/actions';

const StyledCard = styled(Card)`
  padding: 16px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  background: rgba(216, 216, 216, 0.1);
  gap: 16px;
`;

const StyledCardMainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const StyledGrid = styled(Grid)`
  padding-top: 8px;
  padding-left: 8px;
`;

const ScrollableGrid = styled(Grid)`
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--thumbBG) var(--scrollbarBG);
  --scrollbarBG: #1b1b1c;
  --thumbBG: #ffffff;
  ::-webkit-scrollbar {
    width: 11px;
  }
  ::-webkit-scrollbar-track {
    background: var(--scrollbarBG);
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--thumbBG);
    border-radius: 6px;
    border: 3px solid var(--scrollbarBG);
  }
`;

const StyledGridItem = styled(Grid)`
  padding: 4px 24px;
`;

function getLogoURL(logoURI: string) {
  if (logoURI?.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${logoURI.split('//')[1]}`;
  }
  if (typeof logoURI === 'string') {
    return logoURI;
  }
  return '';
}

const buildTokenListUrl = (tokenListUrl: string) => `https://tokenlists.org/token-list?url=${tokenListUrl}`;

interface TokenListProps {
  logo: string;
  name: string;
  url: string;
  tokens: number;
  isEnabled: boolean;
  onToggle: () => void;
}
const RawTokenList = ({ logo, name, tokens, isEnabled, onToggle, url }: TokenListProps) => (
  <StyledCard raised elevation={0}>
    <img src={logo} width="35px" height="35px" alt={name} />
    <StyledCardMainContent>
      <Typography variant="body1">{name}</Typography>
      <Typography variant="body2" color="rgba(255,255,255,0.5)">
        <FormattedMessage
          description="tokenlisttokens"
          defaultMessage="{tokenNumber} tokens"
          values={{ tokenNumber: tokens }}
        />
      </Typography>
    </StyledCardMainContent>
    <FormGroup row>
      <Switch checked={isEnabled} onChange={onToggle} name={`enableDisable${url}`} color="primary" />
    </FormGroup>
  </StyledCard>
);

const TokenList = React.memo(RawTokenList);

interface TokenListsProps {
  isAggregator?: boolean;
}

const TokenLists = ({ isAggregator }: TokenListsProps) => {
  const tokenList = useTokensLists();
  const savedTokenList = useSavedTokenLists();
  const savedAggregatorTokenList = useSavedAggregatorTokenLists();
  const dispatch = useAppDispatch();

  const savedTokenListToUse = isAggregator ? savedAggregatorTokenList : savedTokenList;

  const onEnableDisableList = (list: string) => {
    if (isAggregator) {
      dispatch(enableAggregatorTokenList({ tokenList: list, enabled: !savedAggregatorTokenList.includes(list) }));
    } else {
      dispatch(enableTokenList({ tokenList: list, enabled: !savedTokenList.includes(list) }));
    }
  };

  return (
    <>
      <StyledGrid item xs={12} style={{ flexBasis: 'auto' }}>
        <Typography variant="body1" fontWeight={600} fontSize="1.2rem">
          <FormattedMessage description="manageListAndTokens" defaultMessage="Manage list & tokens" />
        </Typography>
      </StyledGrid>
      <ScrollableGrid item xs={12} style={{ flexGrow: 1 }}>
        <Grid container spacing={2} direction="column">
          {Object.keys(tokenList).map((tokenListUrl) =>
            tokenList[tokenListUrl] ? (
              <StyledGridItem item xs={12} key={tokenListUrl} sx={{ paddingRight: '0px !important' }}>
                <TokenList
                  logo={getLogoURL(tokenList[tokenListUrl].logoURI)}
                  name={tokenList[tokenListUrl].name}
                  tokens={Object.keys(tokenList[tokenListUrl].tokens).length}
                  isEnabled={savedTokenListToUse.includes(tokenListUrl)}
                  onToggle={() => onEnableDisableList(tokenListUrl)}
                  url={buildTokenListUrl(tokenListUrl)}
                />
              </StyledGridItem>
            ) : null
          )}
        </Grid>
      </ScrollableGrid>
    </>
  );
};

export default TokenLists;
