import React from 'react';
import { useTheme } from 'styled-components';
import { ContainerBox, Skeleton, Typography } from 'ui-library';

const GraphSkeleton = () => {
  const { spacing } = useTheme();
  return (
    <ContainerBox gap={4} justifyContent="space-between" flexDirection="column" style={{ minHeight: spacing(77) }}>
      <ContainerBox gap={4} flex="1">
        <ContainerBox flexDirection="column" gap={3} alignItems="start" justifyContent="space-between">
          <Typography variant="bodyRegular">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="bodyRegular">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="bodyRegular">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="bodyRegular">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="bodyRegular">
            <Skeleton animation="wave" width={40} />
          </Typography>
          <Typography variant="bodyRegular">
            <Skeleton animation="wave" width={40} />
          </Typography>
        </ContainerBox>
        <ContainerBox gap={4} fullWidth justifyContent="center" alignItems="end">
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(16)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(20)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(16)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(20)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(24)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(28)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(32)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(24)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(28)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(24)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(20)} animation="wave" />
          <Skeleton variant="rectangular" width={spacing(6)} height={spacing(16)} animation="wave" />
        </ContainerBox>
      </ContainerBox>
      <ContainerBox gap={8} justifyContent="space-around">
        <Typography variant="bodyRegular">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="bodyRegular">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="bodyRegular">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="bodyRegular">
          <Skeleton animation="wave" width={60} />
        </Typography>
        <Typography variant="bodyRegular">
          <Skeleton animation="wave" width={60} />
        </Typography>
      </ContainerBox>
    </ContainerBox>
  );
};

export default GraphSkeleton;
