// 生成 config.js —— 把 Supabase URL / publishable key 注进静态页面。
//
// 取值优先级：
//   1. 环境变量 WQ_SUPABASE_URL / WQ_SUPABASE_ANON_KEY
//   2. 仓库根目录的 .env.local
//   3. 都没有 → 生成空配置（应用以纯本地模式运行）
//
// 用法：
//   node scripts/gen-config.mjs
//
// 注意：publishable key 本身是公开的（等同旧版 anon key），
// 真正的安全边界是数据库里的 RLS 策略。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env.local");
const outFile = path.join(root, "config.js");

function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (k) out[k] = v;
  }
  return out;
}

const fileEnv = fs.existsSync(envFile) ? parseEnv(fs.readFileSync(envFile, "utf8")) : {};
const url = (process.env.WQ_SUPABASE_URL || fileEnv.WQ_SUPABASE_URL || "").trim();
const key = (process.env.WQ_SUPABASE_ANON_KEY || fileEnv.WQ_SUPABASE_ANON_KEY || "").trim();

const body = `// 自动生成，请勿手改，也不要提交到仓库。
// 重新生成：node scripts/gen-config.mjs
window.WQ_CONFIG = {
  supabaseUrl: ${JSON.stringify(url)},
  supabaseAnonKey: ${JSON.stringify(key)},
};
`;

fs.writeFileSync(outFile, body, "utf8");

if (url && key) {
  console.log(`config.js 已生成 · ${url} · key …${key.slice(-6)}`);
} else {
  console.warn("⚠ 没有找到 WQ_SUPABASE_URL / WQ_SUPABASE_ANON_KEY，已生成空配置（纯本地模式）");
  console.warn("  在 .env.local 里填好，或设置同名环境变量后重跑。");
}
