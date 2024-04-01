import React from 'react';
import { useAppDispatch } from '@hooks/state';
import { fetchInitialBalances, fetchPricesForAllChains } from '@state/balances/actions';
import useTokenListByChainId from '@hooks/useTokenListByChainId';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import { Button, Zoom, useSnackbar } from 'ui-library';
import { timeoutPromise } from '@mean-finance/sdk';
import { TimeoutPromises } from '@constants/timing';
import useContactListService from '@hooks/useContactListService';
import useTransactionService from '@hooks/useTransactionService';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { API_ERROR_MESSAGES, ApiErrorKeys } from '@constants';
import useUser from '@hooks/useUser';
import { UserStatus } from 'common-types';
import useTrackEvent from '@hooks/useTrackEvent';
import usePositionService from '@hooks/usePositionService';

const PromisesInitializer = () => {
  const dispatch = useAppDispatch();
  const user = useUser();
  const tokenListByChainId = useTokenListByChainId();
  const isLoadingAllTokenLists = useIsLoadingAllTokenLists();
  const contactListService = useContactListService();
  const transactionService = useTransactionService();
  const positionService = usePositionService();
  const intl = useIntl();
  const fetchRef = React.useRef(true);
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const trackEvent = useTrackEvent();

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
    const fetchBalancesAndPrices = async () => {
      // Fire-and-Forget Promises
      timeoutPromise(contactListService.initializeAliasesAndContacts(), TimeoutPromises.COMMON, {
        description: ApiErrorKeys.LABELS_CONTACT_LIST,
      }).catch(handleError);
      timeoutPromise(transactionService.fetchTransactionsHistory(), TimeoutPromises.COMMON, {
        description: ApiErrorKeys.HISTORY,
      }).catch(handleError);
      timeoutPromise(positionService.fetchUserHasPositions(), TimeoutPromises.COMMON, {
        description: ApiErrorKeys.HISTORY,
      }).catch(handleError);
      timeoutPromise(positionService.fetchCurrentPositions(), TimeoutPromises.COMMON, {
        description: ApiErrorKeys.DCA_POSITIONS,
      }).catch(handleError);

      // Awaited Promises
      try {
        await timeoutPromise(dispatch(fetchInitialBalances({ tokenListByChainId })).unwrap(), TimeoutPromises.COMMON, {
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
      void fetchBalancesAndPrices();
      fetchRef.current = false;
    }
  }, [user?.status, tokenListByChainId, isLoadingAllTokenLists, handleError]);

  React.useEffect(() => {
    if (user?.status !== UserStatus.notLogged) {
      fetchRef.current = true;
    }
  }, [user?.status]);
  return null;
};

export default PromisesInitializer;
