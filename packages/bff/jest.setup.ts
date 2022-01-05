import {
  enableSpyForFastify,
  enableSpyForUUID,
  mockDB,
  mockFastify,
  mockUUIDV4,
} from '@/test_utils/mocks';

mockDB();
enableSpyForFastify();
enableSpyForUUID();

beforeEach(() => {
  mockFastify();
  mockUUIDV4();
});

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});
