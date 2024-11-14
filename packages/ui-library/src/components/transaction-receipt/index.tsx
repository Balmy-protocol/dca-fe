import { Dialog } from '../dialog';
import { DialogTitle } from '../dialogtitle';
import { DialogContent } from '../dialogcontent';
import { DividerBorder2 } from '../divider';
import { Link } from '../link';
import { ArrowRightIcon, CloseIcon } from '../../icons';
import React from 'react';
import { createStyles } from '../../common';
import { IconButton } from '../iconbutton';
import { withStyles } from 'tss-react/mui';
import { AmountsOfToken, TokenWithIcon, TransactionEventTypes } from 'common-types';
import { Typography, TypographyProps } from '../typography';
import { useTheme } from '@mui/material';
import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
import BalmyLogoSmallLight from '../../assets/balmy-logo-small-light';
import { baseColors, colors } from '../../theme';
import styled from 'styled-components';
import { getIsDelayedWithdraw, getTransactionTypeTitle } from './transaction-types-map';
import { DateTime } from 'luxon';
import { maxUint256 } from 'viem';
import { ContainerBox } from '../container-box';
import { formatCurrencyAmount, formatUsdAmount } from '../../common/utils/currency';
import {
  ERC20ApprovalReceipt,
  ERC20TransferReceipt,
  NativeTransferReceipt,
  DCAWithdrawReceipt,
  SwapReceipt,
  DCATerminatedReceipt,
  DCAModifyReceipt,
  DCACreatedReceipt,
  EarnDepositReceipt,
  EarnIncreaseReceipt,
  EarnWithdrawReceipt,
  DCAPermissionsModifiedReceipt,
  DCATransferReceipt,
  DcaTransactionReceiptProp,
  TransactionReceiptProp,
  EarnClaimDelayedWithdrawReceipt,
  EarnSpecialWithdrawReceipt,
} from './types';
import { HiddenNumber } from '../hidden-number';

const StyledDialog = withStyles(Dialog, ({ palette: { mode } }) =>
  createStyles({
    paper: {
      border: `2px solid ${colors[mode].violet.violet500}`,
      borderBottom: '0',
      borderBottomLeftRadius: '0 !important',
      borderBottomRightRadius: '0 !important',
      overflow: 'visible !important',
      '&:after': {
        borderLeft: `2px solid ${colors[mode].violet.violet500}`,
        borderRight: `2px solid ${colors[mode].violet.violet500}`,
        borderBottom: 0,
        backgroundImage: `url(\'data:image/svg+xml;utf8, <svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg"><path d="M -15 110 L100 10 L215 110" fill="${colors[
          mode
        ].background.tertiary.replace('#', '%23')}" stroke="${colors[mode].violet.violet500.replace(
          '#',
          '%23'
        )}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>\')`,
        backgroundSize: '5% 13px',
        height: '10px',
        transform: 'rotate(180deg)',
        backgroundPosition: 'center',
        content: '" "',
        display: 'block',
        position: 'absolute',
        bottom: '-10px',
        left: '-2px',
        width: 'calc(100% + 4px)',
      },
    },
  })
);

const StyledDialogTitle = withStyles(DialogTitle, ({ palette: { mode }, spacing }) =>
  createStyles({
    root: {
      padding: `${spacing(8)}`,
      gap: spacing(2),
      display: 'flex',
      alignItems: 'flex-end',
      backgroundColor: colors[mode].violet.violet500,
      borderTopLeftRadius: spacing(3),
      borderTopRightRadius: spacing(3),
      position: 'relative',
      overflow: 'hidden',
      '&:after': {
        content: '" "',
        position: 'absolute',
        width: '70%',
        paddingBottom: '70%',
        left: '50%',
        transform: 'translateX(-50%)',
        borderRadius: '50%',
        filter: 'blur(46px)',
        background: colors[mode].violet.violet400,
        bottom: '-275%',
      },
    },
  })
);

