import React from 'react';
import { SvgIcon } from 'ui-library';
import BulbSvg from './bulb.svg';

interface BulbProps {
  size?: string;
}

const Bulb = ({ size }: BulbProps) => {
  const realSize = size || '28px';
  return <SvgIcon component={BulbSvg} viewBox="0 0 74 74" style={{ fontSize: realSize }} />;
};

export default Bulb;
