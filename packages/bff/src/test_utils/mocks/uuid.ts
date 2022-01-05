import * as uuid from 'uuid';

// 直接jest.spyOnが使用できないのでjest.mockを使用してラップする
const enableSpyForUUID = () => {
  // jest.spyOnを使えるように新しいオブエジェクトの参照を返すことに留意
  jest.mock('uuid', (): typeof uuid => ({ ...jest.requireActual<typeof uuid>('uuid') }));
};

const mockUUIDV4 = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod: typeof import('uuid') = require('uuid');
  const spy = jest.spyOn(mod, 'v4').mockReturnValue('dummy-uuid-v4');

  return spy;
};

export { enableSpyForUUID, mockUUIDV4 };
