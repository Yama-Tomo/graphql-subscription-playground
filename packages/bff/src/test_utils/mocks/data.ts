const mockDB = () => {
  jest.mock('@/data/db', () => ({
    get db() {
      return { messages: [], users: [], channels: [] };
    },
  }));
};

const mockDBData = (data: typeof import('@/data/db')['db']) => {
  // mockDB()でモックしたあとでないと@/data/dbをimportしてはいけないので
  // この関数が呼ばれたタイミングでrequireを使ってこのタイミングで動的に読み込む
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const DB: typeof import('@/data/db') = require('@/data/db');
  const spy = jest.spyOn(DB, 'db', 'get');
  spy.mockReturnValue(data);

  return spy;
};

export { mockDB, mockDBData };
