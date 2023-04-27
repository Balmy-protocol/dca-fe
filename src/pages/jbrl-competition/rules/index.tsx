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

const LeaderboardRules = () => (
  <StyledFAQContainer>
    <Typography variant="h4" sx={{ alignSelf: 'center', marginBottom: '10px' }}>
      <FormattedMessage description="faq" defaultMessage="Rules" />
    </Typography>

    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="jbrlRulesHowToCompete" defaultMessage="How can I compete?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="jbrlRulesHowToCompeteResponse"
            defaultMessage="To compete, you will need to invest a total of 500 jBRL among all your positions. That being said, you can compete with up to 6 positions. Be sure to deploy your positions on the 26 and 27 of April!"
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="jbrlRulesPrizes" defaultMessage="What are the prizes?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="jbrlRulesPrizes"
            defaultMessage="There will be 5 winners, at the end of the competition the top 5 portfolios in terms of net worth will be the ones to get prizes. The prizes will be sent to the winner addresses shortly after the competition ends.{br}{br}1st place 1,500 jBRL{br}2nd place 1250 jBRL{br}3rd place 1000 jBRL{br}4th place 750 jBRL{br}5th place 500 jBRL"
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
          <FormattedMessage description="jbrlRulesWhenStart" defaultMessage="When does it start/end?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="jbrlRulesWhenStartResponse"
            defaultMessage="It starts 26 of April 00:00 UTC and ends 27 May. To participate, you must create your positions from April 26 to 27. The competition ends on the 27 of May."
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage
            description="jbrlRulesCanModify"
            defaultMessage="Can I modify my positions once deployed?"
          />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="jbrlRulesCanModifyResponse"
            defaultMessage="You shall not modify the parameters of your positions once you have deployed them. Nor can positions be transferred. If a position get modified, it will not be taken into account.{br}{br}So plan your positions well before deploying them."
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
          <FormattedMessage
            description="jbrlRulesCanWithdraw"
            defaultMessage="Can I add or withdraw funds from my positions?"
          />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="faqWhatIsTransactionSimulationResponse"
            defaultMessage="No, you should not withdraw funds from your positions or add more jBRL to your positions. Funds that are withdrawn from positions will not be taken into account."
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="jbrlRulesCanWithdraw" defaultMessage="How many positions can I use?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="jbrlRulesCanWithdrawResponse"
            defaultMessage="You’ve got a total of 6 positions at your disposal, diversify your portfolio using various strategies. You can either decide to invest your 500 jBRL on one position, or diversify your portfolio using more positions (maximum 6 positions). Combinations are endless.  "
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage
            description="jbrlRulesCanYield"
            defaultMessage="Can I enable “generate yield” option on my positions?"
          />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="jbrlRulesCanYieldResponse"
            defaultMessage="Yes, you can opt in to generate yield with the tokens you are buying, just remember that The safety of the funds will be up to the selected platform, so please do your own research to perform an educated risk/reward assessment. That being said, enabling generating yield could be a game winning decision."
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion disableGutters>
      <AccordionSummary>
        <Typography>
          <FormattedMessage description="jbrlRulesHowMuchInvest" defaultMessage="How much jBRL can I invest?" />
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          <FormattedMessage
            description="jbrlRulesHowMuchInvestResponse"
            defaultMessage="To participate, you should invest a total of 500 jBRL among all your positions. You don’t need to fill any form."
          />
        </Typography>
      </AccordionDetails>
    </Accordion>
  </StyledFAQContainer>
);

export default LeaderboardRules;
