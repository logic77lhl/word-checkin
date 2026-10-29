# 词途 · 背单词打卡

一个参考 [HF 探索打卡](https://logic77lhl.github.io/hf-quest/) 做的单页背单词打卡应用：暗色界面、每日打卡、连续天数、热力图、间隔复习、10 题小测和徽章。没有后端，数据只存在浏览器 `localStorage` 里。

## 功能

- **词库**：内置四级 2607、六级 2345、考研 3727、雅思 3575 词，可切换；也可以粘贴自己的词表。
- **每日计划**：每天 10 / 15 / 20 / 30 / 50 个新词，随时改。
- **学习卡片**：先看英文回忆，再点开释义，按「认识 / 模糊 / 忘了」评分。
- **间隔复习**：按 1、2、4、7、15、30、60、120 天安排下次复习，到期的词会出现在「复习」里。
- **打卡**：当天学过至少 1 个词就能打卡；完成每日新词目标会自动打卡。连续天数、最长连续、累计天数都会记录。
- **热力图**：最近 12 周，每格一天，颜色深浅 = 当天碰过的词次。
- **小测**：从学过的词里随机抽 10 个，看英文选中文；答对 +2 XP，满分再 +10。
- **统计与徽章**：学习总数、掌握数、30 天柱状图、记忆状态、13 个自动判定的徽章。
- **数据管理**：导出 / 导入 JSON 备份，换设备不丢进度。
- **发音**：使用浏览器自带的 `speechSynthesis`，不需要联网。
- **离线**：没有第三方依赖；直接双击 `index.html` 也能用（`file://` 下词库脚本同样能加载）。

## 本地运行

```powershell
cd word-checkin
node scripts/serve.mjs
# 打开 http://localhost:4173
```

也可以直接双击 `index.html`。用本地服务器打开时，浏览器控制台和自动刷新体验更好。

## 部署到 GitHub Pages

1. 新建仓库，把 `index.html` 和 `data/` 两个东西传上去（`scripts/` 可选）。
2. 仓库 Settings → Pages → Source 选 `Deploy from a branch`，分支 `main`，目录 `/ (root)`。
3. 等一分钟，打开 `https://<用户名>.github.io/<仓库名>/`。

所有资源都是相对路径，放在子目录也能正常工作。

## 目录

```
word-checkin/
├─ index.html            # 界面 + 逻辑 + 样式（单文件）
├─ data/
│  ├─ cet4.js            # 四级词库（window.__BOOKS.cet4）
│  ├─ cet6.js
│  ├─ kaoyan.js
│  ├─ ielts.js
│  └─ books.json         # 构建统计
└─ scripts/
   ├─ serve.mjs          # 本地静态服务器
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

- 存储 key：`wordquest-v1`
- 内容：设置、每个词的等级和到期日、每日记录、XP、徽章、自定义词表
- 换设备：统计与徽章 → 导出备份 JSON → 在新设备导入
- 清空：统计与徽章 → 清空全部（不可撤销）

没有账号、没有上传、没有云同步。想加跨设备同步，可以照 HF 打卡项目的思路接 GitHub Gist，或者换成自己的后端。

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
