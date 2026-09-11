# GitHub Skill 审计

> 研究阶段：2026-09-11；本轮不安装 Skill、不改依赖。

## 候选与决定

|候选|来源|决定|理由|
|---|---|---|---|
|[Anthropic frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)|官方公开 Skill|ADAPT|强调独特、生产级、反模板化；适合首页叙事，但不能覆盖数据真实性|
|[Microsoft frontend-design-review](https://github.com/microsoft/skills/blob/main/.github/skills/frontend-design-review/SKILL.md)|官方公开 Skill|ADAPT|适合可访问性、可信度和交互审查；作为 review checklist|
|[ui-ux-pro-max](https://github.com/NinjaSln-labs/agent-skills/blob/main/ui-ux-pro-max/SKILL.md)|社区 Skill|REFERENCE ONLY|覆盖面广但需逐条核验许可证、方法与维护，不直接安装|
|[Junaid-PK frontend-design-skill](https://github.com/Junaid-PK/frontend-design-skill)|社区 Skill|REFERENCE ONLY|token 与无运行时依赖思路有价值；不替代项目领域规则|
|[GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)|官方文档|REFERENCE ONLY|可解释 scrub/pin/matchMedia/清理；当前 CSS/rAF 已足够，不先加依赖|
|[Motion useScroll](https://motion.dev/docs/react-use-scroll)|官方文档|REFERENCE ONLY|提供 useScroll/useTransform 思路；需先测包体、SSR 与 reduced-motion|
|[Next Image](https://nextjs.org/docs/pages/api-reference/components/image)|官方文档|ADAPT|用于 preload、sizes、远程来源与质量白名单审查|
|[Web Vitals](https://web.dev/articles/vitals?hl=en)|Google 官方|ADAPT|LCP/INP/CLS 作为验收指标，不是 Skill 安装|

## 本地缺口

已安装技能中没有直接覆盖 sports-card 数据归一化、卡片 identity matching、授权 marketplace adapter、comps 统计、图片许可、玩家分析、竞品 GitHub discovery 的项目技能。`sites` 技能与本项目 Next.js/Vercel 交付不等价，不能当作领域技能。

## 不安装理由

运行时动画库、爬虫库、通用“自动抓价”Skill 会扩大依赖与合规风险。先用现有 `lucide-react`、Recharts、Next Image、rAF 和 adapter 接口；只有性能/交互验收证明必要时才引入单一库。

## Skill 质量门槛

后续每个 Skill 必须有：清晰触发条件、输入输出、真实数据/授权边界、失败与回滚、测试验收、许可证和维护证据；不能只因为仓库名字相似而安装。
