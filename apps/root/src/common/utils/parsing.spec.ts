import { SWAP_INTERVALS_MAP } from '@constants';

import { SwapInfo } from '@types';
import { calculateStale, HEALTHY, NO_SWAP_INFORMATION, STALE, NOTHING_TO_EXECUTE } from './parsing';

describe('Parsing', () => {
  describe('calculateStale', () => {
    let lastSwapped: number | undefined;
    let frequencyType: bigint;
    let createdAt: number;
    let nextSwapInformation: SwapInfo | null;
    const mockedTodaySeconds = 1642439808;

    beforeEach(() => {
      const mockedToday = new Date(mockedTodaySeconds * 1000);
      jest.useFakeTimers();
      jest.setSystemTime(mockedToday);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    SWAP_INTERVALS_MAP.forEach(({ value, description, staleValue }, index) => {
      // eslint-disable-next-line jest/valid-title
      describe(description, () => {
        beforeEach(() => {
          frequencyType = value;
          lastSwapped = 0;
          createdAt = 0;
          nextSwapInformation = [true, true, true, true, true, true, true, true];
        });

        describe('when nextSwapInformation is null', () => {
          it('should return NO_SWAP_INFORMATION', () => {
            const staleResult = calculateStale(frequencyType, createdAt, lastSwapped, null);

            expect(staleResult).toBe(NO_SWAP_INFORMATION);
          });
        });

        describe("when nextSwapInformation hasn't got the interval to execute", () => {
          beforeEach(() => {
            nextSwapInformation = [true, true, true, true, true, true, true, true];
            nextSwapInformation[index] = false;
          });

          it('should return NOTHING_TO_EXECUTE', () => {
            const staleResult = calculateStale(frequencyType, createdAt, lastSwapped, nextSwapInformation);

            expect(staleResult).toBe(NOTHING_TO_EXECUTE);
          });
        });

        describe('when lastSwapped is 0', () => {
          beforeEach(() => {
            lastSwapped = 0;
          });

          it(`should return HEALTHY if it was created at before the stale limit`, () => {
            createdAt = Number(BigInt(mockedTodaySeconds) - staleValue + 1n);
            const staleResult = calculateStale(frequencyType, createdAt, lastSwapped, nextSwapInformation);

            expect(staleResult).toBe(HEALTHY);
          });
          it('should return STALE', () => {
            createdAt = Number((BigInt(mockedTodaySeconds) / frequencyType - 1n) * frequencyType - staleValue);
            const staleResult = calculateStale(frequencyType, createdAt, lastSwapped, nextSwapInformation);

            expect(staleResult).toBe(STALE);
          });
        });

        it('should return HEALTHY', () => {
          lastSwapped = mockedTodaySeconds;
          createdAt = 0;
          const staleResult = calculateStale(frequencyType, createdAt, lastSwapped, nextSwapInformation);

          expect(staleResult).toBe(HEALTHY);
        });
        it('should return STALE', () => {
          lastSwapped = Number(BigInt(mockedTodaySeconds) - (staleValue + value));
          createdAt = 0;

          const staleResult = calculateStale(frequencyType, createdAt, lastSwapped, nextSwapInformation);

          expect(staleResult).toBe(STALE);
        });
      });
    });
  });
});
