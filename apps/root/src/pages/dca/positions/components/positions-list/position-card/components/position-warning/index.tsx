import React from 'react';
import { Position } from 'common-types';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, ErrorOutlineIcon, Link, Typography } from 'ui-library';
import { AAVE_FROZEN_TOKENS } from '@constants';

interface PositionWarningProps {
  position: Position;
}

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
  } else if (position.from.symbol === 'agEUR' || position.to.symbol === 'agEUR') {
    message = (
      <FormattedMessage
        description="positionagEURNotSupported"
        defaultMessage="Due to Euler's security breach, the Angle protocol has been paused. As a consequence, oracles and swaps cannot operate reliably and have been halted."
      />
    );
  }

  if ((!!position.from.underlyingTokens.length || !!position.to.underlyingTokens.length) && position.chainId === 1) {
    message = (
      <>
        <FormattedMessage
          description="positionEulerHack1"
          defaultMessage="Euler has frozen the contracts after the hack, so modifying positions or withdrawing is not possible at the moment. You might be entitled to claim compensation, to do this visit the"
        />
        <Link href="https://app.balmy.xyz/euler-claim" target="_blank">
          <FormattedMessage description="EulerClaim ClaimPage" defaultMessage="claim page" />
        </Link>
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

  return (
    message && (
      <ContainerBox alignItems="flex-start" gap={1}>
        <ErrorOutlineIcon fontSize="small" color="warning" />
        <Typography variant="bodySmallRegular" color="warning.dark">
          {message}
        </Typography>
      </ContainerBox>
    )
  );
};

export default PositionWarning;
