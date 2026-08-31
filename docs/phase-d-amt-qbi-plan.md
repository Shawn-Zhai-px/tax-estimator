# Phase D — AMT 与 QBI 扣除：复杂度分析与实施计划

> 对应 `docs/tax-scope-analysis.md` Phase C 里被有意推迟的两项："QBI（Section 199A）扣除"
> 和 "AMT"。本文档回答"为什么这两项比 Phase A/B/C 已实现的内容更复杂"，并给出一份可以
> 分阶段落地的具体计划。写作时间：2026-08-25。尚未开始实施——本文档本身不改动任何代码。

---

## 结论先行

QBI 和 AMT 之所以被排在 Phase C 之后，不是因为"税法条文更长"，而是因为**它们都需要
这个工具目前完全没有建模的新一类输入**：

- **QBI** 需要知道用户的自雇/传承实体收入是不是来自"合格营业"、是不是 SSTB（指定服务类
  行业）、以及该营业实体付了多少 W-2 工资、有多少合格资产原值（UBIA）——这些都不是"一个
  数字"，而是"每个业务一组数字"，而当前的 `selfEmploymentNetIncome` 只是一个笼统的
  Schedule C 净利润输入。
- **AMT** 需要一整套独立于"常规税"的第二套应税收入口径（AMTI），其调整项在 TCJA 之后已经
  大幅精简（不再有个人宽免的加回、也不再有 misc itemized 加回），但仍然需要至少
  **SALT 全额加回**（这是目前触发个人 AMT 最常见的原因）和 **ISO（激励股票期权）行权价差**
  这类当前工具完全没有相关输入的项目。

两者都不能像 Phase A/B/C 那样"加一个输入框、复用现有的 `applyBrackets`"就完成，而是需要
先决定"要多大程度地简化"，因此值得单独立项分析，而不是直接开始写代码。

---

## 1. QBI（Section 199A，合格营业收入 20% 扣除）

### 1.1 法规现状（OBBBA 后，已确认为永久性条款）

QBI 扣除本来会在 2025 年底到期（TCJA 日落条款），**OBBBA（2025 年 7 月签署）已将其变为
永久性**条款，不再有到期问题——这意味着这不是一个"要不要赌它续不续"的问题，而是一个
"迟早都该做"的功能缺口。

| 项目 | 2025 | 2026 |
|---|---|---|
| 应税收入下限（低于此值：全额 20%，不受 W-2/UBIA 限制，SSTB 也按合格营业处理） | Single/HoH $197,300；MFJ $394,600 | Single/HoH $201,750；MFJ $403,500 |
| Phase-in 区间宽度 | Single/HoH $50,000；MFJ $100,000 | **OBBBA 扩大为** Single/HoH $75,000；MFJ $150,000（此后按通胀调整） |
| 应税收入上限（超出此值：非 SSTB 按 W-2/UBIA 全额限制；SSTB 扣除为 0） | Single/HoH $247,300；MFJ $494,600 | Single/HoH $276,750；MFJ $553,500 |
| 最低扣除额（新增） | 无 | **OBBBA 新增**：只要 QBI ≥ $1,000 且实质参与经营，扣除额不低于 $400 |

**核心公式（不分区间时）**：`min(20% × QBI, 20% × (应税收入 − 资本利得/合格股息))`。

**W-2/UBIA 限制（应税收入超过上限时生效）**：把 `20% × QBI` 换成
`min(20% × QBI, max(50% × W-2 工资, 25% × W-2 工资 + 2.5% × UBIA))`。

**Phase-in 区间内**：非 SSTB 按线性比例，从"不受限"过渡到"全额受限"；SSTB 按线性比例，从
"按合格营业全额扣除"过渡到"扣除为 0"。

**CA 一侧**：加州不承认 QBI 扣除（CA 从未采纳 TCJA 的 Section 199A），因此
**这项扣除只影响联邦，不影响 `caAGI`/`stateTaxableIncome`**——这一点和 HSA 的
"CA 不承认"逻辑类似，可以复用 `caAGI` 那种"联邦一个数、CA 另一个数"的既有模式，反而是
这个功能里最简单的一部分。

