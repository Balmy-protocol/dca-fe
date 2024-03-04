import { defineMessage } from 'react-intl';

export enum ApiErrorKeys {
  BALANCES = 'BALANCES',
  LABELS_CONTACT_LIST = 'LABELS_CONTACT_LIST',
  HISTORY = 'HISTORY',
}

export const API_ERROR_MESSAGES: Record<ApiErrorKeys, ReturnType<typeof defineMessage>> = {
  [ApiErrorKeys.BALANCES]: defineMessage({
    description: 'errorApiBalances',
    defaultMessage: "We weren't able to get your balances, please refresh the site to try again",
  }),
  [ApiErrorKeys.LABELS_CONTACT_LIST]: defineMessage({
    description: 'errorApiLabelsContaacts',
    defaultMessage: "We weren't able to get your contact list, please refresh the site to try again",
  }),
  [ApiErrorKeys.HISTORY]: defineMessage({
    description: 'errorApiHistory',
    defaultMessage: "We weren't able to get your transactions history, please refresh the site to try again",
  }),
};
