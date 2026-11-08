// 새 버전 만들기: package.json 버전을 올리고 releases.json 맨 위에 작성할 항목을 추가합니다.
//   npm run release:new -- patch     (0.1.0 → 0.1.1) 오류 수정·문구 수정
//   npm run release:new -- minor     (0.1.0 → 0.2.0) 기능 추가
//   npm run release:new -- major     (0.1.0 → 1.0.0) 큰 개편
//   npm run release:new -- 1.2.3     직접 지정
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url);
const pkgUrl = new URL("package.json", root);
const lockUrl = new URL("package-lock.json", root);
const relUrl = new URL("src/data/releases.json", root);

const arg = process.argv[2] ?? "patch";
const pkg = JSON.parse(readFileSync(pkgUrl, "utf8"));
const [maj, min, pat] = pkg.version.split(/[.-]/).map(Number);

let next;
if (arg === "major") next = `${maj + 1}.0.0`;
else if (arg === "minor") next = `${maj}.${min + 1}.0`;
else if (arg === "patch") next = `${maj}.${min}.${pat + 1}`;
else if (/^\d+\.\d+\.\d+$/.test(arg)) next = arg;
else {
  console.error("사용법: npm run release:new -- patch|minor|major|x.y.z");
  process.exit(1);
}

const data = JSON.parse(readFileSync(relUrl, "utf8"));
if (data.releases.some((r) => r.version === next)) {
  console.error(`v${next} 항목이 이미 있습니다.`);
  process.exit(1);
}

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
data.releases.unshift({
  version: next,
  date: today,
  title: "TODO: 이번 업데이트를 한 줄로 요약",
  summary: "",
  changes: [{ type: "added", text: "TODO: 변경 내용" }],
});
writeFileSync(relUrl, JSON.stringify(data, null, 2) + "\n");

pkg.version = next;
writeFileSync(pkgUrl, JSON.stringify(pkg, null, 2) + "\n");
try {
  const lock = JSON.parse(readFileSync(lockUrl, "utf8"));
  lock.version = next;
  if (lock.packages?.[""]) lock.packages[""].version = next;
  writeFileSync(lockUrl, JSON.stringify(lock, null, 2) + "\n");
} catch {}

console.log(`✔ v${next} 준비 완료.`);
console.log("  src/data/releases.json 맨 위 항목의 TODO를 채운 뒤 커밋·푸시하세요.");
console.log("  (TODO가 남아 있으면 빌드가 실패하여 배포되지 않습니다.)");
