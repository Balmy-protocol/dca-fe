import React from 'react';
import styled from 'styled-components';
import Modal from 'common/modal';
import { Position } from 'types';
import { FormattedMessage } from 'react-intl';
import useTransactionModal from 'hooks/useTransactionModal';
import Typography from '@mui/material/Typography';
import { useTransactionAdder } from 'state/transactions/hooks';
import { TRANSACTION_TYPES } from 'config/constants';
import Link from '@mui/material/Link';
import usePositionService from 'hooks/usePositionService';

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

const StyledMigrateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
`;

interface MigratePositionModalProps {
  position: Position;
  onCancel: () => void;
  open: boolean;
}

const MigratePositionModal = ({ position, open, onCancel }: MigratePositionModalProps) => {
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const positionService = usePositionService();
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
      const result = await positionService.migratePosition(position);
      addTransaction(result, {
        type: TRANSACTION_TYPES.MIGRATE_POSITION,
        typeData: { id: position.id, from: position.from.symbol, to: position.to.symbol },
        position,
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
      showCloseIcon
      maxWidth="sm"
      title={
        <FormattedMessage
          description="migrate title"
          defaultMessage="Migrate {from}/{to} position"
          values={{ from: position.from.symbol, to: position.to.symbol }}
        />
      }
      actions={[
        {
          color: 'migrate',
          variant: 'contained',
          onClick: handleMigrate,
          label: <FormattedMessage description="migrate position" defaultMessage="Migrate position" />,
        },
      ]}
    >
      <StyledMigrateContainer>
        <Typography variant="body1">
          <FormattedMessage
            description="migrate description primary"
            defaultMessage="You are migrating a position from a deprecated version of Mean Finance to the newest one."
          />
          <FormattedMessage
            description="migrate description"
            defaultMessage="Your position will be closed here and we will create a new one on"
          />
          <StyledLink href="https://mean.finance" target="_blank">
            {` mean.finance.`}
          </StyledLink>
        </Typography>
        <Typography variant="body1">
          <FormattedMessage
            description="closed description"
            defaultMessage="All {to} balance will be sent to you and all {from} balance will be used to create a new position with the same rate and remaining swaps."
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
            }}
          />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage description="migrate warning" defaultMessage="This cannot be undone." />
        </Typography>
      </StyledMigrateContainer>
    </Modal>
  );
};
export default MigratePositionModal;
