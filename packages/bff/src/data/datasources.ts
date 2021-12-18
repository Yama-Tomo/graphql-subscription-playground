import { Context } from '@/context';

type Options = { cache?: boolean };
type DataSourceContext = Omit<Context, 'dataSources'>;

export type { Options, DataSourceContext };
