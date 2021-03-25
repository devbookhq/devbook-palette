const { version } = require('./package.json');



module.exports = {
  webpack: {
    configure: {

      /*
      optimization: {
        runtimeChunk: false,
        splitChunks: {
          chunks(chunk) {
            return false
          },
        },
      },
      */
    },
  },
};

