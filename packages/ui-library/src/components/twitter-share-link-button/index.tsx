import React from 'react';
import { Link, LinkProps } from '../link';
import styled from 'styled-components';
import { TwitterIcon } from '../../icons';
import { colors } from '../../theme';

interface TwitterShareLinkButtonProps extends LinkProps {
  text: string;
  url: string;
}

const StyledLink = styled(Link)`
  display: flex;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.spacing(4)};
`;

const StyledIcon = styled(TwitterIcon)`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo4}
`}
`;

const TwitterShareLinkButton = ({ text, url, children, ...linkProps }: TwitterShareLinkButtonProps) => {
  const linkHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  return (
    <StyledLink href={linkHref} target="_blank" {...linkProps}>
      <StyledIcon />
      {children}
    </StyledLink>
  );
};

export { TwitterShareLinkButton, TwitterShareLinkButtonProps };
