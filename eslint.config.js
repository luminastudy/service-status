// @ts-check
import config from "eslint-config-agent/ddd";

export default [
  ...config,
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
];