### 1.2 为什么比 Phase A/B/C 难

1. **输入形态变了**：现有 `selfEmploymentNetIncome` 是一个数字。QBI 需要区分：
   - 这笔营业收入是不是"合格营业"（大部分是，除了工资本身、资本利得等）；
   - 是不是 SSTB（医生/律师/会计/咨询/金融投资类服务等——税法列举了具体清单，形式上更接近
     一个"是/否"下拉，但用户可能自己也不确定自己的行业算不算 SSTB，需要给出解释和链接）；
   - 该营业实体付出的 **W-2 工资总额**（不是用户自己的工资，是"这家公司/这个 Schedule C
     业务发给员工的 W-2"——对多数独资、无雇员的自由职业者，这个值是 0，意味着一旦收入超过
     上限，扣除会被限制到很低甚至 0）；
   - **UBIA（合格资产原值）**——设备、房产等资产的原始成本，对多数纯服务型自由职业者同样
     是 0。
2. **应税收入门槛用的是"应税收入"而不是"AGI"**：即 `federalTaxableIncome`（扣除标准/分项
   扣除之后），这意味着 QBI 扣除本身必须在标准/分项扣除决定之后、但在计算最终应纳税所得额
   之前额外减去一层——目前 `federalTaxableIncome = federalAGI − deductionUsed` 这一行需要
   变成 `federalTaxableIncome = federalAGI − deductionUsed − qbiDeduction`，而
   `qbiDeduction` 的计算又依赖于 `federalTaxableIncome`（判断在哪个区间）——存在**循环依赖**
   （QBI 扣除封顶用的是"减去 QBI 扣除之前"的应税收入，需要按 IRS Worksheet 的顺序先算出
   "减去 QBI 前"的应税收入用于封顶判断和门槛判断，再单独减去 QBI 得到最终应税收入，顺序
   处理得当就不是真正的循环，但和现有的"一条线走到底"的计算顺序相比，需要更谨慎地插入
   一个新阶段）。
3. **多个营业实体的加总规则**（本工具大概率会跳过）：真实 Form 8995-A 允许多个营业分别计算
   再加总，甚至允许"聚合"多个关联业务；这里建议**只支持单一自雇/营业收入**（复用已有的
   `selfEmploymentNetIncome` 字段本身），不做多业务建模，作为一个明确标注的简化。

### 1.3 建议的简化实施方案（值得做，工作量中等偏上）

- 复用现有 `selfEmploymentNetIncome` 作为"合格营业收入"（QBI 本身有几处技术性调整，如
  减去自雇税抵扣的一半、减去自雇健康险保费、减去自雇退休金供款——本工具目前只有自雇税
  抵扣，可以先只做这一项调整，其余标注为"未建模，可能轻微高估 QBI"）。
- 新增输入：`isSpecifiedServiceTradeOrBusiness?: boolean`（SSTB 是/否，默认 false）、
  `qualifiedBusinessW2Wages?: number`（默认 0）、`qualifiedBusinessUbia?: number`（默认 0）。
  三者都设为可选、默认最保守值（0/false），保证不填时行为等价于"当前完全不算 QBI"，
  向后兼容。
- 在 `estimateTax()` 里，`federalTaxableIncome` 拆成两步：`taxableIncomeBeforeQbi`（
  现有公式）→ 按上表门槛/区间/SSTB 规则算出 `qbiDeduction` → 最终
  `federalTaxableIncome = taxableIncomeBeforeQbi − qbiDeduction`，资本利得的 stacking 逻辑
  （`ordinaryTaxableIncome`/`capGainsInTaxableIncome`）需要同步改用扣完 QBI 之后的
  `federalTaxableIncome`。
- UI 上明确提示："此工具只支持单一自雇/营业收入的简化 QBI 计算，不支持多个业务加总/聚合、
  自雇健康险与退休金对 QBI 的调整"，避免用户误以为覆盖了复杂的多业务场景。

---

## 2. AMT（个人替代性最低税，Form 6251）

### 2.1 法规现状

