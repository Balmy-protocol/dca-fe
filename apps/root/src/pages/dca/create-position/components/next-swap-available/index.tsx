import styled from 'styled-components';
import React from 'react';
import findIndex from 'lodash/findIndex';
import isUndefined from 'lodash/isUndefined';
import { DateTime } from 'luxon';
import { FormattedMessage } from 'react-intl';
import { Typography } from 'ui-library';
import { useCreatePositionState } from '@state/create-position/hooks';
import { AvailablePair } from '@types';
import { SWAP_INTERVALS_MAP } from '@constants';

const StyledNextSwapContainer = styled.div`
  display: flex;
  margin-top: 5px;
`;

type Props = {
  existingPair?: AvailablePair;
  yieldEnabled: boolean;
};

const NextSwapAvailable = ({ existingPair, yieldEnabled }: Props) => {
  const { fromYield, frequencyType, toYield } = useCreatePositionState();

  const nextSwapAvailableAt = existingPair?.nextSwapAvailableAt[Number(frequencyType)];
  console.log(
    existingPair,
    nextSwapAvailableAt && DateTime.fromSeconds(nextSwapAvailableAt).toRelative(),
    nextSwapAvailableAt && DateTime.fromMillis(nextSwapAvailableAt).toRelative()
  );

  const showNextSwapAvailableAt = !yieldEnabled || (yieldEnabled && !isUndefined(fromYield) && !isUndefined(toYield));

  return (
    <>
      {showNextSwapAvailableAt && !!nextSwapAvailableAt && (
        <StyledNextSwapContainer>
          <Typography variant="caption">
            <FormattedMessage
              description="nextSwapCreate"
              defaultMessage="Next swap for this position will be executed "
            />
            {DateTime.fromSeconds(nextSwapAvailableAt) > DateTime.now() && (
              <FormattedMessage
                description="nextSwapCreateTime"
                defaultMessage="&nbsp;approximately {nextSwapAvailableAt}."
                values={{
                  nextSwapAvailableAt: DateTime.fromSeconds(nextSwapAvailableAt).toRelative() || '',
                }}
              />
            )}
            {DateTime.fromSeconds(nextSwapAvailableAt) < DateTime.now() && (
              <FormattedMessage
                description="nextSwapCreateSoon"
                defaultMessage="&nbsp;soon. Create a position now to be included in the next swap."
              />
            )}
          </Typography>
        </StyledNextSwapContainer>
      )}
      {showNextSwapAvailableAt && !nextSwapAvailableAt && !existingPair && (
        <StyledNextSwapContainer>
          <Typography variant="caption">
            <FormattedMessage
              description="nextSwapCreateNoPair"
              defaultMessage="Next swap will be executed within the first hour after the position is created."
            />
          </Typography>
        </StyledNextSwapContainer>
      )}
      {showNextSwapAvailableAt && !nextSwapAvailableAt && !!existingPair && (
        <StyledNextSwapContainer>
          <Typography variant="caption">
            <FormattedMessage
              description="nextSwapCreateNoPositions"
              defaultMessage="Next swap will be executed within the first hour after the position is created."
            />
          </Typography>
        </StyledNextSwapContainer>
      )}
    </>
  );
};

export default NextSwapAvailable;