const StyledDialogContent = withStyles(DialogContent, ({ space }) =>
  createStyles({
    root: {
      padding: `${space.s05} ${space.s05} ${space.s07} !important`,
      gap: space.s05,
      display: 'flex',
      flexDirection: 'column',
    },
  })
);

const StyledBodySmallBold = styled(Typography).attrs(
  ({
    theme: {
      palette: { mode },
    },
    ...rest
  }) => ({
    variant: 'bodySmallBold',
    color: colors[mode].typography.typo2,
    ...rest,
  })
)``;

const StyledSectionContent = styled.div`
  ${({ theme: { spacing } }) => `
    gap: ${spacing(1)};
  `}
  display: flex;
  flex-direction: column;
`;

const StyledDoubleSectionContent = styled.div`
  display: flex;
  flex-direction: row;
  ${StyledSectionContent} {
    flex: 1;
  }
`;

const StyledPositionId = styled(ContainerBox).attrs({
  gap: 2.25,
  alignSelf: 'start',
  alignItems: 'center',
})<{ $allowClick: boolean }>`
  ${({ theme: { palette, spacing }, $allowClick }) => `
  padding: ${spacing(1)} ${spacing(2)};
  border: 1px solid ${colors[palette.mode].border.border2};
  border-radius: ${spacing(2)};
  transition: box-shadow 0.3s;
  ${
    $allowClick &&
    `cursor: pointer;
    &:hover {
      box-shadow: ${colors[palette.mode].dropShadow.dropShadow100};
    }`
  }
`}
`;

const HiddenNumberWithToken = ({ token }: { token: TokenWithIcon }) => {
  return (
    <ContainerBox alignItems="center" gap={2}>
      {token.icon}
      <HiddenNumber size="medium" justifyContent="flex-start" />
    </ContainerBox>
  );
};

const NumberWithToken = ({
  token,
  amount,
  intl,
  customRenderer,
  color,
  showBalances = true,
}: {
  token: TokenWithIcon;
  amount: AmountsOfToken;
  intl: IntlShape;
  customRenderer?: React.ReactNode;
  color?: TypographyProps['color'];
  showBalances?: boolean;
}) => {
  const { spacing } = useTheme();

  if (!showBalances) {
    return <HiddenNumberWithToken token={token} />;
  }

  return (
    <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }} color={color}>
      {token.icon}
      {customRenderer || (
        <>
          {formatCurrencyAmount({ amount: amount.amount, token, intl })}
          {amount.amountInUSD && ` ($${formatUsdAmount({ amount: amount.amountInUSD, intl })})`}
        </>
      )}
    </StyledBodySmallBold>
  );
};

interface TransactionReceiptProps {
  transaction?: TransactionReceiptProp;
  open: boolean;
  onClose: () => void;
  onClickPositionId?: ({ chainId, positionId, hub }: { chainId: number; hub: string; positionId: number }) => void;
  showBalances?: boolean;
}

