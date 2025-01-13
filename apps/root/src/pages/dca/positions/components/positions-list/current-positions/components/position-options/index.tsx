import { PROTOCOL_TOKEN_ADDRESS, getWrappedProtocolToken } from '@common/mocks/tokens';
import { DISABLED_YIELD_WITHDRAWS } from '@constants';
import usePushToHistory from '@hooks/usePushToHistory';
import useAnalytics from '@hooks/useAnalytics';
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
  MoreVertButtonIcon,
  OptionsMenuItems,
  OptionsMenuOption,
  OptionsMenuOptionType,
  WalletMoneyIcon,
} from 'ui-library';

interface PositionProp extends DistributiveOmit<Position, 'from' | 'to'> {
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
  walletIsConnected: boolean;
}

const PositionOptions = ({
  position,
  disabled,
  onTerminate,
  handleOnWithdraw,
  hasSignSupport,
  showSwitchAction,
  walletIsConnected,
}: PositionOptionsProps) => {
  const { toWithdraw, chainId, pendingTransaction } = position;
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();
  const { trackEvent } = useAnalytics();
  const intl = useIntl();
  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const onViewDetails = () => {
    dispatch(setPosition(undefined));
    pushToHistory(`/invest/positions/${chainId}/${position.version}/${position.positionId}`);
    trackEvent('DCA - Position List - View details');
  };

  const handleTerminate = () => {
    onTerminate(position);
    trackEvent('DCA - Position List - Terminate');
  };

  const fromHasYield = !!position.from.underlyingTokens.length;
  const toHasYield = !!position.to.underlyingTokens.length;

  const disabledWithdraw =
    disabled ||
    !walletIsConnected ||
    DISABLED_YIELD_WITHDRAWS.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '');

  const disabledTerminate =
    disabledWithdraw ||
    !walletIsConnected ||
    DISABLED_YIELD_WITHDRAWS.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '');

  const options = React.useMemo<OptionsMenuOption[]>(() => {
    const viewPositionOption: OptionsMenuOption = {
      label: (
        <Link
          href={`/invest/positions/${chainId}/${position.version}/${position.positionId}`}
          underline="none"
          color="inherit"
          onClick={(e) => e.preventDefault()}
        >
          <FormattedMessage description="viewPosition" defaultMessage="View position" />
        </Link>
      ),
      onClick: onViewDetails,
      disabled,
      type: OptionsMenuOptionType.option,
      control: <KeyboardArrowRightIcon />,
      Icon: ChartSquareIcon,
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
              Icon: MoneysIcon,
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
                    Icon: MoneysIcon,
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
      Icon: WalletMoneyIcon,
    };

    return [viewPositionOption, ...operateOptions, { type: OptionsMenuOptionType.divider }, terminateOption];
  }, [showSwitchAction, disabled, position, handleOnWithdraw, handleTerminate, hasSignSupport]);

  return (
    <>
      <MoreVertButtonIcon
        onClick={(e) => setAnchorEl(e.currentTarget)}
        $isActive={!!anchorEl}
        disabled={!!pendingTransaction}
        fontSize="large"
      />
      <OptionsMenuItems options={options} anchorEl={anchorEl} handleClose={() => setAnchorEl(null)} />
    </>
  );
};

export default PositionOptions;
