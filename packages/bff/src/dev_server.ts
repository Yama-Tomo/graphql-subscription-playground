import sourceMapSupport from 'source-map-support';

import { startServer } from '@/server';

sourceMapSupport.install();

startServer().then(({ publicUrl }) => {
  console.log(`🚀 Server ready: ${publicUrl}`);
});
