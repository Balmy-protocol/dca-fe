import { generateCalendarLinks, LinkType } from '@common/utils/calendar/calendar';
import useTrackEvent from '@hooks/useTrackEvent';
import { DateTime } from 'luxon';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  colors,
  ContainerBox,
  Modal,
  SPACING,
  Typography,
  BalmyLogoSmallDark,
  DonutShape,
  CoinStar,
  AppleIcon,
  Button,
  CalendarMonthIcon,
  GCalendarIcon,
  KeyboardArrowDownIcon,
  OptionsMenuItems,
  OptionsMenuOptionType,
  OutlookIcon,
} from 'ui-library';

interface GuardianListSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StyledContainer = styled(ContainerBox).attrs({ gap: 6, flexDirection: 'column', alignItems: 'center' })`
  ${({ theme: { spacing } }) => `
    margin-top: ${spacing(12)};
    padding-top: ${spacing(6)};
  `}
`;

const StyledHeader = styled(ContainerBox).attrs({ justifyContent: 'space-between' })`
  background: linear-gradient(180deg, #eadbff 25.13%, rgba(211, 180, 255, 0.8) 100%);
  ${({ theme: { spacing } }) => `
    height: ${spacing(24)};
  `}
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;
`;

const StyledHeaderContent = styled(ContainerBox).attrs({ gap: 3, alignItems: 'center' })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(5)} ${spacing(12)};
  `}
`;

export const validateEmailAddress = (address: string) => {
  const validRegex = RegExp(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/);
  return validRegex.test(address);
};

const generateCalendarInfo = (intl: ReturnType<typeof useIntl>) => ({
  timeZone: 'UTC',
  name: intl.formatMessage({
    defaultMessage: 'Earn Early Access Launch',
    description: 'earn.subscribe.modal.calendar.name',
  }),
  description: intl.formatMessage({
    defaultMessage: "It's time to reclaim your time and grow your crypto portfolio!",
    description: 'earn.subscribe.modal.calendar.description',
  }),
  location: 'https://app.balmy.xyz',
  startDate: DateTime.fromMillis(1736899199000).toISODate(),
  endDate: DateTime.fromMillis(1736899199000).toISODate(),
});

const GuardianListSubscribeModal = ({ isOpen, onClose }: GuardianListSubscribeModalProps) => {
  const intl = useIntl();
  const [anchorWithdrawButton, setAnchorWithdrawButton] = React.useState<null | HTMLElement>(null);
  const trackEvent = useTrackEvent();

  const onClick = (linkType: LinkType) => {
    generateCalendarLinks(linkType, generateCalendarInfo(intl));
    setAnchorWithdrawButton(null);
    trackEvent('Earn - Subscribe to calendar', {
      calendarType: linkType,
    });
  };

  return (
    <Modal open={isOpen} onClose={onClose} showCloseIcon maxWidth="sm">
      <StyledContainer>
        <StyledHeader>
          <StyledHeaderContent>
            <BalmyLogoSmallDark size={SPACING(7)} />
            <ContainerBox alignItems="center">
              <Typography variant="h3Bold" color={({ palette: { mode } }) => colors[mode].accent.primary}>
                <FormattedMessage description="earn.subscribe.modal.title.earn" defaultMessage="Earn's" />
              </Typography>
              <Typography
                variant="h3Bold"
                color={({ palette: { mode } }) => colors[mode].typography.typo1}
                sx={({ spacing }) => ({ paddingLeft: spacing(2) })}
              >
                <FormattedMessage description="earn.subscribe.modal.title" defaultMessage="Early Access" />
              </Typography>
            </ContainerBox>
          </StyledHeaderContent>
          <ContainerBox style={{ position: 'relative' }} justifyContent="end" alignItems="end">
            <div style={{ position: 'absolute' }}>
              <DonutShape width="120px" height="120px" top={SPACING(10)} />
            </div>
            <div style={{ position: 'absolute', bottom: '5px' }}>
              <CoinStar right={SPACING(25)} />
            </div>
          </ContainerBox>
        </StyledHeader>
        <Typography
          variant="bodyRegular"
          textAlign="center"
          color={({ palette: { mode } }) => colors[mode].typography.typo2}
        >
          <FormattedMessage
            description="earn.subscribe.modal.description.closed"
            defaultMessage="Thank you for your interest in Earn's beta program! While early access registration is now closed, we're excited to announce that all beta features will be launching on January 14th.{br}{br}Mark your calendar and get ready to experience the future of decentralized finance, designed with the security and simplicity you deserve.{br}{br}Launch Date: <b>January 14th, 2024</b>"
            values={{
              br: <br />,
              b: (chunks) => <b>{chunks}</b>,
            }}
          />
        </Typography>
        <Button
          variant="contained"
          onClick={(e) => setAnchorWithdrawButton(e.currentTarget)}
          endIcon={<KeyboardArrowDownIcon />}
          fullWidth
          size="large"
        >
          <FormattedMessage
            description="earn.subscribe.modal.calendar.add-to-calendar"
            defaultMessage="Save the date!"
          />
        </Button>
        <OptionsMenuItems
          options={[
            {
              label: <FormattedMessage description="addToGoogle" defaultMessage="Google Calendar" />,
              type: OptionsMenuOptionType.option,
              Icon: GCalendarIcon,
              onClick: () => onClick(LinkType.Google),
            },
            {
              label: <FormattedMessage description="addToApple" defaultMessage="Apple" />,
              Icon: AppleIcon,
              type: OptionsMenuOptionType.option,
              onClick: () => onClick(LinkType.Apple),
            },
            {
              label: <FormattedMessage description="addToGoogle" defaultMessage="Outlook" />,
              Icon: OutlookIcon,
              type: OptionsMenuOptionType.option,
              onClick: () => onClick(LinkType.OutlookCom),
            },
            {
              label: <FormattedMessage description="addToIcal" defaultMessage="iCal File" />,
              Icon: CalendarMonthIcon,
              type: OptionsMenuOptionType.option,
              onClick: () => onClick(LinkType.ICal),
            },
          ]}
          anchorEl={anchorWithdrawButton}
          handleClose={() => setAnchorWithdrawButton(null)}
        />
      </StyledContainer>
    </Modal>
  );
};

export default GuardianListSubscribeModal;
