import * as fs from 'fs';
import * as path from 'path';

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

type DB = { messages: Message[]; channels: Channel[]; users: User[] };

const db: DB = (() => {
  if (process.env.NODE_ENV === 'test') {
    throw new Error('DB values must be mocked');
  }

  const dataFile = path.resolve(__dirname, 'db.json');
  const flushToDisk = () => fs.writeFileSync(dataFile, JSON.stringify(db));

  process.once('SIGUSR2', function () {
    flushToDisk();
    process.kill(process.pid, 'SIGUSR2');
  });

  process.on('SIGINT', function () {
    flushToDisk();
  });

  if (fs.existsSync(dataFile)) {
    try {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  const messages: Message[] = [];
  const channels: Channel[] = [];
  const users: User[] = [];
  return { messages, channels, users };
})();

export { db };
export type { DB, Channel, Message, User, ChannelWithPersonalizedData, ReadMessageUsers };
