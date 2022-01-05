import * as fastify from 'fastify';

// 直接jest.spyOnが使用できないのでjest.mockを使用してラップする
const enableSpyForFastify = () => {
  // jest.spyOnを使えるように新しいオブエジェクトの参照を返すことに留意
  jest.mock('fastify', (): typeof fastify => ({
    ...jest.requireActual<typeof fastify>('fastify'),
  }));
};

const mockFastify = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod: typeof import('fastify') = require('fastify');
  const spy = jest.spyOn(mod, 'fastify');
  spy.mockImplementation(() => {
    return {
      ...jest.requireActual<typeof fastify>('fastify').fastify(),
      listen() {
        return Promise.resolve('dummy listen');
      },
    };
  });

  return spy;
};

export { enableSpyForFastify, mockFastify };
