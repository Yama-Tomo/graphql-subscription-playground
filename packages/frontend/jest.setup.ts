import '@testing-library/jest-dom/extend-expect';
import 'isomorphic-unfetch';

import { mockRouter, server } from '@/test_utils/mocks';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process as any).browser = true;

process.env = {
  ...process.env,
  NEXT_PUBLIC_GRAPHQL_URL: 'http://localhost:9999/graphql', // dummy
  NEXT_PUBLIC_WS_GRAPHQL_URL: 'ws://localhost:9999/ws/graphql', // dummy
};

mockRouter();

beforeAll(() => server.listen());

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  server.resetHandlers();
});

afterAll(() => server.close());
