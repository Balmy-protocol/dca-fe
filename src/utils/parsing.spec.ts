import { SWAP_INTERVALS_MAP } from 'config/constants';
import { BigNumber } from 'ethers';
import { calculateStale, HEALTHY, NO_SWAP_INFORMATION, STALE, NOTHING_TO_EXECUTE } from './parsing';

describe('Parsing', () => {
  describe('calculateStale', () => {
    let lastSwapped: number | undefined;
    let frequencyType: BigNumber;
    let createdAt: number;
    let nextSwapInformation: boolean | null;
    const mockedTodaySeconds = 1642439808;

    beforeEach(() => {
      const mockedToday = new Date(mockedTodaySeconds * 1000);
      jest.useFakeTimers();
      jest.setSystemTime(mockedToday);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    SWAP_INTERVALS_MAP.forEach(({ value, description, staleValue }) => {
      // eslint-disable-next-line jest/valid-title
      describe(description, () => {
        beforeEach(() => {
          frequencyType = value;
          lastSwapped = 0;
          createdAt = 0;
          nextSwapInformation = true;
        });

        describe('when nextSwapInformation is null', () => {
          it('should return NO_SWAP_INFORMATION', () => {
            const staleResult = calculateStale(lastSwapped, frequencyType, createdAt, null);

            expect(staleResult).toBe(NO_SWAP_INFORMATION);
          });
        });

        describe("when nextSwapInformation hasn't got the interval to execute", () => {
          beforeEach(() => {
            nextSwapInformation = true;
          });

          it('should return NOTHING_TO_EXECUTE', () => {
            const staleResult = calculateStale(lastSwapped, frequencyType, createdAt, nextSwapInformation);

            expect(staleResult).toBe(NOTHING_TO_EXECUTE);
          });
        });

        describe('when lastSwapped is 0', () => {
          beforeEach(() => {
            lastSwapped = 0;
          });

          it(`should return HEALTHY if it was created at before the stale limit`, () => {
            createdAt = BigNumber.from(mockedTodaySeconds).sub(staleValue).add(BigNumber.from(1)).toNumber();
            const staleResult = calculateStale(lastSwapped, frequencyType, createdAt, nextSwapInformation);

            expect(staleResult).toBe(HEALTHY);
          });
          it('should return STALE', () => {
            createdAt = BigNumber.from(mockedTodaySeconds)
              .div(frequencyType)
              .sub(1)
              .mul(frequencyType)
              .sub(staleValue)
              .toNumber();
            const staleResult = calculateStale(lastSwapped, frequencyType, createdAt, nextSwapInformation);

            expect(staleResult).toBe(STALE);
          });
        });

        it('should return HEALTHY', () => {
          lastSwapped = mockedTodaySeconds;
          createdAt = 0;
          const staleResult = calculateStale(lastSwapped, frequencyType, createdAt, nextSwapInformation);

          expect(staleResult).toBe(HEALTHY);
        });
        it('should return STALE', () => {
          lastSwapped = BigNumber.from(mockedTodaySeconds).sub(staleValue.add(value)).toNumber();
          createdAt = 0;

          const staleResult = calculateStale(lastSwapped, frequencyType, createdAt, nextSwapInformation);

          expect(staleResult).toBe(STALE);
        });
      });
    });
  });
});
