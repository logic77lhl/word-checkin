# 词途 · 背单词打卡

在线使用：**https://logic77lhl.github.io/word-checkin/**

一个参考 [HF 探索打卡](https://logic77lhl.github.io/hf-quest/) 做的单页英语学习打卡应用：暗色界面、每日打卡、连续天数、热力图、间隔复习、10 题小测、听写、跟读和徽章。默认没有后端，数据存在浏览器 `localStorage` 里；登录后可选同步到 Supabase。

## 功能

- **词库**：内置四级 2607、六级 2345、考研 3727、雅思 3575 词，可切换；也可以粘贴自己的词表。
- **每日计划**：每天 10 / 15 / 20 / 30 / 50 个新词，随时改。
- **学习卡片**：先看英文回忆，再点开释义，按「认识 / 模糊 / 忘了」评分。
- **间隔复习**：按 1、2、4、7、15、30、60、120 天安排下次复习，到期的词会出现在「复习」里。
- **打卡**：当天学过至少 1 个词就能打卡；完成每日新词目标会自动打卡。连续天数、最长连续、累计天数都会记录。
- **热力图**：最近 12 周，每格一天，颜色深浅 = 当天碰过的词次。
- **小测**：从学过的词里随机抽 10 个，看英文选中文；答对 +2 XP，满分再 +10。
- **听写**：听发音写单词，或听音选义；答对 +3 XP，答错也会记一次练习。
- **跟读**：听发音 → 录音 → 回放；浏览器支持时自动识别并给词级相似度，不支持时可回放自评。
- **句子训练**：60 句基础/进阶句子，支持句子听写和影子跟读；听写按词级准确率判定。
- **统计与徽章**：学习总数、掌握数、30 天柱状图、记忆状态、四技能训练统计、18 个自动判定的徽章。
- **数据管理**：导出 / 导入 JSON 备份，换设备不丢进度。
- **账号与同步**（可选）：GitHub 登录或邮箱魔法链接，进度存到 Supabase 单行 JSON，带版本号乐观锁和合并规则；不登录时完全等同纯本地版。
- **发音**：使用浏览器自带的 `speechSynthesis`，不需要联网。
- **离线**：未登录时没有第三方依赖，直接双击 `index.html` 也能用（`file://` 下词库脚本同样能加载）。

## 听写与跟读

- **词源**：当前词库里学过的词（记忆等级 ≥ 1），优先安排到期词；没学过的词不会出现。
- **听写**：两种模式——听音写词（拼写）和听音选义（四选一）。可重播、慢速；提交后显示正确拼写、音标和释义。
- **跟读**：先听正常/慢速，再录音；停止后可以回放。支持 Web Speech API 的浏览器（Chrome / Edge）会做词级识别，给相似度；不支持时用「读对了 / 还不行」自评。
- **句子训练**：内置 60 句（基础 40 / 进阶 20）。句子听写按词级准确率判定，≥ 85% 通过；影子跟读 ≥ 70% 通过。句子听写 +5 XP，影子跟读 +8 XP。
- **计分**：听写答对 +3 XP、答错 +1；跟读通过 +5、未通过 +2。都会计入当天「碰过词」和打卡条件，但不会改变单词的复习到期日。
- **限制**：浏览器语音识别只做词级匹配，不是音素级发音评分；麦克风需要 HTTPS 或 `localhost`（GitHub Pages 满足）。

## 本地运行

```powershell
cd word-checkin
node scripts/serve.mjs
# 打开 http://localhost:4173
```

也可以直接双击 `index.html`。用本地服务器打开时，浏览器控制台和自动刷新体验更好。

## 启用账号同步（Supabase）

不配这一段也能用，页面会自动进「纯本地模式」。要开登录和云同步，按下面四步做一遍。

> 也可以直接打开站点里的 **配置教程页**：[`guide.html`](guide.html)，带自检按钮和错误对照表。

### 1. 建项目和表

在 [supabase.com](https://supabase.com/dashboard) 新建项目（区域选 Southeast Asia / Singapore 对国内最快），然后在 **SQL Editor** 执行：

```sql
create table public.progress (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  revision    bigint not null default 1,
  updated_at  timestamptz not null default now(),
  constraint progress_size check (pg_column_size(data) <= 2097152)
);

alter table public.progress enable row level security;

create policy "own progress select" on public.progress
  for select using (auth.uid() = user_id);
create policy "own progress insert" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "own progress update" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress delete" on public.progress
  for delete using (auth.uid() = user_id);

-- 给登录用户表权限（RLS 负责限定到「只有自己那一行」）
grant select, insert, update, delete on public.progress to authenticated;
```

RLS 是安全边界：前端只拿 publishable key（等同旧版 anon key），**永远不要把 `service_role` / secret key 写进前端**。

### 2. 配置回调地址和登录方式

**Authentication → URL Configuration**

- Site URL：`https://<用户名>.github.io/<仓库名>/`
- Redirect URLs：再各加一条
  - `https://<用户名>.github.io/<仓库名>/login.html`
  - `http://localhost:4173/login.html`

**Authentication → Sign In / Providers**

- **GitHub**：先在 GitHub 建 OAuth App（Homepage 填站点地址，Callback 填 `https://<项目ref>.supabase.co/auth/v1/callback`），把 Client ID / Secret 填回来。
- **Email**：默认就开着，魔法链接登录，不用存密码。
  ⚠️ 免费版自带发信服务每小时只能发几封，只适合自己测。要给真实用户用，得在 **Authentication → Emails → SMTP** 换成自己的发信服务。

### 3. 填 URL 和 key（走环境变量，不进仓库）

`config.js` 由脚本从环境变量生成，已在 `.gitignore` 里，不会提交。

本地：

```powershell
# 方式一：仓库根目录建 .env.local
WQ_SUPABASE_URL=https://xxxx.supabase.co
WQ_SUPABASE_ANON_KEY=sb_publishable_xxxx

# 方式二：设成系统环境变量（同名），脚本会优先读它
node scripts/gen-config.mjs     # 生成 config.js
```

线上（GitHub Actions 部署时注入）：

```powershell
gh secret set WQ_SUPABASE_URL --body "https://xxxx.supabase.co"
gh secret set WQ_SUPABASE_ANON_KEY --body "sb_publishable_xxxx"
```

### 4. 同步怎么工作

- 本地数据按账号隔离：游客用 `wordquest-v1`，登录后用 `wordquest-v1:<user_id>`，共用电脑不会串号。
- 改动停下来 1.5 秒后自动上传；切后台 / 关页面时尽力补一次。
- 写入带 `revision` 乐观锁：版本对不上就拉最新 → 按规则合并 → 重试最多 3 次。
- 合并规则：单词按 `last` 取较新（听说计数取较大）、每日记录按天取并集且计数取较大、徽章取并集（日期取较早）、技能计数取 `max`、自定义词按单词去重、设置按 `settings.updatedAt` 取新。
- 第一次在某台设备登录时，如果这台设备还有游客进度，会弹窗让你选「合并 / 只用云端 / 只用本机」。

## 部署到 GitHub Pages

站点用 GitHub Actions 部署（因为 `config.js` 要从 Secrets 生成，不能提交）：

1. 仓库 Settings → Pages → Source 选 **GitHub Actions**。
2. 把上面第 3 步的两个 Secret 建好。
3. push 到 `main`，`.github/workflows/pages.yml` 会自动生成 `config.js` 并发布。

只想纯本地部署、不要账号功能，也可以不用 Actions：直接让 Pages 从 `main` 分支根目录发布，不生成 `config.js` 即可（页面会进纯本地模式）。

## 目录

```
word-checkin/
├─ index.html            # 界面 + 逻辑 + 样式（单文件）
├─ login.html            # 登录 / 注册页（Supabase Auth）
├─ guide.html            # 配置教程（建表、环境变量、GitHub 登录、自检）
├─ config.js             # 自动生成，含 Supabase URL 与 publishable key（不进仓库）
├─ js/
│  ├─ cloud.js           # 云同步层：推送、乐观锁、合并规则
│  └─ vendor/supabase.js # supabase-js v2 UMD（MIT）
├─ data/
│  ├─ cet4.js            # 四级词库（window.__BOOKS.cet4）
│  ├─ cet6.js
│  ├─ kaoyan.js
│  ├─ ielts.js
│  └─ books.json         # 构建统计
├─ research/
│  └─ open-source-language-learning.md   # 开源项目调研
├─ .github/workflows/
│  └─ pages.yml          # 从 Secrets 生成 config.js 并发布
└─ scripts/
   ├─ serve.mjs          # 本地静态服务器
   ├─ gen-config.mjs     # 从环境变量生成 config.js
   └─ build-books.mjs    # 把原始 JSON 压成 data/*.js
```

## 词库来源与重建

词库来自开源项目 [qwerty-learner](https://github.com/Kaiyiwing/qwerty-learner) 的 `public/dicts`。原始文件体积较大，仓库里只保留了压缩后的 `data/*.js`。

需要重建时，把原始 JSON 下载到 `data-src/`：

```powershell
$base = "https://raw.githubusercontent.com/Kaiyiwing/qwerty-learner/master/public/dicts/"
$dir = "data-src"; New-Item -ItemType Directory -Force $dir | Out-Null
foreach ($f in "CET4_T.json","CET6_T.json","KaoYan_3_T.json","IELTS_3_T.json") {
  curl.exe -L -o "$dir/$f" "$base$f"
}
node scripts/build-books.mjs
```

脚本会去重、清理标点、把音标里的 `'` 规范成 `ˈ`，输出成浏览器可以直接 `<script>` 加载的格式。词条结构是 `[单词, 释义, 音标]`，改 `scripts/build-books.mjs` 里的 `books` 数组就能加自己的词库（记得同步 `index.html` 里的 `BOOK_META` 的 `total`）。

## 自定义词表格式

在「词库与计划 → 导入自己的词表」里，每行一个词，支持这些写法：

```
abandon 放弃；抛弃
resilient 有韧性的
serendipity, 意外发现珍奇事物的运气
give up	放弃
```

单词和释义之间用空格、逗号、制表符、`|` 或 `:` 分隔。重复词会自动跳过。

## 复习算法

每个词有一个 `b`（记忆等级）和 `due`（下次复习日期）：

| 评分 | 等级变化 | 下次复习 |
| --- | --- | --- |
| 认识 | `b + 1`（最高 8） | 1 / 2 / 4 / 7 / 15 / 30 / 60 / 120 天后 |
| 模糊 | 保持当前等级（最低 1） | 明天 |
| 忘了 | 回到 1 | 今天（本轮会再出现一次） |

`b >= 6` 视为「已掌握」（下次间隔 ≥ 30 天）。算法在 `index.html` 的 `grade()` 里，想换成 SM-2 / FSRS 可以只改这一段。

## 数据

- 存储 key：游客 `wordquest-v1`；登录后 `wordquest-v1:<user_id>`
- 内容：设置、每个词的等级和到期日、每日记录、XP、徽章、自定义词表
- 换设备：登录同一个账号自动同步；也可以导出 JSON 手动搬
- 清空：统计与徽章 → 清空全部（登录时会连云端一起清）

没有登录时不会发出任何网络请求（除了加载词库文件）。登录后只有两类请求：Supabase Auth 和 `public.progress` 表，后者由 RLS 限制成「只能读写自己那一行」。

## 可改的地方

- 主题色：`index.html` 顶部 `:root` 里的 `--acc`、`--bg`、`--panel`
- 词库列表与总词数：`BOOK_META`
- 每日目标档位：`PLAN` 卡片里的 `goal` 按钮和 `data-n`
- 打卡判定：`doCheckin()` 和 `maybeAutoCheckin()`
- 徽章：`BADGES` 数组，每项一个 `test(ctx)` 函数
- 每日一句：`QUOTES` 数组

## 说明

- 释义和音标来自开源词表，个别条目可能有排版或释义风格差异；以词典为准。
- 发音依赖浏览器语音合成，Chrome / Edge 一般可用；Firefox 需要系统装了英文语音。
- 打卡日期按设备本地时区计算；跨时区旅行可能出现一天偏差。

## 调研

- [开源英语学习项目调研：听说读写，谁能打？](research/open-source-language-learning.md)
