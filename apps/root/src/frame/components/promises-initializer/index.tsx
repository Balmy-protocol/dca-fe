import React from 'react';
import { useAppDispatch } from '@hooks/state';
import { fetchInitialBalances, fetchPricesForAllChains } from '@state/balances/actions';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import { Button, Zoom, useSnackbar } from 'ui-library';
import { timeoutPromise } from '@balmy/sdk';
import { TimeoutPromises } from '@constants/timing';
import useContactListService from '@hooks/useContactListService';
import useTransactionService from '@hooks/useTransactionService';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { API_ERROR_MESSAGES, ApiErrorKeys } from '@constants';
import useUser from '@hooks/useUser';
import { UserStatus } from 'common-types';
import useAnalytics from '@hooks/useAnalytics';
import usePositionService from '@hooks/usePositionService';
import { processConfirmedTransactionsForDca, processConfirmedTransactionsForEarn } from '@state/transactions/actions';
import useEarnService from '@hooks/earn/useEarnService';
import useLabelService from '@hooks/useLabelService';
import useEarnAccess from '@hooks/useEarnAccess';

const PromisesInitializer = () => {
  const dispatch = useAppDispatch();
  const user = useUser();
  const isLoadingAllTokenLists = useIsLoadingAllTokenLists();
  const contactListService = useContactListService();
  const transactionService = useTransactionService();
  const positionService = usePositionService();
  const earnService = useEarnService();
  const labelService = useLabelService();
  const intl = useIntl();
  const fetchRef = React.useRef(true);
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const { hasEarnAccess } = useEarnAccess();

  const handleError = React.useCallback(
    (error: unknown) => {
      if (error instanceof Error) {
        const errorKey = Object.values(ApiErrorKeys).find((key) => error.message.includes(key));
        if (!errorKey) {
          return;
        }

        trackEvent(`Api initial request failed`, {
          requestType: errorKey,
          timeouted: error.message.includes('timeouted'),
        });

        snackbar.enqueueSnackbar(intl.formatMessage(API_ERROR_MESSAGES[errorKey]), {
          variant: 'error',
          action: (
            <>
              <Button
                onClick={() => {
                  navigate(0);
                }}
                color="success"
              >
                <FormattedMessage description="refresh" defaultMessage="Refresh" />
              </Button>
              <Button
                onClick={() => {
                  snackbar.closeSnackbar(errorKey);
                }}
              >
                <FormattedMessage description="close" defaultMessage="Close" />
              </Button>
            </>
          ),
          key: errorKey,
          preventDuplicate: true,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'right',
          },
          persist: true,
          TransitionComponent: Zoom,
        });
      }
    },
    [snackbar, navigate, intl]
  );

  React.useEffect(() => {
    const executeInitialRequests = async () => {
      // Fire-and-Forget Promises
      timeoutPromise(contactListService.fetchLabelsAndContactList(), TimeoutPromises.COMMON, {
        description: ApiErrorKeys.LABELS_CONTACT_LIST,
      }).catch(handleError);
      void timeoutPromise(labelService.initializeWalletsEnsNames(), TimeoutPromises.COMMON, {
        description: ApiErrorKeys.ENS,
      }).catch(() => {});
      timeoutPromise(transactionService.fetchIndexingBlocks(), TimeoutPromises.COMMON, {
        description: ApiErrorKeys.DCA_INDEXING_BLOCKS,
      }).catch(handleError);
      timeoutPromise(transactionService.fetchTransactionsHistory({ isFetchMore: false }), TimeoutPromises.COMMON, {
        description: ApiErrorKeys.HISTORY,
      }).catch(handleError);
      timeoutPromise(positionService.fetchUserHasPositions(), TimeoutPromises.COMMON, {
        description: ApiErrorKeys.HISTORY,
      }).catch(handleError);
      if (hasEarnAccess) {
        timeoutPromise(earnService.fetchUserStrategies(), TimeoutPromises.COMMON, {
          description: ApiErrorKeys.EARN,
        })
          .then(() => void dispatch(processConfirmedTransactionsForEarn()))
          .catch(handleError);
      }
      timeoutPromise(positionService.fetchCurrentPositions(), TimeoutPromises.COMMON, {
        description: ApiErrorKeys.DCA_POSITIONS,
      })
        .then(() => void dispatch(processConfirmedTransactionsForDca()))
        .catch(handleError);

      // Awaited Promises
      try {
        await timeoutPromise(dispatch(fetchInitialBalances()).unwrap(), TimeoutPromises.COMMON, {
          description: ApiErrorKeys.BALANCES,
        });
        await timeoutPromise(dispatch(fetchPricesForAllChains()), TimeoutPromises.COMMON);
      } catch (error) {
        if (error instanceof Error) {
          handleError(error);
        } else {
          handleError(new Error(ApiErrorKeys.BALANCES));
        }
      }
    };

    if (fetchRef.current && user?.status === UserStatus.loggedIn && !isLoadingAllTokenLists) {
      void executeInitialRequests();
      fetchRef.current = false;
    }
  }, [user, isLoadingAllTokenLists, handleError]);

  React.useEffect(() => {
    if (!user || user.status !== UserStatus.loggedIn) {
      fetchRef.current = true;
    }
  }, [user]);
  return null;
};

export default PromisesInitializer;
