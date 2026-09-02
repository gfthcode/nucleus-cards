"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="state-page">
      <span className="risk-icon">!</span>
      <h1>页面暂时无法加载</h1>
      <p>演示数据处理出现问题。你可以重试，或返回行情首页。</p>
      <button className="button button-primary" onClick={reset}>
        重新加载
      </button>
    </main>
  );
}
