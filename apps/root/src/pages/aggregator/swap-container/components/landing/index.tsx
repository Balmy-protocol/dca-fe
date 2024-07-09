import * as React from 'react';
import {
  Typography,
  BalmyLogoSmallDark,
  BalmyLogoSmallLight,
  BackgroundPaper,
  ContainerBox,
  TickCircleIcon,
  useTheme,
  colors,
  baseColors,
  BackgroundGrid,
} from 'ui-library';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';
import useSdkDexes from '@hooks/useSdkSources';
import { chunk, orderBy } from 'lodash';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI } from '@common/utils/currency';

const BulletPoint = ({ label }: { label: string }) => (
  <ContainerBox gap={1} alignItems="center">
    <TickCircleIcon color="primary" />
    <Typography variant="bodySmallBold" noWrap>
      {label}
    </Typography>
  </ContainerBox>
);

const StyledBackgroundPaper = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
  display: flex;
  flex-direction: column;
  gap: ${spacing(6)};
  align-items: center;
  padding-top: ${spacing(12)};
  padding-bottom: ${spacing(47.5)};
  position: relative;
  overflow: hidden;
`}
`;

const StyledBottomBackground = styled.div`
  ${({ theme: { palette, spacing } }) => `
  position: absolute;
  bottom: 0;
  opacity: 0.5;
  background: ${palette.mode === 'light' ? baseColors.violet.violet500 : baseColors.violet.violet600};
  filter: blur(${spacing(19)});
  width: 100%;
  height: ${spacing(47.5)};
  transform: translateY(50%);
  `}
`;

const StyledBackgroundGrid = styled(BackgroundGrid)`
  position: absolute;
  bottom: 0;
`;

const StyledDexRows = styled(ContainerBox).attrs({ flexDirection: 'column', gap: 5 })`
  ${({ theme: { spacing } }) => `
  position: absolute;
  bottom: -${spacing(6)};
  left: 0;
`}
`;

const StyledDexItem = styled(ContainerBox)`
  ${({ theme: { spacing } }) => `
  margin: 0 ${spacing(2.5)};
`}
`;

const moveRight = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
`;

const moveLeft = keyframes`
    0% { transform: translateX(-100%); }
    100% { transform: translateX(0); }
`;

const StyledDexRow = styled(ContainerBox)<{ $evenRow: boolean }>`
  width: 50%;
  animation: ${({ $evenRow }) => ($evenRow ? moveRight : moveLeft)} 30s linear infinite;
`;

const bulletLabels = defineMessages({
  bestPrice: {
    defaultMessage: 'Best price always',
    description: 'descBestPrice',
  },
  swapTransfer: {
    description: 'descSwapAndTransfer',
    defaultMessage: 'Swap and transfer',
  },
  buyOrders: {
    description: 'descBuyOrders',
    defaultMessage: 'Buy orders',
  },
  noExtraFees: {
    description: 'descNoFee',
    defaultMessage: 'No extra fees',
  },
});

const AggregatorLanding = () => {
  const { palette, spacing } = useTheme();
  const intl = useIntl();
  const dexes = useSdkDexes();

  const dexRows = React.useMemo(() => {
    const dexesArray = orderBy(Object.values(dexes), 'name', 'asc');
    const [row1, row2] = chunk(dexesArray, Math.ceil(dexesArray.length / 2));

    // Ensure same amount of elements for equal animation speed
    if (dexesArray.length % 2 !== 0) {
      row2.unshift(...row1.slice(-1));
    }

    // Duplicate elements on each row for animation effect
    const formatRow1 = [...row1, ...row1];
    const formatRow2 = [...row2, ...row2];

    return [formatRow1, formatRow2];
  }, [dexes]);

  const logoProps = { size: spacing(13), fill: colors[palette.mode].typography.typo2 };
  const logo =
    palette.mode === 'light' ? <BalmyLogoSmallDark {...logoProps} /> : <BalmyLogoSmallLight {...logoProps} />;

  return (
    <StyledBackgroundPaper variant="outlined">
      {logo}
      <Typography variant="h4" fontWeight={700}>
        <FormattedMessage description="metaAggregatorTitle" defaultMessage="Balmy's Aggregator of Aggregators" />
      </Typography>
      <Typography variant="bodyRegular" textAlign="center">
        <FormattedMessage
          description="metaAggregatorDescription"
          defaultMessage="We find the best prices across all of Defi. You can now make sure you are getting the best deal possibe."
        />
      </Typography>
      <ContainerBox gap={2} justifyContent="space-around" fullWidth flexWrap="wrap">
        {Object.values(bulletLabels).map((label) => (
          <BulletPoint key={label.description} label={intl.formatMessage(label)} />
        ))}
      </ContainerBox>
      <StyledBottomBackground />
      <StyledBackgroundGrid width={spacing(158)} height={spacing(40)} />
      <StyledDexRows>
        {dexRows.map((row, i) => (
          <StyledDexRow $evenRow={i % 2 === 0} key={i}>
            {row.map((dex, j) => (
              <StyledDexItem key={dex.name + j}>
                <TokenIcon size={20} token={emptyTokenWithLogoURI(dex.logoURI)} />
              </StyledDexItem>
            ))}
          </StyledDexRow>
        ))}
      </StyledDexRows>
    </StyledBackgroundPaper>
  );
};

export default AggregatorLanding;
