type Message = {
  channelId: string;
  id: string;
  text: string;
  userId: string;
  date: Date;
  readUserIds: string[];
};

type Channel = {
  description?: string | null;
  id: string;
  isDM: boolean;
  joinUserIds: string[];
  name: string;
  ownerId: string;
};

type ChannelWithPersonalizedData = Channel;

type User = {
  id: string;
  name: string;
};

type ReadMessageUsers = {
  id: string;
  readUserIds: string[];
};

const messages: Message[] = [];
const channels: Channel[] = [];
const users: User[] = [];
const db = { messages, channels, users };

export { db };
export type { Channel, Message, User, ChannelWithPersonalizedData, ReadMessageUsers };
