import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default () => {
  // For web builds (Cloudflare, VPS, etc.), don't use root: "./src"
  // For Zalo builds, use zmp commands which handle the config differently
  const isWebBuild = process.env.WEB_BUILD === 'true' || !process.env.npm_config_user_agent?.includes('zmp');

  return defineConfig({
    root: isWebBuild ? undefined : "./src",
    base: "",
    plugins: [zaloMiniApp(), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
};
