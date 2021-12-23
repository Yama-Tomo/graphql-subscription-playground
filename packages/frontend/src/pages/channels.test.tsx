import { setUserId } from '@/libs/user';
import Channels from '@/pages/channels.page';
import { createTestRenderer } from '@/test_utils/helper';

const renderer = createTestRenderer(Channels);

describe('Sample.ts Functions TestCases', () => {
  beforeAll(() => {
    setUserId('test-uid');
  });

  it('チャンネル一覧が描画されること', async () => {
    const result = renderer();
    expect(await result.findByText(/ch1/)).toBeInTheDocument();
    expect(await result.findByText(/ch2/)).toBeInTheDocument();
    expect(await result.findByText(/dm1/)).toBeInTheDocument();
  });
});
