import "dotenv/config";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

// Load the appropriate .env file
const ENV = process.env.ENV_NAME || "development"; // Default to 'local' if not specified
dotenvConfig({ path: resolve(__dirname, `.env.${ENV}`) });

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ENV_NAME: process.env.ENV_NAME,
    },
  };
};
