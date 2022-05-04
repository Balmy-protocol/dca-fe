import React from 'react';
import styled from 'styled-components';
import Modal from 'common/modal';
import { Position } from 'types';
import { FormattedMessage } from 'react-intl';
import WalletContext from 'common/wallet-context';
import useTransactionModal from 'hooks/useTransactionModal';
import Typography from '@mui/material/Typography';
import { useTransactionAdder } from 'state/transactions/hooks';
import { TRANSACTION_TYPES } from 'config/constants';
import Link from '@mui/material/Link';

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

interface MigratePositionModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const MigratePositionModal = ({ position, open, onCancel }: MigratePositionModalProps) => {
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const { web3Service } = React.useContext(WalletContext);
  const addTransaction = useTransactionAdder();

  const handleMigrate = async () => {
    try {
      onCancel();
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="migrating position"
              defaultMessage="Migrating your {from}/{to} position"
              values={{
                from: position.from.symbol,
                to: position.to.symbol,
              }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.migratePosition(position.id);
      addTransaction(result, {
        type: TRANSACTION_TYPES.MIGRATE_POSITION,
        typeData: { id: position.id, from: position.from.symbol, to: position.to.symbol },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="migrating position success"
            defaultMessage="Migrating your {from}/{to} position has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
            }}
          />
        ),
      });
    } catch (e) {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: 'error while migrating position',
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  return (
    <Modal
      open={open}
      showCloseButton
      onClose={onCancel}
      actions={[
        {
          color: 'primary',
          variant: 'contained',
          onClick: handleMigrate,
          label: <FormattedMessage description="migrate position" defaultMessage="Migrate position" />,
        },
      ]}
    >
      <Typography variant="h6">
        <FormattedMessage
          description="migrate title"
          defaultMessage="Migrate {from}/{to} position"
          values={{ from: position.from.symbol, to: position.to.symbol }}
        />
      </Typography>
      <Typography variant="body1">
        <FormattedMessage
          description="migrate description"
          defaultMessage="Your position will be terminated here and we will create a new one on"
        />
        <StyledLink href="https://mean.finance" target="_blank">
          {` mean.finance`}
        </StyledLink>
      </Typography>
      <Typography variant="body1">
        <FormattedMessage
          description="terminate description"
          defaultMessage="You will get back whatever has been swapped on your position and the remaining funds will be used for the new position"
        />
      </Typography>
      <Typography variant="body1">
        <FormattedMessage description="migrate warning" defaultMessage="This cannot be undone." />
      </Typography>
    </Modal>
  );
};
export default MigratePositionModal;
