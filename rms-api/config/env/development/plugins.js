module.exports = ({ env }) => ({
  email: {
    provider: "nodemailer",
    providerOptions: {
      nodemailer_default_from: "default_from_email@example.com",
      nodemailer_default_replyto: "default_replyto_email@example.com",
      host: 'smtp.develmail.com',
      port: "25", // Add port number
      password: "VRVUVXHMTSKLA",
      username: "7MVLBIV7JUTUE",
      authMethod: "LOGIN", // Auth method
    }
  },
});