import React from 'react';
import { HackLandingId } from '@pages/hacks/types';
import useHacksLandings from './useHackLanding';

export default function useHackLanding(landingId?: HackLandingId) {
  const hacksLandings = useHacksLandings();

  const hackLanding = React.useMemo(
    () => hacksLandings.find((landing) => landing.id === landingId),
    [hacksLandings, landingId]
  );

  return hackLanding;
}
