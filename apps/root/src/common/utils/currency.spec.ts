import { parseExponentialNumberToString } from './currency';

describe('parseExponentialNumberToString', () => {
  test('should convert big exponential number to string', () => {
    const exponentialNumber = 1.23e28;
    const expectedString = '123' + '0'.repeat(26);

    const result = parseExponentialNumberToString(exponentialNumber);

    expect(result).toEqual(expectedString);
  });

  test('should convert small exponential number to string', () => {
    const exponentialNumber = 1.23e-28;
    const expectedString = '0.' + '0'.repeat(27) + '123';

    const result = parseExponentialNumberToString(exponentialNumber);

    expect(result).toEqual(expectedString);
  });

  test('should return the same value for non-exponential numbers', () => {
    const nonExponentialNumber = 12345;
    const expectedString = '12345';

    const result = parseExponentialNumberToString(nonExponentialNumber);

    expect(result).toEqual(expectedString);
  });
});
