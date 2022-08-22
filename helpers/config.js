/**
 * Environments
 *
 * @format
 */

// module scaffolding
const configuration = {};

// development environments
configuration.development = {
  port: 3000,
  env_name: "development",
  secretKey: "development",
  macChecks: 5,
  twilio: {
    fromPhone: "",
    accountSid: "ACf7abd58f3b0f4c2b080e41d392505e49",
    authToken: "9883fe5b83ccef7867b68c862ed9685e",
  },
};
// production environments
configuration.production = {
  port: 5000,
  env_name: "production",
  secretKey: "production",
  macChecks: 5,
  twilio: {
    fromPhone: "",
    accountSid: "ACf7abd58f3b0f4c2b080e41d392505e49",
    authToken: "9883fe5b83ccef7867b68c862ed9685e",
  },
};

// check environment
const currentEnvironment =
  typeof process.env.NODE_ENV === "string"
    ? process.env.NODE_ENV
    : "development";

// exports corresponding environment variables
const environmentToExports =
  typeof configuration[currentEnvironment] === "object"
    ? configuration[currentEnvironment]
    : configuration.development;

// module exports
module.exports = environmentToExports;
