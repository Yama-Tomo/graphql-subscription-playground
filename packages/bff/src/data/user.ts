import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { db, User } from '@/data/db';
import { DataSourceContext, Options } from '@/data/datasources';
import { v4 } from 'uuid';

class UserDataSource extends DataSource {
  context!: DataSourceContext;
  private byIdLoader: DataLoader<string, User>;

  constructor(options?: Options) {
    super();

    this.byIdLoader = new DataLoader(
      async (ids) => {
        return ids.map(
          (id) => db.users.find((v) => v.id === id) || new Error(`user not found: [${id}]`)
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

    return items as User[];
  }

  getByName(name: string) {
    // キーワード検索のように検索条件が幅広い場合はキャッシュせずにクライアント側のキャッシュ戦略に任せたほうが良い気がする
    return db.users.filter((usr) => usr.name.includes(name));
  }

  create(data: Omit<User, 'id'>) {
    const user = { ...data, id: v4() };
    db.users.push(user);

    return user;
  }
}

export { UserDataSource };
