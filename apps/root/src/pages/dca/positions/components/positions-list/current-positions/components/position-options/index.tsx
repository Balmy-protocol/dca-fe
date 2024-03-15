import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from '@common/mocks/tokens';
import { DISABLED_YIELD_WITHDRAWS } from '@constants';
import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';
import { useAppDispatch } from '@state/hooks';
import { setPosition } from '@state/position-details/actions';
import { Position, Token } from 'common-types';
import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import {
  ChartSquareIcon,
  KeyboardArrowRightIcon,
  Link,
  MoneysIcon,
  MoreVertIcon,
  OptionsMenu,
  OptionsMenuOption,
  OptionsMenuOptionType,
  Typography,
  WalletMoneyIcon,
} from 'ui-library';

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface PositionOptionsProps {
  position: PositionProp;
  disabled: boolean;
  onTerminate: (position: Position) => void;
  handleOnWithdraw: (useProtocolToken: boolean) => void;
  hasSignSupport: boolean;
  showSwitchAction: boolean;
}

const PositionOptions = ({
  position,
  disabled,
  onTerminate,
  handleOnWithdraw,
  hasSignSupport,
  showSwitchAction,
}: PositionOptionsProps) => {
  const { toWithdraw, chainId, pendingTransaction } = position;
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();
  const trackEvent = useTrackEvent();
  const intl = useIntl();
  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);

  const onViewDetails = () => {
    dispatch(setPosition(undefined));
    pushToHistory(`/${chainId}/positions/${position.version}/${position.positionId}`);
    trackEvent('DCA - Position List - View details');
  };

  const handleTerminate = () => {
    onTerminate(position);
    trackEvent('DCA - Position List - Terminate');
  };

  const fromHasYield = !!position.from.underlyingTokens.length;
  const toHasYield = !!position.to.underlyingTokens.length;

  const disabledWithdraw =
    disabled || DISABLED_YIELD_WITHDRAWS.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '');

  const disabledTerminate =
    disabledWithdraw ||
    DISABLED_YIELD_WITHDRAWS.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '');

  const options = React.useMemo<OptionsMenuOption[]>(() => {
    const viewPositionOption: OptionsMenuOption = {
      label: (
        <Link
          href={`/${chainId}/positions/${position.version}/${position.positionId}`}
          underline="none"
          color="inherit"
          onClick={(e) => e.preventDefault()}
        >
          <Typography variant="bodySmall">
            <FormattedMessage description="viewPosition" defaultMessage="View position" />
          </Typography>
        </Link>
      ),
      onClick: onViewDetails,
      disabled,
      type: OptionsMenuOptionType.option,
      control: <KeyboardArrowRightIcon />,
      icon: <ChartSquareIcon />,
    };

    const operateOptions: OptionsMenuOption[] =
      toWithdraw.amount > 0n
        ? [
            { type: OptionsMenuOptionType.divider },
            {
              type: OptionsMenuOptionType.option,
              label: intl.formatMessage(
                defineMessage({
                  description: 'withdrawToken',
                  defaultMessage: 'Withdraw {token}',
                }),
                {
                  token:
                    hasSignSupport || position.to.address !== PROTOCOL_TOKEN_ADDRESS
                      ? position.to.symbol
                      : wrappedProtocolToken.symbol,
                }
              ),
              onClick: () => handleOnWithdraw(hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS),
              disabled: disabled || showSwitchAction || disabledWithdraw,
              icon: <MoneysIcon />,
            },
            ...(hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS
              ? [
                  {
                    type: OptionsMenuOptionType.option,
                    label: intl.formatMessage(
                      defineMessage({
                        description: 'withdrawWrapped',
                        defaultMessage: 'Withdraw {wrappedProtocolToken}',
                      }),
                      {
                        wrappedProtocolToken: wrappedProtocolToken.symbol,
                      }
                    ),
                    onClick: () => handleOnWithdraw(false),
                    disabled: disabled || showSwitchAction || disabledWithdraw,
                    icon: <MoneysIcon />,
                  },
                ]
              : []),
          ]
        : [];

    const terminateOption: OptionsMenuOption = {
      onClick: handleTerminate,
      disabled: disabled || showSwitchAction || disabledTerminate,
      label: intl.formatMessage(
        defineMessage({
          description: 'terminate position',
          defaultMessage: 'Withdraw and close position',
        })
      ),
      type: OptionsMenuOptionType.option,
      color: 'error',
      icon: <WalletMoneyIcon color="error" />,
    };

    return [viewPositionOption, ...operateOptions, { type: OptionsMenuOptionType.divider }, terminateOption];
  }, []);

  return (
    <OptionsMenu
      mainDisplay={<MoreVertIcon />}
      options={options}
      blockMenuOpen={!!pendingTransaction}
      showEndIcon={false}
    />
  );
};

export default PositionOptions;
