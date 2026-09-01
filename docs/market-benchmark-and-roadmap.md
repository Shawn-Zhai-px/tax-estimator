# 与主流产品对标 + 未来开发路线图

> 分析时间：2026-08-25。本文档只做分析和规划，不涉及代码修改。

## 0. 先明确一件事：我们和 FreeTaxUSA/TurboTax 不是同一类产品

FreeTaxUSA、TurboTax、H&R Block、Cash App Taxes 这些是**报税产品**——它们收集用户的
姓名/SSN/银行账户等个人信息，生成正式的 1040/540 表格，并通过 IRS MeF 系统**电子提交**
给税务机关。

这个项目从一开始（`docs/my_plan/MyPlan.md` 第 4 条）就明确设定为**纯估算工具**：
不生成可提交的正式表格，不电子报税。隐私边界准确的说法是：**不收集任何能定位到具体
个人身份的信息**——姓名、社保号（SSN）、家庭住址、银行账号等——但**数字相关的信息
（收入、扣除、抵免等税务计算输入）是可以收集的**，这和"完全不收集任何数据"不是一回事。
这一点也带来一个结构性优势：因为本项目从不电子报税，天然就不需要像 FreeTaxUSA/TurboTax
那样出于法律要求必须采集 SSN——未来即使加账户功能，个人信息层面的风险也远低于报税产品。

**这个定位差异是本文档最重要的前提**：下面所有"对标"和"路线图"，目标都是让**税务计算
本身尽可能全面、准确**，而不是把这个网站做成 FreeTaxUSA 的替代品。电子报税/向 IRS 或
各州提交申报，因为和"估算工具"这个定义本身矛盾，明确不在路线图范围内；但**账户/登录、
是否走订阅付费模式，目前是一个待定问题——留到第 5 节结合竞品分析后再讨论，不在此处
提前下结论**。

## 1. 该跟谁对比？两类完全不同的产品

| 类别 | 代表产品 | 是否收集个人信息 | 是否电子报税 | 和本项目的关系 |
|---|---|---|---|---|
| 报税产品（Tier 1） | FreeTaxUSA、TurboTax、H&R Block、Cash App Taxes | 是 | 是 | 不是同类竞品，只借鉴其"计算覆盖面" |
| 纯估算工具（Tier 2，真正的同类竞品） | TurboTax 官网的 TaxCaster、SmartAsset 联邦税计算器、NerdWallet 税务计算器 | 否（一般不需要注册） | 否 | **这才是本项目真正对标的产品类别** |

Tier 1 产品的免费版功能范围（用于判断"税务计算覆盖面"该做到多深）：

| 产品 | 免费档覆盖 | 收费档覆盖 |
|---|---|---|
| **FreeTaxUSA** | 联邦申报永久免费，含自雇（Schedule C/SE）、K-1、投资收入、分项扣除——不因为"复杂"而分层收费，州申报统一 $15.99 | 无实质"更高级"档位，主要按"联邦免费+州付费"收费 |
| **TurboTax** | Free Edition 仅覆盖最简单的 1040（约 37% 报税人符合），2026 起取消了 Basic 档 | Deluxe（分项扣除/教育抵免，~$79 联邦）、Premium（合并了原 Premier + Self-Employed，含投资/租金/自雇，~$139 联邦） |
| **H&R Block** | Free 档覆盖简单 W-2 + 学生贷款利息 + CTC + EITC | Deluxe（房贷/HSA/自雇副业）、Premium（房租/投资 /加密货币）、Self-Employed（折旧等） |
| **Cash App Taxes** | 完全免费、单一档位，含自雇（Schedule C）、投资、租金收入（Schedule E）——但**不支持多州申报、不支持 Form 2210（预估税罚款）** | 无付费档 |

Tier 2（真正同类的纯估算工具）目前的已知短板（这对我们反而是差异化机会）：
- **SmartAsset** 的计算器明确**不含 AMT**，也没有详细的分项扣除/优化建议。
- **NerdWallet** 的计算器支持标准/分项二选一 + 401(k)/HSA 调整，但同样**没有完整的 AMT 计算**。
- 两者都不会像本项目一样把结果映射到具体的 **1040/540 表格行号**——这是本项目现有的、
  同类免费估算工具里少见的差异化功能。
