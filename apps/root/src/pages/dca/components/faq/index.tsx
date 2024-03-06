import React from 'react';
import { Typography, Accordion, AccordionDetails, AccordionSummary, ContainerBox, colors } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const StyledQuestion = styled(Typography).attrs({ variant: 'h6' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo2};
`}
`;

const StyledAnswer = styled(Typography).attrs({ variant: 'body' })`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo3};
`}
`;

const DcaFAQ = () => (
  <ContainerBox flexDirection="column" gap={8}>
    <Typography variant="h4" fontWeight={700} textAlign="center">
      <FormattedMessage description="dcaFaqTitle" defaultMessage="Balmy’s DCA Frequently Asked Questions" />
    </Typography>
    <ContainerBox flexDirection="column">
      <Accordion>
        <AccordionSummary>
          <StyledQuestion>
            <FormattedMessage description="faqWhatIsMeanFinance" defaultMessage="What is Mean Finance?" />
          </StyledQuestion>
        </AccordionSummary>
        <AccordionDetails>
          <StyledAnswer>
            <FormattedMessage
              description="faqWhatIsMeanFinanceResponse"
              defaultMessage="Mean Finance is the state-of-the-art DCA protocol. It enables you to set up actions like “Swap 10 USDC for WBTC every day, for 30 days”. You can create these actions between almost all ERC20 tokens, in the frequency of your choosing. These token swaps will then occur regardless of the asset's price and at regular intervals, reducing the impact of volatility on your investment."
            />
          </StyledAnswer>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary>
          <StyledQuestion>
            <FormattedMessage description="faqHowDoesMeanFinanceWork" defaultMessage="How does Mean Finance work?" />
          </StyledQuestion>
        </AccordionSummary>
        <AccordionDetails>
          <StyledAnswer>
            <FormattedMessage
              description="faqHowDoesMeanFinanceWorkResponse"
              defaultMessage="When you set up a position, you are creating an intention to swap one token for the other. Then, some external user can come and execute the swap for you, honoring the desired frequency of course. When they execute your swap, you are charged a 0.6% fee on the amount that was swapped. This fee is then split between Mean Finance and the swapper. Since you don’t have to execute the swap by yourself, you don’t need to pay any gas."
            />
          </StyledAnswer>
        </AccordionDetails>
      </Accordion>
    </ContainerBox>
  </ContainerBox>
);

export default DcaFAQ;
