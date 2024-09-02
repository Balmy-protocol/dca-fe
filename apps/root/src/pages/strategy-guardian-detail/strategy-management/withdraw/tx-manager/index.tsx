import React from 'react';
import EarnWithdrawCTAButton from '../cta-button';
import { DisplayStrategy } from 'common-types';
import styled from 'styled-components';
import { ContainerBox } from 'ui-library';

const StyledButtonContainer = styled(ContainerBox).attrs({ alignItems: 'center', justifyContent: 'center' })`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

interface EarnWithdrawTransactionManagerProps {
  strategy?: DisplayStrategy;
}

const EarnWithdrawTransactionManager = ({ strategy }: EarnWithdrawTransactionManagerProps) => {
  return (
    <StyledButtonContainer>
      <EarnWithdrawCTAButton onHandleWithdraw={() => {}} strategy={strategy} />
    </StyledButtonContainer>
  );
};

export default EarnWithdrawTransactionManager;
