import path from "path";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: false,
    sassOptions: {
        includePaths: [path.join(path.dirname("./"), "styles")],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default config;
