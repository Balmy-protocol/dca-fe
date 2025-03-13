import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from 'ui-library';

interface UpdateNotificationProps {
  onUpdate: () => void;
}

const NotificationContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 320px;
  z-index: 9999;
  border: 1px solid #e0e0e0;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
`;

const Message = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666666;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 8px;
`;

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onUpdate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for service worker update events
    const handleServiceWorkerUpdate = () => {
      setIsVisible(true);
    };

    // Register event listener
    window.addEventListener('serviceWorkerUpdate', handleServiceWorkerUpdate);

    return () => {
      window.removeEventListener('serviceWorkerUpdate', handleServiceWorkerUpdate);
    };
  }, []);

  const handleUpdate = () => {
    setIsVisible(false);
    onUpdate();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <NotificationContainer>
      <Title>Update Available</Title>
      <Message>A new version of Balmy is available. Update now to get the latest features and improvements.</Message>
      <ButtonContainer>
        <Button variant="outlined" onClick={handleDismiss}>
          Later
        </Button>
        <Button variant="contained" onClick={handleUpdate}>
          Update Now
        </Button>
      </ButtonContainer>
    </NotificationContainer>
  );
};

export default UpdateNotification;
