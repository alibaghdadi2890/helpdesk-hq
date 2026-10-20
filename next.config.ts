import type { NextConfig } from "next";

const config: NextConfig = {
  // The app is mostly a JSON API. pg is a server-only dependency.
  serverExternalPackages: ["pg"],
};

export default config;