| 项目 | 2025 | 2026（OBBBA 生效） |
|---|---|---|
| AMT 宽免额 — Single/HoH | $88,100 | $90,100 |
| AMT 宽免额 — MFJ | $137,000 | $140,200 |
| AMT 宽免额 — MFS | $68,500 | $70,100 |
| 宽免额 phase-out 起点 — Single/HoH | $626,350 | **OBBBA 大幅下调至** $500,000（此后按通胀调整） |
| 宽免额 phase-out 起点 — MFJ | $1,252,700 | **OBBBA 大幅下调至** $1,000,000 |
| phase-out 比率 | 超出部分的 25% | **OBBBA 翻倍至** 超出部分的 50% |
| 26%/28% 税率分界点 | $239,100（MFS: $119,550） | $244,500（MFS: $122,250） |
| 资本利得/合格股息 | 在 AMTI 内仍按 0%/15%/20% 优惠税率计税（只是先并入 AMTI 参与宽免额
    phase-out 判断，本身不按 26%/28% 计税） | 同左 |

**OBBBA 对 AMT 的净效果**：宽免额小幅提高，但 **phase-out 起点大幅下调 + phase-out 比率
翻倍**，整体上让中高收入（尤其是有较大 SALT 加回或行使 ISO 的）纳税人从 2026 起比 2025
更容易触发 AMT——这是这项功能"迟早该做"的现实理由，而不只是理论完整性。

**计税逻辑**：`AMTI = 应税收入(taxable income, 即扣完 QBI 之后、加回标准/分项扣除中不允许
AMT 扣除的部分, 主要是 SALT) `；`暂定最低税(TMT) = AMTI 超过宽免额后按 26%/28%（资本利得部分
仍按优惠税率）计税`；`AMT = max(0, TMT − 常规税(federalTax))`——即只有当"用 AMT 口径算出来
的税"比"用常规税法算出来的税"更高时，才需要补差额。

### 2.2 为什么比 Phase A/B/C 难

1. **需要一整套新的"AMT 调整项"输入**，而这些恰恰是当前工具完全没有涉及的领域：
   - **SALT 加回**：这是目前个人触发 AMT 最主要的原因——`saltDeductible`（已经建模）需要
     在 AMTI 计算里**全额加回**（AMT 不允许扣除任何州/地方税）。这一项**不需要新输入**，
     可以直接复用现有的 `saltDeductible`，是 AMT 里最容易实现的部分。
   - **ISO（激励股票期权）行权价差**：行权时"公允市值 − 行权价"的差额是最典型的 AMT
     偏好项之一（尤其是科技行业员工），本工具目前完全没有股票期权相关的任何输入，需要
     新增一个"ISO 行权价差"输入框（并说明这是一个简化——真实情况还涉及行权后是否当年卖出、
     disqualifying disposition 等复杂规则，本工具只做"未卖出、需要缴 AMT 偏好"这一种
     最常见的场景）。
   - **私人活动债券利息（Private Activity Bond interest）**：市政债券利息通常联邦免税，
     但如果是私人活动债券，需要加回 AMTI。本工具目前没有任何"免税利息"相关输入，这是一个
     相对小众的场景（只有持有市政债券基金的用户才会遇到），可以作为可选输入，默认 0。
   - 标准扣除本身也不允许在 AMT 里扣（AMT 从"应税收入"往回加，需要**先加回标准/分项扣除
     里不被 AMT 认可的部分**——好消息是 TCJA 之后个人宽免额加回、misc itemized 加回等
     大部分历史上复杂的加回项已经被取消，只剩 SALT 是主要项，AMT 的"调整项清单"比 TCJA 之前
     短很多，这也是本工具现在才考虑做 AMT 的原因之一——门槛比几年前低了。
2. **需要与 QBI 联动**：AMTI 是在"应税收入"基础上调整，而应税收入本身已经扣除了 QBI——即
   AMT 必须在 Phase D 的 QBI 逻辑落地之后才能正确实现（QBI 扣除本身在 AMT 下同样允许，
   不需要加回），**建议先做 QBI 再做 AMT**，顺序上有依赖关系。
