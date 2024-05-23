import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { ConnectedWallet, NFTData, Position, TokenListId, TransactionTypes } from '@types';
import {
  IconButton,
  Menu,
  MenuItem,
  MoreVertIcon,
  createStyles,
  Button,
  Typography,
  ContainerBox,
  OptionsMenuOptionType,
  OptionsMenuItems,
  KeyboardArrowDownIcon,
  Link,
} from 'ui-library';
import { withStyles } from 'tss-react/mui';
import {
  LATEST_VERSION,
  shouldEnableFrequency,
  DISABLED_YIELD_WITHDRAWS,
  DCA_PAIR_BLACKLIST,
  CHAIN_CHANGING_WALLETS_WITH_REFRESH,
  PERMISSIONS,
  SUPPORTED_NETWORKS_DCA,
} from '@constants';
import { getProtocolToken, getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import TerminateModal from '@common/components/terminate-modal';
import ModifySettingsModal from '@common/components/modify-settings-modal';
import NFTModal from '../view-nft-modal';

import useSupportsSigning from '@hooks/useSupportsSigning';
import useWalletNetwork from '@hooks/useWalletNetwork';
import useTrackEvent from '@hooks/useTrackEvent';
import { useAppDispatch } from '@state/hooks';
import { useTransactionAdder } from '@state/transactions/hooks';
import useTransactionModal from '@hooks/useTransactionModal';
import useErrorService from '@hooks/useErrorService';
import usePositionService from '@hooks/usePositionService';
import TransferPositionModal from '../transfer-position-modal';
import { initializeModifyRateSettings } from '@state/modify-rate-settings/actions';
import { Address, Transaction, formatUnits } from 'viem';
import { shouldTrackError } from '@common/utils/errors';
import useDcaTokens from '@hooks/useDcaTokens';

const StyledMenu = withStyles(Menu, () =>
  createStyles({
    paper: {
      borderRadius: '8px',
    },
  })
);

interface PositionSummaryControlsProps {
  pendingTransaction: string | null;
  position: Position;
  ownerWallet: ConnectedWallet;
}

const PositionSummaryControls = ({ pendingTransaction, position, ownerWallet }: PositionSummaryControlsProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [anchorWithdrawButton, setAnchorWithdrawButton] = React.useState<null | HTMLElement>(null);
  const fromHasYield = !!position.from.underlyingTokens.length;
  const toHasYield = !!position.to.underlyingTokens.length;
  const isPending = pendingTransaction !== null;
  const wrappedProtocolToken = getWrappedProtocolToken(position.chainId);
  const protocolToken = getProtocolToken(position.chainId);
  const hasSignSupport = useSupportsSigning();
  const [connectedNetwork] = useWalletNetwork(position.user);
  const trackEvent = useTrackEvent();
  const dispatch = useAppDispatch();
  const [showTerminateModal, setShowTerminateModal] = React.useState(false);
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [showModifyRateSettingsModal, setShowModifyRateSettingsModal] = React.useState(false);
  const [showNFTModal, setShowNFTModal] = React.useState(false);
  const [nftData, setNFTData] = React.useState<NFTData | null>(null);
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const addTransaction = useTransactionAdder();
  const positionService = usePositionService();
  const errorService = useErrorService();
  const intl = useIntl();
  const dcaTokens = useDcaTokens(position.chainId, true);
  const [csvUrl, setCsvUrl] = React.useState('');
  const downloadCsvLinkRef = React.useRef<HTMLAnchorElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isOnNetwork = connectedNetwork?.chainId === position.chainId;

  const showSwitchAction = !isOnNetwork && CHAIN_CHANGING_WALLETS_WITH_REFRESH.includes(ownerWallet.providerInfo.name);

  const disabled = showSwitchAction;

  const showExtendedFunctions =
    position.version === LATEST_VERSION &&
    !DCA_PAIR_BLACKLIST.includes(position.pairId) &&
    !!dcaTokens[`${position.chainId}-${position.from.address}` as TokenListId] &&
    (!fromHasYield ||
      !!dcaTokens[`${position.chainId}-${position.from.underlyingTokens[0]?.address}` as TokenListId]) &&
    (!toHasYield || !!dcaTokens[`${position.chainId}-${position.to.underlyingTokens[0]?.address}` as TokenListId]) &&
    shouldEnableFrequency(
      position.swapInterval.toString(),
      position.from.address,
      position.to.address,
      position.chainId
    );

  const disabledWithdraw =
    disabled || DISABLED_YIELD_WITHDRAWS.includes((toHasYield && position.to.underlyingTokens[0]?.address) || '');
  const disabledWithdrawFunds =
    disabled || DISABLED_YIELD_WITHDRAWS.includes((fromHasYield && position.from.underlyingTokens[0]?.address) || '');

  const disableModifyPosition = isPending || disabled || !SUPPORTED_NETWORKS_DCA.includes(position.chainId);
  const shouldShowWithdrawWrappedToken =
    position.toWithdraw.amount > 0n && hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS;
  const shouldDisableArrow =
    isPending || disabled || (!shouldShowWithdrawWrappedToken && position.remainingLiquidity.amount <= 0n);

  React.useEffect(() => {
    let downloadUrl: string | null = null;
    const fetchPositionCsv = async () => {
      const rawContent = await positionService.fetchPositionSwapsForCSV(position);
      const blob = new Blob([rawContent], { type: 'text/csv' });

      downloadUrl = URL.createObjectURL(blob);
      setCsvUrl(downloadUrl);
    };

    try {
      void fetchPositionCsv();
    } catch (e) {
      console.error('Error fetching CSV content:', e);
    }

    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, []);

  const onTerminate = () => {
    setShowTerminateModal(true);
    trackEvent('DCA - Position details - Show terminate modal');
  };

  const onModifyRate = () => {
    const remainingLiquidityToUse = position.rate.amount * position.remainingSwaps;

    dispatch(
      initializeModifyRateSettings({
        fromValue: formatUnits(remainingLiquidityToUse, position.from.decimals),
        rate: formatUnits(position.rate.amount, position.from.decimals),
        frequencyValue: position.remainingSwaps.toString(),
      })
    );
    trackEvent('DCA - Position details - Show add funds modal');
    setShowModifyRateSettingsModal(true);
  };

  const onTransfer = () => {
    setShowTransferModal(true);
    trackEvent('DCA - Position details - Show transfer modal');
  };

  const onViewNFT = async () => {
    const tokenNFT = await positionService.getTokenNFT(position);
    setNFTData(tokenNFT);
    setShowNFTModal(true);
    trackEvent('DCA - Position Details - View NFT');
  };

  const onWithdrawFunds = async (useProtocolToken = true) => {
    try {
      const hasYield = position.from.underlyingTokens.length;
      let hasPermission = true;
      if (useProtocolToken || hasYield) {
        hasPermission = await positionService.companionHasPermission(position, PERMISSIONS.REDUCE);
      }
      const protocolOrWrappedToken = useProtocolToken ? protocolToken.symbol : wrappedProtocolToken.symbol;
      const fromSymbol =
        position.from.address === PROTOCOL_TOKEN_ADDRESS || position.from.address === wrappedProtocolToken.address
          ? protocolOrWrappedToken
          : position.from.symbol;

      const removedFunds = position.rate.amount * position.remainingSwaps;
      setModalLoading({
        content: (
          <>
            <Typography variant="bodyRegular">
              <FormattedMessage
                description="Withdrawing funds from"
                defaultMessage="Withdrawing {fromSymbol} funds"
                values={{ fromSymbol }}
              />
            </Typography>
            {useProtocolToken && !hasPermission && hasSignSupport && (
              <Typography variant="bodyRegular">
                <FormattedMessage
                  description="Approve signature companion text"
                  defaultMessage="You will need to first sign a message (which is costless) to authorize our Companion contract. Then, you will need to submit the transaction where you get your balance back as {from}."
                  values={{ from: position.from.symbol }}
                />
              </Typography>
            )}
          </>
        ),
      });
      trackEvent('DCA - Position details - Withdraw funds submitting', { chainId: position.chainId, useProtocolToken });

      let hash: Address;

      if (hasSignSupport) {
        const result = await positionService.modifyRateAndSwaps(position, '0', '0', !useProtocolToken);
        hash = result.hash;
      } else {
        const result = await positionService.modifyRateAndSwapsSafe(position, '0', '0', !useProtocolToken);

        hash = result.safeTxHash as Address;
      }
      addTransaction(
        { hash, from: position.user, chainId: position.chainId },
        {
          type: TransactionTypes.withdrawFunds,
          typeData: {
            id: position.id,
            from: fromSymbol,
            removedFunds: removedFunds.toString(),
          },
          position: position,
        }
      );
      setModalSuccess({
        hash,
        content: (
          <FormattedMessage
            description="withdraw from success"
            defaultMessage="Your withdrawal of funds of {fromSymbol} from your {from}/{to} position has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
              fromSymbol,
            }}
          />
        ),
      });
      trackEvent('DCA - Position details - Withdraw funds submitted', { chainId: position.chainId, useProtocolToken });
    } catch (e) {
      // User rejecting transaction
      // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (shouldTrackError(e as Error)) {
        trackEvent('DCA - Position details - Withdraw funds error', { chainId: position.chainId, useProtocolToken });
        // eslint-disable-next-line no-void, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void errorService.logError('Error while withdrawing funds', JSON.stringify(e), {
          position: position.chainId,
          useProtocolToken,
          chainId: position.chainId,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: (
          <FormattedMessage description="modalErrorWithdrawFunds" defaultMessage="Error while withdrawing funds" />
        ),
        error: {
          ...e,
          extraData: {
            useProtocolToken,
            chainId: position.chainId,
          },
        },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const onWithdraw = async (useProtocolToken = false) => {
    try {
      const hasYield = position.to.underlyingTokens.length;
      let hasPermission = true;
      if (useProtocolToken || hasYield) {
        hasPermission = await positionService.companionHasPermission(position, PERMISSIONS.WITHDRAW);
      }
      const protocolOrWrappedToken = useProtocolToken ? protocolToken.symbol : wrappedProtocolToken.symbol;
      const toSymbol =
        position.to.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === wrappedProtocolToken.address
          ? protocolOrWrappedToken
          : position.to.symbol;
      setModalLoading({
        content: (
          <>
            <Typography variant="bodyRegular">
              <FormattedMessage
                description="Withdrawing from"
                defaultMessage="Withdrawing {toSymbol}"
                values={{ toSymbol }}
              />
            </Typography>
            {useProtocolToken && !hasPermission && hasSignSupport && (
              <Typography variant="bodyRegular">
                <FormattedMessage
                  description="Approve signature companion text"
                  defaultMessage="You will need to first sign a message (which is costless) to authorize our Companion contract. Then, you will need to submit the transaction where you get your balance back as {from}."
                  values={{ from: position.to.symbol }}
                />
              </Typography>
            )}
          </>
        ),
      });
      trackEvent('DCA - Position details - Withdraw submitting', { chainId: position.chainId, useProtocolToken });

      let result;
      let hash;

      if (hasSignSupport) {
        result = await positionService.withdraw(position, useProtocolToken);

        hash = result.hash;
      } else {
        result = await positionService.withdrawSafe(position);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        result.hash = result.safeTxHash;
        hash = result.safeTxHash;
      }

      addTransaction(
        { ...(result as Transaction), chainId: position.chainId },
        {
          type: TransactionTypes.withdrawPosition,
          typeData: {
            id: position.id,
            withdrawnUnderlying: position.toWithdraw.amount.toString(),
          },
          position: position,
        }
      );
      setModalSuccess({
        hash,
        content: (
          <FormattedMessage
            description="withdraw from success"
            defaultMessage="Your withdrawal of {toSymbol} from your {from}/{to} position has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
              toSymbol,
            }}
          />
        ),
      });
      trackEvent('DCA - Position details - Withdraw submitted', { chainId: position.chainId, useProtocolToken });
    } catch (e) {
      // User rejecting transaction
      if (shouldTrackError(e as Error)) {
        trackEvent('DCA - Position details - Withdraw error', { chainId: position.chainId, useProtocolToken });
        void errorService.logError('Error while withdrawing', JSON.stringify(e), {
          position: position.id,
          useProtocolToken,
          chainId: position.chainId,
        });
      }
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: <FormattedMessage description="modalErrorWithdraw" defaultMessage="Error while withdrawing" />,
        error: {
          ...e,
          extraData: {
            useProtocolToken,
            chainId: position.chainId,
          },
        },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const options = React.useMemo(
    () => [
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
        disabled: disabledWithdraw || isPending || disabled || position.toWithdraw.amount <= 0n,
        onClick: () => onWithdraw(!!hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS),
      },
      ...(shouldShowWithdrawWrappedToken
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
              disabled: disabledWithdraw || isPending || disabled,
              onClick: () => onWithdraw(false),
            },
          ]
        : []),
      {
        type: OptionsMenuOptionType.option,
        label: (
          <FormattedMessage
            description="withdraw funds"
            defaultMessage="Withdraw remaining {token}"
            values={{ token: position.from.symbol }}
          />
        ),
        disabled: disabledWithdrawFunds || isPending || disabled || position.remainingLiquidity.amount <= 0n,
        onClick: onWithdrawFunds,
      },
    ],
    [intl, wrappedProtocolToken, disabledWithdraw, isPending, disabled, position, hasSignSupport]
  );

  return (
    ownerWallet && (
      <>
        <TerminateModal open={showTerminateModal} position={position} onCancel={() => setShowTerminateModal(false)} />
        <ModifySettingsModal
          open={showModifyRateSettingsModal}
          position={position}
          onCancel={() => setShowModifyRateSettingsModal(false)}
        />
        <TransferPositionModal
          open={showTransferModal}
          position={position}
          onCancel={() => setShowTransferModal(false)}
        />
        <NFTModal open={showNFTModal} nftData={nftData} onCancel={() => setShowNFTModal(false)} />
        <ContainerBox gap={3} alignSelf="end">
          {showExtendedFunctions && (
            <Button variant="outlined" disabled={disableModifyPosition} onClick={onModifyRate}>
              <FormattedMessage description="managePosition" defaultMessage="Manage position" />
            </Button>
          )}

          {shouldDisableArrow && (
            <Button
              variant="outlined"
              disabled={disabledWithdraw || isPending || disabled || position.toWithdraw.amount <= 0n}
              onClick={() => onWithdraw(!!hasSignSupport && position.to.address === PROTOCOL_TOKEN_ADDRESS)}
            >
              <FormattedMessage
                description="withdrawToken"
                defaultMessage="Withdraw {token}"
                values={{
                  token:
                    hasSignSupport || position.to.address !== PROTOCOL_TOKEN_ADDRESS
                      ? position.to.symbol
                      : wrappedProtocolToken.symbol,
                }}
              />
            </Button>
          )}

          {!shouldDisableArrow && (
            <>
              <Button
                variant="outlined"
                disabled={disabledWithdraw || isPending || disabled || position.toWithdraw.amount <= 0n}
                onClick={(e) => setAnchorWithdrawButton(e.currentTarget)}
                endIcon={<KeyboardArrowDownIcon />}
              >
                <FormattedMessage defaultMessage="Withdraw" description="withdraw" />
              </Button>
              <OptionsMenuItems
                options={options}
                anchorEl={anchorWithdrawButton}
                handleClose={() => setAnchorWithdrawButton(null)}
              />
            </>
          )}

          <ContainerBox alignSelf="center">
            <IconButton onClick={handleClick} disabled={isPending}>
              <MoreVertIcon color="info" />
            </IconButton>
            <StyledMenu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  void onViewNFT();
                }}
                disabled={disabled}
              >
                <FormattedMessage description="view nft" defaultMessage="View NFT" />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  onTransfer();
                }}
                disabled={isPending || disabled}
              >
                <FormattedMessage description="transferPosition" defaultMessage="Transfer position" />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  onTerminate();
                }}
                disabled={isPending || disabled || disabledWithdraw || !showExtendedFunctions}
              >
                <FormattedMessage description="terminate position" defaultMessage="Withdraw and close position" />
              </MenuItem>
              {csvUrl && (
                <MenuItem
                  onClick={handleClose}
                  component={Link}
                  download={`position_${position.chainId}_${position.positionId}.csv`}
                  ref={downloadCsvLinkRef}
                  href={csvUrl}
                  sx={{ textDecoration: 'none !important' }}
                >
                  <FormattedMessage description="exportPositionCSV" defaultMessage="Export as CSV" />
                </MenuItem>
              )}
            </StyledMenu>
          </ContainerBox>
        </ContainerBox>
      </>
    )
  );
};

export default PositionSummaryControls;
