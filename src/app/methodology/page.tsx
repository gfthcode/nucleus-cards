import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { brands, dataSources } from "@/lib/demo-data";
import { productConfig } from "@/config/product";

export const metadata: Metadata = { title: "数据方法与合规说明" };
const methods = [
  [
    "成交价与标价",
    "实际成交价来自已完成的单卡交易；当前在售标价仅反映卖方报价，二者分开存储、计算和展示。",
  ],
  [
    "价格指数",
    "优先采用排除组合交易、重复交易和已标记异常值后的中位数；仅在样本充足时显示精确参考值。",
  ],
  [
    "汇率换算",
    "每条成交保存原始币种、原始金额、成交时点汇率及换算币种。演示模式使用固定示例汇率。",
  ],
  [
    "异常处理",
    "IQR 规则用于提示异常值，原始记录不会被删除；页面保存排除原因并允许管理员复核。",
  ],
  [
    "流动性",
    "综合 30 日成交频率、在售数量、距最近成交时间与价格波动，转换为 0—100 分。",
  ],
  [
    "球员代际",
    "按职业阶段分为核心新秀、近年新秀、年轻核心、当打球员、老将与退役传奇；角色球员、交易热点和签约热点为可叠加标签，不替代基础代际。",
  ],
  [
    "跨届比较",
    "2020—2026 届按同届代表球员、表现、市场热度、成交量、风险与数据完整度横向呈现；低样本时只给观察摘要，不给虚假精确结论。",
  ],
  [
    "AI 分析",
    "演示引擎为确定性规则，不随机生成结论；输出经过 Zod 校验，包含 playerCohort、peerComparison、依据、失效事件、置信度和免责声明。",
  ],
];
export default function MethodologyPage() {
  return (
    <main className="page-shell inner-page">
      <PageHeader
        eyebrow="METHODOLOGY & LICENSING"
        title="数据方法与授权状态"
        description="公开解释行情的来源、计算、异常处理、完整度和 AI 分析边界。没有授权的数据不进行侵入式采集。"
      />
      <section className="method-grid">
        {methods.map(([title, body], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
      <section className="data-panel source-table">
        <div className="section-heading">
          <div>
            <span className="section-kicker">SOURCE REGISTRY</span>
            <h2>数据源状态</h2>
          </div>
          <small>更新时间 2026-08-31 09:30 CST</small>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>来源</th>
                <th>地区</th>
                <th>当前在售</th>
                <th>历史成交</th>
                <th>授权状态</th>
                <th>运行状态</th>
              </tr>
            </thead>
            <tbody>
              {dataSources.map((source) => (
                <tr key={source.id}>
                  <td>
                    <b>{source.name}</b>
                    <small>{source.error ?? "可用"}</small>
                  </td>
                  <td>{source.region}</td>
                  <td>{source.supportsListings ? "支持" : "不支持"}</td>
                  <td>{source.supportsSales ? "支持" : "不支持"}</td>
                  <td>
                    <span className={`source-status ${source.authorization}`}>
                      {source.authorization}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`risk-pill ${source.enabled ? "low" : "medium"}`}
                    >
                      {source.enabled ? "已启用" : "未启用"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="brand-registry">
        <div>
          <span className="section-kicker">BRAND & PRODUCT LINES</span>
          <h2>品牌及系列范围</h2>
        </div>
        {brands.map((brand) => (
          <article key={brand.name}>
            <h3>{brand.name}</h3>
            <p>{brand.authorization}</p>
            <div>
              {brand.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </article>
        ))}
      </section>
      <section className="legal-panel">
        <h2>免责声明与合规边界</h2>
        <p>{productConfig.disclaimer}</p>
        <ul>
          <li>
            页面标注“演示数据”的价格、比赛、交易流言、签约与伤病内容均为产品功能样本，不代表实时事实。
          </li>
          <li>不绕过登录、验证码、付费墙、反爬措施或访问限制。</li>
          <li>
            没有公开 API 或商业授权的平台仅提供适配器、CSV 导入与演示数据。
          </li>
          <li>
            社区提交始终保留“社区提交”标签，审核后也不会冒充平台官方数据。
          </li>
          <li>中国内地正式部署前需完成 ICP 备案、数据合规和内容运营评估。</li>
        </ul>
      </section>
    </main>
  );
}
