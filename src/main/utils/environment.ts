import { Environment } from 'services/electron.service/environment';

declare var ENVIRONMENT: Environment;

const isDev = ENVIRONMENT === Environment.Development;
const isProd = ENVIRONMENT === Environment.Production;
const isStaging = ENVIRONMENT === Environment.Staging;

export {
  isDev,
  isProd,
  isStaging,
};
