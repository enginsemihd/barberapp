import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // An unrelated package-lock.json exists in a parent directory
    // (C:\Users\LENOVO); pin the workspace root here instead of letting
    // Turbopack infer it and warn on every dev server start.
    root: path.join(__dirname),
  },
};

export default nextConfig;
