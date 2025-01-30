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

const TierFAQ = () => {
  const { trackEvent } = useAnalytics();

  const onFeedbackClick = ({ id, value: helpfull }: { id: string; value: boolean }) => {
    trackEvent(`FAQ ${id} was usefull`, { helpfull });
  };

  return (
    <StyledContainer flexDirection="column" gap={8} alignSelf="center">
      <Typography variant="h4Bold" textAlign="center">
        <FormattedMessage description="tier-view.faq.title" defaultMessage="Tier Frequently Asked Questions" />
      </Typography>
      <ContainerBox flexDirection="column" gap={4}>
        <Accordion>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="tier-view.faq.what-is-tier"
                defaultMessage="What is the Tier system for?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="tier-view.faq.what-is-tier-response"
                defaultMessage="The Tier system is designed to make your journey with Balmy both more rewarding and enjoyable. As you progress through tiers, you'll unlock increasing benefits while creating a stronger community. We believe great products are meant to be shared, which is why we want you to bring your friends along on this journey of financial freedom."
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Tier - What is Tiers?" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="tier-view.faq.tier-progress"
                defaultMessage="How do I progress through Balmy's tier system?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="tier-view.faq.tier-progress-response"
                defaultMessage="Advancing through Balmy's tiers involves completing specific tasks related to trading, one-click upgrades,  referrals, and community engagement. Each tier has its own requirements that you can track in your profile."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Tier - Tier Progress" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="tier-view.faq.referrals"
                defaultMessage="When does a referral count as active?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="tier-view.faq.referrals-response"
                defaultMessage="A referral becomes active when your referred friend deposits at least $100 in Earn Strategies and maintains that deposit for a minimum of 48 hours."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Tier - Referral" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="tier-view.faq.superchain-networks"
                defaultMessage="Why do only certain networks count towards tier progression?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="tier-view.faq.superchain-networks-response"
                defaultMessage="During this early access, we're focusing on Superchain networks thanks to the incredible support we've received from the Optimism Collective throughout our journey."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Tier - Tier Progression" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="tier-view.faq.universal-authorization"
                defaultMessage="Why must I use Universal Authorization for my swaps to count?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="tier-view.faq.universal-authorization-response"
                defaultMessage="Universal Authorization not only provides enhanced security by reducing authorization-related risks, but it also allows us to reliably track your trading activity. This ensures accurate and fair tier progression for all users."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Tier - Universal Authorization" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
        <Accordion disableGutters>
          <AccordionSummary>
            <StyledQuestion>
              <FormattedMessage
                description="tier-view.faq.not-universal-authorization"
                defaultMessage="What happens to my existing swap volume if I haven't been using Universal Authorization?"
              />
            </StyledQuestion>
          </AccordionSummary>
          <AccordionDetails>
            <StyledAnswer>
              <FormattedMessage
                description="tier-view.faq.not-universal-authorization-response"
                defaultMessage="Universal Authorization not only provides enhanced security by reducing authorization-related risks, but it also allows us to reliably track your trading activity. This ensures accurate and fair tier progression for all users."
                values={{
                  p: (chunks: React.ReactNode) => <p>{chunks}</p>,
                  br: <br />,
                }}
              />
            </StyledAnswer>
            <ThumbsSatisfaction id="Tier - Not Universal Authorization" onClickOption={onFeedbackClick} />
          </AccordionDetails>
        </Accordion>
      </ContainerBox>
    </StyledContainer>
  );
};

export default TierFAQ;
