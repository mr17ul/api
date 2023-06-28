module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        "client": "mysql",
        "host": "localhost",
        "port": 8585,
        "user": "root",
        "password": "N0cp1C$r$q7",
        "database": "nocpl_rms"
      },
      options: {
        useNullAsDefault: true,
        debug: false,
        pool: {
          "min": 0,
          "max": 50,
          "idleTimeoutMillis": 30000,
          "createTimeoutMillis": 30000,
          "acquireTimeoutMillis": 30000
        }
      },
    },
  },
});
