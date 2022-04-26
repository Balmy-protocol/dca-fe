import React from 'react';
import styled from 'styled-components';
import SilverTrophy from 'assets/svg/atom/silver-trophy';
import GoldTrophy from 'assets/svg/atom/gold-trophy';
import BronzeTrophy from 'assets/svg/atom/bronze-trophy';
import Address from 'common/address';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { buildEtherscanAddress } from 'utils/etherscan';
import Link from '@mui/material/Link';
import CallMadeIcon from '@mui/icons-material/CallMade';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const StyledLoadearboardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledPaper = styled(Paper)<{ isFirsts: boolean; index: number }>`
  ${({ isFirsts }) => (isFirsts ? 'margin: 10px 0px;' : 'margin: 0px 0px;')}
  ${({ index }) => (index === 2 ? 'margin: 10px 0px 20px 0px;' : '')}
`;

const StyledLeaderboardItemContainer = styled.div<{ index: number }>`
  ${({ theme, index }) => `
    display: flex;
    padding: 10px 20px;
    ${index === 0 ? 'padding: 30px 20px 30px 35px;' : ''}
    ${index === 1 ? 'padding: 20px 20px 20px 35px;' : ''}
    ${index === 2 ? 'padding: 15px 20px 15px 35px;' : ''}
    ${index > 2 ? 'padding: 10px 20px;' : ''}
    // border: 1px solid ${theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)'};
    align-items: center;

    &:nth-child(even) {
      // border-top: none;
      // border-bottom: none;
    }

    &:last-child {
      // border-bottom: 1px solid ${theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)'};
    }
  `}
`;

const StyledLeadearboardItemPosition = styled.div`
  display: flex;
  font-weight: 400 !important;
`;

const StyledLeadearboardItemUser = styled.div`
  flex-grow: 1;
  margin-left: 30px;
  font-weight: 400 !important;
  overflow: hidden;
`;

const StyledLeadearboardItemValue = styled.div`
  font-weight: 400 !important;
  flex-shrink: 0;
`;

const StyledLink = styled(Link)<{ isFirsts: boolean }>`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#ffffff'};
  `}
  margin: 0px 5px;
`;

interface LeaderboardProps {
  rows: { name: string; value: number; display: string }[];
}

const getTypographySize = (index: number) => {
  if (index === 0) {
    return 'h5';
  }
  if (index === 1) {
    return 'h6';
  }
  if (index === 2) {
    return 'body1';
  }

  return 'body2';
};

const Leaderboard = ({ rows }: LeaderboardProps) => {
  const currentNetwork = useCurrentNetwork();

  return (
    <StyledLoadearboardContainer>
      {rows.map((row, index) => (
        <StyledPaper
          elevation={index < 3 ? 3 : 0}
          variant={index > 2 ? 'elevation' : 'outlined'}
          index={index}
          square={index > 2}
          isFirsts={index < 3}
        >
          <StyledLeaderboardItemContainer index={index}>
            <StyledLeadearboardItemPosition>
              <Typography variant={getTypographySize(index)} style={{ fontWeight: 400 }}>
                {index === 0 && <GoldTrophy />}
                {index === 1 && <SilverTrophy />}
                {index === 2 && <BronzeTrophy />}
                {index > 2 && index}
              </Typography>
            </StyledLeadearboardItemPosition>
            <StyledLeadearboardItemUser>
              <Typography variant={getTypographySize(index)} style={{ fontWeight: 400 }} noWrap>
                <StyledLink
                  isFirsts={index < 3}
                  href={buildEtherscanAddress(row.name, currentNetwork.chainId)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Address address={row.name} />
                  <CallMadeIcon fontSize="inherit" />
                </StyledLink>
              </Typography>
            </StyledLeadearboardItemUser>
            <StyledLeadearboardItemValue>
              <Typography variant={getTypographySize(index)} style={{ fontWeight: 400 }}>
                {row.display}
              </Typography>
            </StyledLeadearboardItemValue>
          </StyledLeaderboardItemContainer>
        </StyledPaper>
      ))}
    </StyledLoadearboardContainer>
  );
};
export default Leaderboard;
