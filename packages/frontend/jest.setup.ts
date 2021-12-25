import '@testing-library/jest-dom/extend-expect';
import 'isomorphic-unfetch';

import { mockRouter, server } from '@/test_utils/mocks';

process.env = {
  ...process.env,
  NEXT_PUBLIC_GRAPHQL_URL: 'http://localhost:9999/graphql',
};

mockRouter();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
