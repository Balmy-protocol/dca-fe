import * as React from 'react';
import { Typography, Chip, Paper, CheckCircleOutlineOutlined as CheckCircleOutlineOutlinedIcon } from 'ui-library';
import EmptyRoutes from '@assets/svg/emptyRoutes';
import { FormattedMessage } from 'react-intl';
import { withStyles } from 'tss-react/mui';
import compact from 'lodash/compact';
import styled from 'styled-components';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI } from '@common/utils/currency';
import useSdkDexes from '@hooks/useSdkSources';
import MinimalTabs from '@common/components/minimal-tabs';
import { SourceMetadata } from '@mean-finance/sdk';
import AggregatorFAQ from '../faq';

const StatusChip = withStyles(Chip, () => ({
  colorSuccess: {
    background: 'rgba(33, 150, 83, 0.1)',
    color: '#219653',
  },
  colorError: {
    background: 'rgba(235, 87, 87, 0.1)',
    color: '#EB5757',
  },
}));

const StyledPaper = styled(Paper)<{ $column?: boolean; $align?: boolean }>`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
  display: flex;
  gap: 24px;
  flex-direction: ${({ $column }) => ($column ? 'column' : 'row')};
  ${({ $align }) => ($align ? 'align-self: flex-start;' : '')}
`;

const StyledCenteredWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
`;

const StyledChipsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-direction: column;
`;

const StyledChipsGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

interface SourceMetadataWithId extends SourceMetadata {
  id: string;
}

const AggregatorLanding = () => {
  const dexes = useSdkDexes();
  const dexesKeys = Object.keys(dexes);
  const [tabIndex, setTabIndex] = React.useState(0);
  const mappedDexes = dexesKeys.reduce<SourceMetadataWithId[][]>((acc, dexKey, index) => {
    const newAcc = [...acc];

    if (index % 3 === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nextDex =
        dexes[dexesKeys[index + 1]] && dexesKeys[index + 1]
          ? {
              ...dexes[dexesKeys[index + 1]],
              id: dexesKeys[index + 1],
            }
          : null;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const nextDexThird =
        dexes[dexesKeys[index + 2]] && dexesKeys[index + 2]
          ? {
              ...dexes[dexesKeys[index + 2]],
              id: dexesKeys[index + 2],
            }
          : null;

      const group = compact([
        {
          ...dexes[dexKey],
          id: dexKey,
        },
        nextDex,
        nextDexThird,
      ]);

      newAcc.push(group);
    }

    return newAcc;
  }, []);

  return (
    <StyledPaper variant="outlined" $column>
      <StyledPaper variant="outlined" $column>
        <MinimalTabs
          options={[
            { key: 0, label: 'Intro' },
            { key: 1, label: 'FAQ' },
          ]}
          selected={{ key: tabIndex, label: '' }}
          indicatorColor="#7C37ED"
          onChange={({ key }) => setTabIndex(key as number)}
        />
        <StyledCenteredWrapper>
          {tabIndex === 1 && <AggregatorFAQ />}
          {tabIndex === 0 && (
            <>
              <EmptyRoutes size="150px" />
              <Typography variant="h5">
                <FormattedMessage
                  description="meanFinanceMetaAggregator"
                  defaultMessage="Introducing Mean Finance's Meta Aggregator"
                />
              </Typography>
              <StyledChipsContainer>
                <StyledChipsGroup>
                  <StatusChip
                    label={<FormattedMessage description="descNoFee" defaultMessage="No extra fees" />}
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<CheckCircleOutlineOutlinedIcon />}
                  />
                  <StatusChip
                    label={<FormattedMessage description="descBestPrice" defaultMessage="Best price always" />}
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<CheckCircleOutlineOutlinedIcon />}
                  />
                  <StatusChip
                    label={<FormattedMessage description="descBuyOrders" defaultMessage="Buy orders" />}
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<CheckCircleOutlineOutlinedIcon />}
                  />
                </StyledChipsGroup>
                <StyledChipsGroup>
                  <StatusChip
                    label={
                      <FormattedMessage
                        description="descTransactionSimulation"
                        defaultMessage="Transaction simulation"
                      />
                    }
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<CheckCircleOutlineOutlinedIcon />}
                  />
                  <StatusChip
                    label={<FormattedMessage description="descSwapAndTransfer" defaultMessage="Swap and transfer" />}
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<CheckCircleOutlineOutlinedIcon />}
                  />
                </StyledChipsGroup>
              </StyledChipsContainer>
              <Typography variant="body1" sx={{ textAlign: 'center', padding: '0px 20px' }}>
                <FormattedMessage
                  description="meanFinanceMetaAggregatorDescription"
                  defaultMessage="We find the best prices across all of DeFi so you don't have to. You can now make sure you are getting the best deal possible"
                />
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', padding: '0px 20px' }}>
                <FormattedMessage description="meanFinanceMetaAggregatorSupporting" defaultMessage="Supporting:" />
              </Typography>
              <StyledChipsContainer>
                {mappedDexes.map((dexGroup, index) => (
                  <StyledChipsGroup key={index}>
                    {dexGroup.map((dex) => (
                      <StatusChip
                        label={dex.name}
                        color="secondary"
                        variant="outlined"
                        size="small"
                        icon={<TokenIcon isInChip size="18px" token={emptyTokenWithLogoURI(dex.logoURI)} />}
                        key={dex.id}
                      />
                    ))}
                  </StyledChipsGroup>
                ))}
              </StyledChipsContainer>
            </>
          )}
        </StyledCenteredWrapper>
      </StyledPaper>
    </StyledPaper>
  );
};

export default AggregatorLanding;
