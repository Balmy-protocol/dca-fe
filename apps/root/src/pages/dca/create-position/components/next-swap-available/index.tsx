import styled from 'styled-components';
import React from 'react';
import isUndefined from 'lodash/isUndefined';
import { DateTime } from 'luxon';
import { FormattedMessage } from 'react-intl';
import { Typography } from 'ui-library';
import { useCreatePositionState } from '@state/create-position/hooks';
import { AvailablePair } from '@types';

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

  const showNextSwapAvailableAt = !yieldEnabled || (yieldEnabled && !isUndefined(fromYield) && !isUndefined(toYield));

  return (
    <>
      {showNextSwapAvailableAt && !!nextSwapAvailableAt && (
        <StyledNextSwapContainer>
          <Typography variant="caption">
            {DateTime.fromSeconds(nextSwapAvailableAt) > DateTime.now() ? (
              <FormattedMessage
                description="nextSwapCreateTime.new"
                defaultMessage="Next swap for this position will be executed approximately {nextSwapAvailableAt}."
                values={{
                  nextSwapAvailableAt: DateTime.fromSeconds(nextSwapAvailableAt).toRelative() || '',
                }}
              />
            ) : (
              <FormattedMessage
                description="nextSwapCreateSoon.new"
                defaultMessage="Next swap for this position will be executed soon. Create a position now to be included in the next swap."
                values={{
                  nextSwapAvailableAt: DateTime.fromSeconds(nextSwapAvailableAt).toRelative() || '',
                }}
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
