import React from 'react';
import {
  Typography,
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

const DcaFAQ = () => {
  const { trackEvent } = useAnalytics();

  const onFeedbackClick = ({ id, value: helpfull }: { id: string; value: boolean }) => {
    trackEvent(`FAQ ${id} was usefull`, { helpfull });
  };

  return (
    <StyledContainer flexDirection="column" gap={8} alignSelf="center">
      <Typography variant="h4Bold" textAlign="center">
        <FormattedMessage description="dcaFaqTitle" defaultMessage="Balmy’s DCA Frequently Asked Questions" />
      </Typography>
      <ContainerBox flexDirection="column" gap={4}>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqWhatIsMeanFinance"
                defaultMessage="What is Dollar Cost Averaging (DCA)?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqWhatIsMeanFinanceResponse"
                defaultMessage="Dollar Cost Averaging (DCA) is an investment strategy where you invest a fixed amount of money at regular intervals, regardless of the asset's price. This strategy helps reduce market volatility and averages your purchase prices over time.{br}{br}Balmy’s Recurring Investment product allows you to customize your investment parameters and automate recurring buys in just a few clicks: 1) Choose the blockchain to use; 2) Choose the token you want to sell and the one you want to buy; 3) Define the total amount you want to sell and the time frame to divide that sale.{br}{br}Moreover, our platform offers advanced features such as yield generation, allowing you to maximize your returns while staying true to your long-term investment goals without the need for constant monitoring."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="DCA what is dca" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqHowDoRecurringInvestments"
                defaultMessage="How do Recurring Investments generate yields on this platform?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqHowDoRecurringInvestmentsResponse"
                defaultMessage="Balmy supports yield generation for idle assets for maximal capital efficiency. We've integrated external platforms so you can generate yields while your Recurring Investments get executed by utilizing various yield sources available in the DeFi ecosystem like Aave, Yearn, and Sonne, among others.{br}{br}To participate in these yield sources, you need to turn on the “Generate yield” button and select the one you prefer. While doing so, your funds will be deposited into your selected platform to generate yield while they wait to be swapped or withdrawn."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="DCA how does yield work" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqIsItSafeYields"
                defaultMessage="Is it safe to enable yield generation while my Recurring Investments are active?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqIsItSafeYieldsResponse"
                defaultMessage="By allowing you to choose your preferred yield-generating platform, we ensure you can make your own risk-reward assessments. Although all the platforms we integrate go through a careful selection process, we strongly recommend you conduct thorough research before selecting a platform for generating a yield on your assets. Please do your own research to make the most informed decision."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="DCA is yield safe" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqCanICancel"
                defaultMessage="Can I cancel my Recurring Investments before they finish, and how does it impact my yields?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqCanICancelResponse"
                defaultMessage="Yes, you have the option to cancel your Recurring Investments before it finishes without any cost. By canceling your Recurring Investments, you would only stop generating yields."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="DCA can i cancel" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqHowIsApy"
                defaultMessage="How is the Annual Percentage Yield (APY) of the tokens of my Recurring Investments calculated?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqHowIsApyResponse"
                defaultMessage="The calculation of the APY of the tokens of your Recurring Investments will depend on how the different yield sources generate yields. For example, if it is a lending market like Aave, it will depend on factors like the demand for loans and the supply of funds from lenders. What we do is bring this information for you expressed as an annual percentage, representing the expected return on your investment."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="DCA how is apy calculated" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqAreThereFees"
                defaultMessage="Are there fees associated with my Recurring Investments and yield generation?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqAreThereFeesResponse"
                defaultMessage="When you're using Recurring Investments and generating yields on Balmy you won't pay any transaction costs on your swaps. Transaction costs are covered by the “swapper” (swappers are market makers that execute swaps and provide the liquidity needed for those swaps).{br}{br}The only charges you'll come across are the protocol fees, which only apply to swapped funds. That is, if you cancel your Recurring Investments and you have funds left to invest, no fee was or will be applied to those funds. The fee on swapped funds is 0.6% and is split between the protocol and the swapper. "
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="DCA are there any fees" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
      </ContainerBox>
    </StyledContainer>
  );
};

export default DcaFAQ;