3. **需要与资本利得 stacking 逻辑对齐**：现有的 `applyBrackets` 双调用技巧（Phase C 已经
   用于联邦优惠税率）需要在 AMT 口径下**再调用一次**（AMTI 里的资本利得同样享受优惠税率，
   但普通收入部分改用 26%/28% 两档而不是联邦累进税率表）——不是新技巧，但是要把已有的
   "先对普通收入部分计税、再对资本利得部分算增量"逻辑在一套新的税率表（`amtBrackets`，
   只有 2 档）上再跑一遍，并且这次的"应税收入"起点是 AMTI 而不是
   `federalTaxableIncome`。
4. **"取两者较大值"的比较逻辑是全新的**：现有代码里"标准 vs 分项"、"联邦 vs CA 独立判断"
   都是"取较大值当作扣除"，而 AMT 是"取两条完全独立算出来的税额中较大的那一个作为最终应
   缴税额"——概念上和现有的任何一处都不一样，需要新增
   `federalTax = max(federalTaxBeforeAmt − 各类信用, tentativeMinimumTax − 各类信用)`
   这样的比较（且要小心 AMT 下 CTC/ODC 等信用的处理规则和常规税法不完全一致，本工具建议
   简化为"两条线都先不减信用比较 TMT vs 常规税，取较大者，再统一减去信用"，并在文档/UI 里
   注明这是简化，可能和官方 Form 6251 的信用顺序有细微出入）。
5. **CA 有自己独立的 AMT**（7% 税率，宽免额和联邦不同，且 CA 从未提高过宽免额、几乎所有
   中高收入纳税人理论上都可能被轻微触碰到），如果要在 CA 侧也做，等于**要把上述整套逻辑
   再实现一遍、换一套 CA 专属的宽免额和 7% 单一税率**——建议**第一步只做联邦 AMT**，CA AMT
   作为明确标注的"暂不支持"未来项（CA AMT 命中率和金额通常远小于联邦 AMT，优先级更低）。

### 2.3 建议的简化实施方案（工作量较大，建议放在 QBI 之后）

- 新增输入（均可选，默认 0）：`isoExerciseSpread`（ISO 行权价差）、
  `privateActivityBondInterest`（私人活动债券利息）。SALT 加回直接复用已有的
  `saltDeductible`，不需要新输入。
- `types.ts` 新增 `amtExemption`/`amtExemptionMfs`、`amtPhaseOutThreshold`/`...Mfs`、
  `amtPhaseOutRate`（2025: 0.25 / 2026: 0.50）、`amt26PctBreakpoint`/`...Mfs`，以及联邦
  `amtCapitalGainsBrackets`（可直接复用已有的 `capitalGainsBrackets`，AMT 下资本利得税率
  和常规税法一致）。
- 新增 `calculateAmt()`：
  1. `amti = federalTaxableIncome + deductionUsed(还原成分项时的 SALT 部分, 若为标准扣除则
     整个标准扣除额加回 — 需要确认标准扣除在 AMT 下是否允许，建议按"标准扣除同样不允许"
     处理，即两种情况都加回 `deductionUsed` 而不是只加 SALT，更保守也更简单) + isoExerciseSpread
     + privateActivityBondInterest + qbiDeduction 不加回（QBI 本身 AMT 下继续允许）`。
  2. 宽免额按 `amti` 和 phase-out 公式算出实际可用宽免额（超过 phase-out 起点后，每 $1
     AMTI 减 $0.25/$0.5 宽免额，2026 完全 phase-out 后为 0）。
  3. `amtTaxableBase = clampToZero(amti − 实际宽免额)`，资本利得部分继续按 0/15/20% 优惠
     税率单独 stacking，普通收入部分按 26%/28% 两档计税，得到 `tentativeMinimumTax`。
  4. `amtAmount = clampToZero(tentativeMinimumTax − federalTaxBeforeCredits)`（用"扣信用前"
     的常规税比较，简化 AMT 信用抵免顺序的复杂规则）。
  5. `federalTotalTax` 里加上 `amtAmount`。
