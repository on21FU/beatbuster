import path from "path";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  sassOptions: {
    includePaths: [path.join(path.dirname("./"), "styles")],
  },
};

export default config;
