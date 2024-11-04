import Address from '@common/components/address';
import React from 'react';
import useActiveWallet from '@hooks/useActiveWallet';
import styled, { useTheme } from 'styled-components';
import { CircularProgress, colors, ContainerBox, SuccessTickIcon, Typography } from 'ui-library';
import { FormattedMessage } from 'react-intl';

const StyledTransactionStepIcon = styled.div<{ isLast: boolean; isCurrentStep: boolean }>`
  ${({ theme: { palette, spacing }, isLast, isCurrentStep }) => `
  position: relative;
  ${
    !isLast &&
    `&:after {
    content: '';
    position: absolute;
    width: ${spacing(1.25)};
    left: calc(50% - ${spacing(0.625)});
    top: ${spacing(15)};
    right: 0;
    bottom: 0;
    background: ${isCurrentStep ? palette.gradient.main : colors[palette.mode].background.secondary};
  }`
  }
`}
`;

const iconContentBorderColor = (
  mode: 'light' | 'dark',
  isCurrentStep: boolean,
  variant: 'primary' | 'secondary',
  done?: boolean
) => {
  if (done) {
    return colors[mode].border.border1;
  }

  if (variant === 'primary') {
    return isCurrentStep ? colors[mode].violet.violet500 : colors[mode].background.secondary;
  }

  return colors[mode].border.border2;
};

const iconContentBackgroundColor = (mode: 'light' | 'dark', variant: 'primary' | 'secondary', done?: boolean) => {
  if (done) {
    return colors[mode].background.quartery;
  }
  if (variant === 'primary') {
    return colors[mode].background.tertiary;
  }
  return colors[mode].background.secondary;
};

const iconContentColor = (mode: 'light' | 'dark', done?: boolean) => {
  if (done) {
    return colors[mode].semantic.success.primary;
  }
  return colors[mode].violet.violet600;
};

const StyledTransactionStepIconContent = styled.div<{
  isCurrentStep: boolean;
  variant: 'primary' | 'secondary';
  done?: boolean;
}>`
  ${({ theme: { palette, spacing }, isCurrentStep, variant, done }) => `
  display: flex;
  padding: ${spacing(4)};
  background-color: ${iconContentBackgroundColor(palette.mode, variant, done)};
  border-radius: 50%;
  border: ${spacing(0.875)} solid;
  border-color: ${iconContentBorderColor(palette.mode, isCurrentStep, variant, done)};
  ${isCurrentStep ? `box-shadow: ${colors[palette.mode].dropShadow.dropShadow100}` : ''};
  z-index: 99;
  & .MuiSvgIcon-root {
    color: ${iconContentColor(palette.mode, done)};
  }
`}
`;

const StyledTransactionStepContent = styled(ContainerBox).attrs({
  flexDirection: 'column',
  justifyContent: 'center',
  fullWidth: true,
  gap: 6,
})<{ isLast: boolean }>`
  ${({ theme: { spacing }, isLast }) => `
  padding-bottom: ${isLast ? '0' : spacing(12)};
`}
`;

const StyledTransactionStepTitle = styled(Typography).attrs({ variant: 'h5Bold' })<{
  $isCurrentStep: boolean;
}>`
  ${({ theme: { palette }, $isCurrentStep }) => `
    color: ${$isCurrentStep ? colors[palette.mode].typography.typo1 : colors[palette.mode].typography.typo3};
    `}
`;

const StyledTransactionStepWallet = styled(Typography).attrs({ variant: 'bodySmallSemibold' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo3};
    `}
`;

export interface CommonTransactionStepItemProps {
  onGoToEtherscan: (hash: string) => void;
  isLast: boolean;
  isCurrentStep: boolean;
  done?: boolean;
  variant?: 'primary' | 'secondary';
  explanation?: string;
}

type CommonTransactionActionProps = DistributiveOmit<CommonTransactionStepItemProps, 'onGoToEtherscan'> & {
  title?: React.ReactElement;
  icon: React.ReactElement;
  isLoading?: boolean;
  hideWalletLabel?: boolean;
};

const CommonTransactionStepItem = ({
  isLast,
  isCurrentStep,
  done,
  variant = 'primary',
  title,
  icon,
  explanation,
  children,
  isLoading,
  hideWalletLabel,
}: React.PropsWithChildren<CommonTransactionActionProps>) => {
  const activeWallet = useActiveWallet();
  const account = activeWallet?.address;
  const { spacing } = useTheme();

  return (
    <>
      <StyledTransactionStepIcon isLast={isLast} isCurrentStep={isCurrentStep}>
        <StyledTransactionStepIconContent isCurrentStep={isCurrentStep} done={done} variant={variant}>
          {isLoading ? <CircularProgress size={spacing(5)} thickness={5} /> : done ? <SuccessTickIcon /> : icon}
        </StyledTransactionStepIconContent>
      </StyledTransactionStepIcon>
      <StyledTransactionStepContent isLast={isLast}>
        {title && (
          <ContainerBox flexDirection="column" gap={1}>
            <StyledTransactionStepTitle $isCurrentStep={isCurrentStep}>{title}</StyledTransactionStepTitle>
            {!hideWalletLabel && (
              <StyledTransactionStepWallet>
                <Address trimAddress address={account || ''} />
              </StyledTransactionStepWallet>
            )}
          </ContainerBox>
        )}
        {children}
        {explanation && isCurrentStep && (
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="bodySemibold">
              <FormattedMessage description="transactionStepsWhy" defaultMessage="Why do I need to do this?" />
            </Typography>
            <Typography variant="bodySmallRegular">{explanation}</Typography>
          </ContainerBox>
        )}
      </StyledTransactionStepContent>
    </>
  );
};

export default CommonTransactionStepItem;
