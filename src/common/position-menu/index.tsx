import React from 'react';
import styled from 'styled-components';
import Slide from '@material-ui/core/Slide';
import { Position } from 'types';
import PositionSettings from 'common/position-settings';
import RemoveFundsSettings from 'common/remove-funds-settings';
import ModifyRateSettings from 'common/modify-rate-settings';

const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background-color: white;
  padding: 10px 30px;
  display: flex;
  flex-direction: column;
`;

interface PositionMenuProps {
  position: Position;
  onClose: () => void;
  shouldShow: boolean;
  onWithdraw: (position: Position) => void;
  onTerminate: (position: Position) => void;
  onModifyRate: (ammountToRemove: string) => void;
  onRemoveFunds: (ammountToRemove: string) => void;
}

const PositionMenu = ({
  onClose,
  shouldShow,
  onWithdraw,
  onTerminate,
  onModifyRate,
  onRemoveFunds,
  position,
}: PositionMenuProps) => {
  const [activeMenu, setActiveMenu] = React.useState('settings');

  const onTerminatePosition = () => onTerminate(position);
  const onWithdrawPosition = () => onWithdraw(position);
  const onRemoveFundsPosition = (ammountToRemove: string) => {
    onRemoveFunds(ammountToRemove);
    onClose();
    setActiveMenu('settings');
  };
  const onModifyRatePosition = (frequencyValue: string) => {
    onModifyRate(frequencyValue);
    onClose();
    setActiveMenu('settings');
  };
  return (
    <Slide direction="up" in={shouldShow} mountOnEnter unmountOnExit>
      <StyledOverlay>
        {activeMenu === 'settings' && (
          <PositionSettings
            onClose={onClose}
            onWithdraw={onWithdrawPosition}
            onTerminate={onTerminatePosition}
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
            onModifyRate={onModifyRatePosition}
          />
        )}
      </StyledOverlay>
    </Slide>
  );
};

export default PositionMenu;
