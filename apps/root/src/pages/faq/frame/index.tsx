import React from 'react';
import styled from 'styled-components';
import { Grid, Link, Typography, Card, Paper } from 'ui-library';
import Button from '@common/components/button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@state/hooks';
import { changeMainTab } from '@state/tabs/actions';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(6px);
  display: flex;
  gap: 20px;

  p {
    margin: 0px;
    margin-bottom: 24px;
  }

  h2 {
    margin: 0px;
    margin-bottom: 12px;
    font-weight: 500 !important;
  }
  ul {
    margin: 0px;
    margin-bottom: 24px;
    li {
      p {
        margin: 0px;
      }
    }
  }
`;

const StyledCard = styled(Card)`
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-grow: 1;
  background: #292929;
  padding: 16px;
`;

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'};
  `}
  margin: 0px 5px;
`;

const FAQFrame = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onBackToApp = () => {
    navigate(-1);
  };

  React.useEffect(() => {
    dispatch(changeMainTab(3));
  }, []);

  return (
    <Grid container>
      <Grid item xs={12} style={{ paddingBottom: '45px', paddingTop: '15px' }}>
        <Button variant="text" color="default" onClick={onBackToApp}>
          <Typography variant="h5" component="div" style={{ display: 'flex', alignItems: 'center' }}>
            <ArrowBackIcon fontSize="inherit" />{' '}
            <FormattedMessage description="backToApp" defaultMessage="Back to app" />
          </Typography>
        </Button>
      </Grid>
      <StyledPaper variant="outlined">
        <StyledCard variant="outlined">
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2">
                <FormattedMessage description="faqWhatIsMeanFinance" defaultMessage="What is Mean Finance?" />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqWhatIsMeanFinanceResponse"
                  defaultMessage="Mean Finance is the state-of-the-art DCA protocol. It enables you to set up actions like “Swap 10 USDC for WBTC every day, for 30 days”. You can create these actions between almost all ERC20 tokens, in the frequency of your choosing. These token swaps will then occur regardless of the asset's price and at regular intervals, reducing the impact of volatility on your investment."
                />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2">
                <FormattedMessage
                  description="faqHowDoesMeanFinanceWork"
                  defaultMessage="How does Mean Finance work?"
                />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqHowDoesMeanFinanceWorkResponse"
                  defaultMessage="When you set up a position, you are creating an intention to swap one token for the other. Then, some external user can come and execute the swap for you, honoring the desired frequency of course. When they execute your swap, you are charged a 0.6% fee on the amount that was swapped. This fee is then split between Mean Finance and the swapper. Since you don’t have to execute the swap by yourself, you don’t need to pay any gas."
                />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2">
                <FormattedMessage
                  description="faqWhyShouldIUseMeanFinance"
                  defaultMessage="Why should I use Mean Finance?"
                />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqWhyShouldIUseMeanFinanceResponsePart1"
                  defaultMessage="Timing the market can be extremely difficult. The goal of performing DCA is to reduce the overall impact of volatility on the price of the target asset; as the price will likely vary each time one of the periodic swaps is executed, the investment is not as highly subject to volatility. DCA aims to avoid making the mistake of making one lump-sum investment that is poorly timed with regard to asset pricing."
                />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqWhyShouldIUseMeanFinanceResponsePart2"
                  defaultMessage="Mean Finance will allow you to perform DCA, in a gasless and decentralized fashion. This means:"
                />
              </Typography>
              <ul>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhyShouldIUseMeanFinanceResponsePart3"
                      defaultMessage="No account required"
                    />
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhyShouldIUseMeanFinanceResponsePart4"
                      defaultMessage="No trading limits"
                    />
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhyShouldIUseMeanFinanceResponsePart5"
                      defaultMessage="No deposit or withdrawal fees"
                    />
                  </Typography>
                </li>
              </ul>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2">
                <FormattedMessage
                  description="faqHowIsThePriceCalculatedForEachSwap"
                  defaultMessage="How is the price calculated for each swap?"
                />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqHowIsThePriceCalculatedForEachSwapResponseFirst"
                  defaultMessage="Mean Finance relies on on-chain oracles to determine the price at the moment of the swap. Right now Mean Finance uses"
                />
                <StyledLink href="https://chain.link/data-feeds" target="_blank" rel="noreferrer">
                  Chainlink price feeds
                </StyledLink>
                <FormattedMessage description="faqHowIsThePriceCalculatedForEachSwapResponseAnd" defaultMessage="and" />
                <StyledLink
                  href="https://docs.uniswap.org/protocol/concepts/V3-overview/oracle"
                  target="_blank"
                  rel="noreferrer"
                >
                  Uniswap V3’s TWAP oracles,
                </StyledLink>
                <FormattedMessage
                  description="faqHowIsThePriceCalculatedForEachSwapResponseSecond"
                  defaultMessage="but in the future we will support more on-chain oracles."
                />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2">
                <FormattedMessage description="faqIsMeanFinanceAudited" defaultMessage="Is Mean Finance audited?" />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqIsMeanFinanceAuditedResponse"
                  defaultMessage="Mean Finance contracts have been audited by Pessimistic and PeckShield. You can read the reports"
                />
                <StyledLink
                  href="https://github.com/Mean-Finance/dca-v2-core/tree/main/audits"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FormattedMessage description="faqIsMeanFinanceAuditedHere" defaultMessage="here" />
                </StyledLink>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2">
                <FormattedMessage
                  description="faqWhenDoINeedToPayGasFees"
                  defaultMessage="When do I need to pay gas fees?"
                />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqWhenDoINeedToPayGasFeesResponsePart1"
                  defaultMessage="Users need to pay gas only when they interact with the positions. This includes:"
                />
              </Typography>
              <ul>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhenDoINeedToPayGasFeesResponsePart2"
                      defaultMessage="Creating their position"
                    />
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhenDoINeedToPayGasFeesResponsePart3"
                      defaultMessage="Modifying their position"
                    />
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhenDoINeedToPayGasFeesResponsePart4"
                      defaultMessage="Withdrawing balance from their position"
                    />
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhenDoINeedToPayGasFeesResponsePart6"
                      defaultMessage="Setting or revoking permissions"
                    />
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhenDoINeedToPayGasFeesResponsePart5"
                      defaultMessage="Closing their position"
                    />
                  </Typography>
                </li>
              </ul>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqWhenDoINeedToPayGasFeesResponsePart6"
                  defaultMessage="End users don’t have to pay gas fees when the swaps are executed."
                />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqWhenDoINeedToPayGasFeesResponsePart7"
                  defaultMessage="For more information, feel free to check our"
                />
                <StyledLink href="https://docs.mean.finance/concepts/fees" target="_blank" rel="noreferrer">
                  <FormattedMessage
                    description="faqWhenDoINeedToPayGasFeesResponsePart8"
                    defaultMessage="fees section."
                  />
                </StyledLink>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2">
                <FormattedMessage description="faqDoINeedToPayAnyFees" defaultMessage="Do I need to pay any fees?" />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqDoINeedToPayAnyFeesResponsePart1"
                  defaultMessage="Users need to pay gas fees when interacting with their positions. At the same time, there is a protocol fee that is charged in each swap. That fee is currently 0.6%. "
                />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqDoINeedToPayAnyFeesResponsePart2"
                  defaultMessage="For example, let’s assume that you’ve created a position that swaps 2000 USDC for ETH each day. Let’s also assume that, when the swap is executed, 2000 USDC = 1 ETH. Instead of getting 1 ETH, you would be getting 1 ETH - 0.6% = 0.994 ETH. That 0.6% will be split between Mean Finance and the user who actually executed the swap."
                />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqDoINeedToPayAnyFeesResponsePart3"
                  defaultMessage=" For more information, feel free to check our"
                />
                <StyledLink href="https://docs.mean.finance/concepts/fees" target="_blank" rel="noreferrer">
                  <FormattedMessage
                    description="faqWhenDoINeedToPayGasFeesResponsePart8"
                    defaultMessage="fees section."
                  />
                </StyledLink>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2">
                <FormattedMessage
                  description="faqWhatDoesItMeanForAPairToBeStale"
                  defaultMessage="What does it mean for a pair to be stale?"
                />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqWhatDoesItMeanForAPairToBeStaleResponsePart1"
                  defaultMessage="Mean Finance incentivizes other users to execute swaps, for a profit. Now, these incentives can be affected by different factors:"
                />
              </Typography>
              <ul>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhatDoesItMeanForAPairToBeStaleResponsePart2"
                      defaultMessage="The general sentiment of the crypto market"
                    />
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhatDoesItMeanForAPairToBeStaleResponsePart3"
                      defaultMessage="The popularity/demand of the tokens involved in the swap"
                    />
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhatDoesItMeanForAPairToBeStaleResponsePart4"
                      defaultMessage="The volume of the tokens involved in the swap"
                    />
                  </Typography>
                </li>
              </ul>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqWhatDoesItMeanForAPairToBeStaleResponsePart5"
                  defaultMessage="When a specific pair has some swaps that haven’t been executed in quite some time, the pair is signaled as stale."
                />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2">
                <FormattedMessage description="faqWhyIsMyPositionStale" defaultMessage="Why is my position stale?" />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqWhyIsMyPositionStaleResponsePart1"
                  defaultMessage="You don’t need to execute your swaps by yourself since Mean Finance incentivizes other users to execute swaps, for a profit. Now, these incentives can be affected by different factors:"
                />
              </Typography>
              <ul>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhyIsMyPositionStaleResponsePart2"
                      defaultMessage="The general sentiment of the crypto market"
                    />
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhyIsMyPositionStaleResponsePart3"
                      defaultMessage="The popularity/demand of the tokens involved in the swap"
                    />
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    <FormattedMessage
                      description="faqWhyIsMyPositionStaleResponsePart4"
                      defaultMessage="The volume of the tokens involved in the swap"
                    />
                  </Typography>
                </li>
              </ul>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqWhyIsMyPositionStaleResponsePart5"
                  defaultMessage="So it could happen that your swap is not executed within your specified frequency. If this were to happen to your position, remember that fees are only charged on swaps, so your balance will remain unaffected."
                />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5" component="h2">
                <FormattedMessage
                  description="faqWhenWillMyPositionBeSwapped"
                  defaultMessage="When will my position be swapped?"
                />
              </Typography>
              <Typography variant="body1">
                <FormattedMessage
                  description="faqWhenWillMyPositionBeSwappedResponse"
                  defaultMessage="Since swaps are executed by external users, they can decide when to execute them. For example, let’s assume that you had created a position with daily swaps. This means that from 00 AM UTC to 11.59 PM UTC, your position can only be executed once. Once it is executed, it can't be executed again until 00 AM of the following day. The same happens with other frequencies, such as weekly or monthly."
                />
              </Typography>
            </Grid>
          </Grid>
        </StyledCard>
      </StyledPaper>
    </Grid>
  );
};

export default FAQFrame;
