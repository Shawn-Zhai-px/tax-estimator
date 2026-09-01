# Phase E — 权威功能矩阵、系统架构设计与验收测试计划

> 综合三份并行深度调研(FreeTaxUSA+Cash App Taxes / TurboTax+H&R Block / TaxAct+TaxCaster+SmartAsset+
> NerdWallet)的产出。写作时间：2026-08-31。本文档是"修改"阶段（Phase 2）开工前的权威依据——
> 功能矩阵定义做什么、系统架构定义谁来做/怎么分工、验收测试计划定义怎么算做完。

---

## 0. 调研方法论与置信度说明

三个 Agent 分别深挖了：
1. **FreeTaxUSA + Cash App Taxes**（"永远免费复杂度，只对州/支持服务收费"的代表）
2. **TurboTax + H&R Block**（"分层付费+激进升级提示"的代表，且都有 FTC 执法记录）
3. **TaxAct + 三个纯估算同类工具（TaxCaster / SmartAsset / NerdWallet）**——后三者是本项目
   真正的同类竞品

每份报告都要求给每条非显而易见的结论标注来源 URL；部分来自低权威度聚合站点的结论（如 TaxAct
"$100k 保证从未成功赔付"的说法）已在下方标注为"未独立核实，置信度较低"。已发现并修正原有
`docs/market-benchmark-and-roadmap.md` 的两处错误：NerdWallet 计算器其实是**联邦专用**（不算
州税，原文档误判为"全 50 州"）；TaxCaster 独立 App 已于 2025 年 10 月下架（仅网页版仍在）。

---

## 1. 关键发现总结（跨五个 Tier 1 + 三个 Tier 2 产品）

### 1.1 定价墙/隐私模式验证了本项目定位的结构性优势

- **TurboTax**：2022 年 FTC 行政诉讼认定其"免费"广告具有欺骗性，最终支付 **$141M** 多州和解金；
  ProPublica 多年调查发现 TurboTax 曾在代码里指示搜索引擎**不要收录**其真正免费的 IRS Free File
  页面，转而把流量导向名字相似但覆盖面窄得多的付费版 "Free Edition"。
- **H&R Block**：2024 年 FTC 行政投诉认定其**故意制造"降级障碍"**——用户想从付费版降回免费版时，
  软件会删除已填数据、强迫联系客服走"障碍赛"流程；2025 年以 **$7M** 和解。
- **TaxAct（连同 H&R Block、TaxSlayer）**：2018–2022 年在网站嵌入 Meta Pixel / Google Analytics，
  向 Meta/Google 传输用户姓名、邮箱、电话、住址、报税身份、大致 AGI、退税/欠税金额、抚养人姓名等
  信息用于广告定向。触发国会调查（定性为"reckless"）、FTC 警告、多个州总检察长起诉、
  一起最终获批准的联邦消费者集体诉讼（赔付金额各信源口径不一，约 $14.95M–$23M 区间）、以及
  康涅狄格州 2026 年 8 月刚宣布的 **$27.5万** 单独和解。

**这三件事合在一起，是本项目"不收集个人信息、不设付费墙"这一既定定位目前能找到的最强现实
佐证**——不是"我们比较克制"这种自我表述，而是"同类产品因为收集了 PII / 设置了付费墙，
真金白银地在监管和诉讼上栽了跟头"。建议在隐私政策/条款页面（Phase G 已规划）里明确引用这类
背景作为设计原则的解释，而不只是笼统写"我们不收集数据"。

### 1.2 AI 与跨产品准确性问题——对"透明估算"定位的双重印证

- **Washington Post 独立测试**：H&R Block 的 AI Tax Assist 在测试问题里**超过 30% 给出无用或错误
  答案**，包括在加密货币税务处理上给错误指导。TurboTax 的 AI 助手同一测试中表现同样不理想。
- **跨产品准确性差异**：用完全相同的合成输入分别喂给 TurboTax / TaxAct / H&R Block，退税结果
  分别约 $1,800 / $1,900 / $1,700——差异被归因于"每家产品的交互问答方式不同地提炼/解读同一组
  事实"，而非单纯算法 bug。Consumer Reports 对 TurboTax/H&R Block/TaxAct/TaxSlayer 的实测也发现
  **每个产品都至少有一个缺陷**，其中一个可能导致漏报本该拿到的抵免。

