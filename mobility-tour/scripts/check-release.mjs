// 빌드 전 검사: package.json의 버전에 해당하는 업데이트 내역이 작성되어 있는지 확인합니다.
// Vercel은 `npm run build` 전에 이 스크립트(prebuild)를 실행하므로,
// 내역을 작성하지 않은 버전은 배포되지 않습니다.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
const { releases } = JSON.parse(readFileSync(new URL("src/data/releases.json", root), "utf8"));

const TYPES = new Set(["added", "changed", "fixed", "content", "removed", "security"]);
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const errors = [];

const cmp = (a, b) => {
  const pa = a.split(/[.-]/).slice(0, 3).map(Number);
  const pb = b.split(/[.-]/).slice(0, 3).map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
};

if (!Array.isArray(releases) || releases.length === 0) errors.push("releases 배열이 비어 있습니다.");

const seen = new Set();
releases.forEach((r, i) => {
  const where = `releases[${i}] (${r.version ?? "버전 없음"})`;
  if (!SEMVER.test(r.version ?? "")) errors.push(`${where}: version이 x.y.z 형식이 아닙니다.`);
  if (seen.has(r.version)) errors.push(`${where}: 같은 버전이 두 번 있습니다.`);
  seen.add(r.version);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date ?? "") || Number.isNaN(Date.parse(r.date)))
    errors.push(`${where}: date는 YYYY-MM-DD 형식이어야 합니다.`);
  if (!r.title || /TODO/i.test(r.title)) errors.push(`${where}: title을 작성하세요.`);
  if (!Array.isArray(r.changes) || r.changes.length === 0)
    errors.push(`${where}: changes에 변경 사항을 1개 이상 작성하세요.`);
  (r.changes ?? []).forEach((c, j) => {
    if (!TYPES.has(c.type)) errors.push(`${where} changes[${j}]: type은 ${[...TYPES].join(", ")} 중 하나여야 합니다.`);
    if (!c.text || /TODO/i.test(c.text)) errors.push(`${where} changes[${j}]: text를 작성하세요.`);
  });
  if (i > 0 && SEMVER.test(r.version) && cmp(releases[i - 1].version, r.version) <= 0)
    errors.push(`${where}: 최신 버전이 위에 오도록 내림차순으로 정렬하세요.`);
});

if (!releases.some((r) => r.version === pkg.version))
  errors.push(`package.json 버전 ${pkg.version}에 대한 업데이트 내역이 src/data/releases.json에 없습니다.`);
else if (releases[0].version !== pkg.version)
  errors.push(`가장 위 항목(${releases[0].version})이 package.json 버전(${pkg.version})과 다릅니다.`);

if (errors.length) {
  console.error("\n✖ 업데이트 내역 검사 실패 (" + fileURLToPath(new URL("src/data/releases.json", root)) + ")\n");
  for (const e of errors) console.error("  - " + e);
  console.error("\n  새 버전은 `npm run release:new -- patch|minor|major` 로 만들고 내용을 채워 주세요.\n");
  process.exit(1);
}
console.log(`✔ 업데이트 내역 확인: v${pkg.version} (${releases.length}개 릴리스)`);
