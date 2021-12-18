import { Config } from 'apollo-server-core';
import { MessageDataSource } from '@/data/message';
import { UserDataSource } from '@/data/user';
import { DataSourceContext, Options } from '@/data/datasources';
import { ChannelDataSource } from '@/data/channel';

type Cache = NonNullable<Config['cache']>;

const dataSources = (options?: Options) => ({
  message: new MessageDataSource(options),
  channel: new ChannelDataSource(options),
  user: new UserDataSource(options),
});

const initDataSources = async (context: DataSourceContext, cache: Cache, options?: Options) => {
  const ds = dataSources(options);
  const initializers: Array<void | Promise<void>> = Object.values(ds).map((dsInstance) => {
    return dsInstance.initialize({ context, cache });
  });

  await Promise.all(initializers);
  return ds;
};

type DataSources = ReturnType<typeof dataSources>;

export { dataSources, initDataSources };
export * from './db';
export type { DataSources };