const ERC20ApprovalTransactionReceipt = ({ transaction }: { transaction: ERC20ApprovalReceipt }) => {
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount approved" />
        </Typography>
        <NumberWithToken
          token={transaction.data.token}
          amount={transaction.data.amount}
          intl={intl}
          customRenderer={
            transaction.data.amount.amount === maxUint256 &&
            transaction.type === TransactionEventTypes.ERC20_APPROVAL ? (
              <FormattedMessage description="unlimited" defaultMessage="Unlimited" />
            ) : undefined
          }
        />
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.owner}</StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Spender" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.spender}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const ERC20TransferTransactionReceipt = ({
  transaction,
  showBalances,
}: {
  transaction: ERC20TransferReceipt;
  showBalances: boolean;
}) => {
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount sent" />
        </Typography>
        <NumberWithToken
          showBalances={showBalances}
          token={transaction.data.token}
          amount={transaction.data.amount}
          intl={intl}
        />
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.to}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const NativeTransferTransactionReceipt = ({
  transaction,
  showBalances,
}: {
  transaction: NativeTransferReceipt;
  showBalances: boolean;
}) => {
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="Amount sent" />
        </Typography>
        <NumberWithToken
          showBalances={showBalances}
          token={transaction.tx.network.nativeCurrency}
          amount={transaction.data.amount}
          intl={intl}
        />
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.to}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const DCAWithdrawTransactionReceipt = ({
  transaction,
  showBalances,
}: {
  transaction: DCAWithdrawReceipt;
  showBalances: boolean;
}) => {
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawn" defaultMessage="Withdrawn" />
        </Typography>
        <NumberWithToken
          showBalances={showBalances}
          token={transaction.data.toToken}
          amount={transaction.data.withdrawn}
          intl={intl}
        />
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawnBy" defaultMessage="Withdrawn by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const SwapTransactionReceipt = ({ transaction, showBalances }: { transaction: SwapReceipt; showBalances: boolean }) => {
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionSwapSoldToken" defaultMessage="Sold token" />
        </Typography>
        <NumberWithToken
          showBalances={showBalances}
          token={transaction.data.tokenIn}
          amount={transaction.data.amountIn}
          intl={intl}
        />
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionSwapBoughtToken" defaultMessage="Bought token" />
        </Typography>
        <NumberWithToken
          showBalances={showBalances}
          token={transaction.data.tokenOut}
          amount={transaction.data.amountOut}
          intl={intl}
        />
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionSwapSwappedBy" defaultMessage="Swapped by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
      {transaction.data.recipient && (
        <StyledSectionContent>
          <Typography variant="labelRegular">
            <FormattedMessage
              description="TransactionReceipt-transactionSwapTransferedTo"
              defaultMessage="Transfered to"
            />
          </Typography>
          <StyledBodySmallBold>{transaction.data.recipient}</StyledBodySmallBold>
        </StyledSectionContent>
      )}
    </>
  );
};