- IRS 官方的 Direct File（免费报税，非估算工具）已于 2026 报税季**被叫停**，进一步说明
  "独立于官方渠道之外的免费/透明估算工具"仍有需求空间。

## 2. 功能覆盖对比表

以"能否算对"为标准，对比本项目当前实现 vs. Tier 1 免费档 vs. Tier 2 纯估算工具：

| 功能 | 本项目现状 | FreeTaxUSA/TurboTax（免费档） | TaxCaster/SmartAsset/NerdWallet |
|---|---|---|---|
| 自雇税（SE Tax） | ✅ 已实现（Phase A） | ✅（部分产品收费档） | ✅ TaxCaster 支持 |
| CTC / 其他抚养人抵免 | ✅ 已实现 | ✅ | ✅ |
| 学生贷款利息扣除 | ✅ 已实现 | ✅ | 部分支持 |
| 分项扣除拆解（房贷/SALT/慈善/医疗） | ✅ 已实现，且联邦/CA 各自独立判断 | ✅（部分需付费档） | 仅笼统输入 |
| 抚养儿童看护抵免 | ✅ 已实现 | ✅ | 较少支持 |
| 资本利得/合格股息优惠税率 | ✅ 已实现 | ✅ | 部分支持 |
| NIIT（3.8%） | ✅ 已实现 | ✅ | 少见 |
| HSA / 401(k) / IRA 调整 | ✅ 已实现 | ✅ | ✅ |
| **AMT** | ❌ 未实现（已有 `docs/phase-d-amt-qbi-plan.md` 规划） | ✅ | ❌ SmartAsset/NerdWallet 均缺失 |
| **QBI（199A）** | ❌ 未实现（同上已规划） | ✅ | 少见 |
| **EITC** | ❌ 未实现 | ✅ | 少见 |
| 教育抵免（AOTC/LLC） | ❌ 未实现 | ✅ | 少见 |
| W-2 工资本身的 Additional Medicare 0.9% | ❌ 未实现（disclaimer 中已注明） | ✅ | 少见 |
| 支持的州 | 仅 CA / TX | 全 50 州 | 全 50 州（简化模型） |
| 多州/部分年度居民 | ❌ | ✅（部分产品限制） | ❌ 基本都不支持 |
| **联邦/州表格行号映射（1040/540）** | ✅ **本项目的差异化亮点** | 内部生成正式表格但不是"教育展示"用途 | ❌ 都没有 |
| 工资代扣计算器（独立页面） | ✅ 已有 `/paycheck-withholding` | 无对应免费工具 | TaxCaster 有类似的 W-4 计算器 |
| PDF/CSV 导出估算结果 | ✅ 已实现 | 生成正式表格 PDF（要报税） | 部分支持导出 |
| 账户/登录/历史记录 | ❌ **主动不做**（见第 0 节） | 需要 | 通常不需要 |
| 电子报税 | ❌ **主动不做** | 是 | 否（同类工具也不做） |

## 3. 差距分析：想达到"可以对外发布"的标准，还需要做什么

按四个维度拆解（不是所有维度都需要写代码——按实际情况分类）：

### 3.1 计算覆盖面（写代码）

优先级从高到低：

1. **QBI + AMT**（已有详细规划 `docs/phase-d-amt-qbi-plan.md`，直接照此实施即可）——这是
   当前 disclaimer 里明确列出的两个"不计算"项，也是 Tier 1 产品都覆盖、Tier 2 同类工具
   反而普遍缺失的功能，实现后能在"纯估算工具"这个类别里建立明显优势。
2. **EITC（低收入劳动所得抵免）**——`docs/tax-scope-analysis.md` 中 Phase C 就已提到但
   一直被推迟，覆盖人群（低收入/时薪工作者）和本项目"灵活就业/小时工"的既定目标用户
   重叠度很高，值得提上日程。
