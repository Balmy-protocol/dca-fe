// eslint-disable-next-line import/no-extraneous-dependencies
import { ModuleMocker } from 'jest-mock';

export function createMockInstance<T, K>(cl: T) {
  const mocker = new ModuleMocker(global);

  const metadata = mocker.getMetadata(cl);

  if (!metadata) {
    throw new Error('Could not get metadata');
  }

  const Mock = mocker.generateFromMetadata<T>(metadata);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Mock() as jest.MockedObject<K>;
}
