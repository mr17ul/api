module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  cron:{
    enabled : true
  },
  admin:{
    auth:{
      secret:'AyEKK89iuQ/pyW/c3MnzosUIiz/F8IgEFJXi6vk6BYfhd+XKgp3kkSSIyfQ5IksRIhXsqEfw6kM9OGr0y+ylNQ=='
    }
  }
});