3. **W-2 工资本身的 Additional Medicare Tax（0.9%）**——目前只有自雇收入部分被 disclaimer
   提及未建模，但普通高收入 W-2 员工超过门槛（$200k/$250k MFJ）同样要缴，且和已实现的
   NIIT 是完全独立的两个税种，容易被误以为"已经算过了"。
4. **教育抵免（AOTC/终身学习抵免）**——次优先级，覆盖面不如前三项广。
5. **更多州**——CA/TX 已覆盖加州华人社区的核心场景，若要扩大受众，NY/WA/MA 等州是
   参考同类工具的常见下一批候选，但工作量大（每个州都要重新调研税率表+特殊规则），
   建议放在功能对比里的第一档需求做完之后再评估。

### 3.2 准确性与可信度（写代码 + 建立流程）

- **测试覆盖有缺口**：目前只有 `src/lib/__tests__/calculateTax.test.ts`（87 个断言），
  但 `src/lib/calculatePaycheck.ts`（工资代扣引擎，独立于 `calculateTax.ts` 的另一套逻辑）
  **完全没有测试**。在对外宣称"可信赖的估算工具"之前，这是必须补的一块。
- **没有 CI**：仓库里没有 `.github/workflows`，`npm test`/`npx tsc --noEmit`/`npm run build`
  目前都是手动跑的。哪怕只是一个"PR 时自动跑 test + build"的 GitHub Actions，也能防止
  未来的改动悄悄破坏已有的税务计算逻辑。
- **年度数据更新没有固定流程**：`src/config/2025|2026/taxData.ts` 里大量数字（联邦/CA
  税率表、SALT 上限、抵免金额等）需要每年跟着 IRS Rev. Proc. / FTB 公告更新，目前是
  "遇到就手动查、手动写注释来源"。建议整理成一份可复用的年度更新 checklist（哪些
  IRS/FTB 文件要查、哪些字段要改），避免每年都从零摸索。
- **`caDataIsProvisional` 这种"数据置信度标记"的做法值得推广**——目前只用在 CA
  2026 数据上，可以考虑对"近似值"（如已经用到的 `dependentCareCreditIsApproximate`）
  统一成一套约定，而不是每个字段各自命名。

### 3.3 产品体验（写代码）

- **可访问性（WCAG 2.2 AA）**：目前没有做过专门的可访问性审查（键盘导航、表单标签、
  颜色对比度、焦点可见性）。美国 ADA Title II 已明确网站需符合 WCAG 2.1 A/AA，即使是
  小型个人项目，这也是对外发布前值得过一遍的基本功课，且大部分问题不需要重新设计，
  只需要开发时的小调整（正确的 `<label htmlFor>`、足够的对比度等——`TaxForm.tsx` 目前
  的 `<label>` 用法已经是对的起点）。
- **输入校验/异常值处理**：目前数字输入框基本靠 `Number(x) || 0` 兜底，没有对"负数"
  "明显不合理的大数"做任何提示性校验（虽然 `clampToZero` 保证了计算不会出错，但用户
  输入错误时不会有任何反馈）。
- **SEO**：作为一个面向公众的免费工具，目前没有看到针对性的 meta description/结构化数据/
  sitemap，而这类工具的自然流量很大程度上来自搜索（参考 SmartAsset/NerdWallet 都靠
  SEO 获取流量）。
- **移动端**：`docs/tax-scope-analysis.md` 里已有结论——继续吃 Tailwind 响应式老本即可，
  建议对外发布前专门过一遍真机/多分辨率测试，而不是只在开发时抽查。

### 3.4 合规与信任（基本不涉及代码，但要写文案）

- **Disclaimer 需要跟着功能实现同步更新**——当前 `DisclaimerBanner.tsx` 明确写着"不含
  EITC、教育抵免、AMT、QBI"，QBI/AMT 一旦实现，这句话就是过时信息，必须同步改。
- **补一个独立的隐私政策页面**——需要准确说明"收集什么、不收集什么"：不收集姓名/
  SSN/家庭住址等个人身份信息，但数字相关的税务输入信息会被收集（现状是否已经收集、
  存到哪里，需要在实现账户/登录相关功能时一并明确并写入政策，而不是笼统写"什么都不
  收集"）。这也是建立用户信任、以及很多浏览器/搜索引擎对"正规网站"的隐性期待。
