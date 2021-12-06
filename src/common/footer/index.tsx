import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { CategoryProvider, CategoryTitle, CategoryItem } from '@mui-treasury/components/menu/category';
import Link from '@material-ui/core/Link';
import { useNikiCategoryMenuStyles } from '@mui-treasury/styles/categoryMenu/niki';
import styled from 'styled-components';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import TwitterIcon from '@material-ui/icons/Twitter';
import DiscordIcon from 'assets/svg/atom/discord';
import DescriptionIcon from '@material-ui/icons/Description';
import GitHubIcon from '@material-ui/icons/GitHub';
import MeanLogo from 'common/mean-logo';
import { useThemeMode } from 'state/config/hooks';

const StyledCategoryTitle = styled(CategoryTitle)`
  margin: 0px;
  margin-bottom: 0.5em;
  cursor: default;
  font-size: 1rem;
  letter-spacing: 0.75px;
  text-transform: uppercase;
`;

const StyledIconContainer = styled.div`
  display: inline-box;
  margin-right: 5px;
`;

const Footer = () => {
  const mode = useThemeMode();

  const history = useHistory();

  const onFaqClick = () => {
    history.push('/faq');
  };

  return (
    <Box width="100%" px={{ xs: 2, sm: 3, lg: 4 }}>
      <Divider />
      <Box pt={6} pb={{ md: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={12} lg={4}>
            <Link href="http://mean.finance">
              <MeanLogo theme={mode} />
            </Link>
          </Grid>
          <Grid item xs={12} md={8} lg={4}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <CategoryProvider useStyles={useNikiCategoryMenuStyles}>
                  <StyledCategoryTitle>
                    <FormattedMessage description="community" defaultMessage="Community" />
                  </StyledCategoryTitle>
                  <CategoryItem
                    href="https://github.com/Mean-Finance/dca"
                    target="_blank"
                    color="inherit"
                    style={{ textDecoration: 'none' }}
                  >
                    <StyledIconContainer>
                      <GitHubIcon fontSize="inherit" />
                    </StyledIconContainer>
                    <FormattedMessage description="github" defaultMessage="Github" />
                  </CategoryItem>
                  <CategoryItem
                    href="https://twitter.com/mean_fi"
                    target="_blank"
                    color="inherit"
                    style={{ textDecoration: 'none' }}
                  >
                    <StyledIconContainer>
                      <TwitterIcon fontSize="inherit" />
                    </StyledIconContainer>
                    <FormattedMessage description="twitter" defaultMessage="Twitter" />
                  </CategoryItem>
                  <CategoryItem
                    href="https://discord.com/invite/ThfzDdn4pn"
                    target="_blank"
                    color="inherit"
                    style={{ textDecoration: 'none' }}
                  >
                    <StyledIconContainer>
                      <DiscordIcon size="inherit" />
                    </StyledIconContainer>
                    <FormattedMessage description="discord" defaultMessage="Discord" />
                  </CategoryItem>
                </CategoryProvider>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={8} lg={4}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <CategoryProvider useStyles={useNikiCategoryMenuStyles}>
                  <StyledCategoryTitle>
                    <FormattedMessage description="resources" defaultMessage="Resources" />
                  </StyledCategoryTitle>
                  <CategoryItem
                    href="https://docs.mean.finance"
                    target="_blank"
                    color="inherit"
                    style={{ textDecoration: 'none' }}
                  >
                    <StyledIconContainer>
                      <DescriptionIcon fontSize="inherit" />
                    </StyledIconContainer>
                    <FormattedMessage description="docs" defaultMessage="Docs" />
                  </CategoryItem>
                  <CategoryItem onClick={onFaqClick} color="inherit" style={{ textDecoration: 'none' }}>
                    <StyledIconContainer>
                      <DescriptionIcon fontSize="inherit" />
                    </StyledIconContainer>
                    <FormattedMessage description="faq" defaultMessage="FAQ" />
                  </CategoryItem>
                </CategoryProvider>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Footer;
