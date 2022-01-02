import React from 'react';
import some from 'lodash/some';
import { FullPosition } from 'types';
import { POSITION_ACTIONS } from 'config/constants';

function useHasBeenTransfered(position?: FullPosition) {
  return React.useMemo(
    () =>
      !!position && some(position.history, (positionAction) => positionAction.action === POSITION_ACTIONS.TRANSFERED),
    [position]
  );
}

export default useHasBeenTransfered;