- **Terms of Use**——涵盖"仅供参考、不构成税务建议、不建立委托关系"这几点，当前
  disclaimer 已经涵盖核心意思，可以考虑整理成独立页面，增强正式感。
- **不需要考虑**：IRS e-file provider 认证、Circular 230 从业人员合规——这些只适用于
  报税产品或提供"个性化建议"的从业者，本项目既不报税也不针对具体纳税人提供咨询意见，
  不适用。

### 3.5 明确排除 vs. 待定问题

**明确排除**（和"估算工具"这个产品定义本身矛盾，不是竞品分析能改变的）：

- 电子报税 / 向 IRS 或各州提交申报
- W-2/1099 文件导入与 OCR 识别（这类功能的价值主要是为"报税"服务，而非"估算"）

**待定问题（不下结论，见第 5 节的竞品分析）**：

- 账户/登录系统
- 是否走订阅付费模式
- 服务器端是否保存用户的数字化税务输入历史（注意：即使做，也只涉及数字，不涉及
  姓名/SSN/住址等身份信息——见第 0 节）

## 4. 待定问题的竞品参考：账户 + 付费模式该怎么选

这一节只提供参考信息，不给出最终决定——账户/登录、是否订阅付费，按你的要求留到看完
这些信息后再一起决定。

### 4.1 同类估算工具的现状（"什么都不做"这一端）

- **TaxCaster**（TurboTax 旗下的免费估算工具，是本项目最直接的同类对标）**完全匿名，
  不需要登录，也没有"保存估算结果"的功能**——即使页面上出现登录提示，也可以直接以
  访客身份跳过继续用。这代表纯估算工具品类里的"现状基线"：不加账户完全说得通，是
  合理的默认选项，不会显得功能缺失。

### 4.2 报税产品的账户模式（不直接适用，但可作参考）

- FreeTaxUSA/TurboTax/H&R Block 的账户体系是**因为电子报税的法律/流程要求**而存在
  （需要跨年调用上一年数据、需要 SSN 做身份核验、需要保存已提交的申报记录备查）——
  这个"为什么需要账户"的理由，在本项目里**不成立**，所以不能直接照抄这套账户设计，
  只能借鉴其中"用邮箱注册、不强制收集身份证件级别信息"的思路。

### 4.3 相邻的个人理财类 App 的付费模式（更接近本项目量级的参考对象）

个人理财类工具（不是报税工具，但和本项目一样"围绕数字、面向普通消费者"）近年的
付费模式很有参考价值：

| 产品 | 模式 | 定价 |
|---|---|---|
| YNAB | 纯订阅，无免费版 | $14.99/月 或 $109/年 |
| Copilot Money | 纯订阅，无免费版，无广告 | $13/月 或 $95/年 |
| Rocket Money | Freemium（核心功能免费，增值功能付费） | $4～$12/月（增值部分） |
| NerdWallet Plus | 在免费内容基础上叠加的订阅增值层 | $49/年 |

背景信息：Mint（曾经的免费、广告支持的个人理财工具）关停后，普遍被解读为"广告支持
的免费个人理财工具在大规模场景下难以为继"的信号，继任者（Monarch、Copilot、YNAB、
Rocket Money）大多转向了订阅付费。**这提示了一个方向性参考**：如果本项目未来真的要做
账户/付费，"轻量账户（仅邮箱，不含身份信息）+ Freemium 或订阅"这类模式，在同量级的
个人理财类产品里是当前的主流选择，而不是"免费+广告"。

### 4.4 三个可选方向（仅供决策参考，非最终建议）

| 方向 | 说明 | 何时适合 |
|---|---|---|
| **A. 维持现状：无账户** | 和 TaxCaster 一致，最省心，符合当前"纯估算"定位 | 短期内没有"跨设备保存历史/多年对比"这类明确需求时 |
| **B. 轻量账户（仅邮箱，无 SSN/姓名/住址）** | 用于保存数字化的估算场景、跨年对比，不涉及任何身份信息 | 如果验证到用户确实想要"保存多个假设情景"这个需求 |
| **C. 账户 + 订阅付费（参考 YNAB/Copilot/Rocket Money）** | 在 B 的基础上把高级功能（如多州对比、历史趋势）设为付费 | 需要先有 B 的基础和一定的使用数据支撑，不建议一步做到位 |

