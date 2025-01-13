import { generateCalendarLinks, LinkType } from '@common/utils/calendar/calendar';
import useAnalytics from '@hooks/useAnalytics';
import { Position } from 'common-types';
import { DateTime } from 'luxon';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  OptionsMenuOptionType,
  GCalendarIcon,
  AppleIcon,
  OutlookIcon,
  ContainerBox,
  Button,
  KeyboardArrowDownIcon,
  OptionsMenuItems,
  CalendarMonthIcon,
  ButtonProps,
} from 'ui-library';

interface AddPositionToCalendarButtonProps {
  position: {
    chainId?: Position['chainId'];
    from: Nullable<Position['from']>;
    to: Nullable<Position['to']>;
    swapInterval: Position['swapInterval'];
    remainingSwaps: Position['remainingSwaps'];
    positionId?: Position['positionId'];
    version?: Position['version'];
  };
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}
const generateCalendarInfo = (
  {
    from,
    to,
    swapInterval,
    remainingSwaps,
    chainId,
    positionId,
    version,
  }: AddPositionToCalendarButtonProps['position'],
  intl: ReturnType<typeof useIntl>
) => ({
  timeZone: 'UTC',
  name: intl.formatMessage(
    {
      defaultMessage: 'Refill your {from}/{to} recurring investment on Balmy',
      description: 'Calendar event name',
    },
    { from: from?.symbol, to: to?.symbol }
  ),
  description: intl.formatMessage({
    defaultMessage: 'Add funds so your position never ends!',
    description: 'Calendar event description',
  }),
  location:
    chainId && positionId
      ? `https://app.balmy.xyz/invest/positions/${chainId}/${version}/${positionId}`
      : 'https://app.balmy.xyz/invest/positions',
  startDate: DateTime.fromMillis(Date.now() + Number(remainingSwaps * swapInterval) * 1000).toISODate(),
  endDate: DateTime.fromMillis(Date.now() + Number(remainingSwaps * swapInterval) * 1000).toISODate(),
});

export const AddPositionToCalendarButton = ({ position, variant, size }: AddPositionToCalendarButtonProps) => {
  const intl = useIntl();
  const { trackEvent } = useAnalytics();
  const [anchorWithdrawButton, setAnchorWithdrawButton] = React.useState<null | HTMLElement>(null);

  const onClick = (linkType: LinkType) => {
    generateCalendarLinks(linkType, generateCalendarInfo(position, intl));
    setAnchorWithdrawButton(null);
    trackEvent('DCA - Add reminder to calendar', {
      calendarType: linkType,
    });
  };
  return (
    <ContainerBox alignSelf="stretch" justifyContent="center">
      <Button
        variant={variant || 'outlined'}
        onClick={(e) => setAnchorWithdrawButton(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
        fullWidth
        size={size}
      >
        <FormattedMessage description="DcaAddToCalendarButton" defaultMessage="Add to calendar" />
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
    </ContainerBox>
  );
};
