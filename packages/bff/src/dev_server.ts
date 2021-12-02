import { startServer } from '@/server';

startServer().then(({ publicUrl }) => {
  console.log(`🚀 Server ready: ${publicUrl}`);
});
