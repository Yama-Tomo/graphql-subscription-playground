import * as Router from '@/libs/router';

const router = (): Router.Router => {
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
  jest.spyOn(Router, 'useRouter').mockImplementation(router);
};

export { router, mockRouter };