结论：**"这是估算，不是权威计算"这句免责声明不是谦虚客套，而是行业里连最成熟的商业产品都
无法回避的现实**——这进一步支持了本项目已有的 disclaimer 措辞方向，也说明 Phase F（测试/CI/
年度数据更新流程）这类"准确性工程"投入是真实必要的，不是过度工程。

### 1.3 UI/工作流模式——可借鉴 vs. 应明确避免

**可借鉴的设计思路（原创重新实现，绝不照抄文案/UI/代码）：**

| 来源 | 模式 | 对本项目的启示 |
|---|---|---|
| TurboTax | 自适应单题式问答 + 跟随作答动态重排的进度条 + 顶部实时刷新的"预计退税"数字 | 主估算页目前是"填完整表单再点 Calculate"，可以考虑加一个**实时预览**（复用已有的 `useMemo` 计算，只是把结果提前展示，而不是等点击） |
| Cash App Taxes | 一进门二选一："引导式问答" vs "自选式章节列表" | 对我们这种无登录/无会话状态的估算器很适用——让熟悉自己情况的回头用户可以跳过引导直接填 |
| TaxAct、FreeTaxUSA（体验较差） | 问答/表单视图双模式切换，让用户看到底层表单实时生成 | 印证了本项目现有的 1040/540 逐行映射是**五个 Tier 1 产品 + 三个 Tier 2 产品全部没有做好或压根没有**的差异化点——调研反复验证了这一点，值得作为核心卖点持续投入，而不只是维持现状 |

**应明确避免的模式：**

| 来源 | 反面模式 | 本项目现状 |
|---|---|---|
| TurboTax / H&R Block | 填了大半信息后才提示"这个情况需要升级付费" | 天然不适用——本项目无付费墙 |
| SmartAsset | 结果数字旁边直接放"匹配理财顾问"引流 CTA，被第三方综述明确点名为"主业是线索转化，计算器只是引流工具" | **必须显式规避**——这是三个 Tier 2 同类工具里"变现动作最靠近计算结果"的反面案例 |
| Cash App Taxes | 报税功能强制要求注册完整的 Cash App 支付账户 | 印证"不要为了业务需要（而非税务正确性）强加账户门槛"这条待定问题（第 4 节）的参考案例 |
| NerdWallet | 自雇税拆到另一个完全独立的"小企业计算器"，同一用户的 W-2+1099 收入没法在一处合并估算 | 本项目已经是统一引擎（`calculateTax.ts` 一次算完），**必须在合并 paycheck 为 tab 时继续保持统一，不要拆分成孤立工具** |

### 1.4 Tier 2（纯估算同类工具）输入颗粒度对比——真正的"功能对等"基准线

| 维度 | TaxCaster | SmartAsset（详细版） | NerdWallet | 本项目现状 |
|---|---|---|---|---|
| 州税 | 否（仅联邦） | 是 | 否（联邦专用，页面有明确免责声明） | 是（CA/TX） |
| 自雇税 | 部分（收入若填入会计入，但无 Schedule C 明细） | 否（收"business income"但不算 SE 税） | 否（拆到独立的小企业计算器） | 是（Phase A） |
| 分项扣除明细 | 笼统"其他分项扣除" | 完整拆分（房贷/SALT/慈善现金+非现金/医疗） | 仅一个笼统总额 | 完整拆分，联邦/CA 独立判断 |
| 资本利得细分 | 未确认 | **长期/短期分开** | 无 | 仅长期（未分短期——**发现的新缺口，见第 2 节**） |
| HSA/401(k)/IRA | 无 | 401(k)+IRA | 401(k)+传统 IRA（无 Roth） | 有 |
| 抚养人抵免颗粒度 | 部分 | 按类别分人数 | 自报一个笼统抵免总额 | 逐个抚养人计算（Phase A） |
| AMT / QBI | 均无 | 均无 | 均无 | 未上线但已有 Phase D 计划 |
| 1040/540 逐行映射 | 无 | 无 | 无 | **有——三者均无，独家优势** |
| 结果旁的付费/引流 CTA | 有（导流到 TurboTax 付费版+贷款广告） | 有（导流理财顾问匹配，位置紧贴结果） | 弱/未在页面上确认 | 无（设计原则） |

