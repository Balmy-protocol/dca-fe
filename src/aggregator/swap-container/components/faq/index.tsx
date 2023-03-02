import React from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { Link } from '@mui/material';

const StyledFAQContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-top: 50px;
`;

const StyledLink = styled(Link)`
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
    <Typography variant="h4" sx={{ alignSelf: 'center', marginBottom: '10px' }}>
      <FormattedMessage description="faq" defaultMessage="FAQ" />
    </Typography>

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
            defaultMessage="You've probably heard many DEXes or aggregators claim that they offer the best prices. Well, now you can be sure. We will query all of them at the same time so you don't have to, and you will be able to choose the one that best fits your needs"
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
            defaultMessage="We don't add any extra fees at all. You are getting exactly the same prices as if you would have interacted with the aggregators directly.{br}{br}Some aggregators support revenue sharing so we might get some part of their fee, but this is no extra charge to you.{br}{br}To clarify, these aggregators are not prioritized in any way, you can choose how to sort the results by yourself."
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
            description="faqIsSafeResponse"
            defaultMessage="You are having exactly the same experience as if you would have used the different aggregators directly. We haven't built any smart contracts on top of theirs, so there is no added risk. At the same time, we offer transaction simulations on some networks."
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage
            description="faqWhatIsTransactionSimulation"
            defaultMessage="What is transaction simulation?"
          />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsTransactionSimulationResponse"
            defaultMessage="Aggregators sometimes fail or give you less than they said they would. This of course sucks!{br}{br}Well when you are using Mean's Meta Aggregator, we will simulate your transactions to make sure it doesn't fail when you submit it. And, at the same time, we will show you the how your balances will change so that can be 100% sure that you'll get what you expect!{br}{br}The balance changes are currently available only on:{br}{br}- Ethereum{br}{br}- Polygon{br}{br}We will be adding more soon"
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
            defaultMessage="Please help us improve by sharing your feedback on the Feedback tab, or pinging us on Discord"
          />
          <StyledLink href="https://discord.com/channels/871887207202455584/871887788637839401" target="_blank">
            <FormattedMessage description="here" defaultMessage="here." />
          </StyledLink>
        </Typography>
      </AccordionDetails>
    </Accordion>
  </StyledFAQContainer>
);

export default AggregatorFAQ;
