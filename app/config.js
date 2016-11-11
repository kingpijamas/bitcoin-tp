'use strict';

var environments = {
    production: {
        api: {
            host: '0.0.0.0',
            port: 80,
            clusterPidsDir: '/var/run/bitcoin-tp',
            monPort: 3000
        },
        jwt: {
            secret: process.env.JWT_SECRET || 'aad51916b9978f7637b15901402316de721b4ee0aef551eefaf5a3523aff0952920cfb7948ff4fabf1e0bbe3e567bfa1442e6a15083238597f2fb60cdd44ef7c',
            credentialsRequired: false
        },
        logging: {
            name: 'bitcoin tp',
            level: 'error'
        }
    },

    development: {
        api: {
            host: 'localhost',
            port: 3000
        },
        jwt: {
            secret: process.env.JWT_SECRET || 'aad51916b9978f7637b15901402316de721b4ee0aef551eefaf5a3523aff0952920cfb7948ff4fabf1e0bbe3e567bfa1442e6a15083238597f2fb60cdd44ef7c',
            credentialsRequired: false
        },
        logging: {
            name: 'bitcoin tp',
            level: 'debug'
        }
    }
};


module.exports = environments[process.env.NODE_ENV] || environments.development;
