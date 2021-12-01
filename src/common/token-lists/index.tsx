import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Link from '@material-ui/core/Link';
import FormGroup from '@material-ui/core/FormGroup';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import { useSavedTokenLists, useTokensLists } from 'state/token-lists/hooks';
import { useAppDispatch } from 'hooks/state';
import { enableTokenList } from 'state/token-lists/actions';

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.type === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

const StyledTokenListContainer = styled(Grid)`
  padding: 32px;
`;

const StyledCard = styled(Card)`
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
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

const TokenLists = () => {
  const tokenList = useTokensLists();
  const savedTokenList = useSavedTokenLists();
  const dispatch = useAppDispatch();

  const onEnableDisableList = (list: string) => {
    dispatch(enableTokenList({ tokenList: list, enabled: !savedTokenList.includes(list) }));
  };

  return (
    <StyledTokenListContainer container spacing={4} style={{ flexGrow: 1 }}>
      {Object.keys(tokenList).map((tokenListUrl) =>
        tokenList[tokenListUrl] ? (
          <Grid item xs={12} md={6} key={tokenListUrl}>
            <StyledCard raised elevation={5}>
              <img
                src={getLogoURL(tokenList[tokenListUrl].logoURI)}
                width="50px"
                height="50px"
                alt={tokenList[tokenListUrl].name}
              />
              <Typography variant="body1">{tokenList[tokenListUrl].name}</Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="tokenlisttokens"
                  defaultMessage="{tokenNumber} tokens"
                  values={{ tokenNumber: Object.keys(tokenList[tokenListUrl].tokens).length }}
                />
              </Typography>
              {tokenList[tokenListUrl].version && (
                <Typography variant="body2">
                  v{tokenList[tokenListUrl].version.major}.{tokenList[tokenListUrl].version.minor}.
                  {tokenList[tokenListUrl].version.patch}
                </Typography>
              )}
              <StyledLink target="_blank" href={buildTokenListUrl(tokenListUrl)}>
                <FormattedMessage description="view list" defaultMessage="View list" />
              </StyledLink>
              <FormGroup row>
                <Switch
                  checked={savedTokenList.includes(tokenListUrl)}
                  onChange={() => onEnableDisableList(tokenListUrl)}
                  name={`enableDisable${tokenListUrl}`}
                  color="primary"
                />
              </FormGroup>
            </StyledCard>
          </Grid>
        ) : null
      )}
    </StyledTokenListContainer>
  );
};

export default TokenLists;
