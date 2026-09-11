# GitHub UI / Motion / Performance Skill 预检

审计日期：2026-09-11

本轮按项目长期协议执行 GitHub Skill Preflight。检索结果只作为参考，不代表已安装、已授权或适合直接复制。未安装外部 Skill，不执行安装。

## 1. 当前本地可用 Skill

当前 Skill 清单中没有直接匹配 frontend-design、cinematic-scroll、gsap-framer-scroll-animation、ui-ux-pro-max、design-desk 或 web-performance-optimization 的项目级本地 Skill。

已发现的相关本地能力主要是 Sites 建站 Skill，但本项目是已有 Next.js + GitHub + Vercel 仓库，本轮不把 Sites Skill 当作 UI 设计规范，也不改变部署平台。

结论：本轮采用“官方文档 + GitHub Skill 代码审阅 + 当前项目审计”，不安装新包。

## 2. GitHub 检索结果与决策

| Skill / Pattern | 发现来源 | 匹配度 | 决策 | 原因 |
|---|---|---:|---|---|
| frontend-design | [anthropics/skills](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | 高 | ADAPT | 适合建立有明确主题、反模板、重视可访问性的视觉方向；只吸收原则，不直接复制代码或安装。 |
| frontend-design review | [microsoft/skills](https://github.com/microsoft/skills/blob/main/.github/skills/frontend-design-review/SKILL.md) | 高 | ADAPT | 适合把 UI 审计拆成摩擦、工艺、可信度三类；当前项目尤其需要可信数据视觉。 |
| ui-ux-pro-max | [NinjaSln-labs/agent-skills](https://github.com/NinjaSln-labs/agent-skills/blob/main/ui-ux-pro-max/SKILL.md) | 中 | REFERENCE ONLY | 依赖外部可搜索设计数据库；本轮需求是审计，不需要引入一套新的视觉数据库。 |
| cinematic-scroll | 未发现足够明确、稳定且与当前仓库直接匹配的单一权威 Skill | 中 | REFERENCE ONLY | 现有 Hero 已有滚动编排；先测量和拆分，再决定是否引入新范式。 |
| gsap-framer-scroll-animation | 以 GSAP 官方文档和 Motion 官方文档为主 | 中 | REFERENCE ONLY | 当前 package 未安装 GSAP/Motion；先保持单一 RAF/CSS 方案，避免重复动画库。 |
| design-desk | 未发现可验证的项目级权威来源 | 低 | REJECT | 名称不够具体，无法确认维护者、许可证和实现质量。 |
| web-performance-optimization | 未发现与本项目直接匹配且可验证的单一 Skill；采用 Web Vitals 官方资料 | 高 | ADAPT | 直接用 LCP/INP/CLS 和真实测量约束，避免“感觉变快”。 |

## 3. 官方技术资料

- Next.js Image：[next/image 文档](https://nextjs.org/docs/pages/api-reference/components/image)。Next.js 16 已将 priority 标记为弃用方向，首屏资源应评估 preload、sizes、loading、质量白名单和尺寸配置。
- Motion useScroll：[motion.dev/docs/react-use-scroll](https://motion.dev/docs/react-use-scroll)。可用 motion values 驱动 scroll-linked transform/opacity，但本项目尚未安装 Motion。
- GSAP ScrollTrigger：[gsap.com/docs/v3/Plugins/ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)。支持 scrub/pin/resize refresh，但需要正确注册、清理和避免动画 pinned 元素本身。
- Core Web Vitals：[web.dev/articles/vitals](https://web.dev/articles/vitals?hl=en)。目标参考为 LCP ≤2.5s、INP ≤200ms、CLS ≤0.1（75 分位）。

## 4. License / dependency decision

- 本轮不新增运行时依赖，因而没有新的 lockfile、bundle 和许可证风险。
- 外部 Skill 的 README/SKILL 只作为流程参考，不复制其大段实现。
- 若后续采用 GSAP 或 Motion，必须单独记录版本、包体积、许可证、为什么现有 CSS/RAF 无法满足，以及 reduced-motion 和 cleanup 测试。

## 5. 最终选择

### USE

- 现有 Next.js App Router、CardImage、DataTrustBar、CSS variables、prefers-reduced-motion。
- Next.js 官方图片优化能力，前提是先完成远程域名、尺寸和授权边界设计。
- Web Vitals 官方指标与 Lighthouse/真实设备对照。

### ADAPT

- Anthropic frontend-design 的主题化、反模板、内容优先原则。
- Microsoft frontend-design-review 的 frictionless / quality craft / trustworthy 三轴审计方式。
- GSAP/Motion 文档中的 transform/opacity、单一进度源、生命周期清理原则，不直接引入库。

### REFERENCE ONLY

- ui-ux-pro-max 的设计检索思路。
- GSAP ScrollTrigger 的 pinned timeline 方案。
- Motion useScroll / useTransform 的 motion value 方案。
- 其他 GitHub generic SaaS/frontend design Skill。

### REJECT

- 不明来源的 design-desk。
- 需要大量复制模板、默认蓝紫渐变、crypto/casino/HUD 风格的方案。
- 同时引入 GSAP、Motion、React Spring 等多个动画库。
- 没有许可证、来源、维护状态或可验证代码的 Skill。

## 6. 预检结论

当前项目不应马上安装新的 UI Skill 或动画库。最稳妥的下一步是先写 DESIGN.md、完成资源和性能基线，再针对一个 Hero scene 做小范围验证。只有测量表明现有 RAF/CSS 无法满足 pinned scrub，才引入单一主动画库。
