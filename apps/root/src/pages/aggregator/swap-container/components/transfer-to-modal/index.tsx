import React from 'react';

import AddressInput from '@common/components/address-input';
import { useAggregatorState } from '@state/aggregator/hooks';
import { useAppDispatch } from '@state/hooks';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import useValidateAddress from '@hooks/useValidateAddress';
import { Button, ContainerBox } from 'ui-library';
import { setTransferTo } from '@state/aggregator/actions';
import { SetStateCallback } from 'common-types';
import ContactModal, { ContactListActiveModal } from '@common/components/contact-modal';
import useAnalytics from '@hooks/useAnalytics';

interface TransferToModalProps {
  activeContactModal: ContactListActiveModal;
  setActiveContactModal: SetStateCallback<ContactListActiveModal>;
}

const TransferToModal = ({ activeContactModal, setActiveContactModal }: TransferToModalProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { transferTo } = useAggregatorState();
  const {
    validationResult: { isValidAddress: isValidRecipient, errorMessage },
    setAddress,
    address,
  } = useValidateAddress({
    restrictActiveWallet: true,
    defaultValue: transferTo,
  });
  const { trackEvent } = useAnalytics();

  const handleTransferToConfirmation = () => {
    dispatch(setTransferTo(address));
    setActiveContactModal(ContactListActiveModal.NONE);
    trackEvent('Aggregator - Set transfer to address');
  };

  const onClickContact = (newRecipient: string) => {
    setAddress(newRecipient);
  };

  return (
    <ContactModal
      activeModal={activeContactModal}
      setActiveModal={setActiveContactModal}
      innerInput={
        <ContainerBox flexDirection="column" fullWidth alignItems="center">
          <AddressInput
            id="transferToSwap"
            placeholder={intl.formatMessage(
              defineMessage({
                defaultMessage: 'Set the address to transfer to',
                description: 'transferToSwapModalPlaceholder',
              })
            )}
            value={address}
            onChange={setAddress}
            error={!isValidRecipient && !!errorMessage}
            helperText={errorMessage || ' '}
          />
          <Button
            size="large"
            variant="outlined"
            disabled={!isValidRecipient}
            onClick={handleTransferToConfirmation}
            fullWidth
          >
            <FormattedMessage defaultMessage="Confirm address" description="confirmAddress" />
          </Button>
        </ContainerBox>
      }
      customContactListTitle={
        <FormattedMessage description="swapAndTransferContactModalTitle" defaultMessage="Swap and Transfer" />
      }
      onClickContact={onClickContact}
    />
  );
};

export default TransferToModal;
