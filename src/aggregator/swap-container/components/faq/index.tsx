import React from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const StyledFAQContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-top: 50px;
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
            defaultMessage="You’ve probably heard many DEXes or aggregators claim that they offer the best prices. Well, now you can be sure. We will query all of them at the same time so you don’t have to, and you will be able to choose the one that best fits your needs"
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqWhatIs" defaultMessage="Do you take any fees?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsResponse"
            defaultMessage="We don’t take any fees at all. You are getting exactly the same prices as if you would have interacted with the aggregators directly"
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqWhatIs" defaultMessage="Is it safe?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsResponse"
            defaultMessage="You are having exactly the same experience as if you would have used the different aggregators directly. We haven’t built any smart contracts on top of theirs, so there is no added risk. At the same time, we offer transaction simulations on some networks."
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqWhatIs" defaultMessage="What is transaction simulation?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsResponse"
            defaultMessage="All swaps are executed directly to each Dex/Dex Aggregator contract. This means that if any of the aggregators you use does an airdrop in the future, all swaps made Mean Finance would make you eligible for their airdrop."
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage
            description="faqWhatIs"
            defaultMessage="Will I be eligible for airdrops using Mean Finance Meta Aggregator?"
          />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsResponse"
            defaultMessage="All swaps are executed directly to each Dex/Dex Aggregator contract. This means that if any of the aggregators you use does an airdrop in the future, all swaps made Mean Finance would make you eligible for their airdrop."
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
  </StyledFAQContainer>
);

export default AggregatorFAQ;