**SmartAsset 一个具体的准确性案例**（来自第三方比较文章，带商业动机需谨慎但数字本身可信）：
一个 **$85,000 年收入的加州居民**场景，SmartAsset 因为完全不算自雇税+不算 CA SDI，
**低估了 42%（$6,518）的实际税负**。这正是本项目目标用户画像（加州、灵活就业）最容易踩坑
的地方，也印证了 Phase A 已经优先做自雇税是正确的优先级判断。

---

## 2. 权威功能矩阵（Feature Matrix）

在 `docs/market-benchmark-and-roadmap.md` 第 2 节矩阵基础上，加入本轮调研发现的新维度：

| 功能 | 本项目现状 | Tier 1（FreeTaxUSA 起步价最全，TurboTax/H&R Block 免费档最窄） | Tier 2（同类估算工具） | 本次调研后的判断 |
|---|---|---|---|---|
| 自雇税 | ✅ | ✅ | 仅 TaxCaster 部分支持 | 维持，已领先 Tier 2 |
| 分项扣除拆解（联邦+CA 独立） | ✅ | ✅（部分需付费档） | 仅 SmartAsset 有拆解，其余笼统 | **本项目在此维度已优于全部 Tier 2** |
| **资本利得长/短期分开** | ❌ 仅统一按长期优惠税率处理 | ✅ | 仅 SmartAsset 支持 | **新发现的缺口**——建议 Phase E 补上：短期资本利得应按普通税率而非优惠税率计税，目前若用户误填短期收益会被错误地按 0/15/20% 计算，属于潜在的**准确性 bug**，优先级应提到 QBI/AMT 之后、EITC 之前 |
| EITC | ❌ | ✅ | 少见 | 维持已规划优先级（Phase E） |
| 教育抵免（AOTC/LLC） | ❌ | ✅（付费档） | 少见 | 维持已规划优先级 |
| W-2 Additional Medicare (0.9%) | ❌ | ✅ | 均无 | 维持已规划优先级 |
| AMT / QBI | 🚧 Phase D 进行中 | ✅ | **三者均无** | 上线后即领先全部 Tier 2 同类工具，不只是"追平" |
| 1040/540 逐行映射 | ✅ | 仅内部生成，非教育展示用途 | **三者均无** | 独家差异化，Phase G 应作为营销/首页文案的核心卖点强化，而不只是一个功能点 |
| 工资代扣计算器 | ✅ 独立页面 | 无对应免费工具 | 仅 TaxCaster 有类似 W-4 计算器 | **本次要求合并为主页 tab**——见第 3 节架构设计 |
| 结果旁广告/引流 CTA | ❌（设计原则） | 不适用 | SmartAsset 有，TaxCaster 有，NerdWallet 较弱 | **明确写入架构约束**，任何未来变现设计都不能违反 |
| 网站追踪像素（Meta Pixel 等） | ❌（当前未使用任何分析工具） | TaxAct/H&R Block/TaxSlayer 曾用，已引发多起诉讼 | 未调研 | **明确写入架构约束**——见第 3.5 节 |
| 账户/登录/订阅付费 | ⏸ 待定（见 roadmap 第 4 节） | 需要（因电子报税） | 通常不需要 | 本轮调研没有改变结论，仍待定；Cash App Taxes 强制账户被独立点名为反面案例，进一步支持"不要为业务需要强加账户"的原则 |
| 电子报税 | ❌ 明确排除 | 是 | 否 | 不变 |

---

## 3. 系统架构设计

### 3.1 总体原则

- 保持**纯前端、无后端 API、无数据库**的现有架构——所有计算在浏览器完成，这是本项目对
  TaxAct 数据泄露、FTC 免费墙处罚等 Tier 1 产品案例的结构性免疫，不能为了任何新功能牺牲这一点。
- 两个计算引擎（`calculateTax.ts` 估算联邦/州所得税，`calculatePaycheck.ts` 估算工资代扣）
  **保持逻辑独立**（`paycheckData.ts` 文件头部已有明确注释说明二者用途不同，不要合并），但
  **UI 层合并为同一页面的两个 tab**。
