// 서버 전용: 현재 배포본의 버전·커밋 정보. Vercel 시스템 환경변수를 사용합니다.
// https://vercel.com/docs/environment-variables/system-environment-variables
export const buildInfo = {
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
  builtAt: process.env.NEXT_PUBLIC_BUILD_TIME ?? null,
  env: process.env.VERCEL_ENV ?? "local", // production | preview | development | local
  commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? null,
  branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
  repo:
    process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : null,
};