const DCATerminatedTransactionReceipt = ({
  transaction,
  showBalances,
}: {
  transaction: DCATerminatedReceipt;
  showBalances: boolean;
}) => {
  const intl = useIntl();
  return (
    <>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage
            description="TransactionReceipt-transactionDCAWithdrawn"
            defaultMessage="Withdrawn swapped"
          />
        </Typography>
        <NumberWithToken
          showBalances={showBalances}
          token={transaction.data.toToken}
          amount={transaction.data.withdrawnSwapped}
          intl={intl}
        />
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawn" defaultMessage="Withdrawn funds" />
        </Typography>
        <NumberWithToken
          showBalances={showBalances}
          token={transaction.data.fromToken}
          amount={transaction.data.withdrawnRemaining}
          intl={intl}
        />
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionDCAWithdrawnBy" defaultMessage="Withdrawn by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const DCAModifyTransactionReceipt = ({
  transaction,
  showBalances,
}: {
  transaction: DCAModifyReceipt;
  showBalances: boolean;
}) => {
  const intl = useIntl();

  const {
    from,
    fromToken,
    fromIsYield,
    rate,
    oldRate,
    remainingSwaps,
    oldRemainingSwaps,
    remainingLiquidity,
    oldRemainingLiquidity,
  } = transaction.data;

  return (
    <>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="totalInvested" defaultMessage="Total Invested" />
        </Typography>
        <ContainerBox gap={0.5} alignItems="center">
          <NumberWithToken showBalances={showBalances} token={fromToken} amount={oldRemainingLiquidity} intl={intl} />
          <ArrowRightIcon />
          {oldRemainingLiquidity.amount === remainingLiquidity.amount ? (
            <StyledBodySmallBold>=</StyledBodySmallBold>
          ) : (
            <NumberWithToken
              showBalances={showBalances}
              token={fromToken}
              amount={remainingLiquidity}
              intl={intl}
              color="success.dark"
            />
          )}
        </ContainerBox>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="rate" defaultMessage="Rate" />
        </Typography>
        <ContainerBox gap={0.5} alignItems="center">
          <NumberWithToken showBalances={showBalances} token={fromToken} amount={oldRate} intl={intl} />
          {fromIsYield && Number(oldRate.amount) > 0 && (
            <StyledBodySmallBold>
              <FormattedMessage description="plusYield" defaultMessage="+ yield" />
            </StyledBodySmallBold>
          )}
          <ArrowRightIcon />
          {oldRate.amount === rate.amount ? (
            <StyledBodySmallBold>=</StyledBodySmallBold>
          ) : (
            <>
              <NumberWithToken
                showBalances={showBalances}
                token={fromToken}
                amount={rate}
                intl={intl}
                color="success.dark"
              />
              {fromIsYield && Number(rate.amount) > 0 && (
                <StyledBodySmallBold color="success.dark">
                  <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                </StyledBodySmallBold>
              )}
            </>
          )}
        </ContainerBox>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="swapsLeft" defaultMessage="Swaps left" />
        </Typography>
        <ContainerBox gap={0.5} alignItems="center">
          <StyledBodySmallBold>
            {oldRemainingSwaps === 1 ? (
              <FormattedMessage
                description="TransactionReceipt-transactionDCAModifiedSwapsLeft-singular"
                defaultMessage="1 swap"
              />
            ) : (
              <FormattedMessage
                description="TransactionReceipt-transactionDCAModifiedSwapsLeft-plural"
                defaultMessage="{swaps} swaps"
                values={{
                  swaps: Number(oldRemainingSwaps),
                }}
              />
            )}
          </StyledBodySmallBold>
          <ArrowRightIcon />
          {remainingSwaps === oldRemainingSwaps ? (
            <StyledBodySmallBold>=</StyledBodySmallBold>
          ) : (
            <StyledBodySmallBold color="success.dark">
              {oldRemainingSwaps === 1 ? (
                <FormattedMessage
                  description="TransactionReceipt-transactionDCAModifiedSwapsLeft-singular"
                  defaultMessage="1 swap"
                />
              ) : (
                <FormattedMessage
                  description="TransactionReceipt-transactionDCAModifiedSwapsLeft-plural"
                  defaultMessage="{swaps} swap"
                  values={{
                    swaps: Number(remainingSwaps),
                  }}
                />
              )}
            </StyledBodySmallBold>
          )}
        </ContainerBox>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionDCAModifiedBy" defaultMessage="Modified by" />
        </Typography>
        <StyledBodySmallBold>{from}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const DCACreateTransactionReceipt = ({
  transaction,
  showBalances,
}: {
  transaction: DCACreatedReceipt;
  showBalances: boolean;
}) => {
  const intl = useIntl();

  return (
    <>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionDCACreate" defaultMessage="Rate" />
        </Typography>
        <NumberWithToken
          showBalances={showBalances}
          token={transaction.data.fromToken}
          amount={transaction.data.rate}
          intl={intl}
        />
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionDCAModifiedBy" defaultMessage="Created by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
      </StyledSectionContent>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionDCAModifiedBy" defaultMessage="Owned by" />
        </Typography>
        <StyledBodySmallBold>{transaction.data.owner}</StyledBodySmallBold>
      </StyledSectionContent>
    </>
  );
};

const EarnDepositTransactionReceipt = ({
  transaction,
  showBalances,
}: {
  transaction: EarnDepositReceipt;
  showBalances: boolean;
}) => {
  const intl = useIntl();

  return (
    <>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionEarnDeposit-Asset" defaultMessage="Deposited" />
        </Typography>
        <NumberWithToken
          showBalances={showBalances}
          token={transaction.data.depositToken}
          amount={transaction.data.depositAmount}
          intl={intl}
        />
      </StyledSectionContent>
    </>
  );
};

const EarnIncreaseTransactionReceipt = ({
  transaction,
  showBalances,
}: {
  transaction: EarnIncreaseReceipt;
  showBalances: boolean;
}) => {
  const intl = useIntl();

  return (
    <>
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionEarnIncrease-Asset" defaultMessage="Deposited" />
        </Typography>
        <NumberWithToken
          showBalances={showBalances}
          token={transaction.data.depositToken}
          amount={transaction.data.depositAmount}
          intl={intl}
        />
      </StyledSectionContent>
    </>
  );
};

const EarnWithdrawTransactionReceipt = ({
  transaction,
  showBalances,
}: {
  transaction: EarnWithdrawReceipt;
  showBalances: boolean;
}) => {
  const intl = useIntl();

  const isDelayed = getIsDelayedWithdraw(transaction.data.withdrawn);

  return (
    <StyledSectionContent>
      {isDelayed ? (
        <Typography variant="labelRegular">
          <FormattedMessage
            description="TransactionReceipt-transactionEarnWithdrawDelayed"
            defaultMessage="Delayed withdrawal"
          />
        </Typography>
      ) : (
        <Typography variant="labelRegular">
          <FormattedMessage description="TransactionReceipt-transactionEarnWithdraw" defaultMessage="Withdrew" />
        </Typography>
      )}
      <ContainerBox gap={2} alignItems="center" flexWrap="wrap">
        {transaction.data.withdrawn.map((withdrawn) => (
          <NumberWithToken
            showBalances={showBalances}
            key={withdrawn.token.address}
            token={withdrawn.token}
            amount={withdrawn.amount}
            intl={intl}
          />
        ))}
      </ContainerBox>
    </StyledSectionContent>
  );
};

const EarnSpecialWithdrawTransactionReceipt = ({
  transaction,
  showBalances,
}: {
  transaction: EarnSpecialWithdrawReceipt;
  showBalances: boolean;
}) => {
  const intl = useIntl();

  return (
    <StyledSectionContent>
      <Typography variant="labelRegular">
        <FormattedMessage description="TransactionReceipt-transactionEarnMarketWithdraw" defaultMessage="Withdrew" />
      </Typography>

      <ContainerBox gap={2} alignItems="center" flexWrap="wrap">
        {transaction.data.tokens.map((withdrawnToken) => (
          <NumberWithToken
            showBalances={showBalances}
            key={withdrawnToken.token.address}
            token={withdrawnToken.token}
            amount={withdrawnToken.amount}
            intl={intl}
          />
        ))}
      </ContainerBox>
    </StyledSectionContent>
  );
};

const EarnClaimDelayedWithdrawTransactionReceipt = ({
  transaction,
  showBalances,
}: {
  transaction: EarnClaimDelayedWithdrawReceipt;
  showBalances: boolean;
}) => {
  const intl = useIntl();

  return (
    <StyledSectionContent>
      <Typography variant="labelRegular">
        <FormattedMessage
          description="TransactionReceipt-transactionEarnClaimDelayedWithdraw"
          defaultMessage="Claimed"
        />
      </Typography>
      <NumberWithToken
        showBalances={showBalances}
        token={transaction.data.token}
        amount={transaction.data.withdrawn}
        intl={intl}
      />
    </StyledSectionContent>
  );
};

const DCAPermissionsModifiedTransactionReceipt = ({ transaction }: { transaction: DCAPermissionsModifiedReceipt }) => {
  const { spacing } = useTheme();
  return (
    <StyledSectionContent>
      <Typography variant="labelRegular">
        <FormattedMessage
          description="TransactionReceipt-transactionDCAPermissionsModified-rate"
          defaultMessage="New permissions set:"
        />
      </Typography>
      {transaction.data.permissions.map(({ permissions, label }, index) => (
        <StyledBodySmallBold key={index} sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
          {label}:{permissions.map((permission) => ` ${permission}`)}
        </StyledBodySmallBold>
      ))}
    </StyledSectionContent>
  );
};

const DcaTransferTransactionReceipt = ({ transaction }: { transaction: DCATransferReceipt }) => (
  <>
    <StyledSectionContent>
      <Typography variant="labelRegular">
        <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="From address" />
      </Typography>
      <StyledBodySmallBold>{transaction.data.from}</StyledBodySmallBold>
    </StyledSectionContent>
    <StyledSectionContent>
      <Typography variant="labelRegular">
        <FormattedMessage description="TransactionReceipt-transactionAmountSent" defaultMessage="To address" />
      </Typography>
      <StyledBodySmallBold>{transaction.data.to}</StyledBodySmallBold>
    </StyledSectionContent>
  </>
);

const buildDcaTransactionReceiptForEvent = (
  dcaTransaction: DcaTransactionReceiptProp,
  onClickPositionId?: TransactionReceiptProps['onClickPositionId'],
  showBalances = true
) => {
  let dcaReceipt: React.ReactElement;
  switch (dcaTransaction.type) {
    case TransactionEventTypes.DCA_WITHDRAW:
      dcaReceipt = <DCAWithdrawTransactionReceipt transaction={dcaTransaction} showBalances={showBalances} />;
      break;
    case TransactionEventTypes.DCA_MODIFIED:
      dcaReceipt = <DCAModifyTransactionReceipt transaction={dcaTransaction} showBalances={showBalances} />;
      break;
    case TransactionEventTypes.DCA_CREATED:
      dcaReceipt = <DCACreateTransactionReceipt transaction={dcaTransaction} showBalances={showBalances} />;
      break;
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
      dcaReceipt = <DCAPermissionsModifiedTransactionReceipt transaction={dcaTransaction} />;
      break;
    case TransactionEventTypes.DCA_TRANSFER:
      dcaReceipt = <DcaTransferTransactionReceipt transaction={dcaTransaction} />;
      break;
    case TransactionEventTypes.DCA_TERMINATED:
      dcaReceipt = <DCATerminatedTransactionReceipt transaction={dcaTransaction} showBalances={showBalances} />;
      break;
  }
  return (
    <>
      {dcaReceipt}
      <StyledSectionContent>
        <Typography variant="labelRegular">
          <FormattedMessage
            description="TransactionReceipt-transactionDCAWithdrawnPosition"
            defaultMessage="Position"
          />
        </Typography>
        <StyledPositionId
          onClick={() =>
            onClickPositionId &&
            onClickPositionId({
              positionId: dcaTransaction.data.positionId,
              chainId: dcaTransaction.tx.chainId,
              hub: dcaTransaction.data.hub,
            })
          }
          $allowClick={!!onClickPositionId}
        >
          <ContainerBox gap={0.5} alignItems="center">
            {dcaTransaction.data.fromToken.icon}
            <ArrowRightIcon />
            {dcaTransaction.data.toToken.icon}
          </ContainerBox>
          <StyledBodySmallBold>#{dcaTransaction.data.positionId}</StyledBodySmallBold>
        </StyledPositionId>
      </StyledSectionContent>
    </>
  );
};

const buildTransactionReceiptForEvent = (
  transaction: TransactionReceiptProp,
  onClickPositionId?: TransactionReceiptProps['onClickPositionId'],
  showBalances = true
) => {
  switch (transaction.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      return <ERC20ApprovalTransactionReceipt transaction={transaction} />;
    case TransactionEventTypes.ERC20_TRANSFER:
      return <ERC20TransferTransactionReceipt transaction={transaction} showBalances={showBalances} />;
    case TransactionEventTypes.SWAP:
      return <SwapTransactionReceipt transaction={transaction} showBalances={showBalances} />;
    case TransactionEventTypes.EARN_CREATED:
      return <EarnDepositTransactionReceipt transaction={transaction} showBalances={showBalances} />;
    case TransactionEventTypes.EARN_INCREASE:
      return <EarnIncreaseTransactionReceipt transaction={transaction} showBalances={showBalances} />;
    case TransactionEventTypes.NATIVE_TRANSFER:
      return <NativeTransferTransactionReceipt transaction={transaction} showBalances={showBalances} />;
    case TransactionEventTypes.EARN_WITHDRAW:
      return <EarnWithdrawTransactionReceipt transaction={transaction} showBalances={showBalances} />;
    case TransactionEventTypes.EARN_SPECIAL_WITHDRAW:
      return <EarnSpecialWithdrawTransactionReceipt transaction={transaction} showBalances={showBalances} />;
    case TransactionEventTypes.EARN_CLAIM_DELAYED_WITHDRAW:
      return <EarnClaimDelayedWithdrawTransactionReceipt transaction={transaction} showBalances={showBalances} />;
    case TransactionEventTypes.DCA_WITHDRAW:
    case TransactionEventTypes.DCA_MODIFIED:
    case TransactionEventTypes.DCA_CREATED:
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_TRANSFER:
    case TransactionEventTypes.DCA_TERMINATED:
      return buildDcaTransactionReceiptForEvent(transaction, onClickPositionId, showBalances);
  }
  return null;
};

const TransactionReceipt = ({
  transaction,
  open,
  onClose,
  onClickPositionId,
  showBalances = true,
}: TransactionReceiptProps) => {
  const { spacing } = useTheme();

  const intl = useIntl();

  if (!transaction) {
    return null;
  }

  return (
    <StyledDialog open={open} scroll="paper" maxWidth="xs" fullWidth PaperProps={{ id: 'paper-id' }} onClose={onClose}>
      <StyledDialogTitle>
        <BalmyLogoSmallLight size={spacing(10)} />
        <Typography variant="h3Bold" color={baseColors.violet.violet100}>
          <FormattedMessage description="receipt" defaultMessage="Receipt" />
        </Typography>
        <IconButton
          aria-label="close"
          size="small"
          onClick={onClose}
          style={{ position: 'absolute', top: 0, right: 0, padding: spacing(4) }}
        >
          <CloseIcon fontSize="inherit" sx={{ color: baseColors.violet.violet100 }} />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <StyledSectionContent>
          <Typography variant="labelRegular">
            <FormattedMessage description="TransactionReceipt-transactionType" defaultMessage="Transaction Type" />
          </Typography>
          <StyledBodySmallBold>{intl.formatMessage(getTransactionTypeTitle(transaction))}</StyledBodySmallBold>
        </StyledSectionContent>
        <StyledSectionContent>
          <Typography variant="labelRegular">
            <FormattedMessage description="TransactionReceipt-transactionDateTime" defaultMessage="Date & Time" />
          </Typography>
          <StyledBodySmallBold>
            {DateTime.fromSeconds(Number(transaction.tx.timestamp)).toLocaleString({
              ...DateTime.DATETIME_FULL,
              timeZoneName: undefined,
            })}
          </StyledBodySmallBold>
        </StyledSectionContent>
        {buildTransactionReceiptForEvent(transaction, onClickPositionId, showBalances)}
        <StyledDoubleSectionContent>
          <StyledSectionContent>
            <Typography variant="labelRegular">
              <FormattedMessage description="TransactionReceipt-transactionNetwork" defaultMessage="Network" />
            </Typography>
            <StyledBodySmallBold sx={{ display: 'flex', alignItems: 'center', gap: spacing(2) }}>
              {transaction.tx.network.mainCurrency.icon}
              {transaction.tx.network.name}
            </StyledBodySmallBold>
          </StyledSectionContent>
          <StyledSectionContent>
            <Typography variant="labelRegular">
              <FormattedMessage description="TransactionReceipt-transactionFee" defaultMessage="Network Fee" />
            </Typography>
            <NumberWithToken
              token={transaction.tx.network.nativeCurrency}
              amount={transaction.tx.spentInGas}
              intl={intl}
            />
          </StyledSectionContent>
        </StyledDoubleSectionContent>
        <DividerBorder2 />
        <StyledDoubleSectionContent>
          <StyledSectionContent>
            <Typography variant="labelRegular">
              <FormattedMessage description="TransactionReceipt-transactionId" defaultMessage="Transaction ID" />
            </Typography>
            <Link variant="bodySmallBold" href={transaction.tx.explorerLink} target="_blank">
              <FormattedMessage description="transactionConfirmationViewExplorer" defaultMessage="View in explorer" />
            </Link>
          </StyledSectionContent>
        </StyledDoubleSectionContent>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export {
  TransactionReceipt,
  type TransactionReceiptProps,
  type TransactionReceiptProp,
  getTransactionTypeTitle,
  getIsDelayedWithdraw,
};
