import { Channels_QueryFragment } from '@/hooks/api';

const getDMChannelName = (
  channel: Channels_QueryFragment['channels'][number],
  myUserId: string
) => {
  return channel.joinUsers.find((u) => u.id !== myUserId)?.name || channel.name;
};

export { getDMChannelName };
