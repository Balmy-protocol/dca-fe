import { AccountLabels, Token, TransactionEvent, TransactionEventTypes } from 'common-types';
import intersection from 'lodash/intersection';
import some from 'lodash/some';
import { TRANSACTION_TYPE_TITLE_MAP } from 'ui-library';

const searchByTxData = (event: TransactionEvent, search: string) => {
  const {
    network: { name },
    txHash,
    initiatedBy,
  } = event.tx;

  return (
    name.toLowerCase().includes(search) ||
    txHash.toLowerCase().includes(search) ||
    initiatedBy.toLowerCase().includes(search)
  );
};

const searchByType = (event: TransactionEvent, search: string) =>
  TRANSACTION_TYPE_TITLE_MAP[event.type].toLowerCase().includes(search);

const getTokenSearchParameters = ({ name, symbol, address }: Token) => [name, symbol, address];

const getTransactionEventSearchTerms = (event: TransactionEvent) => {
  let termsToSearch: string[] = [];
  switch (event.type) {
    case TransactionEventTypes.ERC20_APPROVAL:
      const { token: approvalToken, owner, spender } = event.data;
      termsToSearch = [...getTokenSearchParameters(approvalToken), owner, spender];
      break;
    case TransactionEventTypes.DCA_WITHDRAW:
    case TransactionEventTypes.DCA_TERMINATED:
    case TransactionEventTypes.DCA_MODIFIED:
    case TransactionEventTypes.DCA_PERMISSIONS_MODIFIED:
    case TransactionEventTypes.DCA_CREATED:
    case TransactionEventTypes.DCA_TRANSFER:
      const { fromToken, toToken } = event.data;
      termsToSearch = [...getTokenSearchParameters(fromToken), ...getTokenSearchParameters(toToken)];
      break;
    case TransactionEventTypes.SWAP:
      const { tokenIn, tokenOut, recipient } = event.data;
      termsToSearch = [...getTokenSearchParameters(tokenIn), ...getTokenSearchParameters(tokenOut), recipient];
      break;
    case TransactionEventTypes.ERC20_TRANSFER:
    case TransactionEventTypes.NATIVE_TRANSFER:
      const { token: transferToken, from, to } = event.data;
      termsToSearch = [...getTokenSearchParameters(transferToken), from, to];
      break;
  }

  return termsToSearch;
};
const searchByData = (event: TransactionEvent, search: string) => {
  const termsToSearch: string[] = getTransactionEventSearchTerms(event);

  return some(termsToSearch, (term) => term.toLowerCase().includes(search));
};

const searchByLabels = (event: TransactionEvent, accountLabels: AccountLabels, search: string) => {
  const termsToSearch: string[] = getTransactionEventSearchTerms(event);
  const labels = Object.keys(accountLabels).map((address) => address.toLowerCase());

  const possibleTerms = intersection(termsToSearch, labels).map((possibleKey) => accountLabels[possibleKey].label);

  return some(possibleTerms, (term) => term.toLowerCase().includes(search));
};

const searchFunctions = [searchByData, searchByTxData, searchByType];

export const filterEvents = (events: TransactionEvent[], accountLabels: AccountLabels, upperSearch: string) => {
  const search = upperSearch.toLowerCase();

  return events.filter(
    (event) => some(searchFunctions, (fn) => fn(event, search)) || searchByLabels(event, accountLabels, search)
  );
};
