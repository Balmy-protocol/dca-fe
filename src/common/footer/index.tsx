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
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import LanguageLabel from 'common/lang-label';

const StyledFooterContainer = styled.div<{ isSmall: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ isSmall }) => (isSmall ? 'center' : 'space-between')};
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
  align-items: center;
`;

const StyledLink = styled(Link)`
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;

const Footer = () => {
  const mode = useThemeMode();
  const currentBreakPoint = useCurrentBreakpoint();

  const history = useHistory();

  const onFaqClick = () => {
    history.push('/faq');
  };

  return (
    <StyledFooterContainer isSmall={currentBreakPoint === 'xs'}>
      <Link href="https://mean.finance">
        <MeanLogo theme={mode} />
      </Link>
      {currentBreakPoint !== 'xs' && (
        <>
          <StyledFooterMainContent>
            <StyledLink underline="none" target="_blank" href="https://github.com/Mean-Finance">
              <GitHubIcon />
            </StyledLink>
            <StyledLink underline="none" target="_blank" href="https://twitter.com/mean_fi">
              <TwitterIcon />
            </StyledLink>
            <StyledLink underline="none" target="_blank" href="http://discord.mean.finance">
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

            <LanguageLabel />
          </StyledFooterLinks>
        </>
      )}
    </StyledFooterContainer>
  );
};

export default Footer;
