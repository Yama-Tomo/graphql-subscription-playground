import * as ctx from '@/context';

const mockCreateAllRequestSharedContext = () => {
  return jest.spyOn(ctx, 'createAllRequestSharedContext');
};

export { mockCreateAllRequestSharedContext };
