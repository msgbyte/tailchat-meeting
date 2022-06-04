import CopyPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import webpackPaths from './webpack.paths';

export const sharedRendererPlugins: webpack.Configuration['plugins'] = [
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  }),
  new webpack.DefinePlugin({
    process: {
      browser: JSON.stringify(true),
      version: JSON.stringify(process.version),
      env: {
        NODE_ENV: JSON.stringify('production'),
      },
    },
  }),
  new CopyPlugin({
    patterns: [
      { from: webpackPaths.srcPublicPath, to: webpackPaths.distPublicPath },
    ],
  }),
];
