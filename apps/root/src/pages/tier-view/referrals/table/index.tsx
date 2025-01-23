import useInviteCodes, { InviteCodeWithReferralStatus } from '@hooks/tiers/useInviteCodes';
import React from 'react';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  colors,
  ContainerBox,
  Typography,
  TableRow,
  TableCell,
  StyledBodySmallLabelTypography,
  Grid,
  ContentCopyIcon,
  TickCircleIcon,
  Tooltip,
  InfoCircleIcon,
  copyTextToClipboard,
  TableContainer,
  TableHead,
  TableBody,
  Table,
  useSnackbar,
  Zoom,
  QrCodeIcon,
} from 'ui-library';
import ShareQRModal from '../share-qr-modal';

const StyledReferralTable = styled(ContainerBox).attrs({ gap: 6, flexDirection: 'column', flex: 1 })`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(6)};
    background-color: ${colors[palette.mode].background.quartery};
    border: 1px solid ${colors[palette.mode].border.border1};
    border-radius: ${spacing(4)};
  `}
`;

const StyledTableEnd = styled(TableCell).attrs({ size: 'small' })`
  ${({ theme: { spacing } }) => `
    width: ${spacing(12.5)};
    padding: ${spacing(2)} ${spacing(4)};
  `}
`;

const StyledBodyTableCell = styled(TableCell)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(2)} ${spacing(4)};
  `}
`;

const ReferralsTableHeader = () => (
  <TableRow sx={{ backgroundColor: 'transparent !important' }}>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="tier-view.referrals.table.code" defaultMessage="Code" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="tier-view.referrals.table.status" defaultMessage="Status" />
      </StyledBodySmallLabelTypography>
    </TableCell>
    {/* Add date redeemed when be implemented */}
    {/* <TableCell>
      <StyledBodySmallLabelTypography>
        <FormattedMessage description="tier-view.referrals.table.date.redeemed" defaultMessage="Date redeemed" />
      </StyledBodySmallLabelTypography>
    </TableCell> */}
    <StyledTableEnd></StyledTableEnd>
  </TableRow>
);

const ReferralEndCell = ({
  isReferralActive,
  claimedBy,
  onCopy,
  onShare,
}: {
  isReferralActive: boolean;
  claimedBy: InviteCodeWithReferralStatus['claimedBy'];
  onCopy: () => void;
  onShare: () => void;
}) => {
  if (!claimedBy) {
    return (
      <ContainerBox gap={1} alignItems="center">
        <ContentCopyIcon
          sx={({ palette }) => ({ cursor: 'pointer', color: colors[palette.mode].typography.typo4 })}
          onClick={onCopy}
        />
        <QrCodeIcon
          sx={({ palette }) => ({ cursor: 'pointer', color: colors[palette.mode].typography.typo4 })}
          onClick={onShare}
        />
      </ContainerBox>
    );
  }

  if (isReferralActive) {
    return <TickCircleIcon color="success" />;
  }

  return null;
};

const StyledBaseReferralStatusCellPill = styled(ContainerBox).attrs({ alignItems: 'center' })`
  ${({ theme: { spacing, palette } }) => `
    padding: ${spacing(1)} ${spacing(3)};
    border-radius: ${spacing(2)};
    background-color: ${colors[palette.mode].background.tertiary};
  `}
`;

const StyledPendingReferralStatusCellPill = styled(StyledBaseReferralStatusCellPill)`
  ${({ theme: { palette } }) => `
    border: 1px solid ${colors[palette.mode].semantic.warning.primary};
  `}
`;

const StyledActiveReferralStatusCellPill = styled(StyledBaseReferralStatusCellPill)`
  ${({ theme: { palette } }) => `
    border: 1px solid ${colors[palette.mode].border.border2};
  `}
