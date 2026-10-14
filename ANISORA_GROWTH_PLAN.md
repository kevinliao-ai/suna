# AniSora 增长迭代规划

更新日期：2026-10-14 · 基线分支：`origin/master`（线上生产）

> 本仓库为公开仓库，文档不记录收入、订阅人数、用户信息等敏感数据。原始数据以 Google Search Console、Stripe、Vercel、Cloudflare 后台为准。

## 1. 现状

### 1.1 已上线功能

| 模块 | 路由 | 说明 |
|---|---|---|
| 首页 | `/` | Hero、用例、模型情报、Studio Pro 预览、FAQ |
| 模型情报 | `/models`、`/models/[slug]`、`/compare/[slug]` | 6 个模型档案、4 个对比页 |
| 镜头配方 | `/recipes`、`/recipes/[slug]`、`/recipes/collections/[slug]` | 30 个配方、10 个合集 |
| 工作流案例 | `/cases`、`/cases/[slug]` | 6 个案例 |
| 工具 | `/video-cost-calculator`、`/index-tts`、`/sora-watermark-remove` | 成本计算器、IndexTTS 嵌入、Sora 链接解析 |
| Studio | `/dashboard` | 本地项目、可选云同步、订阅状态 |
| Director | `/dashboard/director` | 脚本拆镜、镜头工作台、版本历史、连续性资产、制作看板、粗剪时间线 |
| 生成 | `/api/generation/fal`、`/api/webhooks/fal` | fal：`flux/schnell` 参考帧 + `kling-video v2.1 standard` 图生视频；积分预留、结算、释放 |
| 计费 | `/pricing`、`/api/billing/*`、`/api/stripe/webhook` | Stripe 订阅 Studio Pro（$5.99/月、$59/年），Pro 每月 200 生成积分 |
| SEO 基础 | `sitemap.ts`、`robots.ts` | canonical、noindex 私有路由、JSON-LD（Article/HowTo/FAQ/Breadcrumb） |

### 1.2 数据观察

- 搜索流量几乎全部来自品牌词（`anisora`、`anisora ai`、`ani sora`、`anisora v3`、`index-anisora`、拼写变体 `anizora`），且几乎全部落在首页。
- `anizora`、`anisora v3.2` 等查询曝光可观但点击率明显偏低；美国曝光最多但点击率偏低。
- 点击国家分布中阿拉伯语国家占比最高，其次是美国、日本、印度、俄罗斯。
- 模型目录 `/models` 是唯一有一定非首页曝光的栏目；Recipes、Cases 详情页几乎没有曝光。
- 近期日点击低于 90 天均值，品牌词热度在下降。
- 线上 PostHog 未配置公钥，GA4 未建媒体资源，Vercel Web Analytics 未开启，转化漏斗数据缺失。
- GPTBot、OAI-SearchBot、ClaudeBot、PerplexityBot 访问正常（HTTP 200）。

## 2. 核心问题

1. **意图错配**：品牌词用户想直接用 AniSora 生成动漫视频，首页没有可立即使用的生成入口。
2. **付费后无法生成**：生成接口此前仅对测试白名单开放，订阅用户也无法生成，导致订阅流失。
3. **内容页未通过 GSC 检验**：大量 Recipes/Cases 页面上线后没有曝光，不是有效的排名页。
4. **没有度量**：无法判断用户在哪一步流失。

## 3. 迭代规划

### 迭代 0：止血与度量

代码（本分支 `growth/iteration-0`）：

- [x] 以 `origin/master` 为基线合并 `dev`，统一主干
- [x] 生成权限改为「开关 + 付费权益 + 积分」：`ENABLE_PAID_GENERATION=true` 时对所有登录用户开放入口，Pro 权益与积分预留仍逐单校验；如需回到白名单灰度，设置 `PAID_GENERATION_ALLOWLIST_ONLY=true`
- [x] 免费用户在请求生成时提前返回 `subscription_required`，不再触发供应商报价和任务写入
- [x] 首页 `<title>`、description、H1、FAQ 覆盖 `AniSora`、`AniSora AI`、`AniSora V3`、`Anizora` 等品牌查询，并明确非官方身份
- [x] 修复首页 FAQ 答案未进入服务端 HTML 的问题（折叠内容改为 `forceMount`），首页输出 FAQPage 结构化数据
- [x] JSON-LD 改为服务端直接输出（此前经 `next/script` 在客户端注入，非 JS 爬虫读不到）
- [x] `/pricing`、`/legal` 补充自身 canonical（此前继承首页 canonical，被 Google 视为首页的备用网页）
- [x] Sora 去水印页设为 noindex 并移出 sitemap（Sora 已停服，且依赖第三方解析接口）
- [x] 首页 Hero CTA 增加 PostHog 埋点

后台（需要账号所有者操作）：

