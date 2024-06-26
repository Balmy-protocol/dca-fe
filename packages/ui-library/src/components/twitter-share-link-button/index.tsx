import React from 'react';
import { Link, LinkProps } from '../link';
import styled from 'styled-components';
import { Button } from '../button';
import { TwitterIcon } from '../../icons';

interface TwitterShareLinkButtonProps extends LinkProps {
  text: string;
  url: string;
}

const StyledLink = styled(Link)`
  display: flex;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.spacing(4)};
`;

const StyledButton = styled(Button).attrs({ variant: 'outlined' })`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const TwitterShareLinkButton = ({ text, url, children, ...linkProps }: TwitterShareLinkButtonProps) => {
  const linkHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  return (
    <StyledLink href={linkHref} target="_blank" {...linkProps}>
      <StyledButton>
        <TwitterIcon fontSize="small" color="info" />
        {children}
      </StyledButton>
    </StyledLink>
  );
};

export { TwitterShareLinkButton, TwitterShareLinkButtonProps };
