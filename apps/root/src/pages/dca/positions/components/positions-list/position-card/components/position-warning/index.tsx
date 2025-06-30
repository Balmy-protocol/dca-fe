import React from 'react';
import { Position } from 'common-types';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, ErrorOutlineIcon, Link, Typography, colors } from 'ui-library';
import { AAVE_FROZEN_TOKENS, SONNE_FROZEN_TOKENS, YEARN_SONNE_FROZEN_TOKENS } from '@constants';
import styled from 'styled-components';
import { Chains } from '@balmy/sdk';

interface PositionWarningProps {
  position: Position;
}

const StyledWarning = styled(ContainerBox)`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    background-color: ${colors[mode].semanticBackground.warning};
    border: 1px solid ${colors[mode].semantic.warning.darker};
    border-radius: ${spacing(5)};
    padding: ${spacing(4)}
  `}
`;

const PositionWarning = ({ position }: PositionWarningProps) => {
  let message: React.ReactElement | undefined;

  if (
    (position.from.symbol === 'CRV' && position.yields.from) ||
    (position.to.symbol === 'CRV' && position.yields.to)
  ) {
    message = (
      <FormattedMessage
        description="positionCRVNotSupported"
        defaultMessage="Unfortunately, the CRV token can no longer be used as collateral on Aave V3. This means that it's not possible to swap this position."
      />
    );
  } else if (position.from.symbol === 'UNIDX' || position.to.symbol === 'UNIDX') {
    message = (
      <FormattedMessage
        description="positionUNIDXNotSupported"
        defaultMessage="$UNIDX liquidity has been moved out of Uniswap, thus rendering the oracle unreliable. Swaps have been paused until a reliable oracle for $UNIDX is available"
      />
    );
  } else if (position.from.symbol === 'LPT') {
    message = (
      <FormattedMessage
        description="positionLPTNotSupported"
        defaultMessage="Livepeer liquidity on Arbitrum has decreased significantly, so adding funds is disabled until this situation has reverted."
      />
    );
  } else if (position.from.symbol === 'jEUR' && position.yields.from) {
    message = (
      <>
        <FormattedMessage
          description="positionJEURNotSupported"
          defaultMessage="Due to the latest developments Aave has paused the $jEUR lending and borrowing. As a result, increasing the position has been disabled. Read more about this here"
        />
        <Link href="https://app.aave.com/governance/proposal/?proposalId=143" target="_blank">
          <FormattedMessage description="here" defaultMessage="here." />
        </Link>
      </>
    );
  }

  if ((!!position.from.underlyingTokens.length || !!position.to.underlyingTokens.length) && position.chainId === 1) {
    message = (
      <>
        <FormattedMessage
          description="positionEulerHack1"
          defaultMessage="Euler has experienced a security incident and your funds may be eligible for recovery. Please join our Discord and contact us through the #support channel for assistance with the recovery process."
        />
      </>
    );
  }

  if (
    AAVE_FROZEN_TOKENS.includes(position.yields.to?.tokenAddress.toLowerCase() || '') ||
    AAVE_FROZEN_TOKENS.includes(position.yields.from?.tokenAddress.toLowerCase() || '')
  ) {
    message = (
      <>
        <FormattedMessage
          description="positionAaveVulnerability"
          defaultMessage="Due to recent updates, Aave has temporarily suspended certain lending and borrowing pools. Rest assured, no funds are at risk and Aave’s DAO already has a governance proposal to re-enable safely previously affected pools. However, during this period, you won’t be able to interact with your position and we won’t be able to execute the swaps. For a comprehensive understanding of Aave’s decision,"
        />
        <Link href="https://governance.aave.com/t/aave-v2-v3-security-incident-04-11-2023/15335/1" target="_blank">
          <FormattedMessage
            description="clickhereForAnnouncement"
            defaultMessage="click here to read their official announcement."
          />
        </Link>
      </>
    );
  }

  if (
    SONNE_FROZEN_TOKENS.includes(position.yields.to?.tokenAddress.toLowerCase() || '') ||
    SONNE_FROZEN_TOKENS.includes(position.yields.from?.tokenAddress.toLowerCase() || '')
  ) {
    message = (
      <>
        <FormattedMessage
          description="positionSonneVulnerability"
          defaultMessage="Due to a recent hack on the Sonne protocol, adding funds to your DCA positions generating yield on Sonne is disabled. You can still withdraw and close your positions, but these actions may fail or not return the total amount of your invested tokens. For updates, we recommend following"
        />
        <Link
          href="https://twitter.com/SonneFinance"
          target="_blank"
          sx={{ display: 'inline-flex', margin: ({ spacing }) => `0px ${spacing(1)}` }}
        >
          <FormattedMessage description="clickhereForAnnouncementSonne" defaultMessage="their Twitter account." />
        </Link>
        <FormattedMessage description="positionSonneVulnerability2" defaultMessage="Please proceed with caution." />
      </>
    );
  }

  if (position.chainId === Chains.ROOTSTOCK.chainId) {
    message = (
      <>
        <FormattedMessage
          description="rootstock_warning"
          defaultMessage="Rootstock has been deprecated. Increases and deposits are disabled and swaps will not be executed. You can still withdraw and close your positions."
        />
      </>
    );
  }

  if (
    YEARN_SONNE_FROZEN_TOKENS.includes(position.yields.to?.tokenAddress.toLowerCase() || '') ||
    YEARN_SONNE_FROZEN_TOKENS.includes(position.yields.from?.tokenAddress.toLowerCase() || '')
  ) {
    message = (
      <>
        <FormattedMessage
          description="positionSonneYearnVulnerability"
          defaultMessage="Due to a recent hack on the Sonne (which Yearn uses to generate yield) protocol, adding funds to your DCA positions generating yield on Yearn is disabled. You can still withdraw and close your positions, but these actions may fail or not return the total amount of your invested tokens. For updates, we recommend following"
        />
        <Link
          href="https://twitter.com/SonneFinance"
          target="_blank"
          sx={{ display: 'inline-flex', margin: ({ spacing }) => `0px ${spacing(1)}` }}
        >
          <FormattedMessage description="clickhereForAnnouncementSonne" defaultMessage="their Twitter account." />
        </Link>
        <FormattedMessage description="positionSonneVulnerability2" defaultMessage="Please proceed with caution." />
      </>
    );
  }

  return (
    message && (
      <StyledWarning alignItems="flex-start" gap={1}>
        <ErrorOutlineIcon fontSize="small" color="warning" />
        <Typography variant="bodySmallRegular" color="warning.dark">
          {message}
        </Typography>
      </StyledWarning>
    )
  );
};

export default PositionWarning;