- **明确的架构约束（任何模块的实现都不能违反）**：
  1. 不引入任何形式的用户可识别信息字段（姓名/SSN/住址/银行账号）。
  2. 不引入 Meta Pixel、Google Ads Remarketing 等广告追踪脚本；未来如加分析工具，只能是
     Plausible/Simple Analytics 这类不追踪个人的方案（`market-benchmark-and-roadmap.md` 3.3
     已提过，此处重申为硬约束）。
  3. 计算结果附近不放任何第三方产品的引流/广告 CTA（SmartAsset 反面案例）。
  4. 不强制账户/登录才能使用核心估算功能（Cash App Taxes 反面案例）；账户与否仍是第 4 节的
     待定问题，但"核心功能免登录可用"本身不待定。

### 3.2 Tab 合并架构（`calculatePaycheck.ts` 相关）

**现状**：`/paycheck-withholding` 是完全独立的路由/页面（`src/app/paycheck-withholding/page.tsx`），
有自己的 5 步向导（`PaycheckForm.tsx` + `TOTAL_STEPS`）、自己的默认值、自己的年度模型
（`PAYCHECK_TAX_YEAR`，与主估算器的 `taxYear` 选择器是两回事，`paycheckData.ts` 文件头注释
已明确"故意不合并"）。

**目标架构**：

```
src/app/page.tsx  (顶层 tab 容器)
├── Tab: "税务估算" (Income Tax Estimate)  — 复用现有 TaxForm + ResultsPanel，逻辑不变
└── Tab: "工资代扣" (Paycheck Withholding) — 复用现有 PaycheckForm + AnnualScheduleTable，
                                              5 步向导的输入顺序保持不变（用户明确要求）
```

- 用 URL 查询参数标记当前 tab（如 `/?tab=paycheck`），保证浏览器前进/后退、分享链接都能定位到
  正确的 tab——不要做成纯客户端 state 切换导致刷新丢失。
- `/paycheck-withholding` 旧路由**保留为重定向**（Next.js `redirects()` 配置或一个薄的重定向
  page），指向 `/?tab=paycheck`，避免任何已有书签/外链失效。
- 两个 tab 的 state 相互独立（各自的 `useState`），互不清空——切换 tab 不应该丢失另一个 tab
  已填的数据。
- **借着这次合并顺手修的一个真实小 bug**：`paycheck-withholding/page.tsx` 里 `applyCA: true`
  是硬编码的，不管用户在主估算器那边选的是 CA 还是 TX，工资代扣计算永远按 CA 算。合并为 tab 后
  两个 tab 应该共享"当前州"这一个顶层状态（如果用户选 TX，工资代扣 tab 应该自动不显示/不计算
  CA 代扣部分），这是"内容可根据需要修改"授权范围内、且有明确证据支撑（当前确实是逻辑不一致）
  的一处改动。

### 3.3 模块划分与职责边界（避免多 Agent 冲突）

按文件集合是否有重叠划分模块，只有重叠的模块之间才需要串行：

| 模块 | 负责范围 | 主要文件 | 与其他模块的依赖关系 |
|---|---|---|---|
| **A. Tab 容器与路由** | 新建顶层 tab 组件、`page.tsx` 重构为 tab 容器、旧路由重定向、"当前州"提升为共享状态 | `src/app/page.tsx`、新增 `src/components/TabShell.tsx`（或类似）、`next.config.js`（重定向）、`src/app/paycheck-withholding/page.tsx`（改为重定向壳） | **必须最先落地、单独一个 Agent 完成**，B/C/D 都要嵌入这个容器 |
| **B. 联邦/州计算新功能** | 短期资本利得区分、EITC、教育抵免、W-2 Additional Medicare Tax | `src/lib/calculateTax.ts`、`src/config/**`、`src/components/TaxForm.tsx`、`ResultsPanel.tsx`、`Form1040Summary.tsx`/`Form540Summary.tsx`、`exportCsv.ts`/`exportPdf.ts`、`calculateTax.test.ts` | 与 C 文件集合不重叠，可与 C **并行**（各自 worktree）；必须等 A 落地后再合并到主分支，避免和 tab 容器改动冲突 |
| **C. 工资代扣 tab 化 + 内容修订** | 迁入 tab、修 CA 硬编码 bug、根据本轮调研审视是否有内容需要更新（本轮调研未深挖工资代扣类竞品，除 CA 硬编码 bug 外暂无强证据支撑的其他内容变更） | `src/lib/calculatePaycheck.ts`、`src/lib/paycheckData.ts`、`src/components/PaycheckForm.tsx`、`AnnualScheduleTable.tsx`、`exportPaycheckCsv.ts`、`calculatePaycheck.test.ts` | 与 B 文件集合不重叠，可与 B **并行**；同样等 A 落地后再合并 |
| **D. 信任与合规 UX** | 实时结果预览、隐私政策独立页面（引用 TaxAct/FTC 案例说明设计原则）、disclaimer 同步更新、可访问性初审、SEO 基础 | `src/components/DisclaimerBanner.tsx`、新增 `src/app/privacy/page.tsx`、`src/app/layout.tsx`（SEO meta）、可能触及 A 的 tab 容器（实时预览需要接入两个 tab 的计算结果） | **必须等 A+B+C 合并后再做**，因为会触碰共享外壳文件 |
| **E. 测试/CI/验证** | 覆盖 B/C 新功能的测试、可访问性/对抗性/安全测试 | 各 `*.test.ts`、`.github/workflows/ci.yml` | 对应 B/C 完成后同步补，属于 Phase 3 验证阶段的一部分 |

