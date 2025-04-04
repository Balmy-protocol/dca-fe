import { defineMessage } from 'react-intl';

export enum ApiErrorKeys {
  BALANCES = 'BALANCES',
  LABELS_CONTACT_LIST = 'LABELS_CONTACT_LIST',
  ENS = 'ENS',
  HISTORY = 'HISTORY',
  DCA_POSITIONS = 'DCA_POSITIONS',
  HAS_DCA_POSITIONS = 'HAS_DCA_POSITIONS',
  DCA_INDEXING_BLOCKS = 'DCA_INDEXING_BLOCKS',
  EARN_INDEXING_BLOCKS = 'EARN_INDEXING_BLOCKS',
  EARN = 'EARN',
}

export const API_ERROR_MESSAGES: Record<ApiErrorKeys, ReturnType<typeof defineMessage>> = {
  [ApiErrorKeys.BALANCES]: defineMessage({
    description: 'errorApiBalances',
    defaultMessage: "We weren't able to get your balances, please refresh the site to try again",
  }),
  [ApiErrorKeys.EARN]: defineMessage({
    description: 'errorApiEarn',
    defaultMessage: "We weren't able to get your Earn positions, please refresh the site to try again",
  }),
  [ApiErrorKeys.LABELS_CONTACT_LIST]: defineMessage({
    description: 'errorApiLabelsContaacts',
    defaultMessage: "We weren't able to get your contact list, please refresh the site to try again",
  }),
  [ApiErrorKeys.HISTORY]: defineMessage({
    description: 'errorApiHistory',
    defaultMessage: "We weren't able to get your transactions history, please refresh the site to try again",
  }),
  [ApiErrorKeys.DCA_POSITIONS]: defineMessage({
    description: 'errorApiDcaPositions',
    defaultMessage: "We weren't able to get your DCA positions, please refresh the site to try again",
  }),
  [ApiErrorKeys.HAS_DCA_POSITIONS]: defineMessage({
    description: 'errorApiDcaPositions',
    defaultMessage: "We weren't able to get your DCA positions, please refresh the site to try again",
  }),
  [ApiErrorKeys.DCA_INDEXING_BLOCKS]: defineMessage({
    description: 'errorApiDcaIndexingBlocks',
    defaultMessage: "We weren't able to get your recent positions, please refresh the site to try again",
  }),
  [ApiErrorKeys.EARN_INDEXING_BLOCKS]: defineMessage({
    description: 'errorApiEarnIndexingBlocks',
    defaultMessage: "We weren't able to get your recent earn positions, please refresh the site to try again",
  }),
  [ApiErrorKeys.ENS]: defineMessage({
    description: 'errorEnsNames',
    defaultMessage: "We weren't able to get your ENS names, please refresh the site to try again",
  }),
};
