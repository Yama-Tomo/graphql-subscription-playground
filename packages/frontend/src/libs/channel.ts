import { types } from '@/hooks/api';

const getDMChannelName = (
  channel: types.MyChannelAndProfileQuery['channels'][number],
  myUserId: string
) => {
  return channel.joinUsers.find((u) => u.id !== myUserId)?.name || channel.name;
};

export { getDMChannelName };
