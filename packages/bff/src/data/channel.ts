import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { v4 } from 'uuid';

import { DataSourceContext, Options } from '@/data/datasources';
import { Channel, db } from '@/data/db';

class ChannelDataSource extends DataSource {
  context!: DataSourceContext;
  private byIdLoader: DataLoader<string, Channel>;

  constructor(options?: Options) {
    super();

    this.byIdLoader = new DataLoader(
      async (ids) => {
        return ids.map(
          (id) => db.channels.find((v) => v.id === id) || new Error(`channel not found: [${id}]`)
        );
      },
      { cache: options?.cache ?? true }
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

    return items as Channel[];
  }

  getJoinedChannels(userId: string) {
    return db.channels.filter((channel) => channel.joinUserIds.includes(userId));
  }

  create(data: Omit<Channel, 'id'>) {
    const channel = { ...data, id: v4() };
    db.channels.push(channel);

    return channel;
  }

  async update(data: Pick<Channel, 'id'> & Partial<Omit<Channel, 'id'>>) {
    const channel = await this.getById(data.id);
    const { joinUserIds, ...rest } = data;

    (Object.keys(rest) as (keyof typeof rest)[]).forEach((key) => {
      if (channel[key] !== data[key]) {
        (channel[key] as unknown) = data[key];
      }
    });

    if (JSON.stringify(joinUserIds) !== JSON.stringify(data.joinUserIds)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      channel.joinUserIds = data.joinUserIds!;
    }

    return channel;
  }

  delete(id: Channel['id']) {
    const dataIdx = db.channels.findIndex((channel) => channel.id === id);
    const channel = db.channels[dataIdx];
    if (!channel) {
      throw new Error('channel not found');
    }

    db.channels.splice(dataIdx, 1);

    return channel;
  }

  async addUser(id: Channel['id'], userId: Channel['joinUserIds'][number]) {
    const channel = await this.getById(id);

    channel.joinUserIds.push(userId);

    return channel;
  }
}

export { ChannelDataSource };
