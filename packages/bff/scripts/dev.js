const esbuild = require('esbuild');
const nodemon = require('nodemon');
const buildOpts = require('./build_opts');

const outfile = './dist/dev_server.js';

esbuild
  .build({
    ...buildOpts(),
    entryPoints: ['./src/dev_server.ts'],
    outfile,
    watch: {
      onRebuild(error) {
        if (error) {
          console.error('watch build failed:', error);
        } else {
          console.log('🔄 watch build succeeded');
        }
      },
    },
  })
  .then((result) => {
    console.log('📦 initial build succeeded');

    process.on('SIGINT', function () {
      result.stop();
      process.exit();
    });

    nodemon({ script: outfile });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
