import { defineConfig } from "tsup";
import path from "path";

export default defineConfig({
  entry: ["./src/index.ts"],
  noExternal: [/.*/],
  splitting: false,
  bundle: true,
  outDir: "./dist",
  clean: true,
  env: { IS_SERVER_BUILD: "true" },
  loader: { ".json": "copy" },
  minify: true,
  sourcemap: false,
  external: ["pg-native"],
  esbuildOptions(options) {
    options.resolveExtensions = [".ts", ".js", ".json"];
    options.nodePaths = [
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "../../node_modules"),
      path.resolve(__dirname, "../../packages/database/node_modules"),
      path.resolve(__dirname, "../../packages/services/node_modules"),
      path.resolve(__dirname, "../../packages/trpc/node_modules"),
      path.resolve(__dirname, "../../packages/logger/node_modules"),
    ];
  },
});