`;

const ReferralStatusCell = ({
  isReferralActive,
  claimedBy,
}: {
  isReferralActive: boolean;
  claimedBy: InviteCodeWithReferralStatus['claimedBy'];
}) => {
  if (!claimedBy) {
    return null;
  }

  if (isReferralActive) {
    return (
      <ContainerBox gap={2} alignItems="center">
        <StyledActiveReferralStatusCellPill>
          <FormattedMessage description="tier-view.referrals.table.status.active" defaultMessage="Completed" />
        </StyledActiveReferralStatusCellPill>
      </ContainerBox>
    );
  }

  return (
    <ContainerBox gap={2} alignItems="center">
      <StyledPendingReferralStatusCellPill>
        <FormattedMessage description="tier-view.referrals.table.status.pending" defaultMessage="Pending Actions" />
      </StyledPendingReferralStatusCellPill>
      <Tooltip
        title={
          <FormattedMessage
            description="tier-view.referrals.table.status.pending.tooltip"
            defaultMessage="Your friend still has to deposit 100 USD on earn and keep it for 48 hours"
          />
        }
      >
        <ContainerBox>
          <InfoCircleIcon fontSize="small" sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
        </ContainerBox>
      </Tooltip>
    </ContainerBox>
  );
};

const ReferralsBodyItem = ({
  inviteCode: { code, claimedBy, isReferralActive },
  onShare,
}: {
  inviteCode: InviteCodeWithReferralStatus;
  onShare: (code: string) => void;
}) => {
  const intl = useIntl();
  const snackbar = useSnackbar();

  const onCopy = () => {
    copyTextToClipboard(
      intl.formatMessage(
        defineMessage({
          description: 'tier-view.referrals.table.copy.code',
          defaultMessage: 'Hey I want to invite you to earn!, you can use this code: {code}',
        }),
        { code }
      )
    );
    snackbar.enqueueSnackbar(
      intl.formatMessage(
        defineMessage({
          description: 'tier-view.referrals.table.copy.code.success',
          defaultMessage: 'Code copied to clipboard',
        })
      ),
      {
        variant: 'success',
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        },
        TransitionComponent: Zoom,
      }
    );
  };

  return (
    <>
      <StyledBodyTableCell>
        <Grid container flexDirection={'row'} alignItems={'center'} gap={3}>
          <Typography
            variant="bodySmallRegular"
            sx={{ textDecorationLine: claimedBy ? 'strikethrough' : 'none' }}
            color={({ palette }) =>
              claimedBy ? colors[palette.mode].typography.typo4 : colors[palette.mode].typography.typo2
            }
          >
            {code}
          </Typography>
        </Grid>
      </StyledBodyTableCell>
      <StyledBodyTableCell>
        <ReferralStatusCell isReferralActive={isReferralActive} claimedBy={claimedBy} />
      </StyledBodyTableCell>
      {/* Add date redeemed when be implemented */}
      {/* <TableCell>
        <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
          {DateTime.fromSeconds(claimedOn).toFormat('MMM d, t')}
        </Typography>
      </TableCell> */}
      <StyledTableEnd>
        <ReferralEndCell
          isReferralActive={isReferralActive}
          claimedBy={claimedBy}
          onCopy={onCopy}
          onShare={() => onShare(code)}
        />
      </StyledTableEnd>
    </>
  );
};

const ReferralsTable = () => {
  const inviteCodes = useInviteCodes();

  const totalInviteCodes = inviteCodes.length;
  const availableInviteCodes =
    totalInviteCodes - inviteCodes.filter((inviteCode) => inviteCode.isReferralActive).length;

  const [isShareQRModalOpen, setIsShareQRModalOpen] = React.useState(false);
  const [inviteCodeToShare, setInviteCodeToShare] = React.useState<string | null>(null);

  const onShare = (code: string) => {
    setInviteCodeToShare(code);
    setIsShareQRModalOpen(true);
  };

  const sortedInviteCodes = React.useMemo(
    () =>
      inviteCodes.sort((a, b) => {
        const priority = (item: InviteCodeWithReferralStatus) => {
          if (item.claimedBy && !item.isReferralActive) return 1; // Pending
          if (!item.claimedBy) return 2; // Unclaimed
          if (item.claimedBy && item.isReferralActive) return 3; // Claimed & Active
        };

        const pA = priority(a);
        const pB = priority(b);

        // If both items have the same priority or no priority, sort alphabetically
        if (!pA || !pB || pA === pB) return a.code.localeCompare(b.code);

        // Otherwise, sort by priority
        return pA - pB;
      }),
    [inviteCodes]
  );

  return (
    <>
      <ShareQRModal
        isOpen={isShareQRModalOpen}
        onClose={() => setIsShareQRModalOpen(false)}
        inviteCode={inviteCodeToShare}
      />
      <StyledReferralTable>
        <ContainerBox gap={2}>
          <ContainerBox gap={2} alignItems="center">
            <Typography variant="h6Bold">
              <FormattedMessage description="tier-view.referrals.table.title" defaultMessage="Referrals" />
            </Typography>
            <Typography variant="bodyBold">·</Typography>
            <Typography variant="bodyRegular">
              <FormattedMessage
                description="tier-view.referrals.table.description"
                defaultMessage="{availableReferrals} of {totalReferrals} left"
                values={{ availableReferrals: availableInviteCodes, totalReferrals: totalInviteCodes }}
              />
            </Typography>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox flex={1}>
          <TableContainer>
            <Table sx={{ tableLayout: 'auto' }}>
              <TableHead>
                <ReferralsTableHeader />
              </TableHead>
              <TableBody>
                {sortedInviteCodes.map((inviteCode) => (
                  <TableRow key={inviteCode.code} sx={({ spacing }) => ({ height: spacing(13) })}>
                    <ReferralsBodyItem inviteCode={inviteCode} onShare={onShare} />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ContainerBox>
      </StyledReferralTable>
    </>
  );
};

export default ReferralsTable;
