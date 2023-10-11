import React from 'react';
import { SvgIcon } from 'ui-library';
import EmptyGraphSvg from './emptyGraph.svg';

interface EmptyGraphProps {
  size?: string;
}

const EmptyGraph = ({ size }: EmptyGraphProps) => {
  const realSize = size || '28px';
  return (
    <SvgIcon
      fill="transparent"
      component={EmptyGraphSvg}
      viewBox="0 0 98 92"
      style={{ fontSize: realSize, fill: 'transparent' }}
    />
  );
};

export default EmptyGraph;
