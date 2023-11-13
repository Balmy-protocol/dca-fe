import React from 'react';
import { parseUnits } from '@ethersproject/units';
import useContactListService from '@hooks/useContactListService';
import { useTransferState } from '@state/transfer/hooks';
import { FormattedMessage } from 'react-intl';
import { Button, Typography } from 'ui-library';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import { Token, TokenType } from '@types';
import useActiveWallet from '@hooks/useActiveWallet';

const TransferButton = () => {
  const { token, amount, recipient } = useTransferState();
  const contactListService = useContactListService();
  const activeWallet = useActiveWallet();

  const parsedAmount = parseUnits(amount || '0', token?.decimals);
  const disableTransfer = !recipient || !token || parsedAmount.lte(0) || !activeWallet;

  const onTransfer = async () => {
    if (disableTransfer) {
      return;
    }
    try {
      const isProtocolToken = token.address === PROTOCOL_TOKEN_ADDRESS;
      const parsedToken: Token = { ...token, type: isProtocolToken ? TokenType.BASE : TokenType.ERC20_TOKEN };

      await contactListService.transferTokenToContact({
        from: activeWallet.address,
        contact: { address: recipient },
        token: parsedToken,
        amount: parsedAmount,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Button variant="outlined" fullWidth onClick={onTransfer} disabled={disableTransfer}>
      <Typography variant="body1">
        <FormattedMessage description="transfer transferButton" defaultMessage="Transfer" />
      </Typography>
    </Button>
  );
};

export default TransferButton;
