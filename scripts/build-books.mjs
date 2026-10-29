// 把 qwerty-learner 的词库 JSON 压成浏览器可直接 <script> 加载的紧凑格式。
// 用法：node scripts/build-books.mjs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "data-src");
const out = path.join(root, "data");
fs.mkdirSync(out, { recursive: true });

const books = [
  { id: "cet4", file: "CET4_T.json", name: "四级核心", en: "CET-4", desc: "大学英语四级高频词，按字母序。" },
  { id: "cet6", file: "CET6_T.json", name: "六级核心", en: "CET-6", desc: "六级常考词，含部分四级重叠词。" },
  { id: "kaoyan", file: "KaoYan_3_T.json", name: "考研核心", en: "Postgraduate", desc: "考研英语大纲核心词。" },
  { id: "ielts", file: "IELTS_3_T.json", name: "雅思核心", en: "IELTS", desc: "雅思听说读写高频词。" },
];

const clean = (s) =>
  String(s || "")
    .replace(/\s+/g, " ")
    .replace(/[；;]\s*/g, "；")
    .replace(/，\s+/g, "，")
    .replace(/\s+([，。；])/g, "$1")
    .replace(/[，；,;]+$/g, "")
    .replace(/\s*[A<]+\s*$/g, "")
    .replace(/\s+[A-Z]\s*(?=；)/g, "")
    .trim();

const summary = [];
for (const b of books) {
  const p = path.join(src, b.file);
  if (!fs.existsSync(p)) {
    console.warn("跳过（缺文件）:", b.file);
    continue;
  }
  const raw = JSON.parse(fs.readFileSync(p, "utf8"));
  const seen = new Set();
  const words = [];
  for (const it of raw) {
    const w = clean(it.name);
    if (!w || !/^[A-Za-z][A-Za-z' .-]*$/.test(w)) continue;
    const key = w.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const t = (it.trans || []).map(clean).filter(Boolean).join("；");
    if (!t) continue;
    const phone = clean(it.usphone || it.ukphone || "").replace(/'/g, "ˈ").replace(/^,/, "ˌ");
    words.push([w, t, phone]);
  }
  const payload = `window.__BOOKS=window.__BOOKS||{};window.__BOOKS[${JSON.stringify(b.id)}]={id:${JSON.stringify(
    b.id
  )},name:${JSON.stringify(b.name)},en:${JSON.stringify(b.en)},desc:${JSON.stringify(
    b.desc
  )},words:${JSON.stringify(words)}};\n`;
  fs.writeFileSync(path.join(out, `${b.id}.js`), payload, "utf8");
  summary.push({ id: b.id, count: words.length, kb: Math.round(Buffer.byteLength(payload) / 1024) });
}

console.table(summary);
fs.writeFileSync(path.join(root, "data", "books.json"), JSON.stringify(summary, null, 2), "utf8");
