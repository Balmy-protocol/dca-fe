import { generateCalendarLinks, LinkType } from '@common/utils/calendar/calendar';
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
}
const generateCalendarInfo = (
  {
    position: { from, to, swapInterval, remainingSwaps, chainId, positionId, version },
  }: AddPositionToCalendarButtonProps,
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
      ? `https://app.balmy.xyz/${chainId}/positions/${version}/${positionId}`
      : 'https://app.balmy.xyz/positions',
  startDate: DateTime.fromMillis(Date.now() + Number(remainingSwaps * swapInterval) * 1000).toISODate(),
  endDate: DateTime.fromMillis(Date.now() + Number(remainingSwaps * swapInterval) * 1000).toISODate(),
});

export const AddPositionToCalendarButton = (partialPosition: AddPositionToCalendarButtonProps) => {
  const intl = useIntl();
  const [anchorWithdrawButton, setAnchorWithdrawButton] = React.useState<null | HTMLElement>(null);

  return (
    <ContainerBox>
      <Button
        variant="outlined"
        onClick={(e) => setAnchorWithdrawButton(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
      >
        <FormattedMessage description="addToContacts" defaultMessage="Add to calendar" />
      </Button>
      <OptionsMenuItems
        options={[
          {
            label: <FormattedMessage description="addToGoogle" defaultMessage="Google Calendar" />,
            type: OptionsMenuOptionType.option,
            Icon: GCalendarIcon,
            onClick: () => generateCalendarLinks(LinkType.Google, generateCalendarInfo(partialPosition, intl)),
          },
          {
            label: <FormattedMessage description="addToApple" defaultMessage="Apple" />,
            Icon: AppleIcon,
            type: OptionsMenuOptionType.option,
            onClick: () => generateCalendarLinks(LinkType.Apple, generateCalendarInfo(partialPosition, intl)),
          },
          {
            label: <FormattedMessage description="addToGoogle" defaultMessage="Outlook" />,
            Icon: OutlookIcon,
            type: OptionsMenuOptionType.option,
            onClick: () => generateCalendarLinks(LinkType.OutlookCom, generateCalendarInfo(partialPosition, intl)),
          },
          {
            label: <FormattedMessage description="addToIcal" defaultMessage="iCal File" />,
            Icon: CalendarMonthIcon,
            type: OptionsMenuOptionType.option,
            onClick: () => generateCalendarLinks(LinkType.ICal, generateCalendarInfo(partialPosition, intl)),
          },
        ]}
        anchorEl={anchorWithdrawButton}
        handleClose={() => setAnchorWithdrawButton(null)}
      />
    </ContainerBox>
  );
};
