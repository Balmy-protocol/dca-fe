import React from 'react';
import { ContainerBox, DividerBorder2, Skeleton, Typography } from 'ui-library';
import { StyledHeader } from '.';
import ComposedTokenIcon from '@common/components/composed-token-icon';

const PositionDataSkeleton = () => (
  <ContainerBox flexDirection="column" gap={8} flexWrap="nowrap">
    <StyledHeader>
      <ContainerBox gap={2}>
        <ComposedTokenIcon isLoading size={8} tokens={[]} />
        <ContainerBox gap={0.5} alignItems="center">
          <Typography variant="bodyRegular">
            <Skeleton variant="text" animation="wave" width="10ch" />
          </Typography>
        </ContainerBox>
      </ContainerBox>
      <ContainerBox gap={4} alignItems="center">
        <Typography variant="bodyRegular">
          <Skeleton variant="text" animation="wave" width="10ch" />
        </Typography>
        <Skeleton variant="circular" animation="wave" height={32} width={32} />
      </ContainerBox>
    </StyledHeader>
    <ContainerBox flexDirection="column" gap={7}>
      <ContainerBox flexDirection="column" gap={2} fullWidth>
        <ContainerBox flexDirection="column" fullWidth>
          <Typography variant="bodySmallRegular">
            <Skeleton variant="text" animation="wave" width="4ch" />
          </Typography>
          <Typography variant="h4">
            <Skeleton variant="text" animation="wave" width="100%" />
          </Typography>
        </ContainerBox>
        <Typography variant="bodySmallRegular">
          <Skeleton variant="text" animation="wave" width="100%" />
        </Typography>
      </ContainerBox>
      <DividerBorder2 />
      <ContainerBox flexDirection="column" gap={5}>
        <ContainerBox gap={10}>
          <ContainerBox flexDirection="column">
            <Typography variant="bodySmallRegular">
              <Skeleton variant="text" animation="wave" width="4ch" />
            </Typography>
            <Typography variant="bodyBold">
              <Skeleton variant="text" animation="wave" width="8ch" />
            </Typography>
          </ContainerBox>
          <ContainerBox flexDirection="column">
            <Typography variant="bodySmallRegular">
              <Skeleton variant="text" animation="wave" width="4ch" />
            </Typography>
            <Typography variant="bodyBold">
              <Skeleton variant="text" animation="wave" width="8ch" />
            </Typography>
          </ContainerBox>
          <ContainerBox flexDirection="column">
            <Typography variant="bodySmallRegular">
              <Skeleton variant="text" animation="wave" width="4ch" />
            </Typography>
            <Typography variant="bodyBold">
              <Skeleton variant="text" animation="wave" width="8ch" />
            </Typography>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox justifyContent="space-between">
          <ContainerBox flexDirection="column">
            <Typography variant="bodySmallRegular">
              <Skeleton variant="text" animation="wave" width="4ch" />
            </Typography>
            <Typography variant="bodyBold">
              <Skeleton variant="text" animation="wave" width="16ch" />
            </Typography>
          </ContainerBox>
          <ContainerBox flexDirection="column">
            <Typography variant="bodySmallRegular">
              <Skeleton variant="text" animation="wave" width="4ch" />
            </Typography>
            <Typography variant="bodyBold">
              <Skeleton variant="text" animation="wave" width="16ch" />
            </Typography>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmallRegular">
            <Skeleton variant="text" animation="wave" width="12ch" />
          </Typography>
          <Typography variant="bodyBold">
            <Skeleton variant="text" animation="wave" width="100%" />
          </Typography>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmallRegular">
            <Skeleton variant="text" animation="wave" width="12ch" />
          </Typography>
          <Typography variant="bodyBold">
            <Skeleton variant="text" animation="wave" width="100%" />
          </Typography>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmallRegular">
            <Skeleton variant="text" animation="wave" width="12ch" />
          </Typography>
          <Typography variant="bodyBold">
            <Skeleton variant="text" animation="wave" width="100%" />
          </Typography>
        </ContainerBox>
        <ContainerBox flexDirection="column">
          <Typography variant="bodySmallRegular">
            <Skeleton variant="text" animation="wave" width="12ch" />
          </Typography>
          <Typography variant="bodyBold">
            <Skeleton variant="text" animation="wave" width="100%" />
          </Typography>
        </ContainerBox>
      </ContainerBox>
    </ContainerBox>
  </ContainerBox>
);

export default PositionDataSkeleton;
