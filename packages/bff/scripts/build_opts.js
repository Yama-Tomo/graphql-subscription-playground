const { nodeExternalsPlugin } = require('esbuild-node-externals');

module.exports = () => ({
  bundle: true,
  platform: 'node',
  plugins: [nodeExternalsPlugin()],
});
