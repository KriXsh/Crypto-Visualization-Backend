const env = process.env.NODE_ENV || "development";
console.log('Current NODE_ENV:', process.env.NODE_ENV);

import developmentConfig from './development.js';

let config;

switch (env) {
    case 'development':
        config = developmentConfig;
        break;
    default:
        console.error(`Unknown environment: ${env}`);
        process.exit(1);
}

export default config;