**共享技术契约**：`TaxEstimateInput`/`TaxEstimateResult`（`calculateTax.ts`）与
`PaycheckInput`/`AnnualScheduleResult`（`calculatePaycheck.ts`）这两组 TypeScript 接口就是
B/C 两个模块对外的契约——新增字段一律走"可选、默认值安全"的既有约定（本项目 Phase A-D 一直
遵守，见每次实现后 100% 通过的向后兼容测试），这样即使 B/C 并行开发，只要不修改已有字段的语义，
合并时不会互相破坏。

---

## 4. 验收测试计划（Acceptance Test Plan）

### 4.1 新功能正确性（每项都要有手算验证的单元测试，沿用现有 `check()` 风格）

- **短期资本利得区分**：构造一个"全部为短期资本利得"的场景，验证结果按普通累进税率而非
  0/15/20% 优惠税率计税；构造一个"长短期混合"场景，验证两部分分别计税且互不影响。
- **EITC**：至少 3 个官方 EITC 速查表场景（不同抚养人数 × 不同收入水平，含 phase-in/plateau/
  phase-out 三个区间各一个用例）。
- **教育抵免（AOTC/LLC）**：AOTC 满额场景、AOTC phase-out 场景、LLC 场景，含"同一学生不能同时
  拿两种抵免"的互斥校验。
- **W-2 Additional Medicare Tax**：单人高收入 W-2 超过 $200k 门槛场景，验证与已实现的 NIIT
  互不干扰（两者独立触发/独立计算）。
- 每项新功能都要有一条"不填时行为不变"的向后兼容断言（沿用 Phase A-D 的既定测试规范）。

### 4.2 Tab 合并的功能性验收

- 切换 tab 后，另一个 tab 之前填的数据仍在（不丢失）。
- URL 查询参数正确反映当前 tab；刷新页面停留在同一 tab；浏览器前进/后退在两个 tab 间正确切换。
- 访问旧路由 `/paycheck-withholding` 正确重定向到新 tab，不出现 404 或空白页。
- 主估算器选 TX 时，工资代扣 tab 不应再计算/显示 CA 代扣与 CA SDI（验证 3.2 节提到的 bug 修复）。
- 工资代扣 tab 的 5 步向导顺序与合并前一致（逐步比对，确保没有在重构过程中意外重排）。

### 4.3 跨领域不变量（每次验证循环都要重新检查，不只测一次）

- **隐私不变量**：全仓库 grep 确认没有新增任何 `ssn`/`socialSecurityNumber`/`fullName`/
  `homeAddress`/`bankAccount` 类字段；没有引入 `gtag`/`fbq`/Meta Pixel/任何第三方追踪脚本。
- **无引流 CTA 不变量**：`ResultsPanel.tsx` 及其子组件里不出现指向第三方产品/理财顾问匹配/
  广告联盟链接的内容。
- **免责声明时效性**：任何新功能上线后，`DisclaimerBanner.tsx`、`exportCsv.ts`/`exportPdf.ts`
  里的免责文案必须同步检查是否有过时的"不支持 XXX"表述（沿用本次会话已经用过的模式）。
- **构建三件套全绿**：`npx tsc --noEmit` / `npm test` / `npm run build` 必须无错误无警告地通过，
  CI（`.github/workflows/ci.yml`）同步验证。