- UI/1040 摘要/导出：明确标注"本工具的 AMT 计算是简化版本：只加回 SALT、ISO 行权价差、
  私人活动债券利息三项，不支持行权当年卖出（disqualifying disposition）、AMT 净营业亏损
  结转、AMT 外国税收抵免等更复杂的场景；不支持 CA 自己的 AMT（7%）"。这类"清楚写明简化
  边界"的做法和 2026 抚养费信用近似值、CA 数据 provisional 标注是同一套已经在用的透明度
  惯例。

### 2.4 测试策略

沿用现有 `calculateTax.test.ts` 的手算验证套路：
- 一个"SALT 加回后仍未触发 AMT"的低收入案例（验证默认不受影响，向后兼容）。
- 一个"高收入 + 大额 SALT + 无 ISO"的案例，手算 AMTI/宽免额 phase-out/26%/28% 分界，
  验证 `amtAmount > 0` 且等于手算差额。
- 一个"ISO 行权价差单独触发 AMT"的案例（SALT 较小但 ISO 很大）。
- 一个"2026 sneak 进入 phase-out 更早/更快"的案例，对比同样输入在 2025 vs 2026 下 AMT
  金额的差异，验证 OBBBA 参数确实生效。

---

## 3. 建议的实施顺序

1. **先做 QBI**（Phase D1）：工作量中等偏上，但没有"取两套税制较大值"这种全新概念，
   可以复用现有"扣除项 + 门槛/phase-out"的既有模式（和 SALT cap phase-down、CTC phase-out
   是同一类计算），且和资本利得 stacking 的交互点单一、可控。
2. **再做 AMT**（Phase D2），因为：
   - AMTI 的起点依赖 QBI 扣除后的应税收入，做完 QBI 再做 AMT 顺序更顺；
   - AMT 概念上更陌生（比较两套税制取较大值），且需要新的偏好项输入（ISO/私人活动债券
     利息），用户教育成本更高，建议放在后面单独做一轮，充分测试。
3. **EITC 和 CA 自己的 AMT** 仍然建议维持"不做"或"作为更后续的 Phase E"——EITC 主要服务
   低收入人群，和这个工具当前的输入维度（自雇、房贷、投资收入等）用户画像重叠度较低；
   CA AMT 命中率/金额通常远小于联邦 AMT，性价比更低。

---

## 参考来源

- [Alternative Minimum Tax (AMT) Rules and Exclusions for 2026 — SmartAsset](https://smartasset.com/taxes/amt-tax-brackets)
- [AMT Changes Under the Big Beautiful Bill Act — KLR](https://kahnlitwin.com/blogs/tax-blog/amt-changes-under-the-big-beautiful-bill-act-what-to-expect-in-2026)
- [2026 AMT Exemption — Reed Corporation CPA Firm](https://reedcorp.tax/helpful-guides/2026-amt-exemption/)
- [IRS AMT Calculator 2025 & 2026 — ustax.tools](https://ustax.tools/amt-calculator/)
- [2026 Tax Brackets and Federal Income Tax Rates — Tax Foundation](https://taxfoundation.org/data/all/federal/2026-tax-brackets/)
- [Planning for the AMT — The Tax Adviser](https://www.thetaxadviser.com/issues/2025/mar/planning-for-the-amt/)
- [QBI Deduction 2026: Section 199A Guide — National Tax Tools](https://nationaltaxtools.com/guides/qbi-deduction/)
- [Section 199A Deduction Made Permanent Under OBBBA — Hanson CPA](https://www.hanson-cpa.com/qualified-business-income-deduction-made-permanent-under-obbba/)
- [Section 199A (QBI) 2025: New Permanent Limits & Deduction Rules — Ourtaxpartner](https://ourtaxpartner.com/section-199a-qbi-limits-2025/)
- [Calculating W-2 Wages for Limitations on the QBI Deduction — GRF CPAs](https://www.grfcpa.com/resource/calculating-w-2-wages-for-limitations-on-the-qbi-deduction/)
- [QBI Deduction and W-2/UBIA Limits: Thresholds and Phase-In Basics — VisaVerge](https://www.visaverge.com/knowledge/qbi-deduction-and-w-2-ubia-limits-thresholds-and-phase-in-basics/)
