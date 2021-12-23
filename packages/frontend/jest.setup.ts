import '@testing-library/jest-dom/extend-expect';
import 'isomorphic-unfetch';

import { router, server } from '@/test_utils/mocks';

process.env = {
  ...process.env,
  NEXT_PUBLIC_GRAPHQL_URL: 'http://localhost:9999/graphql',
};

jest.mock('next/router', () => ({
  useRouter: router,
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
