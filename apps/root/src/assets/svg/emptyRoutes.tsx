import React from 'react';
import { SvgIcon } from 'ui-library';
import EmptyRoutesSvg from './emptyRoutes.svg';

interface EmptyRoutesProps {
  size?: string;
}

const EmptyRoutes = ({ size }: EmptyRoutesProps) => {
  const realSize = size || '28px';
  return (
    <SvgIcon
      fill="transparent"
      component={EmptyRoutesSvg}
      viewBox="0 0 158 157"
      style={{ fontSize: realSize, fill: 'transparent' }}
    />
  );
};

export default EmptyRoutes;
