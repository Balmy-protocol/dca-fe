import { HackLanding } from './types';

export const HACK_LANDING_MOCK: HackLanding = {
  id: 'hack-landing-1',
  metadata: {
    creator: '0x1234567890123456789012345678901234567890',
    title: 'Hack Landing',
    description: 'This is a mock hack landing page',
    links: ['https://example.com'],
  },
  affectedContracts: {
    10: ['0xED306e38BB930ec9646FF3D917B2e513a97530b1'],
    42161: ['0xED306e38BB930ec9646FF3D917B2e513a97530b1'],
  },
};
