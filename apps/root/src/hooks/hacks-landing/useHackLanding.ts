import React from 'react';
import useServiceEvents from '@hooks/useServiceEvents';
import useHacksLandingService from './useHacksLandingService';
import { HackLanding } from '@pages/hacks/types';
import HacksLandinService, { HacksLandingServiceData } from '@services/hacksLandingService';

const parseHackLanding = (data: HackLanding) => data;

const parseHacksLandings = (landings: HackLanding[]) => landings.map((landing) => parseHackLanding(landing));

export default function useHacksLandings() {
  const hacksLandingService = useHacksLandingService();

  const hacksLandings = useServiceEvents<HacksLandingServiceData, HacksLandinService, 'getHacksLandings'>(
    hacksLandingService,
    'getHacksLandings'
  );

  const parsedHacksLandings = React.useMemo<HackLanding[]>(
    () => parseHacksLandings(Object.values(hacksLandings)),
    [hacksLandings]
  );

  return parsedHacksLandings;
}
