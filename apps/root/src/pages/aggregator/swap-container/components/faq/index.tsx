import React from 'react';
import {
  Typography,
  Link,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ContainerBox,
  colors,
  ThumbsSatisfaction,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import useAnalytics from '@hooks/useAnalytics';

const StyledQuestion = styled(Typography).attrs({ variant: 'h4Bold' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2};
`}
`;

const StyledAnswer = styled(Typography).attrs({ variant: 'bodyRegular' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2};
`}
`;

const StyledContainer = styled(ContainerBox)`
  max-width: 630px;
`;

const AggregatorFAQ = () => {
  const { trackEvent } = useAnalytics();

  const onFeedbackClick = ({ id, value: helpfull }: { id: string; value: boolean }) => {
    trackEvent(`FAQ ${id} was usefull`, { helpfull });
  };

  return (
    <StyledContainer flexDirection="column" gap={8} alignSelf="center">
      <Typography variant="h4Bold" textAlign="center">
        <FormattedMessage description="swapFaqTitle" defaultMessage="Swap Frequently Asked Questions" />
      </Typography>
      <ContainerBox flexDirection="column" gap={4}>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="faqWhatIs" defaultMessage="What is Balmy's Meta Aggregator?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqWhatIsResponse"
                defaultMessage="You've probably heard many applications claim they offer the best prices: well, now you can be sure! We will query all the best aggregators at the same time so you don't have to, and you will be able to choose the one that best fits your needs"
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Aggregator What is" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="faqFees" defaultMessage="Do you take any fees?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqFeesResponse"
                defaultMessage="We don't add any extra fees at all. You are getting exactly the same prices as if you would have interacted with the aggregators directly.{br}{br}Some aggregators support revenue sharing so we might get some part of their fee, but this is no extra charge to you."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Aggregator do you take fees" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="faqIsSafe" defaultMessage="Is it safe?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqIsSafeResponsePartOne"
                defaultMessage="Our smart contracts have been built to leverage the power of "
              />
              <Link
                href="https://mean-finance.medium.com/approve-now-and-for-the-last-time-finally-8717dcde4e87"
                target="_blank"
              >
                <FormattedMessage description="universal approvals" defaultMessage="Universal Approvals" />
              </Link>
              <FormattedMessage
                description="faqIsSafeResponsePartTwo"
                defaultMessage="to minimize any possible exposure to them. Furthermore, by leveraging Universal Approvals we can simulate your trade on any network you are on, so you can now exactly what is going to happen once the swap gets executed! Last, our smart contracts have been audited by Omniscia and there is an active bug bounty on ImmuneFi."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Aggregator is it safe" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqWhatIsTransactionSimulation"
                defaultMessage="What is quote simulation?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqWhatIsTransactionSimulationResponse"
                defaultMessage="Aggregators sometimes fail or give you less than they said they would. This of course, sucks, but you can forget about that while using Balmy's Meta Aggregator!{br}{br}By leveraging the power of Universal Approvals we are able to validate (with on-chain simulation) that all quotes provided by the price sources are valid! We verify that they won't fail, and that you are REALLY going to get the best price available.{br}{br}Additionally, we will show how your balances will change when submitting the transaction so that you can be 100% sure that you will get what you expect."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Aggregator what is quote simulation" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="faqWhatIsBuyOrders" defaultMessage="What are buy orders?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqWhatIsBuyOrdersResponse"
                defaultMessage="Sometimes you don't want to sell tokens, but you want to buy exactly a certain amount. For example, instead of selling 1000 USDC for ETH, you might instead want to buy 1 ETH with USDC.{br}{br}Most aggregators don't offer this feature, so we will show you those who do, and try to estimate a “buy order” on those who don't"
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Aggregator what are buy orders" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="faqWhatIsSwapAndTransfer" defaultMessage="What is swap and transfer?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqWhatIsSwapAndTransferResponse"
                defaultMessage="Sometimes you want to swap some tokens and then send it to another address. It can be annoying to execute two different transactions.{br}{br}With our Meta Aggregator, you can do it all in one transaction!"
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Aggregator what is swap and transfer" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="faqHavingIssues" defaultMessage="I'm having issues, what can I do?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqHavingIssuesResponse"
                defaultMessage="Please help us improve by sharing your feedback on the Feedback tab, or pinging us on "
              />
              <Link href="https://discord.com/channels/871887207202455584/871887788637839401" target="_blank">
                <FormattedMessage description="here" defaultMessage="Discord." />
              </Link>
            </StyledAnswer>
            <ThumbsSatisfaction id="Aggregator im having issues" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
      </ContainerBox>
    </StyledContainer>
  );
};

export default AggregatorFAQ;
