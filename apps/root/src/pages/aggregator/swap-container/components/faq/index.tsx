import React from 'react';
import {
  Typography,
  LinkComponent,
  Accordion as MuiAccordion,
  AccordionProps,
  AccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  AccordionSummaryProps,
  ArrowForwardIosSharp as ArrowForwardIosSharpIcon,
} from 'ui-library';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const StyledFAQContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledLink = styled(LinkComponent)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
  ({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
  })
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon />} {...props} />
))(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AggregatorFAQ = () => (
  <StyledFAQContainer>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqWhatIs" defaultMessage="What is Mean Finance's Meta Aggregator?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsResponse"
            defaultMessage="You've probably heard many applications claim they offer the best prices: well, now you can be sure! We will query all the best aggregators at the same time so you don't have to, and you will be able to choose the one that best fits your needs"
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqFees" defaultMessage="Do you take any fees?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqFeesResponse"
            defaultMessage="We don't add any extra fees at all. You are getting exactly the same prices as if you would have interacted with the aggregators directly.{br}{br}Some aggregators support revenue sharing so we might get some part of their fee, but this is no extra charge to you."
            values={{
              p: (chunks: React.ReactNode) => <p>{chunks}</p>,
              br: <br />,
            }}
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqIsSafe" defaultMessage="Is it safe?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqIsSafeResponsePartOne"
            defaultMessage="Our smart contracts have been built to leverage the power of "
          />
          <StyledLink
            href="https://mean-finance.medium.com/approve-now-and-for-the-last-time-finally-8717dcde4e87"
            target="_blank"
          >
            <FormattedMessage description="universal approvals" defaultMessage="Universal Approvals" />
          </StyledLink>
          <FormattedMessage
            description="faqIsSafeResponsePartTwo"
            defaultMessage="to minimize any possible exposure to them. Furthermore, by leveraging Universal Approvals we can simulate your trade on any network you are on, so you can now exactly what is going to happen once the swap gets executed! Last, our smart contracts have been audited by Omniscia and there is an active bug bounty on ImmuneFi."
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqWhatIsTransactionSimulation" defaultMessage="What is quote simulation?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsTransactionSimulationResponse"
            defaultMessage="Aggregators sometimes fail or give you less than they said they would. This of course, sucks, but you can forget about that while using Mean's Meta Aggregator!{br}{br}By leveraging the power of Universal Approvals we are able to validate (with on-chain simulation) that all quotes provided by the price sources are valid! We verify that they won't fail, and that you are REALLY going to get the best price available.{br}{br}Additionally, we will show how your balances will change when submitting the transaction so that you can be 100% sure that you will get what you expect."
            values={{
              p: (chunks: React.ReactNode) => <p>{chunks}</p>,
              br: <br />,
            }}
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqWhatIsBuyOrders" defaultMessage="What are buy orders?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsBuyOrdersResponse"
            defaultMessage="Sometimes you don't want to sell tokens, but you want to buy exactly a certain amount. For example, instead of selling 1000 USDC for ETH, you might instead want to buy 1 ETH with USDC.{br}{br}Most aggregators don't offer this feature, so we will show you those who do, and try to estimate a “buy order” on those who don't"
            values={{
              p: (chunks: React.ReactNode) => <p>{chunks}</p>,
              br: <br />,
            }}
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqWhatIsSwapAndTransfer" defaultMessage="What is swap and transfer?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsSwapAndTransferResponse"
            defaultMessage="Sometimes you want to swap some tokens and then send it to another address. It can be annoying to execute two different transactions.{br}{br}With our Meta Aggregator, you can do it all in one transaction!"
            values={{
              p: (chunks: React.ReactNode) => <p>{chunks}</p>,
              br: <br />,
            }}
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqHavingIssues" defaultMessage="I'm having issues, what can I do?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqHavingIssuesResponse"
            defaultMessage="Please help us improve by sharing your feedback on the Feedback tab, or pinging us on "
          />
          <StyledLink href="https://discord.com/channels/871887207202455584/871887788637839401" target="_blank">
            <FormattedMessage description="here" defaultMessage="Discord." />
          </StyledLink>
        </Typography>
      </AccordionDetails>
    </Accordion>
  </StyledFAQContainer>
);

export default AggregatorFAQ;
