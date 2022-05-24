import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import Link from '@mui/material/Link';
import styled from 'styled-components';
import TwitterIcon from '@mui/icons-material/Twitter';
import DiscordIcon from 'assets/svg/atom/discord';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import MeanLogo from 'common/mean-logo';
import { useThemeMode } from 'state/config/hooks';
import { Typography } from '@mui/material';

const StyledFooterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  left: 0;
  right: 0;
  position: absolute;
  bottom: 30px;
`;

const StyledFooterMainContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
`;

const StyledFooterLinks = styled.div`
  display: flex;
  gap: 32px;
`;

const StyledLink = styled(Link)`
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Footer = () => {
  const mode = useThemeMode();

  const history = useHistory();

  const onFaqClick = () => {
    history.push('/faq');
  };

  return (
    <StyledFooterContainer>
      <Link href="https://mean.finance">
        <MeanLogo theme={mode} />
      </Link>
      <StyledFooterMainContent>
        <StyledLink underline="none" target="_blank" href="https://github.com/Mean-Finance">
          <GitHubIcon />
        </StyledLink>
        <StyledLink underline="none" target="_blank" href="https://twitter.com/mean_fi">
          <TwitterIcon />
        </StyledLink>
        <StyledLink underline="none" target="_blank" href="https://discord.com/invite/ThfzDdn4pn">
          <DiscordIcon size="24px" />
        </StyledLink>
      </StyledFooterMainContent>
      <StyledFooterLinks>
        <Typography variant="body2">
          <StyledLink underline="none" target="_blank" href="https://docs.mean.finance">
            <DescriptionOutlinedIcon fontSize="inherit" />
            <FormattedMessage description="docs" defaultMessage="Docs" />
          </StyledLink>
        </Typography>

        <Typography variant="body2">
          <StyledLink underline="none" onClick={onFaqClick}>
            <HelpOutlineOutlinedIcon fontSize="inherit" />
            <FormattedMessage description="faq" defaultMessage="FAQ" />
          </StyledLink>
        </Typography>
      </StyledFooterLinks>
    </StyledFooterContainer>
  );
};

export default Footer;
