import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  LinkComponent,
  Typography,
  BugReport as BugReportIcon,
  Twitter as TwitterIcon,
  Preview as PreviewIcon,
  DescriptionOutlined as DescriptionOutlinedIcon,
  HelpOutlineOutlined as HelpOutlineOutlinedIcon,
  GitHub as GitHubIcon,
} from 'ui-library';
import styled from 'styled-components';
import DiscordIcon from '@assets/svg/atom/discord';
import { useThemeMode } from '@state/config/hooks';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import usePushToHistory from '@hooks/usePushToHistory';
import LanguageLabel from './components/lang-label';
import MeanLogo from './components/mean-logo';

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

const StyledLink = styled(LinkComponent)`
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;

const Footer = () => {
  const mode = useThemeMode();
  const currentBreakPoint = useCurrentBreakpoint();

  const pushToHistory = usePushToHistory();

  const onFaqClick = () => {
    pushToHistory('/faq');
  };

  return (
    <StyledFooterContainer isSmall={currentBreakPoint === 'xs'}>
      <LinkComponent href="https://mean.finance">
        <MeanLogo theme={mode} />
      </LinkComponent>
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
              <StyledLink
                underline="none"
                target="_blank"
                href="https://github.com/Mean-Finance/dca-v2-core/tree/main/audits"
              >
                <PreviewIcon fontSize="inherit" />
                <FormattedMessage description="audits" defaultMessage="Audits" />
              </StyledLink>
            </Typography>

            <Typography variant="body2">
              <StyledLink underline="none" target="_blank" href="https://immunefi.com/bounty/meanfinance/">
                <BugReportIcon fontSize="inherit" />
                <FormattedMessage description="bugBounty" defaultMessage="Bug bounty" />
              </StyledLink>
            </Typography>

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