### 4.4 第三阶段（验证）的专项测试授权范围

以下每类测试都应该指派独立的验证 Agent，反复执行直到无重大缺陷遗留：

| 测试类型 | 具体范围 |
|---|---|
| 对抗性/边缘输入 | 负数、极大数、非数字字符串、空输入、超长小数、科学计数法输入等異常值在每个数字输入框的表现；多个可选功能同时触发的组合场景（如同时有 SE 收入+AMT 偏好项+QBI 限制同时生效） |
| 无障碍访问 | 键盘可达性（Tab 顺序、可见焦点环）、表单标签关联、颜色对比度、屏幕阅读器可理解的 tab 切换语义（`role="tab"`/`aria-selected` 等）——对标 WCAG 2.2 AA |
| 视觉/响应式 | 窄屏/中屏/宽屏下 tab 布局、长表格横向滚动是否正常；两个 tab 内容长度差异较大时页面高度跳动是否影响体验 |
| 设备/浏览器 | 至少 Chromium 内核 + 一个移动端视口尺寸的实跑验证（沿用本次会话已经建立的 Playwright 冒烟测试方法） |
| 数据隔离 | 验证两个 tab 之间、以及刷新前后，本地计算状态确实不会被发送到任何网络请求（浏览器 Network 面板应无相关外发请求） |
| 安全 | 由于纯前端无后端，重点是 XSS 类风险（确认所有用户输入都走 React 受控渲染而非 `dangerouslySetInnerHTML`）而非传统的认证/授权类测试（当前无账户系统，此类不适用） |

每个缺陷发现后：记录 → 修复 → 重新跑一遍相关测试类别 → 确认 `npm test`/`tsc`/`build` 仍然全绿，
如此循环直到本节所有测试类别都跑过至少一轮且无已知重大缺陷遗留，再视为 Phase 3 完成。

---

## 参考来源

调研过程中引用的完整来源列表（含 FTC/法院文件、Trustpilot/BBB/ConsumerAffairs 评价页、
CNBC/NerdWallet/Kiplinger 等编辑评测、各产品官方定价/帮助页）已在三份 Agent 调研报告的原始
输出中逐条列出，此处不重复粘贴全部 60+ 条 URL。关键的、被本文档正文直接引用结论的来源：

- [NPR: FTC accuses Intuit of deceptively advertising TurboTax as free](https://www.npr.org/2022/03/29/1089490958/free-turbotax-ftc-intuit)
- [ProPublica: TurboTax deliberately hides its free file page from search engines](https://www.propublica.org/article/turbotax-deliberately-hides-its-free-file-page-from-search-engines)
- [Kiplinger: FTC orders H&R Block to revamp practices and pay millions](https://www.kiplinger.com/taxes/ftc-orders-h-and-r-block-to-revamp-practices-and-pay-millions)
- [The Markup: Congressional report finds Meta and tax-prep companies recklessly shared taxpayer data](https://themarkup.org/pixel-hunt/2023/07/12/congressional-report-finds-meta-and-tax-prep-companies-recklessly-shared-taxpayers-data)
- [WFSB: $275K settlement with TaxAct over sharing taxpayer data with Meta/Google](https://www.wfsb.com/2026/08/19/275k-settlement-with-taxact-reached-over-sharing-taxpayer-data-with-meta-google/)
- [Washington Post (mirror): TurboTax and H&R Block AI chatbots giving bad tax advice](https://img.washingtonpost.com/technology/2024/03/04/ai-taxes-turbotax-hrblock-chatbot/)
- [Yahoo Finance: differences in tax prep software results across products](https://finance.yahoo.com/news/when-to-be-concerned-with-differences-in-your-tax-prep-software-205805673.html)
- [Consumer Reports: tax prep software review (H&R Block, TurboTax, TaxAct, TaxSlayer)](https://www.consumerreports.org/taxes/tax-preparation-software-review-hr-block-deluxe-turbotax-taxact)
- [themoneypocket.com: SmartAsset tax calculator comparison guide (42% underestimate example)](https://www.themoneypocket.com/articles/smartasset-tax-calculator-comparison-guide)
- [levyio.com: Best tax calculators 2026 roundup (monetization patterns)](https://levyio.com/best-tax-calculators/)
