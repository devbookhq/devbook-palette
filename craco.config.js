const SentryWebpackPlugin = require('@sentry/webpack-plugin');

module.exports = () => {
  return {
    webpack: {
      plugins: {
        add: [
          new SentryWebpackPlugin({
            // sentry-cli configuration
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: 'devbook',
            project: 'devbook',

            // webpack specific configuration
            include: '.',
            ignore: ['node_modules', 'craco.config.js', 'react-dev-tools-4.9.0_26'],
          }),
        ],
      },
    },
  };
};
