import type { NextConfig } from "next";
import pkg from "./package.json";

const nextConfig: NextConfig = {
  // 클라이언트(방문객 앱)에서도 버전을 표시할 수 있도록 빌드 시점에 주입
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  poweredByHeader: false,
};

export default nextConfig;
