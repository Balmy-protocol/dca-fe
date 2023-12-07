import React from 'react';
import styled from 'styled-components';
import { Grid, Typography, FormGroup, Switch, Card, baseColors } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { useSavedAllTokenLists, useSavedDcaTokenLists, useTokensLists } from '@state/token-lists/hooks';
import { useAppDispatch } from '@hooks/state';
import { enableAllTokenList, enableDcaTokenList } from '@state/token-lists/actions';

const StyledCard = styled(Card)`
  padding: 16px;
  display: flex;
  align-items: center;
  border-radius: 4px;
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
  --scrollbarBG: ${baseColors.greyscale.greyscale2};
  --thumbBG: ${baseColors.white};
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
      <Typography variant="body">{name}</Typography>
      <Typography variant="bodySmall">
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
  allowAllTokens?: boolean;
}

const TokenLists = ({ allowAllTokens }: TokenListsProps) => {
  const tokenList = useTokensLists();
  const savedDcaTokenList = useSavedDcaTokenLists();
  const savedAllTokenList = useSavedAllTokenLists();
  const dispatch = useAppDispatch();

  const savedTokenListToUse = allowAllTokens ? savedAllTokenList : savedDcaTokenList;

  const onEnableDisableList = (list: string) => {
    if (allowAllTokens) {
      dispatch(enableAllTokenList({ tokenList: list, enabled: !savedTokenListToUse.includes(list) }));
    } else {
      dispatch(enableDcaTokenList({ tokenList: list, enabled: !savedDcaTokenList.includes(list) }));
    }
  };

  return (
    <>
      <StyledGrid item xs={12} style={{ flexBasis: 'auto' }}>
        <Typography variant="body" fontWeight={600} fontSize="1.2rem">
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
