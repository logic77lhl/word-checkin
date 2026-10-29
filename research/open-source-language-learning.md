# 开源英语学习项目调研：听说读写，谁能打？

> 调研时间：2026-10-29。Star 数为当天 GitHub 数据，只作热度参考，不代表质量。
> 结论先行：**开源生态很热闹，但"听说读写都完整"的项目非常少**；大多数项目只在某一个技能上很强。

## 0. 一句话结论

- **最接近"四技能一体"的是 [echo-type](https://github.com/Talljack/echo-type)**：Listen / Speak / Read / Write + Shadow Reading，MIT，315★。但它是 Next.js + Supabase + AI API 的重型应用，不是我们这种静态站。
- **词汇/SRS 最成熟**：qwerty-learner（23.6k★）、word-atlas（3.2k★）、Anki + FSRS。
- **阅读最成熟**：LinguaCafe、Lute v3、read-frog、Yomitan。
- **听力最强的是"素材挖掘工具"**：LLPlayer、asbplayer，不是课程。
- **口语有开源评分引擎**：OpenPronounce（音素级）、iSpeakerReact（练习 UI），但集成产品少。
- **写作只有"检查器"**：Harper、LanguageTool；没有成熟的"写作练习 + 评分"开源应用。
- **不建议换栈去合并这些项目**。更合理的路线是：保留我们"词汇为骨架 + 本地优先"的架构，把听、说、读、写做成四个轻模式，共用同一批词和同一套 SRS。

## 1. 能力矩阵

### 综合平台

| 项目 | Stars | 许可 | 技术栈 | 词汇/SRS | 听 | 说 | 读 | 写 | 形态 |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| [echo-type](https://github.com/Talljack/echo-type) | 315 | MIT | Next.js 16 + React 19 + Supabase + Dexie + Tauri + ts-fsrs | ✅ | ✅ | ✅ | ✅ | ✅* | Web + 桌面 |
| [LibreLingo](https://github.com/kantord/LibreLingo) | 2.6k | AGPL-3.0 | Python + Web | ◐ | ◐ | — | ✅ | ◐ | 课程平台 |
| [wordpecker](https://github.com/baturyilmaz/wordpecker-app) | 2.3k | MIT | TypeScript + LLM/OpenAI Realtime | ✅ | ◐ | ◐ | ◐ | — | Web |
| [Openwords](https://github.com/Openwords/OpenwordsWebapp) | 64 | 未标注 | CSS/JS | ◐ | — | — | ◐ | ◐ | 课程平台（2018 后停更） |

\* echo-type 的 Write 更偏"打字/仿写同一段内容"，不是作文批改。

### 单技能工具

| 项目 | Stars | 许可 | 主技能 | 技术栈 | 备注 |
| --- | ---: | --- | --- | --- | --- |
| [qwerty-learner](https://github.com/RealKai42/qwerty-learner) | 23.6k | GPL-3.0 | 词汇 / 默写 / 打字 | TypeScript + React | 词库最全，含四六级/雅思/托福/GRE；有默写模式、音标、发音、正确率 |
| [word-atlas](https://github.com/designfuchen/word-atlas) | 3.2k | 代码许可需确认；数据集 CC BY 4.0 | 词汇 + 音频 + FSRS | React 19 + Vite + ts-fsrs + WebGL2 | 7,298 雅思词、插画、英美音、例句、每日计划；视觉和 FSRS 很值得参考 |
| [Anki](https://github.com/ankitects/anki) | 32.4k | AGPL-3.0（以仓库为准） | SRS | Rust | 生态最大；不是语言课程 |
| [FSRS4Anki](https://github.com/open-spaced-repetition/fsrs4anki) | 4.1k | MIT | SRS 算法 | Jupyter/Python | 现代间隔重复算法；有 ts-fsrs / py-fsrs |
| [LinguaCafe](https://github.com/simjanos-dev/LinguaCafe) | 1.5k | GPL-3.0 | 阅读 + 查词 + SRS | Vue + 自托管 | 27 种语言，支持 DeepL、Anki API、Jellyfin |
| [Lute v3](https://github.com/LuteOrg/lute-v3) | 1.6k | MIT | 阅读 | Python/Flask | Learning Using Texts；v1 已废弃，v3 在维护 |
| [read-frog](https://github.com/mengxi-ream/read-frog) | 10.2k | GPL-3.0 | 阅读 / 字幕 / 闪卡 | TypeScript 浏览器扩展 | 沉浸式翻译 + YouTube/Netflix 字幕 + FSRS 卡片 |
| [Yomitan](https://github.com/yomidevs/yomitan) | 2.9k | GPL-3.0 | 阅读查词 | JavaScript 扩展 | 弹窗词典，Anki 联动 |
| [jidoujisho](https://github.com/arianneorpilla/jidoujisho) | 1.8k | GPL-3.0 | 阅读 / 听力 | Dart/Flutter (Android) | 移动端沉浸套件：视频、阅读器、词典、Anki |
| [LLPlayer](https://github.com/umlx5h/LLPlayer) | 4.4k | GPL-3.0 | 听力 | C#/.NET (Windows) | 双语字幕、Whisper 实时字幕、LLM 翻译、OCR 字幕、查词 |
| [asbplayer](https://github.com/asbplayer/asbplayer) | 1.5k | AGPL-3.0 | 听力 / 字幕挖词 | TypeScript 扩展 | 字幕逐句播放、Anki 制卡、Netflix/YouTube |
| [iSpeakerReact](https://github.com/learnercraft/ispeakerreact) | 63 | Apache-2.0 | 口语 / 听力 | React + Vite | IPA、单词重音、听写、角色扮演、考试任务、录音自评 |
| [OpenPronounce](https://github.com/Halleck45/OpenPronounce) | 170 | MIT | 口语评分 | Python + Wav2Vec2 + DTW | 音素级发音评估，自托管 API，替代 Azure Pronunciation Assessment |
| [Harper](https://github.com/Automattic/harper) | 17.3k | Apache-2.0 | 写作检查 | Rust | 离线、隐私优先的英语语法检查器，可 WASM/LSP |
| [LanguageTool](https://github.com/languagetool-org/languagetool) | 15.2k | LGPL-2.1 | 写作检查 | Java | 25+ 语言，可自托管 API |
| [omnilingo](https://github.com/omnilingo/omnilingo) | 71 | AGPL-3.0 | 听力 | JavaScript | 纯听力学习，2023 后基本停更 |
| [word-wind](https://github.com/heygsc/word-wind) | 325 | 未标注 | 词汇 | TypeScript | 在线背单词，英美音标、例句、短语 |

## 2. 重点项目的真实覆盖

### echo-type：最像"四技能一体"，但很重

README 里写得很直接：

- **Listen**：TTS（浏览器 / Fish Audio / Kokoro），逐词跟读
- **Speak**：50+ 生活场景角色扮演（点餐、面试、看医生），语音识别 + 发音评分
- **Read**：文章 + 内置中文翻译
- **Write**：把同一段内容打出来
- **Shadow Reading**：同一份材料在 Listen → Read → Write 之间流转

技术栈从 `package.json` 看是：Next.js 16、React 19、Supabase、Dexie、Tauri、ts-fsrs、AI SDK（OpenAI/Anthropic/Google/DeepSeek/Groq 等 10+ 家）、edge-tts、fish-audio、react-speech-recognition。

**优点**：产品思路最完整，"同一内容四技能复用"很值得抄。
**问题**：
- 2026-02 才创建，315★，还年轻
- 自托管需要 Supabase + AI Key；发音评分最好用 SpeechSuper（商业 API），否则走 AI 兜底
- 不是静态站，和我们的单文件架构差得远

**结论**：抄交互和数据模型，不 fork。

### LibreLingo：课程平台，不是四技能训练器

- 2.6k★，AGPL-3.0，Python
- 社区共建课程，Duolingo 式练习
- 强在"课程结构 + 练习类型 + 社区内容"
- 口语不是重点，具体听/说覆盖取决于课程作者

**结论**：适合参考课程/关卡设计，不适合直接拿来做"每天 10 分钟四技能"。

### wordpecker：词汇 + AI 语音 + 轻阅读

- 2.3k★，MIT，TypeScript
- 从书/文章/视频里收集词 → 生成测验和 LLM 课程
- **Light Reading**：用你收集的词生成阅读短文
- **Voice Chat**：OpenAI Realtime 语音对话，练发音和表达
- 依赖 OpenAI API；2025-08 后更新变慢

**结论**：AI 语音陪练和"用自己词表生成阅读"这两个点很适合我们。

### qwerty-learner：词汇/默写天花板

- 23.6k★，GPL-3.0，TypeScript/React
- 词库覆盖极广（四六级、雅思、托福、GRE、专四专八、程序员词库等）
- 有音标、发音、**默写模式**、速度/正确率
- Web + VSCode 插件 + GitHub Pages

**结论**：词库和默写交互可以直接借鉴；我们的 `data/*.js` 就来自它。**注意 GPL-3.0**。

### word-atlas：词汇产品的视觉/音频/FSRS 参考

- 3.2k★，React 19 + Vite + ts-fsrs + WebGL2
- 7,298 雅思词，原创插画、英美发音、例句、环境声、每日计划
- FSRS 可调目标记忆率；只有首次作答计入正确率
- 数据集 CC BY 4.0；代码许可需单独确认

**结论**：如果要把我们的词卡做得更有"质感"，这是最好的参考；FSRS 也可以直接换成 `ts-fsrs`。

### 阅读组：LinguaCafe / Lute / read-frog / Yomitan

- **LinguaCafe**：自托管，阅读 + 查词 + SRS + Anki API + DeepL，27 种语言
- **Lute v3**：Python/Flask，纯阅读学习，MIT
- **read-frog**：浏览器扩展，网页/YouTube/Netflix 翻译 + 保存生词 + FSRS 闪卡
- **Yomitan**：弹窗词典，阅读时查词，Anki 联动

**共同点**：都是"在真实内容里遇到词 → 查 → 收进 SRS"，不是"先背完再读"。
**对我们的启发**：阅读模块不要做成"课文 + 选择题"，而是"短文 + 点词查义 + 一键加入复习"。

### 听力组：LLPlayer / asbplayer / jidoujisho

- **LLPlayer**：Windows 播放器，双语字幕、Whisper 实时字幕、LLM 翻译、OCR 字幕、查词、yt-dlp
- **asbplayer**：浏览器 + Chrome 扩展，字幕逐句、循环、自动暂停、Anki 制卡
- **jidoujisho**：Android 沉浸套件，视频/阅读/词典/Anki

**共同点**：强在"把真实视频变成可理解的输入"，不是课程。
**对我们的启发**：听力模块不必做播放器；先做"句子级音频 + 听写 + 跟读"就够了。

### 口语组：OpenPronounce / iSpeakerReact / echo-type

- **OpenPronounce**：MIT，Python，Wav2Vec2 + DTW，音素级评分，自托管 API；README 明确说它是"校准过的启发式"，不是完美模型
- **iSpeakerReact**：Apache-2.0，React/Vite；IPA、重音、听写、30+ 场景、考试任务、录音自评
- **echo-type**：ASR + 发音评分 + 50+ 角色扮演

**结论**：开源口语评分已经"能用"，但要么接自托管模型（OpenPronounce），要么接商业 API（SpeechSuper/Azure）。浏览器自带 SpeechRecognition 只能做"词级对不对"，做不了音素级。

### 写作组：Harper / LanguageTool

- **Harper**：17.3k★，Apache-2.0，Rust，离线、快，英语语法检查
- **LanguageTool**：15.2k★，LGPL-2.1，Java，25+ 语言，可自托管

**缺口**：这两个都是"检查器"，不是"写作练习 + 评分 + 反馈"。
**对我们的启发**：写作模块 = 每日题目 + 编辑器 + Harper/LanguageTool 标错 + 可选 LLM 按 rubric 反馈。不要自己训模型。

## 3. 关键发现

1. **生态是碎片化的**：词汇、阅读、听力、口语、写作各自有强项目，但很少整合。
2. **"四技能"产品要么年轻，要么重**：echo-type 最完整但只有 315★，且依赖 Supabase + AI；LibreLingo 更像课程平台；wordpecker 偏词汇 + 语音。
3. **听力工具强在"素材挖掘"**：LLPlayer/asbplayer 解决的是"看视频时怎么查词、怎么制卡"，不是"零基础怎么练听力"。
4. **口语评分有开源方案**：OpenPronounce 证明了 Wav2Vec2 + DTW 可以做音素级评分；但集成到产品里的很少。
5. **写作是最大空白**：只有检查器，没有成熟的"写作练习/评估"开源应用。
6. **词汇/SRS 最卷**：qwerty-learner 23.6k、Anki 32.4k、word-atlas 3.2k；我们没必要在词库数量上竞争，应该在"四技能复用"上做差异。
7. **许可证要小心**：qwerty-learner 是 GPL-3.0，word-atlas 数据集 CC BY 4.0，Anki 是 AGPL；商用/再分发前要确认。

## 4. 对我们项目的建议

### 4.1 定位

不要做"又一个背单词 App"，也不要做"又一个 Duolingo 克隆"。

建议定位：**以词汇为骨架的轻量四技能训练器**。

- 同一个词/同一段内容，可以在听、说、读、写四个模式里出现
- 每天仍然是一个 10–20 分钟的"打卡组合"，不是四套独立课程
- 保持本地优先、无账号、可静态部署

### 4.2 技术选型

| 需求 | 建议 | 理由 |
| --- | --- | --- |
| 间隔复习 | `ts-fsrs` | 成熟、浏览器可用；word-atlas/echo-type 都在用 |
| 发音/听力音频 | 浏览器 `speechSynthesis` 起步；需要更好音质再接 TTS API | 零成本、离线 |
| 口语识别 | Web Speech API（Chrome/Edge） | 无需后端；Safari 支持有限，要降级 |
| 音素级评分 | 可选接 OpenPronounce（自托管 Python 服务） | MIT；比浏览器 ASR 准，但要多一个服务 |
| 写作检查 | Harper WASM（离线）或 LanguageTool API | Apache-2.0 / LGPL；不要自研 |
| 阅读内容 | 公版短文 / Tatoeba 例句 / 自己生成 | 注意 CC BY 2.0 / CC BY 4.0 署名 |
| 数据同步 | 先导出/导入；要跨设备再接 Gist 或 Supabase | 保持静态站简单 |

### 4.3 四个模块怎么落地

**听力（最容易先做）**
- 单词音频 → 听音选词 / 听音写词
- 句子 TTS → 逐句听写，diff 标错
- 跟读：播放 → 录音 → 回放 → 自评（可选 ASR 词级准确率）

**口语（中等难度）**
- 朗读单词/句子，ASR 转写，和目标文本做词级对齐 + Levenshtein
- 给"漏词/多词/替换"提示，不假装能打音素分
- 需要更专业时再接 OpenPronounce

**阅读（中等难度）**
- 短文 + 点词查义 + 一键加入 SRS
- 先做 20–30 篇 100–200 词的短文，难度分级
- 不要做"阅读理解选择题"；做"可理解输入"

**写作（最容易被低估）**
- 每日 1 个题目（邮件/观点/描述图表）
- 编辑器 + Harper/LanguageTool 标错
- 可选 LLM 按"任务完成/连贯/词汇/语法"四维反馈
- 把用户写错/用错的词回流到 SRS

### 4.4 建议路线图

**第 1 阶段（1–2 周，纯前端）**
1. 听力：单词听音选义 + 句子听写
2. 口语：朗读评分（浏览器 ASR + 词级准确率）
3. 阅读：短文 + 点词查义 + 加入复习
4. 写作：每日题目 + 编辑器 + 基础检查
5. 打卡页升级为"今日四技能组合"

**第 2 阶段（2–4 周）**
6. FSRS 替换现有固定间隔
7. 跟读/影子练习：逐句循环、录音、回放
8. 内容库：短文、例句、音频
9. 统计：四技能分别的 XP/正确率/时长

**第 3 阶段（可选）**
10. OpenPronounce 自托管评分
11. AI 语音陪练（WebRTC/Realtime）
12. 账号与跨设备同步

### 4.5 不要做什么

- **不要 fork qwerty-learner**：GPL、React 工程、词库耦合；我们已经有它的数据
- **不要 fork echo-type**：Next.js + Supabase + AI Key，维护成本高
- **不要自己训发音模型**：OpenPronounce 已经给了可用的基线
- **不要做"四套独立课程"**：内容成本会爆炸；用同一批词/同一段材料复用
- **不要假装浏览器 ASR 能打音素分**：它只能做词级；音素级要专门模型

## 5. 许可证备忘

| 项目/数据 | 许可 | 要注意 |
| --- | --- | --- |
| qwerty-learner | GPL-3.0 | 我们现在的词库来自它；再分发/商用要 GPL 兼容 |
| word-atlas 数据集 | CC BY 4.0 | 必须署名；代码许可单独确认 |
| Tatoeba | CC BY 2.0 | 例句要署名 |
| Harper | Apache-2.0 | 保留 NOTICE |
| LanguageTool | LGPL-2.1 | 动态链接/自托管注意义务 |
| OpenPronounce | MIT | 保留版权声明 |
| Anki | AGPL-3.0（以仓库为准） | 不要直接抄代码进闭源产品 |
| echo-type | MIT | 可参考/复用，但注意它依赖的商业 API |

## 6. 参考链接

- echo-type — https://github.com/Talljack/echo-type
- qwerty-learner — https://github.com/RealKai42/qwerty-learner
- word-atlas — https://github.com/designfuchen/word-atlas
- LibreLingo — https://github.com/kantord/LibreLingo
- wordpecker — https://github.com/baturyilmaz/wordpecker-app
- LinguaCafe — https://github.com/simjanos-dev/LinguaCafe
- Lute v3 — https://github.com/LuteOrg/lute-v3
- read-frog — https://github.com/mengxi-ream/read-frog
- Yomitan — https://github.com/yomidevs/yomitan
- jidoujisho — https://github.com/arianneorpilla/jidoujisho
- LLPlayer — https://github.com/umlx5h/LLPlayer
- asbplayer — https://github.com/asbplayer/asbplayer
- iSpeakerReact — https://github.com/learnercraft/ispeakerreact
- OpenPronounce — https://github.com/Halleck45/OpenPronounce
- Harper — https://github.com/Automattic/harper
- LanguageTool — https://github.com/languagetool-org/languagetool
- Anki — https://github.com/ankitects/anki
- FSRS4Anki — https://github.com/open-spaced-repetition/fsrs4anki
