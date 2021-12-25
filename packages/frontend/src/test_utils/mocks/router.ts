import { Router } from '@/libs/router';

const router = (): Router => {
  return {
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    basePath: '/',
    isLocaleDomain: true,
    isReady: true,
    push: jest.fn(),
    prefetch: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isPreview: false,
  };
};

const mockRouter = () => {
  jest.mock('@/libs/router', () => ({
    useRouter: router,
  }));
};

export { router, mockRouter };
