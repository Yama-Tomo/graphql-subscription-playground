import { startServer } from '@/server';
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

startServer().then(({ publicUrl }) => {
  console.log(`🚀 Server ready: ${publicUrl}`);
});
