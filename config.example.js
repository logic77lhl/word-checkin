// 复制成 config.js，或运行 `node scripts/gen-config.mjs` 从环境变量生成。
// config.js 已被 .gitignore 忽略，不会进仓库。
//
// publishable key 是设计上公开的前端 key；
// 真正的防护是 Supabase 里 progress 表的 RLS 策略。
window.WQ_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
};
