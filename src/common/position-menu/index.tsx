import React from 'react';
import styled from 'styled-components';
import Slide from '@material-ui/core/Slide';
import { Position } from 'types';
import PositionSettings from 'common/position-settings';
import RemoveFundsSettings from 'common/remove-funds-settings';
import ModifyRateSettings from 'common/modify-rate-settings';
import { BigNumber } from 'ethers';

const StyledOverlay = styled.div<{ withPadding: boolean }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: white;
  padding: ${(props) => (props.withPadding ? '10px 30px' : '10px 0px')};
  display: flex;
  flex-direction: column;
`;

interface PositionMenuProps {
  position: Position;
  onClose: () => void;
  shouldShow: boolean;
  balance: BigNumber;
  onWithdraw: (position: Position) => void;
  onModifyRateAndSwaps: (newRate: string, newSwaps: string) => void;
  onRemoveFunds: (ammountToRemove: string) => void;
}

const PositionMenu = ({
  onClose,
  shouldShow,
  onWithdraw,
  onModifyRateAndSwaps,
  onRemoveFunds,
  position,
  balance,
}: PositionMenuProps) => {
  const [activeMenu, setActiveMenu] = React.useState('settings');

  const onWithdrawPosition = () => onWithdraw(position);
  const onRemoveFundsPosition = (ammountToRemove: string) => {
    onRemoveFunds(ammountToRemove);
    onClose();
    setActiveMenu('settings');
  };
  const onModifyRateAndSwapsPosition = (rateValue: string, frequencyValue: string) => {
    onModifyRateAndSwaps(rateValue, frequencyValue);
    onClose();
    setActiveMenu('settings');
  };
  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay withPadding={activeMenu !== 'modifyRate'}>
        {activeMenu === 'settings' && (
          <PositionSettings
            onClose={onClose}
            onWithdraw={onWithdrawPosition}
            onModifyRate={() => setActiveMenu('modifyRate')}
            onRemoveFunds={() => setActiveMenu('removeFunds')}
          />
        )}
        {activeMenu === 'removeFunds' && (
          <RemoveFundsSettings
            onClose={() => setActiveMenu('settings')}
            position={position}
            onWithdraw={onRemoveFundsPosition}
          />
        )}
        {activeMenu === 'modifyRate' && (
          <ModifyRateSettings
            onClose={() => setActiveMenu('settings')}
            position={position}
            onModifyRateAndSwaps={onModifyRateAndSwapsPosition}
            balance={balance}
            isMinimal
          />
        )}
      </StyledOverlay>
    </Slide>
  );
};

export default PositionMenu;
