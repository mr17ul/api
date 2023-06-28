module.exports = ({ env }) => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 8086),
    cron:{
      enabled : true
    }
  });
  