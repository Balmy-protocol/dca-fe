import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';
import WalletContext from 'common/wallet-context';
import ConnectWalletButtom from '../connect-wallet';
import WalletButtom from '../wallet';
import Link from '@material-ui/core/Link';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';

const StyledBox = styled(Box)<{ breakpoint: ReturnType<typeof useCurrentBreakpoint> }>`
  flex: 1;
  display: flex;
  ${(props) =>
    props.breakpoint === 'xs'
      ? `
    justify-content: center;
    margin-bottom: 30px;
  `
      : ''}
`;

const StyledNavbarContainer = styled(Grid)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface NavBarProps {
  isLoading: boolean;
}

const NavBar = ({ isLoading }: NavBarProps) => {
  const currentBreakPoint = useCurrentBreakpoint();
  return (
    <StyledNavbarContainer container>
      <Grid item xs={12} sm={6}>
        <StyledBox breakpoint={currentBreakPoint}>
          <Link href="http://mean.finance">
            <img
              alt="mean finance"
              style={{ width: '200px' }}
              src="data:image/png;base64,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"
            />
          </Link>
        </StyledBox>
      </Grid>
      <Grid item xs={12} sm={6}>
        <WalletContext.Consumer>
          {({ web3Service }) =>
            !web3Service.getAccount() && !isLoading ? (
              <ConnectWalletButtom web3Service={web3Service} />
            ) : (
              <WalletButtom isLoading={isLoading} web3Service={web3Service} />
            )
          }
        </WalletContext.Consumer>
      </Grid>
    </StyledNavbarContainer>
  );
};

export default NavBar;
