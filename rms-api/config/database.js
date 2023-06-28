module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        "client": "mysql",
        "host": "localhost",
        "port": 3306,
        "user": "root",
        "password": "10#Hammer",
        "database": "rms"
      },
      options: {
        useNullAsDefault: true,
        debug: true,
        pool: {
          "min": 0,
          "max": 20,
          "idleTimeoutMillis": 30000,
          "createTimeoutMillis": 30000,
          "acquireTimeoutMillis": 30000
        }
      },
    },
  },
});
