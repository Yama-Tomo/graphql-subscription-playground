import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { v4 } from 'uuid';

import { DataSourceContext, Options } from '@/data/datasources';
import { db, Message } from '@/data/db';

class MessageDataSource extends DataSource {
  context!: DataSourceContext;
  private byIdLoader: DataLoader<string, Message>;
  private byChannelIdLoader: DataLoader<string, Message[]>;

  constructor(options?: Options) {
    super();

    const cache = options?.cache ?? true;
    this.byIdLoader = new DataLoader(
      async (ids) => {
        return ids.map(
          (id) => db.messages.find((v) => v.id === id) || new Error(`message not found: [${id}]`)
        );
      },
      { cache }
    );

    this.byChannelIdLoader = new DataLoader<string, Message[]>(
      async (ids) => {
        return ids.map((id) => db.messages.filter((v) => v.channelId === id));
      },
      { cache }
    );
  }

  initialize(config: DataSourceConfig<DataSourceContext>) {
    this.context = config.context;
  }

  async getById(id: string) {
    return this.byIdLoader.load(id);
  }

  async getByIds(ids: string[]) {
    const items = await this.byIdLoader.loadMany(ids);

    const error = items.find((item): item is Error => item instanceof Error);
    if (error) {
      throw error;
    }

    return items as Message[];
  }

  getByChannelId(id: string) {
    return this.byChannelIdLoader.load(id);
  }

  create(data: Omit<Message, 'id'>) {
    const message = { ...data, id: v4() };
    db.messages.push(message);

    return message;
  }

  async update(data: Pick<Message, 'id'> & Partial<Omit<Message, 'id'>>) {
    const message = await this.getById(data.id);
    const { readUserIds, ...rest } = data;

    console.log(data);
    (Object.keys(rest) as (keyof typeof rest)[]).forEach((key) => {
      if (message[key] !== data[key]) {
        (message[key] as unknown) = data[key];
      }
    });

    if (data.readUserIds && JSON.stringify(readUserIds) !== JSON.stringify(data.readUserIds)) {
      message.readUserIds = data.readUserIds;
    }

    return message;
  }

  delete(id: Message['id']) {
    const dataIdx = db.messages.findIndex((channel) => channel.id === id);
    const message = db.messages[dataIdx];
    if (!message) {
      throw new Error('message not found');
    }

    db.messages.splice(dataIdx, 1);

    return message;
  }
}

export { MessageDataSource };
