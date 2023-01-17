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
          <FormattedMessage description="faqWhatIs" defaultMessage="What is Mean Finance Meta Aggregator?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage description="faqWhatIsResponse" defaultMessage="It's an aggregator of DEX Aggregators" />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqWhatIs" defaultMessage="Does Mean Finance charge a fee for a swap?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsResponse"
            defaultMessage="We take 0 fees from any swap that you make through Mean Finance. You will get all the same prices as you would using the specific Dex/Dex Aggregator from their application."
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
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="faqWhatIs" defaultMessage="How safe is Mean Finance Meta Aggregator?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsResponse"
            defaultMessage="You use the smart contracts of the Dex/Dex Aggregator that you are going to swap with, that means you get the same security you would as using the specific Dex/Dex Aggregator from their application."
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
  </StyledFAQContainer>
);

export default AggregatorFAQ;
