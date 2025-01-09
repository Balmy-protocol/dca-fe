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

const EarnFAQ = () => {
  const { trackEvent } = useAnalytics();

  const onFeedbackClick = ({ id, value: helpfull }: { id: string; value: boolean }) => {
    trackEvent(`FAQ ${id} was usefull`, { helpfull });
  };

  return (
    <StyledContainer flexDirection="column" gap={8} alignSelf="center">
      <Typography variant="h4Bold" textAlign="center">
        <FormattedMessage description="earnFaqTitle" defaultMessage="Balmy’s Earn Frequently Asked Questions" />
      </Typography>
      <ContainerBox flexDirection="column" gap={4}>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="faqWhatIsEarn" defaultMessage="What is Earn Guardian?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqWhatIsEarnResponse"
                defaultMessage="Earn Guardian is your extra layer of security when you're earning yield through our platform. With security professionals and threat detection tools watching over protocols, you’re adding protection not just to your investments but also to the underlying platforms. We bridge the gap between the latest security practices and you. Choose a Guardian and turn your earn-yield experience into a safer journey!"
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Earn - What is Earn Guardian?" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="faqHowDoesGuardianWork" defaultMessage="How does Earn Guardian work?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqHowDoesGuardianWorkResponse"
                defaultMessage="Guardians are constantly monitoring protocols you choose to generate yield on, and if they spot any suspicious behavior involving that protocol, they can pull your funds out of harm's way into Balmy's vault."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Earn - How Does Guardian Work" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="faqChooseOwnGuardian" defaultMessage="Can I choose my own Guardian?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqChooseOwnGuardianResponse"
                defaultMessage="Absolutely! You can choose a Guardian from our list. Each Guardian comes with their own history, description, and fees, so you can pick the one that suits you best. Or, if you prefer, you can opt-out and use no Guardian at all."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Earn - Choose Own Guardian" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqGuardianDetectAttacks"
                defaultMessage="What happens if a Guardian detects an attack?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqGuardianDetectAttacksResponse"
                defaultMessage="If a Guardian detects an attack, they'll move your funds to Balmy's vault, keeping them safe from harm. Once this happens, if the attack gets confirmed and the Guardian had a rescue fee in place, you'll get the funds back, minus the fee (if it applies). Please note that Guardians operate on a best-effort basis, meaning they’ll do their utmost to keep your funds safe as they are incentivized to do so."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Earn - Guardian Detects Attack" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqGuardianMistake"
                defaultMessage="What if the Guardian makes a mistake?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqGuardianMistakeResponse"
                defaultMessage="If it turns out to be a false positive, your funds will be redeposited to continue earning yield. We're all about making sure your assets are protected, but we acknowledge that nothing is 100% foolproof. Still, we believe that having a Guardian is a massive leap from having no protection at all."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Earn - Guardian Mistake" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqPartialRescue"
                defaultMessage="What happens when only a partial rescue can be executed?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqPartialRescueResponse"
                defaultMessage="Guardians will always try to save everything they can. Sometimes though it just may not be possible to get the whole amount. When that happens, the Guardian will save as much as they can so even in the worst-case scenarios part of your assets can still be protected and recovered."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Earn - Partial Rescue" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage description="faqFees" defaultMessage="What fees are involved with Earn Guardian?" />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqFeesResponse"
                defaultMessage="Guardians can set various fees, including: deposit fees, withdrawal fees, performance fees (a share of the profit made by users' yield), and rescue fees (a portion of the funds saved from an attack). We'll always be transparent about any fees, so you'll know exactly what you're getting into."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Earn - Fees Involved" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqFundsSafeGuardian"
                defaultMessage="How do I know my funds are safe with a Guardian?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqFundsSafeGuardianResponse"
                defaultMessage="Guardians will never hold your funds directly. The smart contracts only allow the Guardians to move funds from the yield-earning protocol into Balmy's vault and vice versa."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Earn - Funds Safe Guardian" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqCancelProtection"
                defaultMessage="Can I cancel my Guardian protection?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqCancelProtectionResponse"
                defaultMessage="Yes, you can opt out of Guardian protection at any time. Just remember, doing so means you won't have that extra layer of security watching over your funds. To cancel, you'll need to withdraw your funds from the protected vault and then deposit them into a vault without a Guardian."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Earn - Cancel Protection" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="faqFundsAlwaysSafe"
                defaultMessage="Is there a guarantee that my funds will always be safe?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="faqFundsAlwaysSafeResponse"
                defaultMessage="Earn Guardian operates on a best-effort basis, meaning Guardians will do their utmost to keep your funds safe as they are incentivized to do so."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Earn - Funds Always Safe" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
      </ContainerBox>
    </StyledContainer>
  );
};

export default EarnFAQ;