- [ ] Vercel Production 确认 `ENABLE_PAID_GENERATION=true`，部署后用一个 Pro 账号完整跑通「参考帧 → 视频 → 积分结算」
- [ ] 创建 PostHog（EU）项目，在 Vercel 设置 `NEXT_PUBLIC_POSTHOG_KEY`，代码中已有约 40 个漏斗事件
- [ ] 开启 Vercel Web Analytics；GA4 可选（设置 `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`）
- [ ] Vercel 从 Hobby 升级到 Pro（Hobby 条款不允许商业用途）
- [ ] 联系已取消订阅的用户收集原因，并告知生成功能已开放

验收：Pro 用户可成功生成；PostHog 能看到 `pricing_viewed → billing_checkout_started → billing_checkout_returned_success → director_generation_submitted` 漏斗。

### 迭代 1：品牌流量变现

- [x] 首页首屏放生成器：上传参考图 + 提示词 → 点击生成时再登录和付费（`/api/generation/quick`；图片在浏览器缩放后存入私有 Supabase bucket `anisora-generation-inputs`，以 6 小时签名 URL 交给 fal；结果保存为单镜头 Director 项目，可继续编辑）
- [ ] 上线后用 Pro 账号跑通首页「上传 → 视频 → 积分结算」，并在 PostHog 观察 `home_generator_*` 漏斗
- 评估托管开源 AniSora V3 / V3.2 权重（官方仓库为 Apache-2.0 许可；可选 Replicate / fal 自定义部署 / RunPod），贴合品牌搜索意图；不可行时使用动漫效果最好的可用模型，并在页面如实标注模型。
- 一次性积分包为主、订阅为辅：Stripe `mode=payment` 结账，积分不随订阅周期清零；起步包按 $7.9 → $5.9 → $3.9 做价格测试，暂不送免费生成。
- 积分定价覆盖供应商成本并保留毛利（当前 1 积分 = $0.01 供应商成本，订阅额度偏低）。
- Stripe 开启 Apple Pay / Google Pay / Link。
- 多语言：先做阿拉伯语 `/ar`（RTL），再做日语 `/ja`，配置 hreflang。

验收：首页访问 → 注册率、注册 → 付费转化率、一次性积分包首单。

### 迭代 2：SEO 排名页扩展

- 页面三分法：排名页（一页一个核心词）、索引页（列全内页，不写长 SEO 文案）、其他页（不追求排名）。
- 品牌排名页：`/anisora-v3`、`/anisora-v3-2`、`/index-anisora`（介绍、本地部署、ComfyUI、在线体验入口），承接 `/docs/self-hosting` 等旧链接的 301。
- 工具排名页：anime image to video、AI anime generator、manga to anime video、anime voice（IndexTTS）。
- 模型排名页：补充新近发布的视频模型档案、两两对比、`X alternatives`。
- 新词监控：新视频模型发布后尽快上线对应页面。
- Recipes/Cases：上线两周无曝光的页面配真实生成视频（`VideoObject`）或合并、noindex。
- sitemap 改用内容级 `updatedAt`，不再使用统一的硬编码日期；为排名页生成独立 OG 图。
- GEO：每个排名页包含围绕关键词的文案与 FAQ，保持服务端渲染，定期在 ChatGPT 中检查是否推荐本站。

验收：非品牌词点击占比、至少获得 1 次点击的已收录页面比例。

### 迭代 3：外链与运营

- 提交 AI 工具导航站、Product Hunt；GitHub awesome 列表注明非官方。
- Reddit（如 r/aivideo）先读板块规则，避免影子封禁。
- 外链先小额投入，观察 GSC 曝光、点击、排名变化后再决定是否加码。
- Resend 发信前先养域名，再做生成完成通知与未付费召回邮件。

## 4. 风险与合规

- **商标**：AniSora 为 Bilibili 开源项目名称，域名与之一致；页面保持「独立产品、非官方」声明，并准备备用品牌。
- **内容安全**：开放生成后保持 fal 安全检查，禁止换脸与成人内容。
- **托管条款**：Vercel Hobby 不允许商业用途。
- **仓库可见性**：当前仓库公开，业务代码与配置策略对外可见；GitHub 公开仓库的 fork 不能直接改为私有，如需保密需迁移到新的私有仓库。

## 5. 参考

- web.cafe《网站页面分三类，索引页不用写 SEO 文案》
- web.cafe《怎么判断一个页面是不是精品？只看 GSC》：上线两周后有排名、曝光、点击，且出的是目标词
- web.cafe《先花几百到一两千刀买外链，用 GSC 判断这个站值不值得继续投》
- web.cafe《2026-10-13 国庆新词复盘大讨论》：GPT 流量六个动作；有流量没转化时主推单次付费并逐级测价；AI 视频站用最好的模型并控制时长与成本
