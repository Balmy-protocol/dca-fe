import React from 'react';
import { Token } from 'common-types';
import styled from 'styled-components';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ContainerBox,
  ForegroundPaper,
  GlobalIcon,
  Grid,
  Typography,
  colors,
} from 'ui-library';
import { Address } from 'viem';
import TokenIcon from '@common/components/token-icon';
import { toToken } from '@common/utils/currency';
import { getGhTokenListLogoUrl, TESTNETS } from '@constants';
import { Chain, getAllChains } from '@balmy/sdk';
import { buildEtherscanBase, buildEtherscanToken } from '@common/utils/etherscan';
import { FormattedMessage } from 'react-intl';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';

const StyledExplorersContainer = styled(ForegroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(0)};
`}
`;

const StyledExplorerItem = styled(ContainerBox).attrs({ gap: 2, flexWrap: 'nowrap' })`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(2)};
    cursor: pointer;
    border-radius: ${spacing(2)};
    border: 1px solid ${colors[palette.mode].border.border2};
    background: ${colors[palette.mode].background.tertiary};
  `}
`;

const StyledAccordionDetails = styled(AccordionDetails)`
  ${({ theme: { spacing } }) => `
        padding-top: ${spacing(3)};
    `}
`;

// Replace this value when implementing Token Overview: BLY-2748
const DEFAULT_DISPLAYED_ITEMS = 15;

const ExplorerItem = ({ network, tokenAddress }: { network: Chain; tokenAddress: Address }) => {
  const onGoToEtherscan = () => {
    const url =
      tokenAddress === PROTOCOL_TOKEN_ADDRESS
        ? buildEtherscanBase(network.chainId)
        : buildEtherscanToken(tokenAddress, network.chainId);
    window.open(url, '_blank');
  };

  return (
    <StyledExplorerItem onClick={onGoToEtherscan}>
      <TokenIcon
        size={5}
        token={toToken({
          logoURI: getGhTokenListLogoUrl(network.chainId, 'logo'),
        })}
      />
      <Typography variant="bodySmallSemibold" noWrap>
        {network.name}
      </Typography>
    </StyledExplorerItem>
  );
};

const Explorers = ({ token }: { token: Token }) => {
  const [showMore, setShowMore] = React.useState(false);

  const { firstExplorers, secondExplorers } = React.useMemo(() => {
    const allExplorers = getAllChains()
      .filter((chain) => !TESTNETS.includes(chain.chainId))
      .reduce<{ network: Chain; address: Address }[]>((acc, network) => {
        const tokenData = token.chainAddresses.find((chainToken) => chainToken.chainId === network.chainId);
        if (tokenData) {
          acc.push({
            network,
            address: tokenData.address,
          });
        }
        return acc;
      }, []);

    return {
      firstExplorers: allExplorers.slice(0, DEFAULT_DISPLAYED_ITEMS),
      secondExplorers: allExplorers.slice(DEFAULT_DISPLAYED_ITEMS),
    };
  }, [token.chainAddresses]);

  return (
    <StyledExplorersContainer>
      <Accordion disableGutters defaultExpanded>
        <AccordionSummary>
          <ContainerBox gap={2} alignItems="center">
            <GlobalIcon sx={({ palette: { mode } }) => ({ color: colors[mode].typography.typo2 })} />
            <Typography variant="h5Bold">
              <FormattedMessage defaultMessage="Explorers" description="token-profile.explorers" />
            </Typography>
          </ContainerBox>
        </AccordionSummary>
        <StyledAccordionDetails>
          <Grid container spacing={2}>
            {firstExplorers.map((tokenData) => (
              <Grid item xs="auto" key={tokenData.network.chainId}>
                <ExplorerItem network={tokenData.network} tokenAddress={tokenData.address} />
              </Grid>
            ))}
            {secondExplorers.length > 0 &&
              (showMore ? (
                secondExplorers.map((tokenData) => (
                  <Grid item xs="auto" key={tokenData.network.chainId}>
                    <ExplorerItem network={tokenData.network} tokenAddress={tokenData.address} />
                  </Grid>
                ))
              ) : (
                <Grid item xs="auto">
                  <Typography
                    variant="bodySmallBold"
                    color="primary"
                    noWrap
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setShowMore(true)}
                  >
                    <FormattedMessage
                      defaultMessage="+{amount} more"
                      description="token-profile.explorers.show-more"
                      values={{ amount: secondExplorers.length }}
                    />
                  </Typography>
                </Grid>
              ))}
          </Grid>
        </StyledAccordionDetails>
      </Accordion>
    </StyledExplorersContainer>
  );
};

export default Explorers;