## 5. 建议的路线图（按优先级排序）

| 阶段 | 内容 | 备注 |
|---|---|---|
| **Phase D**（已规划） | QBI + AMT | 见 `docs/phase-d-amt-qbi-plan.md`，直接照此实施 |
| **Phase E** | EITC、W-2 的 Additional Medicare Tax、教育抵免 | 与 Tier 1 免费档功能对齐的最后几块主要缺口 |
| **Phase F（质量加固）** | 补 `calculatePaycheck.ts` 测试、搭建 CI（GitHub Actions 跑 test+build+typecheck）、整理年度数据更新 checklist | 不是新功能，但是"能不能放心对外宣称准确"的前提 |
| **Phase G（发布前打磨）** | 可访问性审查（WCAG 2.2 AA）、输入校验提示、SEO 基础（meta/sitemap）、隐私政策/条款页面（准确描述"不收集身份信息，收集数字信息"）、跟随 Phase D/E 同步更新 disclaimer | 对外发布前的最后一道工序 |
| **Phase H（可选，长期）** | 扩展支持州（NY/WA/MA 等候选） | 工作量大，建议在 D/E/F/G 完成后再评估投入产出比 |
| **账户/订阅（待决策）** | 见第 4 节的三个可选方向（A/B/C） | 不排入以上时间线——需要先决定走哪个方向，再评估工作量和排期 |

## 参考来源

- [FreeTaxUSA Pricing](https://www.freetaxusa.com/pricing/)
- [FreeTaxUSA Self-Employed](https://www.freetaxusa.com/self-employed/)
- [FreeTaxUSA Review 2026 (CNBC)](https://www.cnbc.com/select/freetaxusa-review/)
- [Compare TurboTax Online Products 2025-2026 (Intuit)](https://turbotax.intuit.com/personal-taxes/compare/online/)
- [TurboTax 2026 Review (Taxo)](https://taxo.com/turbotax-review-2026/)
- [H&R Block Online Review 2026 (CNBC)](https://www.cnbc.com/select/hr-block-review/)
- [H&R Block Pricing 2026](https://checkthat.ai/brands/h-r-block/pricing)
- [Cash App Taxes Review 2026 (Forbes Advisor)](https://www.forbes.com/advisor/taxes/cash-app-taxes-review/)
- [IRS Direct File will not be available in 2026 (Federal News Network)](https://federalnewsnetwork.com/it-modernization/2025/11/irs-direct-file-will-not-be-available-in-2026-agency-tells-states/)
- [TurboTax TaxCaster](https://turbotax.intuit.com/tax-tools/calculators/taxcaster/)
- [SmartAsset Federal Income Tax Calculator](https://smartasset.com/taxes/income-taxes)
- [NerdWallet Federal Income Tax Calculator](https://www.nerdwallet.com/taxes/calculators/tax-calculator)
- [Web Accessibility Checklist 2026 (line25.com)](https://line25.com/articles/web-accessibility-checklist-2026/)
- [2026 ADA Web Accessibility Standards & Requirements](https://www.accessibility.works/blog/wcag-ada-website-compliance-standards-requirements/)
- [TaxCaster access/login FAQ](https://www.justanswer.com/accounting-software/tzrtc-turbotax-taxcaster-estimated-taxes-access.html)
- [NerdWallet Subscriptions and Bills FAQs](https://support.nerdwallet.com/hc/en-us/articles/33849929735949-NerdWallet-Subscriptions-and-Bills-FAQs)
- [Best Budgeting Apps for 2026, Ranked by Real-World Use (The College Investor)](https://thecollegeinvestor.com/32672/best-budgeting-apps/)
- [YNAB vs Monarch vs Copilot (2026) pricing comparison (WalletGrower)](https://walletgrower.com/compare/ynab-vs-monarch-vs-copilot)
